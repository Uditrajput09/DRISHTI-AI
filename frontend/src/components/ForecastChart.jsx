import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { CloudRain, TrendingUp, Calendar } from "lucide-react";
import { api } from "../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RISK_BADGE = {
  Critical: { bg: "rgba(255, 110, 199, 0.15)", text: "#FF9AD7", border: "rgba(255, 110, 199, 0.4)" },
  High: { bg: "rgba(120, 115, 245, 0.15)", text: "#A5A6F6", border: "rgba(120, 115, 245, 0.4)" },
  Medium: { bg: "rgba(79, 216, 234, 0.15)", text: "#7EE8F5", border: "rgba(79, 216, 234, 0.4)" },
  Low: { bg: "rgba(52, 211, 153, 0.15)", text: "#6EE7B7", border: "rgba(52, 211, 153, 0.4)" },
};

export default function ForecastChart({ zoneId = 1, zoneName = "Sohra Escarpment" }) {
  const [forecastData, setForecastData] = useState([]);
  const [weeklyDays, setWeeklyDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadForecast() {
      setLoading(true);
      try {
        const [res48h, res7d] = await Promise.all([
          api.getZoneForecast(zoneId || 1),
          fetch(`/api/forecast/weekly?zone_id=${zoneId || 1}`).then(r => r.json()).catch(() => ({ days: [] }))
        ]);
        if (mounted) {
          setForecastData(res48h.forecast_series || []);
          setWeeklyDays(res7d.days || []);
        }
      } catch (err) {
        console.warn("Failed to load forecast series:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadForecast();
    return () => { mounted = false; };
  }, [zoneId]);

  const sampled = forecastData.filter((_, i) => i % 2 === 0).slice(0, 24);

  const labels = sampled.map(item => {
    try {
      const d = new Date(item.time);
      return `${d.getHours()}:00`;
    } catch {
      return item.time;
    }
  });

  const rainfallValues = sampled.map(i => i.rainfall_mm || 0);
  const riskValues = sampled.map(i => i.projected_risk_score || 30);

  const chartData = {
    labels,
    datasets: [
      {
        type: "line",
        label: "Projected Risk (%)",
        borderColor: "#FF6EC7",
        backgroundColor: "rgba(255, 110, 199, 0.15)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5,
        yAxisID: "y1",
        data: riskValues
      },
      {
        type: "bar",
        label: "Rainfall (mm/h)",
        backgroundColor: "rgba(79, 216, 234, 0.65)",
        borderRadius: 4,
        yAxisID: "y",
        data: rainfallValues
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#94a3b8",
          font: { size: 11, family: "'Space Grotesk', sans-serif", weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: "#0d0d14",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(120, 115, 245, 0.35)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#94a3b8", font: { size: 10 } }
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: { display: true, text: "Rainfall (mm)", color: "#4FD8EA", font: { size: 10, weight: 700 } },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#94a3b8", font: { size: 10 } },
        min: 0
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: { display: true, text: "Risk (%)", color: "#FF6EC7", font: { size: 10, weight: 700 } },
        grid: { drawOnChartArea: false },
        ticks: { color: "#FF6EC7", font: { size: 10 } },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc", fontFamily: "Space Grotesk, sans-serif" }}>
          <TrendingUp size={16} color="#FF6EC7" />
          <span>48-Hour & 7-Day Outlook ({zoneName})</span>
        </div>
        <span className="holo-badge-moderate" style={{ fontSize: "0.68rem", padding: "2px 8px" }}>
          Open-Meteo Synced
        </span>
      </div>

      <div style={{ height: 180, position: "relative" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Loading forecast curve...
          </div>
        ) : (
          <Chart type="bar" data={chartData} options={options} />
        )}
      </div>

      {weeklyDays.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>
            <Calendar size={13} color="#06b6d4" />
            <span>7-Day Landslide Outlook</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {weeklyDays.map((d, idx) => {
              const badge = RISK_BADGE[d.risk_level] || RISK_BADGE.Low;
              return (
                <div
                  key={idx}
                  style={{
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    borderRadius: 8,
                    padding: "6px 4px",
                    textAlign: "center",
                    fontSize: "0.72rem"
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#f8fafc", marginBottom: 2 }}>{d.weekday}</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 900, color: badge.text }}>{d.risk_score}%</div>
                  <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 2 }}>🌧️ {d.predicted_rain_mm}m</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
