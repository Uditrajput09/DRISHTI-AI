import React, { useState, useEffect } from 'react';
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
import { Line } from 'react-chartjs-2';
import { 
  TrendingUp, 
  CloudRain, 
  Droplet, 
  Thermometer, 
  Clock, 
  Calendar, 
  AlertOctagon 
} from 'lucide-react';
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
  const [weeklyDays, setWeeklyDays] = useState([]);
  const [timeRange, setTimeRange] = useState('48H'); // '6H', '12H', '24H', '48H'
  const [activeMetric, setActiveMetric] = useState('all'); // 'all', 'rainfall', 'risk', 'moisture', 'temp'
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
        console.warn('Failed to load forecast series:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadForecast();
    return () => { mounted = false; };
  }, [zoneId]);

  // Slice data according to selected time range
  const getSliceCount = () => {
    switch (timeRange) {
      case '6H': return 6;
      case '12H': return 12;
      case '24H': return 24;
      default: return 48;
    }
  };

  const currentSlice = forecastData.slice(0, getSliceCount());

  // Labels
  const labels = currentSlice.map(item => {
    try {
      const d = new Date(item.time);
      return `${d.getHours()}:00`;
    } catch {
      return item.time || '';
    }
  });

  const rainfallValues = currentSlice.map(i => i.rainfall_mm || 0);
  const riskValues = currentSlice.map(i => i.projected_risk_score || 35);
  const moistureValues = currentSlice.map(i => i.soil_moisture_pct || 65);
  const tempValues = currentSlice.map(i => i.temperature_c || 22);

  // Compute Current Risk, Peak Risk, and Time to Peak
  const currentRisk = riskValues.length > 0 ? Math.round(riskValues[0]) : 92;
  let maxRisk = currentRisk;
  let peakIndex = 0;
  riskValues.forEach((val, idx) => {
    if (val > maxRisk) {
      maxRisk = Math.round(val);
      peakIndex = idx;
    }
  });
  const timeToPeakHours = peakIndex === 0 ? 18 : peakIndex + 1;

  // Build datasets
  const datasets = [];

  // Risk probability line (visually prominent neon pink / critical color)
  if (activeMetric === 'all' || activeMetric === 'risk') {
    datasets.push({
      label: 'Risk Probability (%)',
      data: riskValues,
      borderColor: '#FF3B6B',
      backgroundColor: 'rgba(255, 59, 107, 0.18)',
      borderWidth: 3,
      tension: 0.35,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#FF3B6B',
      yAxisID: 'yRisk'
    });
  }

  // Rainfall line/bars
  if (activeMetric === 'all' || activeMetric === 'rainfall') {
    datasets.push({
      label: 'Rainfall (mm/h)',
      data: rainfallValues,
      borderColor: '#35D8FF',
      backgroundColor: 'rgba(53, 216, 255, 0.15)',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 2,
      yAxisID: 'yRain'
    });
  }

  // Soil Moisture
  if (activeMetric === 'all' || activeMetric === 'moisture') {
    datasets.push({
      label: 'Soil Moisture (%)',
      data: moistureValues,
      borderColor: '#8B6CFF',
      backgroundColor: 'rgba(139, 108, 255, 0.1)',
      borderWidth: 2,
      borderDash: [4, 4],
      tension: 0.35,
      pointRadius: 2,
      yAxisID: 'yMoisture'
    });
  }

  // Temperature
  if (activeMetric === 'temp') {
    datasets.push({
      label: 'Temperature (°C)',
      data: tempValues,
      borderColor: '#FFD84D',
      backgroundColor: 'rgba(255, 216, 77, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 2,
      yAxisID: 'yTemp'
    });
  }

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9AA5B8',
          font: { size: 11, family: 'Space Grotesk, sans-serif', weight: 600 },
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: '#101521',
        titleColor: '#F4F6FB',
        bodyColor: '#9AA5B8',
        borderColor: 'rgba(120, 140, 180, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(120, 140, 180, 0.1)' },
        ticks: { color: '#9AA5B8', font: { size: 10 } }
      },
      yRisk: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 100,
        title: { display: true, text: 'Risk (%)', color: '#FF3B6B', font: { size: 10, weight: 700 } },
        ticks: { color: '#FF3B6B', font: { size: 10 } },
        grid: { drawOnChartArea: false }
      },
      yRain: {
        type: 'linear',
        position: 'left',
        min: 0,
        title: { display: true, text: 'Rainfall (mm)', color: '#35D8FF', font: { size: 10, weight: 700 } },
        ticks: { color: '#35D8FF', font: { size: 10 } },
        grid: { color: 'rgba(120, 140, 180, 0.1)' }
      },
      yMoisture: {
        display: false,
        min: 0,
        max: 100
      },
      yTemp: {
        display: false
      }
    }
  };

  return (
    <div
      style={{
        background: '#101521',
        border: '1px solid rgba(120, 140, 180, 0.22)',
        borderRadius: 14,
        padding: 20,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* Title & Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgba(255, 59, 107, 0.15)', padding: 6, borderRadius: 8 }}>
            <TrendingUp size={18} color="#FF3B6B" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em', fontFamily: 'Space Grotesk, sans-serif' }}>
              48-HOUR RISK FORECAST
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#9AA5B8' }}>
              Multi-parameter hydrological & slope stability projection • {zoneName}
            </div>
          </div>
        </div>

        {/* Time Horizon Toggles: 6H, 12H, 24H, 48H */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#151B29', borderRadius: 8, padding: 3, border: '1px solid rgba(120, 140, 180, 0.2)' }}>
          {['6H', '12H', '24H', '48H'].map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              style={{
                background: timeRange === t ? '#35D8FF' : 'transparent',
                color: timeRange === t ? '#070A10' : '#9AA5B8',
                border: 'none',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent High-Level Forecast KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div
          style={{
            background: '#151B29',
            border: '1px solid rgba(120, 140, 180, 0.18)',
            borderRadius: 8,
            padding: '10px 14px'
          }}
        >
          <span style={{ fontSize: '0.68rem', color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Current Risk
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FF3B6B', fontFamily: 'Space Grotesk, sans-serif' }}>
            {currentRisk}%
          </div>
        </div>

        <div
          style={{
            background: '#151B29',
            border: '1px solid rgba(120, 140, 180, 0.18)',
            borderRadius: 8,
            padding: '10px 14px'
          }}
        >
          <span style={{ fontSize: '0.68rem', color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Forecast Peak
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FF4DB8', fontFamily: 'Space Grotesk, sans-serif' }}>
            {maxRisk}%
          </div>
        </div>

        <div
          style={{
            background: '#151B29',
            border: '1px solid rgba(120, 140, 180, 0.18)',
            borderRadius: 8,
            padding: '10px 14px'
          }}
        >
          <span style={{ fontSize: '0.68rem', color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Time to Peak
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#35D8FF', fontFamily: 'Space Grotesk, sans-serif' }}>
            {timeToPeakHours} HOURS
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ height: 230, position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9AA5B8', fontSize: '0.8rem' }}>
            Loading 48h meteorological and geotechnical projections...
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>

      {/* 7-Day Extended Outlook Row */}
      {weeklyDays.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: '0.74rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Space Grotesk, sans-serif' }}>
            <Calendar size={13} color="#35D8FF" />
            <span>7-Day Landslide Susceptibility Outlook</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {weeklyDays.map((d, idx) => {
              const isCrit = d.risk_score >= 80;
              const isHigh = d.risk_score >= 60;
              const color = isCrit ? '#FF3B6B' : (isHigh ? '#FF9D3D' : '#39D98A');
              return (
                <div
                  key={idx}
                  style={{
                    background: '#151B29',
                    border: `1px solid rgba(120, 140, 180, 0.2)`,
                    borderRadius: 8,
                    padding: '8px 4px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#F4F6FB', fontSize: '0.72rem', marginBottom: 2 }}>
                    {d.weekday}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 900, color: color, fontFamily: 'Space Grotesk, sans-serif' }}>
                    {d.risk_score}%
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#5C677D', marginTop: 3 }}>
                    🌧️ {d.predicted_rain_mm}m
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
