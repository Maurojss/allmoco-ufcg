import React, { useState } from 'react';
import { Restaurant, Dish } from '../types';
import { isRestaurantOpenNow, formatCurrency } from '../utils/time';
import { OpenStatusBadge, StudentDiscountBadge, DietaryBadges } from './Badges';
import { getSafeUrl, isValidUrl } from '../utils/security';
import { User } from '../lib/firebase';
import { RatingDisplay } from './RatingStars';
import { ReviewSection } from './ReviewSection';
import { calculateRatingStats } from '../utils/rating';
import {
  X,
  MapPin,
  Clock,
  Edit,
  Trash2,
  Utensils,
  Calendar,
  AlertCircle,
  ExternalLink,
  Store,
  GraduationCap,
  Share2,
  Sparkles,
  UserCheck,
  Heart,
  Star,
  LogIn,
} from 'lucide-react';

interface RestaurantModalProps {
  restaurant: Restaurant | null;
  currentUser?: User | null;
  isFavorite?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
  onRateRestaurant?: (restaurantId: string, rating: number) => void;
  onSubmitReview?: (restaurantId: string, rating: number, comment: string) => void;
  onLoginGoogle?: () => void;
  onClose: () => void;
  onEdit: (restaurant: Restaurant) => void;
  onDeleteRestaurant: (restaurantId: string) => void;
  onDeleteDish: (restaurantId: string, dishId: string) => void;
  onShare?: (restaurant: Restaurant) => void;
  onOpenNutritionModal?: () => void;
}

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  restaurant,
  currentUser,
  isFavorite = false,
  onToggleFavorite,
  onRateRestaurant,
  onSubmitReview,
  onLoginGoogle,
  onClose,
  onEdit,
  onDeleteRestaurant,
  onDeleteDish,
  onShare,
  onOpenNutritionModal,
}) => {
  const [imgError, setImgError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!restaurant) return null;

  const { average: avgRating, count: ratingCount } = calculateRatingStats(
    restaurant.ratings,
    restaurant.reviews
  );
  const userRating = currentUser
    ? restaurant.reviews?.find((r) => r.userId === currentUser.uid)?.rating ||
      restaurant.ratings?.[currentUser.uid] ||
      null
    : null;

  const isOpen = isRestaurantOpenNow(restaurant.openingHours);
  const hasValidImg = isValidUrl(restaurant.imageUrl) && !imgError;
  const safeMapsUrl = getSafeUrl(restaurant.googleMapsUrl, '#');

  const isOwner = Boolean(
    currentUser && restaurant.ownerId && currentUser.uid === restaurant.ownerId
  );

  const handleDeleteDishClick = (dishId: string, dishName: string) => {
    if (restaurant.dishes.length <= 2) {
      setErrorMessage(
        `Não é possível remover "${dishName}". O restaurante deve possuir no mínimo 2 pratos cadastrados.`
      );
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    onDeleteDish(restaurant.id, dishId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button at top right as requested */}
        <button
          type="button"
          onClick={onClose}
          className="modal-close absolute top-3 right-4 z-20 text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs transition-colors cursor-pointer"
          title="Fechar"
          aria-label="Fechar modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Header Title & Status */}
          <div>
            <div className="flex items-center justify-between gap-3 pr-12 mb-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {restaurant.name}
              </h2>

              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(restaurant.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 border ${
                    isFavorite
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-200 dark:border-rose-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-rose-600'
                  }`}
                  title={isFavorite ? 'Remover dos favoritos' : 'Salvar como favorito'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{isFavorite ? 'Favorito' : 'Favoritar'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <OpenStatusBadge isOpen={isOpen} hours={restaurant.openingHours} />
              <div className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-full flex items-center">
                <RatingDisplay average={avgRating} count={ratingCount} size="sm" />
              </div>
              {restaurant.hasStudentDiscount && (
                <StudentDiscountBadge details={restaurant.studentDiscountDetails} />
              )}
              {isOwner && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <UserCheck className="w-3.5 h-3.5" />
                  Cadastrado por você
                </span>
              )}
            </div>

            {restaurant.ownerName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Responsável pelo local: <strong>{restaurant.ownerName}</strong>
              </p>
            )}
          </div>

          {/* Detail Image or Fallback */}
          <div className="detail-img w-full max-h-[200px] h-[200px] object-cover rounded-xl my-3 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
            {hasValidImg ? (
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-center p-4">
                <Store className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-600" />
                <span className="text-sm">{restaurant.name}</span>
                <span className="text-xs text-slate-400 font-normal">Imagem não cadastrada</span>
              </div>
            )}
          </div>

          {/* Location & Operating Hours Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <span className="font-bold block">Horário de Funcionamento:</span>
                <span>{restaurant.openingHours}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="overflow-hidden">
                <span className="font-bold block text-slate-700 dark:text-slate-300">Localização:</span>
                {isValidUrl(safeMapsUrl) ? (
                  <a
                    href={safeMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline font-semibold inline-flex items-center gap-1 truncate"
                  >
                    <span>Abrir no Google Maps</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-500">Link do mapa não fornecido</span>
                )}
              </div>
            </div>
          </div>

          {/* Review & Comments Section */}
          <ReviewSection
            reviews={restaurant.reviews || []}
            userRating={userRating}
            currentUser={currentUser}
            onLoginGoogle={onLoginGoogle}
            onSubmitReview={(score, comment) => {
              if (onSubmitReview) {
                onSubmitReview(restaurant.id, score, comment);
              } else if (onRateRestaurant) {
                onRateRestaurant(restaurant.id, score);
              }
            }}
          />

          {/* Student Discount Box if active */}
          {restaurant.hasStudentDiscount && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-amber-900 dark:text-amber-200 block text-sm">
                  Benefício / Desconto para Estudantes
                </strong>
                <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                  {restaurant.studentDiscountDetails || 'Apresente sua carteirinha universitária no momento do pedido.'}
                </p>
              </div>
            </div>
          )}

          {/* Error Message if attempting to drop below 2 dishes */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dishes List */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-600" />
                <span>Pratos Disponíveis ({restaurant.dishes.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenNutritionModal) onOpenNutritionModal();
                  }}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Calcular Nutrição</span>
                </button>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  Mínimo de 2 pratos por restaurante
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {restaurant.dishes.map((dish) => (
                <div key={dish.id} className="detail-plate py-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {dish.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium text-slate-700 dark:text-slate-300">
                          {dish.size || 'Tamanho padrão'}
                        </span>
                        {dish.availableDays && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {dish.availableDays}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-orange-600 dark:text-orange-400 text-sm sm:text-base">
                        {formatCurrency(dish.price)}
                      </span>

                      {/* Delete Individual Dish */}
                      <button
                        type="button"
                        onClick={() => handleDeleteDishClick(dish.id, dish.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Remover este prato"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {dish.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  )}

                  {/* Dietary Badges */}
                  <div className="plate-badges flex gap-1.5 pt-1">
                    <DietaryBadges
                      isLactoseFree={dish.isLactoseFree}
                      isVegan={dish.isVegan}
                      isGlutenFree={dish.isGlutenFree}
                      compact={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(restaurant)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/70 border border-orange-200 dark:border-orange-800/60 shadow-xs transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(restaurant);
              }}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Editar Restaurante</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onDeleteRestaurant(restaurant.id);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Restaurante</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
