/**
 * frontend/src/components/SurveyForm.jsx
 * Pre-Monsoon Field Vulnerability Survey Form for Disaster Management Officers.
 * Updates zone vulnerability index based on ground inspection.
 */
import React, { useState } from "react";
import { ClipboardCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function SurveyForm({ zones = [], currentUser, onSurveySubmitted }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || 1);
  const [officerName, setOfficerName] = useState(currentUser?.name || "Field Officer");
  const [crackCount, setCrackCount] = useState(0);
  const [toeErosion, setToeErosion] = useState("None");
  const [stabilityRating, setStabilityRating] = useState(3);
  const [vegetationPct, setVegetationPct] = useState(65);
  const [drainage, setDrainage] = useState("Good");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone_id: parseInt(selectedZoneId),
          officer_name: officerName,
          survey_year: new Date().getFullYear(),
          crack_count: parseInt(crackCount),
          toe_erosion_severity: toeErosion,
          slope_stability_rating: parseInt(stabilityRating),
          vegetation_cover_pct: parseFloat(vegetationPct),
          drainage_condition: drainage,
          notes: notes
        })
      });
      const data = await res.json();
      setResult(data);
      if (onSurveySubmitted) onSurveySubmitted(data);
    } catch (err) {
      alert("Survey submission failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
      <button
        onClick={() => setIsOpen(p => !p)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px", background: "transparent", border: "none", cursor: "pointer", color: "#f8fafc"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ClipboardCheck size={16} color="#10b981" />
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>📋 Pre-Monsoon Vulnerability Survey Form</span>
        </div>
        <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700 }}>
          {isOpen ? "▲ Collapse" : "▼ Annual Assessment"}
        </span>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Ground assessment updates the zone's AI baseline vulnerability index for monsoon predictive scoring.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: "0.72rem", color: "#cbd5e1", display: "block", marginBottom: 4 }}>Target Zone</label>
              <select
                value={selectedZoneId}
                onChange={e => setSelectedZoneId(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 8, background: "rgba(15,23,42,0.8)", border: "1px solid var(--border-glass)", color: "#fff", fontSize: "0.8rem" }}
              >
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.72rem", color: "#cbd5e1", display: "block", marginBottom: 4 }}>Surveying Officer</label>
              <input
                type="text"
                value={officerName}
                onChange={e => setOfficerName(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 8, background: "rgba(15,23,42,0.8)", border: "1px solid var(--border-glass)", color: "#fff", fontSize: "0.8rem" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: "0.72rem", color: "#cbd5e1", display: "block", marginBottom: 4 }}>Tension Cracks: {crackCount}</label>
              <input type="range" min={0} max={15} value={crackCount} onChange={e => setCrackCount(e.target.value)} style={{ width: "100%" }} />
            </div>

            <div>
              <label style={{ fontSize: "0.72rem", color: "#cbd5e1", display: "block", marginBottom: 4 }}>Toe Erosion</label>
              <select
                value={toeErosion}
                onChange={e => setToeErosion(e.target.value)}
                style={{ width: "100%", padding: "6px", borderRadius: 8, background: "rgba(15,23,42,0.8)", border: "1px solid var(--border-glass)", color: "#fff", fontSize: "0.78rem" }}
              >
                <option value="None">None</option>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.72rem", color: "#cbd5e1", display: "block", marginBottom: 4 }}>Stability (1-5)</label>
              <select
                value={stabilityRating}
                onChange={e => setStabilityRating(e.target.value)}
                style={{ width: "100%", padding: "6px", borderRadius: 8, background: "rgba(15,23,42,0.8)", border: "1px solid var(--border-glass)", color: "#fff", fontSize: "0.78rem" }}
              >
                <option value={5}>5 - Completely Stable</option>
                <option value={4}>4 - Mostly Stable</option>
                <option value={3}>3 - Moderate</option>
                <option value={2}>2 - Marginal</option>
                <option value={1}>1 - Imminently Failing</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: "0.72rem", color: "#cbd5e1", display: "block", marginBottom: 4 }}>Vegetation Cover: {vegetationPct}%</label>
              <input type="range" min={10} max={100} value={vegetationPct} onChange={e => setVegetationPct(e.target.value)} style={{ width: "100%" }} />
            </div>

            <div>
              <label style={{ fontSize: "0.72rem", color: "#cbd5e1", display: "block", marginBottom: 4 }}>Drainage State</label>
              <select
                value={drainage}
                onChange={e => setDrainage(e.target.value)}
                style={{ width: "100%", padding: "6px", borderRadius: 8, background: "rgba(15,23,42,0.8)", border: "1px solid var(--border-glass)", color: "#fff", fontSize: "0.78rem" }}
              >
                <option value="Good">Good (Clear Culverts)</option>
                <option value="Moderate">Moderate</option>
                <option value="Poor">Poor (Debris Clogged)</option>
                <option value="Blocked">Blocked / No Drainage</option>
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="Field notes (e.g. fresh seepages observed at road cutting)..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", borderRadius: 8, background: "rgba(15,23,42,0.8)", border: "1px solid var(--border-glass)", color: "#fff", fontSize: "0.8rem" }}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              color: "#fff", border: "none", borderRadius: 8, padding: "9px",
              fontSize: "0.85rem", fontWeight: 700, cursor: isSubmitting ? "wait" : "pointer"
            }}
          >
            {isSubmitting ? "Updating Model Index..." : "✓ Submit Official Pre-Monsoon Survey"}
          </button>

          {result && (
            <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: 8, padding: "8px 12px", color: "#6ee7b7", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={14} />
              <span>{result.message} (Delta: {result.vulnerability_delta > 0 ? "+" : ""}{result.vulnerability_delta})</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
