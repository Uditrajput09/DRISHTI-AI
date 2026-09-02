import React, { useEffect, useState } from 'react';
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
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CloudRain, TrendingUp } from 'lucide-react';
import { api } from '../api';

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

export default function ForecastChart({ zoneId = 1, zoneName = 'Sohra Escarpment' }) {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadForecast() {
      setLoading(true);
      try {
        const res = await api.getZoneForecast(zoneId || 1);
        if (mounted) {
          setForecastData(res.forecast_series || []);
        }
      } catch (err) {
        console.warn('Failed to load forecast series:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadForecast();
    return () => { mounted = false; };
  }, [zoneId]);

  // Downsample to 24 slots (every 2 hours) for clean responsive rendering
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
        type: 'line',
        label: 'Projected Landslide Risk (%)',
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5,
        yAxisID: 'y1',
        data: riskValues
      },
      {
        type: 'bar',
        label: 'Rainfall Forecast (mm/h)',
        backgroundColor: 'rgba(6, 182, 212, 0.65)',
        borderRadius: 4,
        yAxisID: 'y',
        data: rainfallValues
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1',
          font: { size: 11, family: "'Plus Jakarta Sans', sans-serif", weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Precipitation (mm)', color: '#06b6d4', font: { size: 10, weight: 700 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
        min: 0
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Risk Index (%)', color: '#ef4444', font: { size: 10, weight: 700 } },
        grid: { drawOnChartArea: false },
        ticks: { color: '#ef4444', font: { size: 10 } },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 18, height: 280, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
          <TrendingUp size={16} color="#ef4444" />
          <span>48-Hour Rainfall & Risk Projection ({zoneName})</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 600, background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: 999 }}>
          Open-Meteo Synced
        </span>
      </div>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Loading forecast curve...
          </div>
        ) : (
          <Chart type="bar" data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
