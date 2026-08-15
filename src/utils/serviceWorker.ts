import { Restaurant } from '../types';

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker registrado com sucesso no escopo:', registration.scope);

          // Listen for SW updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW] Nova versão do app disponível.');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('[SW] Falha ao registrar Service Worker:', error);
        });
    });
  }
}

/**
 * Notifies the Service Worker to pre-cache all restaurant images and a full JSON snapshot.
 */
export function syncOfflineCacheWithServiceWorker(restaurants: Restaurant[]): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return;
  }

  try {
    const imageUrls: string[] = [];

    restaurants.forEach((restaurant) => {
      if (restaurant.imageUrl && restaurant.imageUrl.startsWith('http')) {
        imageUrls.push(restaurant.imageUrl);
      }
      if (Array.isArray(restaurant.reviews)) {
        restaurant.reviews.forEach((rev) => {
          if (rev.userPhoto && rev.userPhoto.startsWith('http')) {
            imageUrls.push(rev.userPhoto);
          }
        });
      }
    });

    const uniqueUrls = Array.from(new Set(imageUrls));

    // Send images to pre-cache in Service Worker
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_IMAGE_URLS',
      urls: uniqueUrls,
    });

    // Send JSON restaurant data snapshot
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_RESTAURANTS_DATA',
      payload: restaurants,
    });
  } catch (err) {
    console.warn('[SW] Erro ao sincronizar cache com Service Worker:', err);
  }
}
