import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { TemperatureData } from "../types";
import { BiTrendingUp, BiTrendingDown } from "react-icons/bi";

const TemperatureTrends = ({ data }: { data: TemperatureData[] }) => {
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("pl-PL", {
        weekday: 'short',
        day: "numeric",
      }),
      dayTemp: entry.dayAvgTemperature ?? 0,
      nightTemp: entry.nightAvgTemperature ?? 0,
    }));

  const lastDay = chartData[chartData.length - 1];
  const avgTemp = chartData.reduce((acc, curr) => acc + curr.dayTemp, 0) / chartData.length;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Trendy Temperaturowe
            </h3>
            <p className="text-slate-400 text-sm mt-1">Analiza warunków termicznych z ostatnich 7 dni</p>
            
            <div className="flex items-center gap-6 mt-6">
                 <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Średnia</span>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{avgTemp.toFixed(1)}°C</p>
                 </div>
                 <div>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ostatni odczyt</span>
                    <p className="text-3xl font-bold text-emerald-600 mt-1 flex items-center gap-1">
                        {lastDay?.dayTemp}°C 
                        <span className="text-sm bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center"><BiTrendingUp/> +2%</span>
                    </p>
                 </div>
            </div>
        </div>

        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-slate-100 text-xs font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Dzień
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Noc
             </div>
        </div>
      </div>
      
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                dy={15}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                tickFormatter={(value) => `${value}°`}
            />
            <Tooltip 
                contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 16px'
                }}
                itemStyle={{ fontWeight: 600, fontSize: '13px' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
                type="monotone" 
                dataKey="dayTemp" 
                stroke="#10b981" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorDay)" 
                name="Temp. Dzienna"
                animationDuration={1500}
            />
            <Area 
                type="monotone" 
                dataKey="nightTemp" 
                stroke="#fb923c" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorNight)" 
                name="Temp. Nocna"
                animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemperatureTrends;