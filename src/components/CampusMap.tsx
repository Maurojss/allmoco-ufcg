import React, { useState } from 'react';
import { Restaurant } from '../types';
import {
  MapPin,
  Compass,
  Store,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Navigation,
  DollarSign,
  GraduationCap,
} from 'lucide-react';

interface CampusMapProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

const ZONES = [
  { id: 'all', name: 'Todas as Áreas' },
  { id: 'anel', name: 'Anel Universitário' },
  { id: 'central', name: 'Praça & Centro de Convivência' },
  { id: 'exatas', name: 'Setor de Exatas e Engenharias' },
  { id: 'entradas', name: 'Entradas & Portões' },
];

export const CampusMap: React.FC<CampusMapProps> = ({ restaurants, onSelectRestaurant }) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [activePinId, setActivePinId] = useState<string | null>(null);

  const activeRestaurant = restaurants.find((r) => r.id === activePinId);

  // Filter restaurants by zone search keyword if filtered
  const filteredRestaurants = restaurants.filter((r) => {
    if (selectedZone === 'all') return true;
    const zoneLower = (r.campusZone || '').toLowerCase();
    const nameLower = r.name.toLowerCase();
    if (selectedZone === 'anel') return zoneLower.includes('anel') || nameLower.includes('anel');
    if (selectedZone === 'central')
      return zoneLower.includes('central') || zoneLower.includes('praça') || zoneLower.includes('convivência');
    if (selectedZone === 'exatas') return zoneLower.includes('exatas') || zoneLower.includes('engenharia');
    if (selectedZone === 'entradas') return zoneLower.includes('portão') || zoneLower.includes('entrada');
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Area Filter */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-xl">
                <Compass className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Mapa Interativo do Campus
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualize espacialmente os restaurantes no Anel Universitário, Praça Central e arredores
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {filteredRestaurants.length} locais no mapa
            </span>
          </div>
        </div>

        {/* Zone Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedZone(zone.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedZone === zone.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Visual Map Canvas + Sidebar List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Interactive Map Visual Stage (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative min-h-[460px] sm:min-h-[520px] flex flex-col justify-between p-4 sm:p-6">
          {/* Stylized Campus Ground SVG Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-orange-500/40" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#campus-grid)" />
              {/* Anel Universitário Loop Visual Ring */}
              <ellipse cx="40%" cy="42%" rx="30%" ry="28%" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="6 6" />
              {/* Campus Central Green Area */}
              <ellipse cx="52%" cy="50%" rx="18%" ry="16%" fill="#10b981" opacity="0.15" />
            </svg>
          </div>

          {/* Map Header Overlay */}
          <div className="relative z-10 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-200 font-semibold flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-orange-400" />
              <span>Planta Esquemática do Campus</span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-400">
              Anel Universitário & Setores
            </div>
          </div>

          {/* Interactive Map Pins Layer */}
          <div className="relative w-full h-[360px] sm:h-[420px] my-2">
            {/* Campus Center Marker */}
            <div className="absolute left-[50%] top-[48%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-500/40 bg-emerald-500/10 animate-pulse flex items-center justify-center">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest text-center px-1">
                  Praça Central
                </span>
              </div>
            </div>

            {/* Anel Ring Label */}
            <div className="absolute left-[20%] top-[18%] text-[10px] font-extrabold text-orange-400/80 uppercase tracking-widest pointer-events-none rotate-[-12deg]">
              ↺ Anel Universitário
            </div>

            {/* Render Pins for Restaurants */}
            {filteredRestaurants.map((rest, index) => {
              // Deterministic coordinates derived from rest.coordinates or index-based ring layout
              const coords = rest.coordinates || {
                x: 20 + ((index * 23) % 65),
                y: 18 + ((index * 31) % 62),
              };

              const isActive = rest.id === activePinId;
              const lowestPrice = Math.min(...rest.dishes.map((d) => d.price));

              return (
                <div
                  key={rest.id}
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                >
                  <button
                    type="button"
                    onClick={() => setActivePinId(isActive ? null : rest.id)}
                    className={`relative p-2 rounded-2xl transition-all duration-300 transform cursor-pointer flex items-center gap-1.5 shadow-lg ${
                      isActive
                        ? 'bg-orange-500 text-white scale-125 z-30 ring-4 ring-orange-400/40'
                        : 'bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white hover:scale-110 border border-slate-600 hover:border-orange-400'
                    }`}
                  >
                    <MapPin className={`w-4 h-4 ${isActive ? 'fill-white' : 'text-orange-400 group-hover:text-white'}`} />
                    <span className="text-[11px] font-extrabold whitespace-nowrap max-w-[100px] truncate">
                      {rest.name.split(' ')[0]}
                    </span>

                    {rest.hasStudentDiscount && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
                    )}
                  </button>

                  {/* Hover Popup Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-700 shadow-2xl w-48 z-40 pointer-events-none animate-fade-in">
                    <span className="font-bold text-orange-400 truncate">{rest.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{rest.campusZone || 'Campus Central'}</span>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800 text-[10px]">
                      <span className="text-emerald-400 font-bold">A partir de R$ {lowestPrice.toFixed(2)}</span>
                      <span className="text-slate-400">{rest.openingHours}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Footer Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-xs text-slate-300">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Restaurante / Bar</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Desconto Estudante</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Clique nos marcadores para ver detalhes</span>
          </div>
        </div>

        {/* Sidebar Info Card / Selected Pin Details */}
        <div className="space-y-4">
          {activeRestaurant ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-orange-500 shadow-xl space-y-4 animate-fade-in">
              <div className="relative h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={activeRestaurant.imageUrl}
                  alt={activeRestaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {activeRestaurant.campusZone || 'Anel Universitário'}
                  </span>
                  <h3 className="text-base font-bold leading-tight mt-1 drop-shadow-sm">
                    {activeRestaurant.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Horário: <strong>{activeRestaurant.openingHours}</strong></span>
                </div>

                {activeRestaurant.hasStudentDiscount && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-start gap-2 text-xs">
                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="leading-tight">
                      <strong>Desconto Estudantil:</strong>{' '}
                      {activeRestaurant.studentDiscountDetails || 'Disponível com carteirinha'}
                    </p>
                  </div>
                )}
              </div>

              {/* Sample Dishes List */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Opções em Destaque:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {activeRestaurant.dishes.slice(0, 3).map((dish) => (
                    <div
                      key={dish.id}
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                        {dish.name}
                      </span>
                      <span className="font-extrabold text-orange-600 dark:text-orange-400">
                        R$ {dish.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectRestaurant(activeRestaurant)}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Ver Cardápio Completo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {activeRestaurant.googleMapsUrl && (
                  <a
                    href={activeRestaurant.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
                    title="Abrir no Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Selecione um ponto no mapa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Clique sobre qualquer um dos marcadores numéricos ou nomes para abrir a ficha completa do restaurante do campus.
              </p>
            </div>
          )}

          {/* Location Quick List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Pontos Registrados
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredRestaurants.map((rest) => (
                <button
                  key={rest.id}
                  type="button"
                  onClick={() => setActivePinId(rest.id)}
                  className={`w-full text-left p-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    activePinId === rest.id
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate max-w-[180px]">{rest.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {rest.campusZone || 'Campus'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
