import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Restaurant } from '../types';
import { isRestaurantOpenNow, formatCurrency } from '../utils/time';
import { OpenStatusBadge, StudentDiscountBadge, DietaryBadges } from './Badges';
import { Utensils, Clock, ChevronRight, Store, Share2, UserCheck, Heart, WifiOff } from 'lucide-react';
import { isValidUrl } from '../utils/security';
import { User } from '../lib/firebase';
import { RatingDisplay } from './RatingStars';
import { calculateRatingStats } from '../utils/rating';

interface RestaurantCardProps {
  restaurant: Restaurant;
  currentUser?: User | null;
  isFavorite?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
  onSelect: (restaurant: Restaurant) => void;
  onShare?: (restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  currentUser,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
  onShare,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOpen = isRestaurantOpenNow(restaurant.openingHours);
  const { average: avgRating, count: ratingCount } = calculateRatingStats(
    restaurant.ratings,
    restaurant.reviews
  );

  const isOwner = Boolean(
    currentUser && restaurant.ownerId && currentUser.uid === restaurant.ownerId
  );

  // Price calculations
  const prices = restaurant.dishes.map((d) => d.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // Aggregate dietary tags for card summary
  const hasVegan = restaurant.dishes.some((d) => d.isVegan);
  const hasLactoseFree = restaurant.dishes.some((d) => d.isLactoseFree);
  const hasGlutenFree = restaurant.dishes.some((d) => d.isGlutenFree);

  const hasValidImg = isValidUrl(restaurant.imageUrl) && !imgError;

  return (
    <div
      onClick={() => onSelect(restaurant)}
      className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between h-full"
    >
      <div>
        {/* Card Header Image or Fallback */}
        <div className="relative h-44 w-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
          {hasValidImg ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-4 text-center">
              <Store className="w-12 h-12 mb-1 opacity-70" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {restaurant.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <OpenStatusBadge isOpen={isOpen} hours={restaurant.openingHours} />
              {isOffline && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider"
                  title="Aplicação offline — dados exibidos do cache"
                >
                  <WifiOff className="w-3 h-3" />
                  Offline
                </span>
              )}
              {isOwner && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                  <UserCheck className="w-3 h-3" />
                  Seu Local
                </span>
              )}
            </div>
            {restaurant.hasStudentDiscount && <StudentDiscountBadge details={restaurant.studentDiscountDetails} />}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Offline Warning Alert */}
          {isOffline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200/80 dark:border-amber-800/60">
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Offline — exibindo dados em cache</span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {onToggleFavorite && (
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(restaurant.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isFavorite
                      ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                      : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                  title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <motion.div
                    key={isFavorite ? 'fav' : 'unfav'}
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 600,
                      damping: 10,
                      mass: 0.4,
                    }}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
                  </motion.div>
                </motion.button>
              )}

              {onShare && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(restaurant);
                  }}
                  className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Compartilhar restaurante"
                  aria-label="Compartilhar restaurante"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Opening Hours & Rating Info */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{restaurant.openingHours}</span>
            </div>
            <RatingDisplay average={avgRating} count={ratingCount} size="sm" />
          </div>

          {restaurant.campusZone && (
            <div>
              <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md truncate inline-block max-w-[220px]">
                {restaurant.campusZone}
              </span>
            </div>
          )}

          {/* Dietary Summary */}
          <DietaryBadges
            isLactoseFree={hasLactoseFree}
            isVegan={hasVegan}
            isGlutenFree={hasGlutenFree}
            compact={true}
          />

          {/* Dishes Count & Price Summary */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Utensils className="w-3.5 h-3.5 text-orange-500" />
              {restaurant.dishes.length} prato{restaurant.dishes.length !== 1 ? 's' : ''}
            </span>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                {minPrice === maxPrice ? 'A partir de' : 'Faixa de preço'}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm text-orange-600 dark:text-orange-400">
                {minPrice === maxPrice
                  ? formatCurrency(minPrice)
                  : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400 group-hover:bg-orange-50/50 dark:group-hover:bg-orange-950/20 transition-colors">
        <span>Ver cardápio e detalhes</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
