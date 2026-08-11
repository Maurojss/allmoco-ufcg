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

    // Fallback: Copy URL to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      if (onToast) {
        onToast('Link do restaurante copiado para a área de transferência!', 'success');
      }
      return true;
    } else {
      // Secondary fallback if clipboard API is blocked
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      if (onToast) {
        onToast('Link do restaurante copiado!', 'success');
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
