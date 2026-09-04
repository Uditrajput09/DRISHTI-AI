/**
 * frontend/src/components/ZoneComparison.jsx
 * Side-by-side risk metric comparison of two selected zones.
 */
import React, { useState } from "react";
import { BarChart2, ArrowUpDown } from "lucide-react";

const METRICS = [
  { key: "risk_score", label: "Risk Index", unit: "%", higher: "worse" },
  { key: "rainfall_24h", label: "24h Rainfall", unit: " mm", higher: "worse" },
  { key: "soil_moisture_pct", label: "Soil Moisture", unit: "%", higher: "worse" },
  { key: "base_slope_deg", label: "Slope Angle", unit: "°", higher: "worse" },
  { key: "vulnerability_index", label: "Vulnerability Index", unit: "", higher: "worse" },
  { key: "base_elevation_m", label: "Elevation", unit: " m", higher: "neutral" },
];

const LEVEL_COLOR = {
  Critical: "#FF6EC7", High: "#7873F5", Medium: "#4FD8EA", Low: "#52D199",
};

export default function ZoneComparison({ zones = [] }) {
  const [zoneAId, setZoneAId] = useState("");
  const [zoneBId, setZoneBId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const zoneA = zones.find((z) => String(z.id) === zoneAId);
  const zoneB = zones.find((z) => String(z.id) === zoneBId);

  const selectStyle = {
    background: "rgba(20, 20, 30, 0.85)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: "6px 10px",
    fontSize: "0.8rem",
    flex: 1,
    cursor: "pointer",
    fontFamily: "Space Grotesk, sans-serif"
  };

  return (
    <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#f8fafc",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart2 size={16} color="#06b6d4" />
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Compare Zones</span>
        </div>
        <ArrowUpDown size={14} color="#64748b" />
      </button>

      {isOpen && (
        <div style={{ padding: "0 18px 16px" }}>
          {/* Zone Selectors */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.72rem", color: "#06b6d4", fontWeight: 700, marginBottom: 4 }}>ZONE A</div>
              <select id="zone-compare-a" value={zoneAId} onChange={(e) => setZoneAId(e.target.value)} style={selectStyle}>
                <option value="">Select Zone A…</option>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.72rem", color: "#a855f7", fontWeight: 700, marginBottom: 4 }}>ZONE B</div>
              <select id="zone-compare-b" value={zoneBId} onChange={(e) => setZoneBId(e.target.value)} style={selectStyle}>
                <option value="">Select Zone B…</option>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
          </div>

          {/* Risk Level Badges */}
          {zoneA && zoneB && (
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {[{ z: zoneA, c: "#06b6d4" }, { z: zoneB, c: "#a855f7" }].map(({ z, c }) => (
                <div key={z.id} style={{ flex: 1, background: "rgba(15,23,42,0.6)", borderRadius: 10, padding: "8px 12px", border: `1px solid ${c}40` }}>
                  <div style={{ fontSize: "0.7rem", color: c, fontWeight: 700 }}>{z.name}</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 900, color: LEVEL_COLOR[z.risk_level] || "#06b6d4" }}>
                    {z.risk_score}%
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: LEVEL_COLOR[z.risk_level], background: `${LEVEL_COLOR[z.risk_level]}22`, padding: "1px 7px", borderRadius: 4 }}>
                    {z.risk_level}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Comparison Table */}
          {zoneA && zoneB ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", color: "#64748b", fontWeight: 600, padding: "4px 0", fontSize: "0.72rem" }}>Metric</th>
                  <th style={{ textAlign: "center", color: "#06b6d4", fontWeight: 700, padding: "4px 0", fontSize: "0.72rem" }}>Zone A</th>
                  <th style={{ textAlign: "center", color: "#a855f7", fontWeight: 700, padding: "4px 0", fontSize: "0.72rem" }}>Zone B</th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map(({ key, label, unit, higher }) => {
                  const valA = parseFloat(zoneA[key] || 0);
                  const valB = parseFloat(zoneB[key] || 0);
                  const aWorse = higher === "worse" && valA > valB;
                  const bWorse = higher === "worse" && valB > valA;
                  return (
                    <tr key={key} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "5px 0", color: "#94a3b8" }}>{label}</td>
                      <td style={{ textAlign: "center", color: aWorse ? "#fca5a5" : "#6ee7b7", fontWeight: 700 }}>
                        {valA.toFixed(1)}{unit}
                        {aWorse && " ▲"}
                      </td>
                      <td style={{ textAlign: "center", color: bWorse ? "#fca5a5" : "#6ee7b7", fontWeight: 700 }}>
                        {valB.toFixed(1)}{unit}
                        {bWorse && " ▲"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: "center", color: "#475569", fontSize: "0.8rem", padding: "10px 0" }}>
              Select both zones to compare metrics
            </div>
          )}
        </div>
      )}
    </div>
  );
}
