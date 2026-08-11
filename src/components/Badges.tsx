import React from 'react';
import { Utensils, CheckCircle2, Clock, GraduationCap } from 'lucide-react';

interface DietaryBadgeProps {
  isLactoseFree?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  compact?: boolean;
}

export const DietaryBadges: React.FC<DietaryBadgeProps> = ({
  isLactoseFree,
  isVegan,
  isGlutenFree,
  compact = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 my-1.5">
      {isLactoseFree && (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md transition-colors ${
            compact ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700`}
          title="Sem Lactose"
        >
          <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1 rounded">SL</span>
          {!compact && <span>Sem Lactose</span>}
        </span>
      )}

      {isVegan && (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md transition-colors ${
            compact ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } bg-emerald-600 text-white shadow-xs`}
          title="Vegano"
        >
          <span className="font-mono text-[10px] bg-emerald-800/40 px-1 rounded">VG</span>
          {!compact && <span>Vegano</span>}
        </span>
      )}

      {isGlutenFree && (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md transition-colors ${
            compact ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } bg-blue-600 text-white shadow-xs`}
          title="Sem Glúten"
        >
          <span className="font-mono text-[10px] bg-blue-800/40 px-1 rounded">SG</span>
          {!compact && <span>Sem Glúten</span>}
        </span>
      )}
    </div>
  );
};

export const OpenStatusBadge: React.FC<{ isOpen: boolean; hours?: string }> = ({ isOpen, hours }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isOpen
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
      }`}
      title={hours ? `Horário: ${hours}` : undefined}
    >
      <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
      <span>{isOpen ? 'Aberto agora' : 'Fechado'}</span>
    </span>
  );
};

export const StudentDiscountBadge: React.FC<{ details?: string }> = ({ details }) => {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50"
      title={details || 'Desconto ou benefício para estudantes'}
    >
      <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span>Desconto Estudante</span>
    </span>
  );
};
