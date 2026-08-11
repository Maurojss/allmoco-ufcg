import React, { useState } from 'react';
import { Review } from '../types';
import { Star, MessageSquare, Send, User as UserIcon, LogIn } from 'lucide-react';
import { User } from '../lib/firebase';

interface ReviewSectionProps {
  reviews?: Review[];
  userRating: number | null;
  currentUser?: User | null;
  onSubmitReview: (rating: number, comment: string) => void;
  onLoginGoogle?: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews = [],
  userRating,
  currentUser,
  onSubmitReview,
  onLoginGoogle,
}) => {
  const existingUserReview = currentUser
    ? reviews.find((r) => r.userId === currentUser.uid)
    : null;

  const [score, setScore] = useState<number>(
    existingUserReview?.rating || userRating || 5
  );
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<string>(
    existingUserReview?.comment || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeScore = hoverScore !== null ? hoverScore : score;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onLoginGoogle) onLoginGoogle();
      return;
    }

    if (score < 1 || score > 5) return;

    setIsSubmitting(true);
    onSubmitReview(score, commentText.trim());
    setIsSubmitting(false);
  };

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span>Avaliações e Comentários</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {reviews.length}
          </span>
        </h3>
      </div>

      {/* Review Form Box */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {currentUser
              ? existingUserReview
                ? 'Editar sua avaliação:'
                : 'Deixar sua avaliação e comentário:'
              : 'Faça login para avaliar:'}
          </span>

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
                    if (!currentUser) {
                      if (onLoginGoogle) onLoginGoogle();
                      return;
                    }
                    setScore(starIndex);
                  }}
                  className="p-1 rounded-lg transition-transform hover:scale-110 cursor-pointer focus:outline-hidden"
                  title={`${starIndex} estrela${starIndex > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {currentUser ? (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escreva seu comentário sobre o cardápio, atendimento ou ambiente..."
              rows={2}
              maxLength={300}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{commentText.length}/300 caracteres</span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{existingUserReview ? 'Atualizar comentário' : 'Publicar comentário'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Entre com sua conta Google para enviar sua nota e comentário.
            </p>
            {onLoginGoogle && (
              <button
                type="button"
                onClick={onLoginGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-orange-500" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="p-6 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 space-y-1">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-semibold">Nenhum comentário ainda</p>
            <p className="text-[11px] text-slate-400">
              Seja o primeiro a compartilhar sua experiência sobre este restaurante!
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <ReviewCard key={rev.id} review={rev} />
          ))
        )}
      </div>
    </div>
  );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        {/* User Info (Avatar & Name) */}
        <div className="flex items-center gap-2.5 min-w-0">
          {review.userPhoto && !imgError ? (
            <img
              src={review.userPhoto}
              alt={review.userName}
              onError={() => setImgError(true)}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800">
              {getInitials(review.userName)}
            </div>
          )}

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {review.userName}
            </h4>
            <span className="text-[10px] text-slate-400 block">
              {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Rating Stars Badge */}
        <div className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-full shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3 h-3 ${
                s <= review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-200 dark:text-slate-700'
              }`}
            />
          ))}
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 ml-1">
            {review.rating}.0
          </span>
        </div>
      </div>

      {/* Review Comment Text */}
      {review.comment ? (
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
          "{review.comment}"
        </p>
      ) : (
        <p className="text-[11px] text-slate-400 italic pl-10">
          Avaliação enviada sem texto.
        </p>
      )}
    </div>
  );
};
