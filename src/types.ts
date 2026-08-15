export interface Dish {
  id: string;
  name: string;
  size: string; // e.g., 'Marmita P', '500g', 'Prato Feito'
  availableDays: string; // e.g., 'Segunda a Sexta', 'Todos os dias'
  price: number; // in R$
  description: string;
  isLactoseFree: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: number;
}

export interface Restaurant {
  id: string;
  name: string;
  imageUrl: string;
  googleMapsUrl: string;
  openingHours: string; // e.g., '11:00 - 14:30' or '18:00 - 02:00'
  hasStudentDiscount: boolean;
  studentDiscountDetails?: string; // e.g., '10% de desconto com carteirinha'
  campusZone?: string; // e.g., 'Anel Universitário', 'Praça Central', etc.
  coordinates?: { x: number; y: number }; // Percentage coordinates (0-100) on campus map
  pratoDoDia?: string; // e.g., 'Carne de Sol na Manteiga com Macaxeira'
  dishes: Dish[];
  createdAt: number;
  ratings?: Record<string, number>; // Map of userId -> score (1..5)
  reviews?: Review[];
  ownerId?: string;
  ownerEmail?: string;
  ownerName?: string;
}

export interface FilterState {
  searchRestaurant: string;
  searchDish: string;
  minPrice: string;
  maxPrice: string;
  lactoseFreeOnly: boolean;
  veganOnly: boolean;
  glutenFreeOnly: boolean;
  openNowOnly: boolean;
  favoritesOnly: boolean;
}

export type TabType = 'list' | 'map' | 'form';

export interface SpendingDishItem {
  dishId: string;
  restaurantId: string;
  restaurantName: string;
  dishName: string;
  price: number;
  daysPerWeek: number; // 1 to 7
  mealType?: 'almoco' | 'jantar' | 'lanche';
  hasStudentDiscount?: boolean;
}

export interface SpendingHistorySummary {
  totalWeekly: number;
  averageDaily: number;
  totalMonthly: number;
  ruComparisonSavings: number;
  itemCount: number;
}
