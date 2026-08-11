import React, { useState } from 'react';
import { COMMON_CAMPUS_FOODS, FoodNutritionDensity, calculateNutrition } from '../utils/nutrition';
import {
  Calculator,
  Flame,
  Scale,
  Sparkles,
  ChevronDown,
  Info,
  Bot,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Utensils,
  Wheat,
} from 'lucide-react';

interface AiNutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  explanation: string;
  productName: string;
  weightGrams: number;
}

const SAMPLE_DISH_SUGGESTIONS = [
  'Marmita Executiva de Frango Grelhado',
  'Feijoada Vegana com Couve',
  'Strogonoff de Carne com Batata Palha',
  'Tapioca de Frango com Requeijão',
  'Burger Smash com Queijo',
  'Bowl de Açaí com Granola',
  'Pastel de Frango com Catupiry',
  'Jantinha com Espetinho de Carne',
];

export const NutritionCalculatorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'standard'>('ai');

  // AI Mode States
  const [customDishName, setCustomDishName] = useState<string>('Marmita Executiva de Frango Grelhado');
  const [aiWeightGrams, setAiWeightGrams] = useState<number>(450);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiNutritionResult | null>(null);

  // Standard Mode States
  const [selectedFoodId, setSelectedFoodId] = useState<string>(COMMON_CAMPUS_FOODS[0].id);
  const [customWeight, setCustomWeight] = useState<number>(COMMON_CAMPUS_FOODS[0].typicalWeightGrams);

  if (!isOpen) return null;

  const currentStandardFood =
    COMMON_CAMPUS_FOODS.find((f) => f.id === selectedFoodId) || COMMON_CAMPUS_FOODS[0];

  const standardNutrition = calculateNutrition(currentStandardFood, customWeight);

  const handleSelectStandardFood = (food: FoodNutritionDensity) => {
    setSelectedFoodId(food.id);
    setCustomWeight(food.typicalWeightGrams);
  };

  const handleEstimateAiNutrition = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customDishName.trim()) {
      setAiError('Por favor, informe o nome do prato ou alimento.');
      return;
    }

    setIsLoadingAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/estimate-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: customDishName.trim(),
          weightGrams: aiWeightGrams,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao estimar nutrição com IA.');
      }

      setAiResult(data);
    } catch (err: any) {
      console.error('Erro ao estimar valores nutricionais:', err);
      setAiError(
        err.message || 'Não foi possível conectar ao serviço de IA. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-xl shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Calculadora Nutricional do Campus</span>
                <span className="text-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                  IA + TACO
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estime calorias e macronutrientes por produto, prato e gramatura
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Estimativa Inteligente (IA)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('standard')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'standard'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Tabela de Alimentos Padrão</span>
          </button>
        </div>

        {/* TAB 1: AI-BASED ESTIMATION */}
        {activeTab === 'ai' && (
          <div className="space-y-4 animate-fade-in">
            <form onSubmit={handleEstimateAiNutrition} className="space-y-4">
              {/* Product Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Digite o nome do prato ou produto do campus:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customDishName}
                    onChange={(e) => setCustomDishName(e.target.value)}
                    placeholder="Ex: Strogonoff de frango com batata palha..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Sugestões:</span>
                  {SAMPLE_DISH_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setCustomDishName(sug);
                        setAiResult(null);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-orange-950/40 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Slider & Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-orange-600" />
                    <span>2. Peso/Porção estimada (em gramas):</span>
                  </label>
                  <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2.5 py-0.5 rounded-md border border-orange-200 dark:border-orange-800/50">
                    {aiWeightGrams}g
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={aiWeightGrams}
                    onChange={(e) => setAiWeightGrams(Number(e.target.value))}
                    className="w-full accent-orange-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={aiWeightGrams}
                    onChange={(e) => setAiWeightGrams(Math.max(1, Number(e.target.value)))}
                    className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-center text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Quick Weight Chips */}
                <div className="flex items-center gap-2 mt-2">
                  {[100, 250, 400, 550, 700].map((wt) => (
                    <button
                      key={wt}
                      type="button"
                      onClick={() => setAiWeightGrams(wt)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        aiWeightGrams === wt
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {wt}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoadingAi || !customDishName.trim()}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingAi ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Calculando estimativa com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Calcular Calorias & Macros com IA</span>
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {aiError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>{aiError}</p>
              </div>
            )}

            {/* AI Output Result Card */}
            {aiResult && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden space-y-4 animate-fade-in border border-slate-800">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-orange-500/20 rounded-full blur-xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-orange-400 font-extrabold uppercase tracking-wider">
                      <Bot className="w-4 h-4" />
                      <span>Estimativa Gerada por IA ({aiResult.weightGrams}g)</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-0.5">{aiResult.productName}</h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-2xl font-black text-orange-400 flex items-center gap-1 justify-start sm:justify-end">
                      <Flame className="w-5 h-5 fill-orange-400" />
                      {aiResult.calories}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Kcal Totais</span>
                  </div>
                </div>

                {/* Macros Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
                    <span className="text-[11px] text-slate-400 block font-medium">Proteínas</span>
                    <span className="text-lg font-extrabold text-emerald-400">{aiResult.protein}g</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
                    <span className="text-[11px] text-slate-400 block font-medium">Carboidratos</span>
                    <span className="text-lg font-extrabold text-amber-400">{aiResult.carbs}g</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
                    <span className="text-[11px] text-slate-400 block font-medium">Gorduras</span>
                    <span className="text-lg font-extrabold text-rose-400">{aiResult.fats}g</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
                    <span className="text-[11px] text-slate-400 block font-medium">Fibras</span>
                    <span className="text-lg font-extrabold text-cyan-400">{aiResult.fiber}g</span>
                  </div>
                </div>

                {/* AI Explanation Note */}
                {aiResult.explanation && (
                  <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      <strong>Análise Nutricional:</strong> {aiResult.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STANDARD FOOD TABLE (TACO/TBCA) */}
        {activeTab === 'standard' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                1. Selecione o tipo de alimento da tabela:
              </label>
              <div className="relative">
                <select
                  value={selectedFoodId}
                  onChange={(e) => {
                    const food = COMMON_CAMPUS_FOODS.find((f) => f.id === e.target.value);
                    if (food) handleSelectStandardFood(food);
                  }}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {COMMON_CAMPUS_FOODS.map((food) => (
                    <option key={food.id} value={food.id}>
                      {food.name} ({food.category})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-orange-600" />
                  <span>2. Peso estimado do produto (em gramas):</span>
                </label>
                <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800/50">
                  {customWeight}g
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="30"
                  max="800"
                  step="5"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <input
                  type="number"
                  min="10"
                  max="1500"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(Math.max(1, Number(e.target.value)))}
                  className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-center text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Standard Nutrition Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-orange-500/20 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block">
                    Tabela TACO/TBCA ({customWeight}g)
                  </span>
                  <h3 className="text-base font-bold text-slate-100">{currentStandardFood.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-orange-400 flex items-center gap-1 justify-end">
                    <Flame className="w-5 h-5 fill-orange-400" />
                    {standardNutrition.calories}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Kcal Totais</span>
                </div>
              </div>

              {/* Macros Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-400 block font-medium">Proteínas</span>
                  <span className="text-lg font-extrabold text-emerald-400">{standardNutrition.protein}g</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-400 block font-medium">Carboidratos</span>
                  <span className="text-lg font-extrabold text-amber-400">{standardNutrition.carbs}g</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-400 block font-medium">Gorduras</span>
                  <span className="text-lg font-extrabold text-rose-400">{standardNutrition.fats}g</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-400 block font-medium">Fibras</span>
                  <span className="text-lg font-extrabold text-cyan-400">{standardNutrition.fiber}g</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informative Note */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Nota de Isenção:</strong> Os valores gerados são estimativas aproximadas para orientação nutricional em porções universitárias. Para dietas médicas específicas, consulte um nutricionista.
          </p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Fechar Calculadora
          </button>
        </div>
      </div>
    </div>
  );
};
