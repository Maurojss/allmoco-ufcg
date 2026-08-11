import { Review } from '../types';

export interface RatingStats {
  average: number;
  count: number;
}

export function calculateRatingStats(
  ratings?: Record<string, number>,
  reviews?: Review[]
): RatingStats {
  const scoresMap = new Map<string, number>();

  if (ratings && typeof ratings === 'object') {
    Object.entries(ratings).forEach(([uid, score]) => {
      if (typeof score === 'number' && !isNaN(score) && score >= 1 && score <= 5) {
        scoresMap.set(uid, score);
      }
    });
  }

  if (Array.isArray(reviews)) {
    reviews.forEach((rev) => {
      if (typeof rev.rating === 'number' && rev.rating >= 1 && rev.rating <= 5) {
        scoresMap.set(rev.userId || rev.id, rev.rating);
      }
    });
  }

  const scores = Array.from(scoresMap.values());

  if (scores.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  const average = Math.round((sum / scores.length) * 10) / 10;

  return { average, count: scores.length };
}
