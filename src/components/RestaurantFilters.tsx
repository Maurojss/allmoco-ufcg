import React from 'react';
import { FilterState } from '../types';
import { Search, FilterX, Clock, SlidersHorizontal, DollarSign, Heart } from 'lucide-react';

interface RestaurantFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  activeFilterCount: number;
}

export const RestaurantFilters: React.FC<RestaurantFiltersProps> = ({
  filters,
  onChange,
  onReset,
  activeFilterCount,
}) => {
  const handleInputChange = (field: keyof FilterState, value: any) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 mb-6">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-base">
          <SlidersHorizontal className="w-5 h-5 text-orange-600" />
          <span>Filtros de Busca</span>
          {activeFilterCount > 0 && (
            <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 text-xs px-2.5 py-0.5 rounded-full font-extrabold">
              {activeFilterCount} ativo{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer transition-all self-start sm:self-auto"
          >
            <FilterX className="w-4 h-4" />
            <span>Limpar todos os filtros</span>
          </button>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Search Restaurant */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Nome do restaurante
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchRestaurant}
              onChange={(e) => handleInputChange('searchRestaurant', e.target.value)}
              placeholder="Ex: RU, Cantina, Coruja..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Search Dish */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Nome ou ingrediente do prato
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchDish}
              onChange={(e) => handleInputChange('searchDish', e.target.value)}
              placeholder="Ex: Strogonoff, Burger, Feijoada..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Preço Mínimo (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                R$
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={filters.minPrice}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Preço Máximo (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                R$
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={filters.maxPrice}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                placeholder="50.00"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Toggles & Restrictions Row */}
      <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-4">
        
        {/* Apenas Favoritos Toggle */}
        <label
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
            filters.favoritesOnly
              ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.favoritesOnly}
            onChange={(e) => handleInputChange('favoritesOnly', e.target.checked)}
            className="sr-only"
          />
          <Heart className={`w-3.5 h-3.5 ${filters.favoritesOnly ? 'fill-white' : 'text-rose-500'}`} />
          <span>Apenas favoritos</span>
        </label>

        {/* Aberto Agora Toggle */}
        <label
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
            filters.openNowOnly
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.openNowOnly}
            onChange={(e) => handleInputChange('openNowOnly', e.target.checked)}
            className="sr-only"
          />
          <Clock className="w-3.5 h-3.5" />
          <span>Aberto agora</span>
        </label>

        {/* Sem Lactose */}
        <label
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
            filters.lactoseFreeOnly
              ? 'bg-slate-800 text-white border-slate-900 shadow-xs dark:bg-slate-200 dark:text-slate-900'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.lactoseFreeOnly}
            onChange={(e) => handleInputChange('lactoseFreeOnly', e.target.checked)}
            className="sr-only"
          />
          <span className="font-mono text-[10px] bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-1 rounded">
            SL
          </span>
          <span>Sem Lactose</span>
        </label>

        {/* Vegano */}
        <label
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
            filters.veganOnly
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.veganOnly}
            onChange={(e) => handleInputChange('veganOnly', e.target.checked)}
            className="sr-only"
          />
          <span className="font-mono text-[10px] bg-emerald-800 text-white px-1 rounded">
            VG
          </span>
          <span>Vegano</span>
        </label>

        {/* Sem Glúten */}
        <label
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
            filters.glutenFreeOnly
              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.glutenFreeOnly}
            onChange={(e) => handleInputChange('glutenFreeOnly', e.target.checked)}
            className="sr-only"
          />
          <span className="font-mono text-[10px] bg-blue-800 text-white px-1 rounded">
            SG
          </span>
          <span>Sem Glúten</span>
        </label>

      </div>

    </div>
  );
};
