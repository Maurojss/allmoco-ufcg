import React, { useRef, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Restaurant } from '../types';
import {
  QrCode,
  X,
  Copy,
  Check,
  Download,
  Printer,
  Share2,
  ExternalLink,
  Sparkles,
  Store,
  MapPin,
  Utensils,
} from 'lucide-react';
import { shareRestaurant } from '../utils/share';

interface RestaurantQRCodeModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  onToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const RestaurantQRCodeModal: React.FC<RestaurantQRCodeModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !restaurant) return null;

  // Build the deep link directly targeting this specific restaurant
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://allmoco-ufcg.web.app';
  const directUrl = `${baseUrl}?restaurant=${encodeURIComponent(restaurant.id)}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(directUrl);
        setCopied(true);
        if (onToast) onToast('Link direto copiado com sucesso!', 'success');
        setTimeout(() => setCopied(false), 2500);
      } else {
        if (onToast) onToast(`Link: ${directUrl}`, 'info');
      }
    } catch {
      if (onToast) onToast('Não foi possível copiar o link.', 'error');
    }
  };

  const handleDownloadPNG = () => {
    try {
      const canvasElement = canvasRef.current?.querySelector('canvas');
      if (!canvasElement) {
        if (onToast) onToast('Erro ao gerar imagem para download.', 'error');
        return;
      }

      // Create a higher resolution canvas with branded frame for downloading
      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      const scale = 2; // High DPI
      const width = 480 * scale;
      const height = 620 * scale;
      exportCanvas.width = width;
      exportCanvas.height = height;

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Header background gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#ea580c');
      gradient.addColorStop(1, '#f97316');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, 110 * scale);

      // Header title
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${24 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🍽️ allmoço UFCG', width / 2, 45 * scale);

      ctx.font = `normal ${13 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = '#ffedd5';
      ctx.fillText('Cardápio Universitário & Preços do Campus', width / 2, 75 * scale);

      // Restaurant Name
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${20 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(restaurant.name, width / 2, 160 * scale);

      if (restaurant.campusZone) {
        ctx.fillStyle = '#64748b';
        ctx.font = `normal ${13 * scale}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(`📍 ${restaurant.campusZone}`, width / 2, 190 * scale);
      }

      // Draw QR Code centered
      const qrSize = 260 * scale;
      const qrX = (width - qrSize) / 2;
      const qrY = 220 * scale;
      ctx.drawImage(canvasElement, qrX, qrY, qrSize, qrSize);

      // Subtitle Instructions
      ctx.fillStyle = '#334155';
      ctx.font = `bold ${14 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.fillText('Aponte a câmera do celular para ver o cardápio', width / 2, 520 * scale);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `normal ${11 * scale}px system-ui, -apple-system, sans-serif`;
      ctx.fillText('Horários, pratos do dia, valores e avaliações dos estudantes', width / 2, 550 * scale);

      // Trigger Download
      const link = document.createElement('a');
      const sanitizedName = restaurant.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `qrcode-allmoco-${sanitizedName}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();

      if (onToast) onToast('QR Code baixado em alta resolução!', 'success');
    } catch (err) {
      console.error('Error downloading QR code:', err);
      if (onToast) onToast('Falha ao baixar imagem do QR Code.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    shareRestaurant(restaurant, onToast);
  };

  return (
    <div
      id="restaurant-qrcode-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-orange-200 block">
                allmoço UFCG • Acesso Rápido
              </span>
              <h3 className="text-lg font-extrabold text-white leading-tight">
                QR Code do Restaurante
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Restaurant identity chip */}
          <div className="flex items-center gap-3 p-3.5 bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/50 rounded-2xl">
            {restaurant.imageUrl ? (
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-12 h-12 rounded-xl object-cover border border-orange-200 dark:border-orange-800 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-orange-200 dark:bg-orange-900 text-orange-700 dark:text-orange-200 flex items-center justify-center font-bold text-lg shrink-0">
                <Store className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base truncate">
                {restaurant.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {restaurant.campusZone && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    {restaurant.campusZone}
                  </span>
                )}
                <span className="shrink-0">• {restaurant.dishes.length} pratos</span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-inner space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
              <QRCodeSVG
                value={directUrl}
                size={220}
                level="H"
                includeMargin={false}
                imageSettings={
                  includeLogo
                    ? {
                        src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=80&q=80',
                        height: 38,
                        width: 38,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>

            {/* Hidden canvas used for high-res PNG generation */}
            <div ref={canvasRef} className="hidden" aria-hidden="true">
              <QRCodeCanvas
                value={directUrl}
                size={512}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Aponte a câmera para abrir no allmoço
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[280px]">
                Abre diretamente este restaurante com cardápio, prato do dia e avaliações.
              </p>
            </div>
          </div>

          {/* Direct Link Box with Copy Button */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex-1 overflow-hidden font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate px-1">
              {directUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
              title="Copiar URL direta"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownloadPNG}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/70 border border-orange-200 dark:border-orange-900/60 text-orange-700 dark:text-orange-300 transition-all font-bold text-xs cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Imagem</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all font-bold text-xs cursor-pointer shadow-2xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartilhar</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all font-bold text-xs cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Mesa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
