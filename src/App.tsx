import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Restaurant, FilterState, TabType, Dish } from './types';
import {
  getStoredRestaurants,
  saveStoredRestaurants,
  getStoredFavorites,
  saveStoredFavorites,
  getStoredFavoriteDishes,
  saveStoredFavoriteDishes,
  getStoredSpendingFrequency,
  saveStoredSpendingFrequency,
  StoredSpendingFrequency,
  subscribeToRestaurants,
  addRestaurantAsync,
  updateRestaurantAsync,
  deleteRestaurantAsync,
  deleteDishFromRestaurantAsync,
  reseedDefaultRestaurantsAsync,
  rateRestaurantAsync,
  addReviewAsync,
} from './utils/storage';
import { syncOfflineCacheWithServiceWorker } from './utils/serviceWorker';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendLocalNotification,
  checkFavoriteUpdates,
  NotificationPermissionState,
} from './utils/notifications';
import { isRestaurantOpenNow } from './utils/time';
import { shareRestaurant } from './utils/share';
import { auth, loginWithGoogle, logoutUser, onAuthStateChanged, User } from './lib/firebase';

import { Header } from './components/Header';
import { NavbarTabs } from './components/NavbarTabs';
import { RestaurantFilters } from './components/RestaurantFilters';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantModal } from './components/RestaurantModal';
import { RestaurantForm } from './components/RestaurantForm';
import { CampusMap } from './components/CampusMap';
import { ConfirmModal } from './components/ConfirmModal';
import { EmptyState } from './components/EmptyState';
import { ToastContainer, ToastMessage } from './components/Toast';
import { NutritionCalculatorModal } from './components/NutritionCalculatorModal';
import { UserProfileModal } from './components/UserProfileModal';
import { RestaurantQRCodeModal } from './components/RestaurantQRCodeModal';

const DEFAULT_FILTERS: FilterState = {
  searchRestaurant: '',
  searchDish: '',
  minPrice: '',
  maxPrice: '',
  lactoseFreeOnly: false,
  veganOnly: false,
  glutenFreeOnly: false,
  openNowOnly: false,
  favoritesOnly: false,
};

export default function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => getStoredRestaurants());
  const [favorites, setFavorites] = useState<string[]>(() => getStoredFavorites());
  const [favoriteDishes, setFavoriteDishes] = useState<string[]>(() => getStoredFavoriteDishes());
  const [spendingFrequency, setSpendingFrequency] = useState<StoredSpendingFrequency>(() =>
    getStoredSpendingFrequency()
  );
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showMyRestaurantsOnly, setShowMyRestaurantsOnly] = useState(false);

  // Selected Restaurant for Detail Modal
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Restaurant for QR Code Modal
  const [qrCodeRestaurant, setQrCodeRestaurant] = useState<Restaurant | null>(null);

  // Nutrition Calculator Modal State
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);

  // User Profile & Spending History Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Editing state for RestaurantForm
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  // Delete Confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Network Online/Offline state listener
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  // Web Notifications API state & ref for tracking favorite restaurant updates
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>(() =>
    getNotificationPermission()
  );
  const prevRestaurantsRef = useRef<Restaurant[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addToast('Conexão com a internet reestabelecida!', 'success');
    };
    const handleOffline = () => {
      setIsOffline(true);
      addToast('Você está offline. Os dados podem estar desatualizados (cache).', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Listen to Auth State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Realtime Firestore Subscription for Restaurants
  useEffect(() => {
    const unsubscribeSnapshot = subscribeToRestaurants((list) => {
      if (list.length === 0) {
        reseedDefaultRestaurantsAsync().then((seeded) => {
          setRestaurants(seeded);
          syncOfflineCacheWithServiceWorker(seeded);
        });
      } else {
        setRestaurants(list);
        syncOfflineCacheWithServiceWorker(list);
      }
    });
    return () => unsubscribeSnapshot();
  }, []);

  // Sync cache with Service Worker when restaurants are updated
  useEffect(() => {
    if (restaurants.length > 0) {
      syncOfflineCacheWithServiceWorker(restaurants);
    }
  }, [restaurants]);

  // 3. Detect changes in Favorite Restaurants (Prato do Dia / New dishes) & Trigger Web Notifications
  useEffect(() => {
    if (restaurants.length > 0) {
      if (prevRestaurantsRef.current.length > 0 && favorites.length > 0) {
        const updates = checkFavoriteUpdates(prevRestaurantsRef.current, restaurants, favorites);
        updates.forEach((update) => {
          // Send Local Web Notification via Web Notifications API
          sendLocalNotification(update.title, {
            body: update.message,
            icon: update.restaurant.imageUrl,
            onClick: () => {
              handleSelectRestaurant(update.restaurant);
            },
          });
          // Also show in-app toast for immediate on-screen visibility
          addToast(update.message, 'info');
        });
      }
      prevRestaurantsRef.current = restaurants;
    }
  }, [restaurants, favorites]);

  // Check for shared restaurant in URL search query on load
  useEffect(() => {
    if (restaurants.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const sharedId = params.get('restaurant');
      if (sharedId) {
        const found = restaurants.find((r) => r.id === sharedId);
        if (found) {
          setSelectedRestaurant(found);
        }
      }
    }
  }, [restaurants]);

  // Auth Handlers
  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      addToast(`Bem-vindo, ${user.displayName || user.email}!`, 'success');
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      addToast('Não foi possível realizar login com o Google.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setShowMyRestaurantsOnly(false);
      addToast('Você saiu da conta.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Open/Close modal and sync URL parameter
  const handleSelectRestaurant = (r: Restaurant | null) => {
    setSelectedRestaurant(r);
    try {
      const url = new URL(window.location.href);
      if (r) {
        url.searchParams.set('restaurant', r.id);
      } else {
        url.searchParams.delete('restaurant');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore URL manipulation failures
    }
  };

  // Share restaurant trigger
  const handleShareRestaurant = (restaurant: Restaurant) => {
    shareRestaurant(restaurant, (msg, type) => addToast(msg, type || 'success'));
  };

  // Favorite toggle handler
  const handleToggleFavorite = (restaurantId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(restaurantId);
      const updated = exists
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId];
      saveStoredFavorites(updated);

      const rest = restaurants.find((r) => r.id === restaurantId);
      const name = rest ? rest.name : 'Restaurante';
      if (!exists) {
        addToast(`"${name}" adicionado aos favoritos!`, 'success');
        // Proactively ask for notifications permission if not yet decided
        if (isNotificationSupported() && getNotificationPermission() === 'default') {
          requestNotificationPermission().then((granted) => {
            setNotificationPermission(getNotificationPermission());
            if (granted) {
              addToast('Você receberá alertas quando este restaurante atualizar o Prato do Dia!', 'success');
            }
          });
        }
      } else {
        addToast(`"${name}" removido dos favoritos.`, 'info');
      }
      return updated;
    });
  };

  // Dish Favorite Toggle Handler
  const handleToggleFavoriteDish = (dishId: string) => {
    setFavoriteDishes((prev) => {
      const exists = prev.includes(dishId);
      const updated = exists ? prev.filter((id) => id !== dishId) : [...prev, dishId];
      saveStoredFavoriteDishes(updated);

      if (!exists) {
        addToast('Prato adicionado aos favoritos e à estimativa de gastos semanais!', 'success');
        setSpendingFrequency((prevFreq) => {
          if (!prevFreq[dishId]) {
            const next = { ...prevFreq, [dishId]: 1 };
            saveStoredSpendingFrequency(next);
            return next;
          }
          return prevFreq;
        });
      } else {
        addToast('Prato removido dos favoritos.', 'info');
      }
      return updated;
    });
  };

  // Spending Frequency Update Handler
  const handleUpdateDishFrequency = (dishId: string, days: number) => {
    setSpendingFrequency((prev) => {
      const updated = { ...prev, [dishId]: days };
      saveStoredSpendingFrequency(updated);
      return updated;
    });
  };

  // Request notifications permission handler
  const handleRequestNotifications = async () => {
    if (!isNotificationSupported()) {
      addToast('Seu navegador não possui suporte para a Web Notifications API.', 'error');
      return;
    }

    const granted = await requestNotificationPermission();
    const currentPerm = getNotificationPermission();
    setNotificationPermission(currentPerm);

    if (granted) {
      sendLocalNotification('🔔 Notificações Ativadas no allmoço UFCG!', {
        body: 'Você receberá alertas sempre que seus restaurantes favoritos atualizarem o Prato do Dia ou adicionarem novos itens ao cardápio.',
      });
      addToast('Notificações de favoritos ativadas com sucesso!', 'success');
    } else if (currentPerm === 'denied') {
      addToast('As notificações estão desativadas nas configurações do seu navegador.', 'info');
    }
  };

  // Rating handler
  const handleRateRestaurant = async (restaurantId: string, rating: number) => {
    if (!currentUser) {
      handleGoogleLogin();
      return;
    }

    try {
      const updated = await rateRestaurantAsync(restaurantId, currentUser.uid, rating);
      if (updated) {
        if (selectedRestaurant?.id === restaurantId) {
          setSelectedRestaurant(updated);
        }
        addToast(`Sua avaliação (${rating} ★) foi registrada com sucesso!`, 'success');
      }
    } catch (e) {
      console.error('Error rating restaurant:', e);
      addToast('Erro ao registrar avaliação.', 'error');
    }
  };

  // Review & Comment handler
  const handleSubmitReview = async (restaurantId: string, rating: number, comment: string) => {
    if (!currentUser) {
      handleGoogleLogin();
      return;
    }

    try {
      const updated = await addReviewAsync(restaurantId, {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Estudante UFCG',
        userPhoto: currentUser.photoURL || undefined,
        rating,
        comment,
      });

      if (updated) {
        if (selectedRestaurant?.id === restaurantId) {
          setSelectedRestaurant(updated);
        }
        addToast('Sua avaliação e comentário foram registrados!', 'success');
      }
    } catch (e) {
      console.error('Error submitting review:', e);
      addToast('Erro ao publicar comentário.', 'error');
    }
  };

  // Toast helper
  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Open Count
  const openCount = useMemo(() => {
    return restaurants.filter((r) => isRestaurantOpenNow(r.openingHours)).length;
  }, [restaurants]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchRestaurant.trim()) count++;
    if (filters.searchDish.trim()) count++;
    if (filters.minPrice !== '') count++;
    if (filters.maxPrice !== '') count++;
    if (filters.lactoseFreeOnly) count++;
    if (filters.veganOnly) count++;
    if (filters.glutenFreeOnly) count++;
    if (filters.openNowOnly) count++;
    if (filters.favoritesOnly) count++;
    if (showMyRestaurantsOnly) count++;
    return count;
  }, [filters, showMyRestaurantsOnly]);

  // Filtered Restaurants calculation
  const filteredRestaurants = useMemo(() => {
    const searchRestTerm = filters.searchRestaurant.toLowerCase().trim();
    const searchDishTerm = filters.searchDish.toLowerCase().trim();
    const minP = filters.minPrice !== '' ? parseFloat(filters.minPrice) : null;
    const maxP = filters.maxPrice !== '' ? parseFloat(filters.maxPrice) : null;

    return restaurants.filter((restaurant) => {
      if (!restaurant) return false;

      // Favorites filter
      if (filters.favoritesOnly && !favorites.includes(restaurant.id)) {
        return false;
      }

      // My restaurants filter
      if (showMyRestaurantsOnly && currentUser) {
        if (!restaurant.ownerId || restaurant.ownerId !== currentUser.uid) {
          return false;
        }
      }

      // Open now filter
      if (filters.openNowOnly && !isRestaurantOpenNow(restaurant.openingHours)) {
        return false;
      }

      // Restaurant name filter
      if (searchRestTerm && !(restaurant.name || '').toLowerCase().includes(searchRestTerm)) {
        return false;
      }

      const dishes = Array.isArray(restaurant.dishes) ? restaurant.dishes : [];

      const hasDishFilters =
        Boolean(searchDishTerm) ||
        minP !== null ||
        maxP !== null ||
        filters.lactoseFreeOnly ||
        filters.veganOnly ||
        filters.glutenFreeOnly;

      if (!hasDishFilters) {
        return true;
      }

      if (dishes.length === 0) {
        return false;
      }

      // Dish-level criteria matching
      const matchingDish = dishes.some((dish) => {
        if (!dish) return false;

        if (
          searchDishTerm &&
          !(dish.name || '').toLowerCase().includes(searchDishTerm) &&
          !(dish.description || '').toLowerCase().includes(searchDishTerm)
        ) {
          return false;
        }

        if (minP !== null && !isNaN(minP) && (dish.price || 0) < minP) {
          return false;
        }

        if (maxP !== null && !isNaN(maxP) && (dish.price || 0) > maxP) {
          return false;
        }

        if (filters.lactoseFreeOnly && !dish.isLactoseFree) {
          return false;
        }

        if (filters.veganOnly && !dish.isVegan) {
          return false;
        }

        if (filters.glutenFreeOnly && !dish.isGlutenFree) {
          return false;
        }

        return true;
      });

      return matchingDish;
    });
  }, [restaurants, filters, favorites, showMyRestaurantsOnly, currentUser]);

  // Create or Update Restaurant Handler
  const handleSaveRestaurant = async (
    data: Omit<Restaurant, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      await updateRestaurantAsync(editingId, data);
      addToast(`Restaurante "${data.name}" atualizado com sucesso!`, 'success');
    } else {
      const ownerInfo = currentUser
        ? {
            ownerId: currentUser.uid,
            ownerEmail: currentUser.email || '',
            ownerName: currentUser.displayName || '',
          }
        : undefined;

      await addRestaurantAsync(data, ownerInfo);
      addToast(`Restaurante "${data.name}" cadastrado com sucesso!`, 'success');
    }

    setEditingRestaurant(null);
    setActiveTab('list');
  };

  // Edit Button Click (from modal or list)
  const handleStartEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    handleSelectRestaurant(null);
    setActiveTab('form');
  };

  // Delete Restaurant Trigger
  const handleDeleteRestaurantPrompt = (restaurantId: string) => {
    setDeleteConfirmId(restaurantId);
  };

  // Confirm Delete Restaurant
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    const target = restaurants.find((r) => r.id === deleteConfirmId);
    await deleteRestaurantAsync(deleteConfirmId);
    addToast(
      target ? `Restaurante "${target.name}" removido.` : 'Restaurante removido com sucesso.',
      'info'
    );
    setDeleteConfirmId(null);
    handleSelectRestaurant(null);
  };

  // Delete Individual Dish from Restaurant
  const handleDeleteDish = async (restaurantId: string, dishId: string) => {
    const targetRest = restaurants.find((r) => r.id === restaurantId);
    if (!targetRest) return;

    if (targetRest.dishes.length <= 2) {
      addToast('Não é possível remover. O restaurante deve ter no mínimo 2 pratos.', 'error');
      return;
    }

    try {
      const updatedRest = await deleteDishFromRestaurantAsync(restaurantId, dishId);
      if (selectedRestaurant?.id === restaurantId && updatedRest) {
        setSelectedRestaurant(updatedRest);
      }
      addToast('Prato removido com sucesso.', 'info');
    } catch (e: any) {
      addToast(e.message || 'Erro ao remover prato.', 'error');
    }
  };

  // Reseed / Restore Default Restaurants
  const handleReseedDefaults = async () => {
    try {
      await reseedDefaultRestaurantsAsync();
      addToast('Restaurantes e cardápios da UFCG restaurados com sucesso!', 'success');
    } catch (err) {
      addToast('Erro ao restaurar restaurantes.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col antialiased selection:bg-orange-500 selection:text-white">
      
      {/* Top Header with Google Login & Notification Toggle */}
      <Header
        totalRestaurants={restaurants.length}
        openCount={openCount}
        currentUser={currentUser}
        isOffline={isOffline}
        notificationPermission={notificationPermission}
        onRequestNotifications={handleRequestNotifications}
        onLoginGoogle={handleGoogleLogin}
        onLogout={handleLogout}
        showMyRestaurantsOnly={showMyRestaurantsOnly}
        onToggleMyRestaurantsOnly={() => setShowMyRestaurantsOnly(!showMyRestaurantsOnly)}
        onOpenNutritionModal={() => setIsNutritionModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Navigation Tabs */}
      <NavbarTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'form' && !editingRestaurant) {
            setEditingRestaurant(null);
          }
          setActiveTab(tab);
        }}
        isEditing={Boolean(editingRestaurant)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'list' ? (
            <motion.div
              key="list-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Filter Panel */}
              <RestaurantFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => {
                  setFilters(DEFAULT_FILTERS);
                  setShowMyRestaurantsOnly(false);
                }}
                activeFilterCount={activeFilterCount}
              />

              {/* Results Counter Banner */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium px-1">
                <span>
                  Exibindo <strong className="text-slate-900 dark:text-slate-100">{filteredRestaurants.length}</strong> de {restaurants.length} restaurantes
                </span>

                {activeFilterCount > 0 && (
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">
                    Filtros aplicados
                  </span>
                )}
              </div>

              {/* Restaurants Grid */}
              <AnimatePresence mode="popLayout">
                {filteredRestaurants.length > 0 ? (
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredRestaurants.map((restaurant, index) => (
                      <motion.div
                        key={restaurant.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92, y: -10 }}
                        transition={{
                          duration: 0.28,
                          delay: Math.min(index * 0.04, 0.24),
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        className="h-full"
                      >
                        <RestaurantCard
                          restaurant={restaurant}
                          currentUser={currentUser}
                          isFavorite={favorites.includes(restaurant.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onSelect={(r) => handleSelectRestaurant(r)}
                          onShare={handleShareRestaurant}
                          onOpenQRCode={(r) => setQrCodeRestaurant(r)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <EmptyState
                      hasFilters={activeFilterCount > 0}
                      onResetFilters={() => {
                        setFilters(DEFAULT_FILTERS);
                        setShowMyRestaurantsOnly(false);
                      }}
                      onAddRestaurant={() => {
                        setEditingRestaurant(null);
                        setActiveTab('form');
                      }}
                      onReseedDefaults={handleReseedDefaults}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : activeTab === 'map' ? (
            <motion.div
              key="map-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <CampusMap
                restaurants={restaurants}
                onSelectRestaurant={(r) => handleSelectRestaurant(r)}
              />
            </motion.div>
          ) : (
            /* Form View */
            <motion.div
              key="form-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <RestaurantForm
                initialData={editingRestaurant}
                currentUser={currentUser}
                onLoginGoogle={handleGoogleLogin}
                onSave={handleSaveRestaurant}
                onCancel={() => {
                  setEditingRestaurant(null);
                  setActiveTab('list');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Detail Modal */}
      <RestaurantModal
        restaurant={selectedRestaurant}
        currentUser={currentUser}
        isFavorite={selectedRestaurant ? favorites.includes(selectedRestaurant.id) : false}
        favoriteDishIds={favoriteDishes}
        onToggleFavorite={handleToggleFavorite}
        onToggleFavoriteDish={handleToggleFavoriteDish}
        onRateRestaurant={handleRateRestaurant}
        onSubmitReview={handleSubmitReview}
        onLoginGoogle={handleGoogleLogin}
        onClose={() => handleSelectRestaurant(null)}
        onEdit={handleStartEdit}
        onDeleteRestaurant={handleDeleteRestaurantPrompt}
        onDeleteDish={handleDeleteDish}
        onShare={handleShareRestaurant}
        onOpenNutritionModal={() => setIsNutritionModalOpen(true)}
        onOpenSpendingModal={() => setIsProfileModalOpen(true)}
      />

      {/* User Profile & Weekly Spending Estimate Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        restaurants={restaurants}
        favoriteRestaurantIds={favorites}
        favoriteDishIds={favoriteDishes}
        spendingFrequency={spendingFrequency}
        onToggleFavoriteRestaurant={handleToggleFavorite}
        onToggleFavoriteDish={handleToggleFavoriteDish}
        onUpdateDishFrequency={handleUpdateDishFrequency}
        onSelectRestaurant={(r) => handleSelectRestaurant(r)}
        onLoginGoogle={handleGoogleLogin}
        onLogout={handleLogout}
      />

      {/* Confirm Delete Restaurant Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Excluir Restaurante?"
        message="Tem certeza que deseja excluir este restaurante e todos os seus pratos? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Nutrition Calculator Modal */}
      <NutritionCalculatorModal
        isOpen={isNutritionModalOpen}
        onClose={() => setIsNutritionModalOpen(false)}
      />

      {/* Standalone / Card triggered QR Code Modal */}
      <RestaurantQRCodeModal
        restaurant={qrCodeRestaurant}
        isOpen={Boolean(qrCodeRestaurant)}
        onClose={() => setQrCodeRestaurant(null)}
        onToast={addToast}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>allmoço – Restaurantes do Campus</strong> • Desenvolvido para a comunidade universitária
          </span>
          <span className="text-slate-400">
            Alimentação acessível, rápida e prática no seu campus
          </span>
        </div>
      </footer>

    </div>
  );
}
