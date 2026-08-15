import { Restaurant } from '../types';

export type NotificationPermissionState = NotificationPermission | 'unsupported';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.warn('[Notifications] Erro ao solicitar permissão de notificação:', error);
    return false;
  }
}

export interface SendNotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
  onClick?: () => void;
}

export function sendLocalNotification(
  title: string,
  options: SendNotificationOptions = {}
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: options.tag || `allmoco-${Date.now()}`,
      data: options.data,
    });

    if (options.onClick) {
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    return notification;
  } catch (err) {
    // If standard constructor fails (e.g. mobile chrome requiring service worker notification)
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification(title, {
            body: options.body || '',
            icon: options.icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: options.tag || `allmoco-${Date.now()}`,
            data: options.data,
          });
        })
        .catch((swErr) => {
          console.warn('[Notifications] Service Worker showNotification erro:', swErr);
        });
    }
    return null;
  }
}

export interface FavoriteChangeResult {
  restaurant: Restaurant;
  type: 'prato_do_dia' | 'new_dish';
  title: string;
  message: string;
}

/**
 * Compares two lists of restaurants and finds updates regarding 'pratoDoDia' or added dishes
 * for restaurants present in the user's favorites.
 */
export function checkFavoriteUpdates(
  previousRestaurants: Restaurant[],
  currentRestaurants: Restaurant[],
  favoriteIds: string[]
): FavoriteChangeResult[] {
  if (
    !previousRestaurants ||
    previousRestaurants.length === 0 ||
    !currentRestaurants ||
    currentRestaurants.length === 0 ||
    !favoriteIds ||
    favoriteIds.length === 0
  ) {
    return [];
  }

  const results: FavoriteChangeResult[] = [];
  const prevMap = new Map<string, Restaurant>();
  previousRestaurants.forEach((r) => prevMap.set(r.id, r));

  const favSet = new Set(favoriteIds);

  currentRestaurants.forEach((currRest) => {
    if (!favSet.has(currRest.id)) return;

    const prevRest = prevMap.get(currRest.id);
    if (!prevRest) return;

    // 1. Check if 'pratoDoDia' changed and is now defined
    const prevPrato = prevRest.pratoDoDia?.trim() || '';
    const currPrato = currRest.pratoDoDia?.trim() || '';

    if (currPrato && currPrato !== prevPrato) {
      results.push({
        restaurant: currRest,
        type: 'prato_do_dia',
        title: `⭐ Prato do Dia: ${currRest.name}`,
        message: `O restaurante ${currRest.name} definiu o Prato do Dia: "${currPrato}". Venha saborear!`,
      });
    }

    // 2. Check if new dishes were added to the menu
    const prevDishIds = new Set((prevRest.dishes || []).map((d) => d.id));
    const newDishes = (currRest.dishes || []).filter((d) => !prevDishIds.has(d.id));

    if (newDishes.length > 0) {
      const dishNames = newDishes.map((d) => d.name).join(', ');
      results.push({
        restaurant: currRest,
        type: 'new_dish',
        title: `🍽️ Novo Prato: ${currRest.name}`,
        message: `O restaurante ${currRest.name} adicionou novidade ao cardápio: ${dishNames}.`,
      });
    }
  });

  return results;
}
