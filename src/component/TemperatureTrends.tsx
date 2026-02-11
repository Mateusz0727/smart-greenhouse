import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface TemperatureData {
  deviceId: string;
  date: string; // ISO string lub format "2024-07-31"
  dayAvgTemperature: number | null;
  nightAvgTemperature: number | null;
}

const TemperatureTrends = ({ data }: { data: TemperatureData[] }) => {
  // Posortuj dane po dacie i przekształć je na format dla Recharts
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
      }),
      dayTemp: entry.dayAvgTemperature ?? null,
      nightTemp: entry.nightAvgTemperature ?? null,
    }));

  return (
    <div
      style={{
        backgroundColor: "#fdfdfc",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        width: "100%",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <h3 style={{ marginBottom: "16px" }}>Trendy</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="dayTemp"
            stroke="#2a9d8f"
            strokeWidth={2}
            dot={false}
            name="Temperatura dzienna"
          />
          <Line
            type="monotone"
            dataKey="nightTemp"
            stroke="#f4a261"
            strokeWidth={2}
            dot={false}
            name="Temperatura nocna"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemperatureTrends;
