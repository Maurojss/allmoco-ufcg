import React from 'react';
import { UtensilsCrossed, GraduationCap, Store, Sparkles, LogIn, LogOut, User as UserIcon, Building2, WifiOff } from 'lucide-react';
import { User } from '../lib/firebase';

interface HeaderProps {
  totalRestaurants: number;
  openCount: number;
  currentUser: User | null;
  isOffline?: boolean;
  onLoginGoogle: () => void;
  onLogout: () => void;
  showMyRestaurantsOnly: boolean;
  onToggleMyRestaurantsOnly: () => void;
  onOpenNutritionModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalRestaurants,
  openCount,
  currentUser,
  isOffline,
  onLoginGoogle,
  onLogout,
  showMyRestaurantsOnly,
  onToggleMyRestaurantsOnly,
  onOpenNutritionModal,
}) => {
  return (
    <header className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 text-white shadow-md border-b border-orange-500/30 relative">
      {/* Persistent Offline Notification Banner */}
      {isOffline && (
        <div className="bg-amber-400 text-slate-950 px-4 py-1.5 text-center text-xs font-extrabold flex items-center justify-center gap-2 border-b border-amber-500 shadow-inner">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Você está offline. Os dados dos restaurantes exibidos estão em modo cache local.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner flex items-center justify-center text-amber-200 shrink-0">
              <UtensilsCrossed className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white flex items-center gap-1.5">
                  allmoço <span className="text-amber-200">UFCG</span>
                </h1>
                <span className="bg-amber-300 text-amber-950 font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Campus UFCG
                </span>

                {isOffline && (
                  <span className="bg-amber-400 text-slate-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </span>
                )}
              </div>
              <p className="text-amber-100/90 text-xs sm:text-sm font-medium mt-0.5">
                Restaurantes, cardápios e descontos universitários no seu campus
              </p>
            </div>
          </div>

          {/* Header Action & User Profile / Stats */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {onOpenNutritionModal && (
              <button
                type="button"
                onClick={onOpenNutritionModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Calculadora Nutricional</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-3 bg-black/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs text-amber-100 font-medium">
              <div className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-200" />
                <span>
                  <strong className="text-white text-sm font-bold">{totalRestaurants}</strong> cadastrados
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span>
                  <strong className="text-emerald-200 text-sm font-bold">{openCount}</strong> abertos
                </span>
              </div>
            </div>

            {/* Google Login / User Menu */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-1.5 pr-2.5 rounded-2xl border border-white/20">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuário'}
                    className="w-7 h-7 rounded-full border border-white/40 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName ? currentUser.displayName[0] : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                
                <div className="text-left hidden lg:block">
                  <span className="block text-xs font-bold text-white truncate max-w-[120px]">
                    {currentUser.displayName || 'Estudante/Dono'}
                  </span>
                  <span className="block text-[10px] text-amber-200/80 truncate max-w-[120px]">
                    {currentUser.email}
                  </span>
                </div>

                {/* My Restaurants filter button */}
                <button
                  type="button"
                  onClick={onToggleMyRestaurantsOnly}
                  className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                    showMyRestaurantsOnly
                      ? 'bg-amber-300 text-amber-950 shadow-sm'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title="Ver apenas meus restaurantes cadastrados"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Meus Locais</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-amber-200 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLoginGoogle}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-slate-800 hover:bg-amber-50 font-extrabold text-xs shadow-md transition-all cursor-pointer border border-amber-200"
              >
                {/* Official Google G Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com Google</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
