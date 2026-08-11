import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  average: number;
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  average,
  count,
  size = 'sm',
  showCount = true,
}) => {
  const iconSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  const textSizeClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  if (count === 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium ${textSizeClass}`}>
        <Star className={`${iconSizeClass} text-slate-300 dark:text-slate-600`} />
        <span>Sem avaliações</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0">
      <div className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
        <Star className={`${iconSizeClass} fill-amber-400 text-amber-400`} />
      </div>
      <span className={`font-bold text-slate-800 dark:text-slate-100 ${textSizeClass}`}>
        {average.toFixed(1)}
      </span>
      {showCount && (
        <span className={`text-slate-500 dark:text-slate-400 font-normal ${textSizeClass}`}>
          ({count})
        </span>
      )}
    </div>
  );
};

interface InteractiveRatingProps {
  userRating: number | null; // 1..5 or null if not rated yet
  onRate: (score: number) => void;
  isLoggedIn: boolean;
  onRequireLogin?: () => void;
}

export const InteractiveRating: React.FC<InteractiveRatingProps> = ({
  userRating,
  onRate,
  isLoggedIn,
  onRequireLogin,
}) => {
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const activeScore = hoverScore !== null ? hoverScore : userRating || 0;

  return (
    <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {userRating ? 'Sua nota:' : 'Avaliar restaurante:'}
        </span>
        {userRating && (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {userRating} de 5 estrelas
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= activeScore;

          return (
            <button
              key={starIndex}
              type="button"
              onMouseEnter={() => setHoverScore(starIndex)}
              onMouseLeave={() => setHoverScore(null)}
              onClick={() => {
                if (!isLoggedIn) {
                  if (onRequireLogin) onRequireLogin();
                  return;
                }
                onRate(starIndex);
              }}
              className="p-1 rounded-lg transition-transform hover:scale-110 cursor-pointer focus:outline-hidden"
              title={`${starIndex} estrela${starIndex > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {!isLoggedIn && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Faça login com sua conta do Google para enviar sua avaliação.
        </p>
      )}
    </div>
  );
};
