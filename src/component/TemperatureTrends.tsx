import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TemperatureData } from "../types";
import { BiTrendingUp, BiSun, BiMoon, BiStats } from "react-icons/bi";
import "../styles/temperature-trends.css";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <div className="tooltip-content">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="tooltip-item">
              <div 
                className="tooltip-dot" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="tooltip-name">
                {entry.name}:
              </span>
              <span className="tooltip-value">
                {entry.value}°C
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const TemperatureTrends = ({ data }: { data: TemperatureData[] }) => {
  // Defensive check for data
  if (!data || data.length === 0) {
      return (
          <div className="trends-card empty">
              <p className="empty-message">Brak danych z czujników do wyświetlenia</p>
          </div>
      );
  }

  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("pl-PL", {
        weekday: 'short',
        day: "numeric",
      }),
      fullDate: new Date(entry.date).toLocaleDateString("pl-PL", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      dayTemp: entry.dayAvgTemperature ?? 0,
      nightTemp: entry.nightAvgTemperature ?? 0,
    }));

  // Statistics Calculation
  const avgTemp = chartData.length > 0 
    ? chartData.reduce((acc, curr) => acc + curr.dayTemp, 0) / chartData.length 
    : 0;
    
  const maxTemp = chartData.length > 0 
    ? Math.max(...chartData.map(d => d.dayTemp)) 
    : 0;

  const minTemp = chartData.length > 0
    ? Math.min(...chartData.map(d => d.nightTemp))
    : 0;

  return (
    <div className="trends-card">
      
      {/* Header Section */}
      <div className="trends-header">
        <div className="trends-title-group">
            <h3>
                <BiStats className="trends-title-icon" />
                Analiza Warunków
            </h3>
            <p className="trends-subtitle">Podgląd temperatur z ostatniego okresu</p>
        </div>
        
        {/* Legend / Range Selector Mockup */}
        <div className="trends-controls">
            <button className="trends-btn active">7 Dni</button>
            <button className="trends-btn">30 Dni</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {/* Card 1: Max */}
        <div className="kpi-card orange">
            <div className="kpi-icon">
                <BiSun size={24} />
            </div>
            <div>
                <p className="kpi-label">Maksimum</p>
                <p className="kpi-value">{maxTemp.toFixed(1)}°C</p>
            </div>
        </div>

        {/* Card 2: Avg */}
        <div className="kpi-card emerald">
            <div className="kpi-icon">
                <BiTrendingUp size={24} />
            </div>
            <div>
                <p className="kpi-label">Średnia</p>
                <p className="kpi-value">{avgTemp.toFixed(1)}°C</p>
            </div>
        </div>

         {/* Card 3: Min */}
         <div className="kpi-card indigo">
            <div className="kpi-icon">
                <BiMoon size={24} />
            </div>
            <div>
                <p className="kpi-label">Minimum (Noc)</p>
                <p className="kpi-value">{minTemp.toFixed(1)}°C</p>
            </div>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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
            <Tooltip content={<CustomTooltip />} />
            <Area 
                type="monotone" 
                dataKey="dayTemp" 
                name="Dzień"
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorDay)" 
                animationDuration={1500}
                activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Area 
                type="monotone" 
                dataKey="nightTemp" 
                name="Noc"
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorNight)" 
                animationDuration={1500}
                activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemperatureTrends;