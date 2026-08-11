import React from 'react';
import { UtensilsCrossed, FilterX, PlusCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
  onAddRestaurant: () => void;
  onReseedDefaults?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  hasFilters,
  onResetFilters,
  onAddRestaurant,
  onReseedDefaults,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-lg mx-auto my-8 space-y-4 shadow-sm">
      <div className="w-16 h-16 mx-auto bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center border border-orange-200 dark:border-orange-800/50">
        <UtensilsCrossed className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {hasFilters ? 'Nenhum restaurante encontrado' : 'Nenhum restaurante cadastrado'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {hasFilters
            ? 'Não encontramos restaurantes ou pratos que correspondam aos filtros selecionados. Tente ajustar os parâmetros de busca.'
            : 'Ainda não há restaurantes cadastrados no banco de dados. Você pode adicionar manualmente ou recarregar os restaurantes padrão da UFCG.'}
        </p>
      </div>

      <div className="pt-2 flex flex-wrap justify-center gap-3">
        {hasFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <FilterX className="w-4 h-4" />
            <span>Limpar Filtros</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onAddRestaurant}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Restaurante</span>
            </button>

            {onReseedDefaults && (
              <button
                type="button"
                onClick={onReseedDefaults}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restaurar Restaurantes Padrão</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
