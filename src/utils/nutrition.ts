export interface FoodNutritionDensity {
  id: string;
  name: string;
  category: string;
  caloriesPer100g: number; // kcal
  proteinPer100g: number; // g
  carbsPer100g: number; // g
  fatsPer100g: number; // g
  fiberPer100g: number; // g
  typicalWeightGrams: number;
}

export const COMMON_CAMPUS_FOODS: FoodNutritionDensity[] = [
  {
    id: 'coxinha-frango',
    name: 'Coxinha de Frango com Catupiry',
    category: 'Salgados Fritos',
    caloriesPer100g: 260,
    proteinPer100g: 11,
    carbsPer100g: 28,
    fatsPer100g: 12,
    fiberPer100g: 1.2,
    typicalWeightGrams: 150,
  },
  {
    id: 'pastel-carne',
    name: 'Pastel Frito (Carne / Frango / Queijo)',
    category: 'Salgados Fritos',
    caloriesPer100g: 285,
    proteinPer100g: 9.5,
    carbsPer100g: 32,
    fatsPer100g: 14,
    fiberPer100g: 1.5,
    typicalWeightGrams: 180,
  },
  {
    id: 'pao-de-queijo',
    name: 'Pão de Queijo Recheado / Tradicional',
    category: 'Salgados Assados',
    caloriesPer100g: 310,
    proteinPer100g: 6.5,
    carbsPer100g: 38,
    fatsPer100g: 15,
    fiberPer100g: 0.8,
    typicalWeightGrams: 90,
  },
  {
    id: 'espetinho-carne',
    name: 'Espetinho de Carne na Brasa',
    category: 'Churrasco & Carnes',
    caloriesPer100g: 210,
    proteinPer100g: 26,
    carbsPer100g: 1,
    fatsPer100g: 11,
    fiberPer100g: 0,
    typicalWeightGrams: 120,
  },
  {
    id: 'espetinho-frango',
    name: 'Espetinho de Frango Grelhado',
    category: 'Churrasco & Carnes',
    caloriesPer100g: 165,
    proteinPer100g: 28,
    carbsPer100g: 0.5,
    fatsPer100g: 5.5,
    fiberPer100g: 0,
    typicalWeightGrams: 120,
  },
  {
    id: 'marmita-pf',
    name: 'Prato Feito / Marmitex Tradicional (Arroz, Feijão, Proteína)',
    category: 'Refeições Completas',
    caloriesPer100g: 145,
    proteinPer100g: 7.5,
    carbsPer100g: 18.5,
    fatsPer100g: 4.8,
    fiberPer100g: 2.1,
    typicalWeightGrams: 500,
  },
  {
    id: 'strogonoff-frango',
    name: 'Strogonoff de Frango com Batata Palha',
    category: 'Refeições Completas',
    caloriesPer100g: 175,
    proteinPer100g: 10,
    carbsPer100g: 14,
    fatsPer100g: 8.5,
    fiberPer100g: 1.1,
    typicalWeightGrams: 450,
  },
  {
    id: 'pizza-calabresa',
    name: 'Pizza de Calabresa ou Muçarela',
    category: 'Massas & Pizzas',
    caloriesPer100g: 265,
    proteinPer100g: 11.5,
    carbsPer100g: 29,
    fatsPer100g: 11.8,
    fiberPer100g: 1.4,
    typicalWeightGrams: 160,
  },
  {
    id: 'acai-completo',
    name: 'Açaí na Tigela (com Banana e Granola)',
    category: 'Sobremesas & Doces',
    caloriesPer100g: 135,
    proteinPer100g: 2.2,
    carbsPer100g: 22,
    fatsPer100g: 4.5,
    fiberPer100g: 2.8,
    typicalWeightGrams: 300,
  },
];

export interface CalculatedNutrition {
  weightGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export function calculateNutrition(
  density: FoodNutritionDensity,
  weightGrams: number
): CalculatedNutrition {
  const factor = Math.max(0, weightGrams) / 100;
  return {
    weightGrams,
    calories: Math.round(density.caloriesPer100g * factor),
    protein: Number((density.proteinPer100g * factor).toFixed(1)),
    carbs: Number((density.carbsPer100g * factor).toFixed(1)),
    fats: Number((density.fatsPer100g * factor).toFixed(1)),
    fiber: Number((density.fiberPer100g * factor).toFixed(1)),
  };
}
