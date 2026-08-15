import { Review } from '../types';

export interface RatingStats {
  average: number;
  count: number;
}

export interface RatingDistributionItem {
  stars: string;
  rating: number;
  count: number;
  percentage: number;
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

export function calculateRatingDistribution(
  ratings?: Record<string, number>,
  reviews?: Review[]
): RatingDistributionItem[] {
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

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const total = scoresMap.size;

  scoresMap.forEach((score) => {
    const rounded = Math.min(5, Math.max(1, Math.round(score)));
    counts[rounded] = (counts[rounded] || 0) + 1;
  });

  return [1, 2, 3, 4, 5].map((star) => ({
    stars: `${star}★`,
    rating: star,
    count: counts[star] || 0,
    percentage: total > 0 ? Math.round(((counts[star] || 0) / total) * 100) : 0,
  }));
}

