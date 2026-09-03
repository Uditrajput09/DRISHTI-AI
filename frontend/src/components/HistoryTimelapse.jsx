/**
 * frontend/src/components/HistoryTimelapse.jsx
 * Historical landslide heatmap time-lapse slider (2000-2026).
 */
import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, FastForward } from "lucide-react";

export default function HistoryTimelapse({ onYearChange }) {
  const [year, setYear] = useState(2010);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchYear = useCallback(async (y) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/risk/history?year=${y}`);
      const data = await res.json();
      if (onYearChange) onYearChange(y, data.points || []);
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  }, [onYearChange]);

  useEffect(() => { fetchYear(year); }, [year]);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setYear(y => {
        if (y >= 2026) { setPlaying(false); return 2026; }
        return y + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div className="glass-panel" style={{ padding: "14px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#f8fafc" }}>
            📊 Historical Incident Heatmap
          </span>
          {loading && <span style={{ fontSize: "0.7rem", color: "#06b6d4" }}>Loading…</span>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            id="heatmap-playpause"
            onClick={() => setPlaying(p => !p)}
            style={{ background: playing ? "rgba(239,68,68,0.2)" : "rgba(6,182,212,0.15)", color: playing ? "#fca5a5" : "#06b6d4", border: `1px solid ${playing ? "rgba(239,68,68,0.3)" : "rgba(6,182,212,0.3)"}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", fontWeight: 700 }}>
            {playing ? <Pause size={13} /> : <Play size={13} />}
            {playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => setYear(2000)}
            style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid var(--border-glass)", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: "0.7rem" }}>
            Reset
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>2000</span>
        <input
          id="heatmap-year-slider"
          type="range" min={2000} max={2026} value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          style={{ flex: 1, accentColor: "#06b6d4" }}
        />
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>2026</span>
      </div>

      <div style={{ textAlign: "center", marginTop: 6 }}>
        <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#06b6d4" }}>{year}</span>
        <span style={{ fontSize: "0.72rem", color: "#64748b", marginLeft: 8 }}>— Historical Landslide Density</span>
      </div>

      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#475569" }}>
        <span>Low density</span>
        <div style={{ display: "flex", gap: 2 }}>
          {["#10b981","#f59e0b","#f97316","#ef4444","#7c3aed"].map(c => (
            <span key={c} style={{ width: 16, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
          ))}
        </div>
        <span>High density</span>
      </div>
    </div>
  );
}
