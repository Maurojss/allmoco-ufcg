import { Restaurant } from '../types';

export const shareRestaurant = async (
  restaurant: Pick<Restaurant, 'id' | 'name'>,
  onToast?: (text: string, type?: 'success' | 'info' | 'error') => void
): Promise<boolean> => {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('restaurant', restaurant.id);
    const shareUrl = url.toString();

    const shareData = {
      title: `${restaurant.name} – allmoço`,
      text: `Confira os pratos e detalhes do restaurante ${restaurant.name} no campus!`,
      url: shareUrl,
    };

    // Attempt Web Share API if supported
    if (
      typeof navigator !== 'undefined' &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
        if (onToast) onToast('Restaurante compartilhado com sucesso!', 'success');
        return true;
      } catch (shareErr) {
        // If the user cancelled the share sheet manually, treat as non-fatal
        if (shareErr instanceof Error && shareErr.name === 'AbortError') {
          return false;
        }
      }
    }

    // Fallback: Copy URL to clipboard with modern async API
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      if (onToast) {
        onToast('Link do restaurante copiado para a área de transferência!', 'success');
      }
      return true;
    } else {
      // Graceful fallback when clipboard permission is unavailable
      if (onToast) {
        onToast(`Link do restaurante: ${shareUrl}`, 'info');
      }
      return true;
    }
  } catch (error) {
    console.error('Error sharing restaurant:', error);
    if (onToast) {
      onToast('Não foi possível compartilhar o restaurante.', 'error');
    }
    return false;
  }
};
