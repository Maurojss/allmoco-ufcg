import React, { useState, useMemo } from 'react';
import { Restaurant, Dish, SpendingDishItem, SpendingHistorySummary } from '../types';
import { User } from '../lib/firebase';
import { formatCurrency } from '../utils/time';
import {
  X,
  User as UserIcon,
  Heart,
  Wallet,
  DollarSign,
  TrendingDown,
  Calendar,
  Sparkles,
  Store,
  Plus,
  Trash2,
  CheckCircle2,
  GraduationCap,
  PieChart as PieChartIcon,
  Utensils,
  ChevronRight,
  LogOut,
  LogIn,
  Info,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  restaurants: Restaurant[];
  favoriteRestaurantIds: string[];
  favoriteDishIds: string[];
  spendingFrequency: { [dishId: string]: number };
  onToggleFavoriteRestaurant: (id: string) => void;
  onToggleFavoriteDish: (dishId: string) => void;
  onUpdateDishFrequency: (dishId: string, days: number) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onLoginGoogle: () => void;
  onLogout: () => void;
}

type ProfileTab = 'spending' | 'favorites' | 'my-places';

const COLORS = ['#ea580c', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  restaurants,
  favoriteRestaurantIds,
  favoriteDishIds,
  spendingFrequency,
  onToggleFavoriteRestaurant,
  onToggleFavoriteDish,
  onUpdateDishFrequency,
  onSelectRestaurant,
  onLoginGoogle,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('spending');
  const [selectedQuickSchedule, setSelectedQuickSchedule] = useState<'5d' | '3d' | '7d' | 'custom'>('custom');
  const [showAddDishSelector, setShowAddDishSelector] = useState(false);

  if (!isOpen) return null;

  // Flatten all available dishes across all restaurants
  const allDishesWithRestaurant = useMemo(() => {
    const list: Array<{ dish: Dish; restaurant: Restaurant }> = [];
    restaurants.forEach((r) => {
      r.dishes.forEach((d) => {
        list.push({ dish: d, restaurant: r });
      });
    });
    return list;
  }, [restaurants]);

  // Active Spending Items (from favorite dishes)
  const spendingItems: SpendingDishItem[] = useMemo(() => {
    const items: SpendingDishItem[] = [];

    favoriteDishIds.forEach((dishId) => {
      const match = allDishesWithRestaurant.find((item) => item.dish.id === dishId);
      if (match) {
        const days = spendingFrequency[dishId] ?? 1;
        items.push({
          dishId: match.dish.id,
          restaurantId: match.restaurant.id,
          restaurantName: match.restaurant.name,
          dishName: match.dish.name,
          price: match.dish.price,
          daysPerWeek: days,
          hasStudentDiscount: match.restaurant.hasStudentDiscount,
        });
      }
    });

    return items;
  }, [favoriteDishIds, allDishesWithRestaurant, spendingFrequency]);

  // Calculate Totals & Summaries
  const summary: SpendingHistorySummary = useMemo(() => {
    let weeklyTotal = 0;
    let totalMealDays = 0;

    spendingItems.forEach((item) => {
      weeklyTotal += item.price * item.daysPerWeek;
      totalMealDays += item.daysPerWeek;
    });

    const activeDays = Math.max(1, Math.min(7, totalMealDays || 5));
    const averageDaily = weeklyTotal > 0 ? weeklyTotal / activeDays : 0;
    const monthlyTotal = weeklyTotal * 4.33; // Average weeks per month

    // RU UFCG subsidized comparison (R$ 3.50 per meal)
    const ruWeeklyCost = 3.5 * (totalMealDays || 5);
    const ruComparisonSavings = weeklyTotal - ruWeeklyCost;

    return {
      totalWeekly: weeklyTotal,
      averageDaily,
      totalMonthly: monthlyTotal,
      ruComparisonSavings,
      itemCount: spendingItems.length,
    };
  }, [spendingItems]);

  // Chart data for spending breakdown per restaurant
  const chartData = useMemo(() => {
    const map: Record<string, { name: string; total: number }> = {};

    spendingItems.forEach((item) => {
      const cost = item.price * item.daysPerWeek;
      if (!map[item.restaurantId]) {
        // Shorten restaurant name for chart readability
        const shortName =
          item.restaurantName.length > 18
            ? item.restaurantName.substring(0, 16) + '...'
            : item.restaurantName;
        map[item.restaurantId] = { name: shortName, total: 0 };
      }
      map[item.restaurantId].total += cost;
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [spendingItems]);

  // Favorite Restaurants List
  const favoriteRestaurants = useMemo(() => {
    return restaurants.filter((r) => favoriteRestaurantIds.includes(r.id));
  }, [restaurants, favoriteRestaurantIds]);

  // My Created Restaurants
  const myRestaurants = useMemo(() => {
    if (!currentUser) return [];
    return restaurants.filter((r) => r.ownerId === currentUser.uid);
  }, [restaurants, currentUser]);

  // Apply Quick Preset (e.g. 5 days, 3 days, 7 days)
  const handleApplyPreset = (type: '5d' | '3d' | '7d') => {
    setSelectedQuickSchedule(type);
    const defaultDays = type === '5d' ? 5 : type === '3d' ? 3 : 7;

    if (spendingItems.length === 1) {
      onUpdateDishFrequency(spendingItems[0].dishId, defaultDays);
    } else if (spendingItems.length > 1) {
      // Distribute evenly among items
      const baseDays = Math.max(1, Math.floor(defaultDays / spendingItems.length));
      spendingItems.forEach((item, index) => {
        const days = index === 0 ? defaultDays - (baseDays * (spendingItems.length - 1)) : baseDays;
        onUpdateDishFrequency(item.dishId, Math.max(1, days));
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with User Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Usuário'}
                  className="w-14 h-14 rounded-2xl border-2 border-white/60 shadow-md object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl shadow-md border-2 border-white/60">
                  {currentUser?.displayName ? currentUser.displayName[0] : <UserIcon className="w-7 h-7" />}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                    {currentUser?.displayName || 'Estudante UFCG'}
                  </h2>
                  <span className="text-[10px] font-extrabold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                    Campus Bodocongó
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 font-medium">
                  {currentUser?.email || 'Perfil Local & Simulação de Gastos'}
                </p>
              </div>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={onLogout}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Conta</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLoginGoogle}
                className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-slate-800 hover:bg-amber-50 text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-orange-600" />
                <span>Entrar com Google</span>
              </button>
            )}
          </div>

          {/* Tab Navigation in Profile */}
          <div className="flex items-center gap-2 mt-5 border-t border-white/20 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('spending')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'spending'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Gastos Semanais Estimados</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'favorites'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Restaurantes Favoritos ({favoriteRestaurants.length})</span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => setActiveTab('my-places')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'my-places'
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Meus Locais ({myRestaurants.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {activeTab === 'spending' && (
            <div className="space-y-6">
              
              {/* Overview Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Total Weekly Metric Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/70 dark:from-orange-950/40 dark:to-amber-950/30 border border-orange-200 dark:border-orange-900/60 shadow-xs">
                  <div className="flex items-center justify-between text-orange-700 dark:text-orange-300 mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-wide">
                      Custo Total Semanal
                    </span>
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
                    {formatCurrency(summary.totalWeekly)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Calculado com base em {summary.itemCount} prato(s) favorito(s)
                  </div>
                </div>

                {/* Daily Average Metric Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-wide">
                      Média Diária Letiva
                    </span>
                    <Calendar className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
                    {formatCurrency(summary.averageDaily)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Estimativa por dia de refeição no campus
                  </div>
                </div>

                {/* Monthly Projection Metric Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-wide">
                      Projeção Mensal (4 sem)
                    </span>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(summary.totalMonthly)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Planejamento financeiro acadêmico
                  </div>
                </div>
              </div>

              {/* RU Subsidy Comparison Notice */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-xs text-emerald-900 dark:text-emerald-200">
                  <span className="font-extrabold text-sm block">
                    Dica de Economia Estudantil (RU UFCG R$ 3,50)
                  </span>
                  <p className="mt-0.5 text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    Almoçar 5 dias no RU Bodocongó custa apenas <strong>R$ 17,50 / semana</strong>.
                    Combinando dias de RU com seus restaurantes favoritos do campus, você equilibra variedade e economia no mês.
                  </p>
                </div>
              </div>

              {/* Spending Breakdown by Restaurant (Bar Chart) */}
              {chartData.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <PieChartIcon className="w-4 h-4 text-orange-600" />
                      <span>Distribuição de Gastos por Estabelecimento (R$/semana)</span>
                    </h3>
                  </div>

                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          tickFormatter={(val) => `R$${val}`}
                        />
                        <Tooltip
                          formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Gasto Semanal']}
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            borderRadius: '0.75rem',
                            border: 'none',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Favorite Dishes & Frequency Manager */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-orange-600" />
                      <span>Pratos Favoritos na Estimativa ({spendingItems.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Ajuste a frequência semanal (dias de consumo) para calibrar seu orçamento.
                    </p>
                  </div>

                  {/* Quick Schedule Presets */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('5d')}
                      className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                        selectedQuickSchedule === '5d'
                          ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      5 Dias (Seg-Sex)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('3d')}
                      className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                        selectedQuickSchedule === '3d'
                          ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      3 Dias (Parcial)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddDishSelector(!showAddDishSelector)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar Prato</span>
                    </button>
                  </div>
                </div>

                {/* Add Dish Dropdown Selector */}
                {showAddDishSelector && (
                  <div className="p-3.5 bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-2xl space-y-2 animate-fade-in">
                    <span className="text-xs font-bold text-orange-950 dark:text-orange-200 block">
                      Selecione um prato para adicionar à sua simulação de gastos:
                    </span>
                    <div className="max-h-48 overflow-y-auto divide-y divide-orange-100 dark:divide-orange-900/40 rounded-xl bg-white dark:bg-slate-800 border border-orange-200/60 dark:border-slate-700">
                      {allDishesWithRestaurant
                        .filter((item) => !favoriteDishIds.includes(item.dish.id))
                        .map(({ dish, restaurant }) => (
                          <div
                            key={dish.id}
                            className="p-2.5 flex items-center justify-between hover:bg-orange-50/50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="min-w-0 pr-3">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block truncate">
                                {dish.name}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                                {restaurant.name} • {formatCurrency(dish.price)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onToggleFavoriteDish(dish.id);
                                onUpdateDishFrequency(dish.id, 1);
                                setShowAddDishSelector(false);
                              }}
                              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                            >
                              + Incluir
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Dish Items List */}
                {spendingItems.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Heart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Nenhum prato favorito adicionado à estimativa
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-3">
                      Adicione pratos aos seus favoritos no cardápio dos restaurantes para simular seu custo semanal com precisão.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddDishSelector(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Escolher Pratos Agora</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                    {spendingItems.map((item) => (
                      <div
                        key={item.dishId}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                              {item.dishName}
                            </h4>
                            {item.hasStudentDiscount && (
                              <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                Desconto Aluno
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.restaurantName} • {formatCurrency(item.price)} por refeição
                          </p>
                        </div>

                        {/* Frequency Controls & Item Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDishFrequency(item.dishId, Math.max(1, item.daysPerWeek - 1))
                              }
                              className="w-6 h-6 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 rounded-lg text-xs cursor-pointer shadow-2xs"
                              title="Diminuir dias"
                            >
                              -
                            </button>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 px-2 min-w-[50px] text-center">
                              {item.daysPerWeek}x / sem
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDishFrequency(item.dishId, Math.min(7, item.daysPerWeek + 1))
                              }
                              className="w-6 h-6 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 rounded-lg text-xs cursor-pointer shadow-2xs"
                              title="Aumentar dias"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[75px]">
                            <span className="text-[10px] text-slate-400 block font-semibold">Subtotal</span>
                            <span className="font-extrabold text-sm text-orange-600 dark:text-orange-400">
                              {formatCurrency(item.price * item.daysPerWeek)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onToggleFavoriteDish(item.dishId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Remover da simulação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 2: Favorite Restaurants List */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Store className="w-4 h-4 text-orange-600" />
                  <span>Restaurantes Favoritados ({favoriteRestaurants.length})</span>
                </h3>
              </div>

              {favoriteRestaurants.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Store className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Nenhum restaurante favoritado ainda
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                    Marque com o coração os restaurantes que você mais frequenta na UFCG para receber alertas de Prato do Dia e gerenciar seus custos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      onClick={() => {
                        onClose();
                        onSelectRestaurant(restaurant);
                      }}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50/40 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-all flex items-center gap-3 group"
                    >
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-orange-600 transition-colors">
                          {restaurant.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {restaurant.campusZone || 'UFCG Bodocongó'}
                        </p>
                        {restaurant.pratoDoDia && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 font-bold truncate">
                            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">{restaurant.pratoDoDia}</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: My Created Places */}
          {activeTab === 'my-places' && currentUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span>Locais Cadastrados por Você ({myRestaurants.length})</span>
                </h3>
              </div>

              {myRestaurants.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Você ainda não cadastrou nenhum restaurante
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                    Deseja cadastrar uma lanchonete, food truck ou restaurante do campus? Use a aba de cadastro.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      onClick={() => {
                        onClose();
                        onSelectRestaurant(restaurant);
                      }}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50/40 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-all flex items-center gap-3 group"
                    >
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-orange-600 transition-colors">
                          {restaurant.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {restaurant.dishes.length} pratos cadastrados
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 text-orange-600" />
            <span>Simulação de gastos baseada nos dados reais dos cardápios da UFCG.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
