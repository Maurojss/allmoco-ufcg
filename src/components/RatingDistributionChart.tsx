import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { motion } from 'motion/react';
import { RatingDistributionItem } from '../utils/rating';
import { Star, BarChart3 } from 'lucide-react';

interface RatingDistributionChartProps {
  distribution: RatingDistributionItem[];
  average: number;
  totalCount: number;
}

// Colors for stars 1 to 5 (from red/amber to vibrant orange)
const BAR_COLORS = [
  '#f87171', // 1 star - red-400
  '#fb923c', // 2 stars - orange-400
  '#fbbf24', // 3 stars - amber-400
  '#f59e0b', // 4 stars - amber-500
  '#ea580c', // 5 stars - orange-600
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: RatingDistributionItem;
    value: number;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-700/60 backdrop-blur-xs">
        <div className="flex items-center gap-1 font-bold text-amber-400 mb-0.5">
          <span>{data.rating}</span>
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
          <span>({data.stars})</span>
        </div>
        <p className="text-slate-200">
          <strong className="text-white font-bold">{data.count}</strong> avaliaç{data.count === 1 ? 'ão' : 'ões'}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {data.percentage}% do total
        </p>
      </div>
    );
  }
  return null;
};

// Custom bar shape renderer for Recharts SVG
interface SpringBarShapeProps {
  fill?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  radius?: number | [number, number, number, number];
}

const RenderBarShape: React.FC<SpringBarShapeProps> = (props) => {
  const { fill, x = 0, y = 0, width = 0, height = 0, radius = [6, 6, 0, 0] } = props;
  
  if (width <= 0 || isNaN(x) || isNaN(y)) return null;
  const safeHeight = Math.max(0, height);
  const r = Array.isArray(radius) ? radius[0] : (typeof radius === 'number' ? radius : 6);

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={safeHeight}
      rx={r}
      ry={r}
      fill={fill || '#f97316'}
      className="transition-all duration-500 hover:opacity-90"
    />
  );
};

export const RatingDistributionChart: React.FC<RatingDistributionChartProps> = ({
  distribution,
  average,
  totalCount,
}) => {
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <motion.div
      id="restaurant-rating-chart"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Distribuição de Avaliações
          </h4>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {totalCount} {totalCount === 1 ? 'avaliação total' : 'avaliações totais'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Left summary block */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.05 }}
          className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-700/60 text-center shadow-xs"
        >
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {average > 0 ? average.toFixed(1) : '—'}
          </span>
          <div className="flex items-center gap-0.5 my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(average) && average > 0
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Média de 1 a 5 estrelas
          </span>
        </motion.div>

        {/* Recharts Column / Bar Chart with spring animated bars */}
        <div className="sm:col-span-8 h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={distribution}
              margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="stars"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                domain={[0, maxCount]}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(249, 115, 22, 0.08)', radius: 8 }}
              />
              <Bar
                dataKey="count"
                shape={<RenderBarShape />}
                maxBarSize={36}
                isAnimationActive={false}
              >
                {distribution.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.rating}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
