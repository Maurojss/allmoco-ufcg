import React from 'react';
import { TabType } from '../types';
import { Utensils, MapPin, PlusCircle, Edit3 } from 'lucide-react';

interface NavbarTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isEditing?: boolean;
}

export const NavbarTabs: React.FC<NavbarTabsProps> = ({
  activeTab,
  onTabChange,
  isEditing = false,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4 py-3 sm:py-0" aria-label="Abas de navegação">
          <button
            type="button"
            onClick={() => onTabChange('list')}
            className={`flex items-center justify-center gap-2 px-5 py-3 font-semibold text-sm rounded-lg sm:rounded-none sm:border-b-2 transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-orange-50 sm:bg-transparent text-orange-600 border-orange-600 dark:bg-orange-950/30 dark:text-orange-400 font-bold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 border-transparent hover:border-slate-300'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Restaurantes Disponíveis</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('map')}
            className={`flex items-center justify-center gap-2 px-5 py-3 font-semibold text-sm rounded-lg sm:rounded-none sm:border-b-2 transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-orange-50 sm:bg-transparent text-orange-600 border-orange-600 dark:bg-orange-950/30 dark:text-orange-400 font-bold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 border-transparent hover:border-slate-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Mapa do Campus</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('form')}
            className={`flex items-center justify-center gap-2 px-5 py-3 font-semibold text-sm rounded-lg sm:rounded-none sm:border-b-2 transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-orange-50 sm:bg-transparent text-orange-600 border-orange-600 dark:bg-orange-950/30 dark:text-orange-400 font-bold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 border-transparent hover:border-slate-300'
            }`}
          >
            {isEditing ? (
              <>
                <Edit3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>Editar Restaurante</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Adicionar Restaurante</span>
              </>
            )}
          </button>
        </nav>
      </div>
    </div>
  );
};
