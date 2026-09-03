/**
 * frontend/src/utils/pdfExport.js
 * Generates a formatted PDF risk report for a selected DRISHTI-AI zone.
 * Uses jsPDF + jspdf-autotable for tables.
 */

export async function exportZoneRiskPDF(zone, alertLogs = []) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const now = new Date();
  const ts = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  doc.setFillColor(2, 132, 199);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("DRISHTI-AI — Landslide Risk Report", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${ts} IST  |  East Khasi Hills, Meghalaya`, 14, 21);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(zone.name || "Unknown Zone", 14, 40);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Zone Code: ${zone.zone_code || "-"}  |  District: ${zone.district || "-"}  |  Elevation: ${zone.base_elevation_m || "-"} m`, 14, 47);
  doc.text(`Geology: ${zone.geology || "-"}  |  Soil: ${zone.soil_type || "-"}  |  Slope: ${zone.base_slope_deg || "-"}`, 14, 53);

  const riskColors = { Critical: [239, 68, 68], High: [249, 115, 22], Medium: [245, 158, 11], Low: [16, 185, 129] };
  const rc = riskColors[zone.risk_level] || [16, 185, 129];
  doc.setFillColor(...rc);
  doc.roundedRect(14, 58, pageW - 28, 20, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Risk Level: ${zone.risk_level || "N/A"}   |   Risk Index: ${zone.risk_score || 0}%`, 20, 71);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Explainable AI (XAI) Triggering Factors", 14, 90);

  const factors = zone.triggering_factors || {};
  const factorRows = Object.entries(factors).map(([key, f]) => [
    f?.name || key, f?.value || "-", f?.impact || "-", f?.description || "-"
  ]);

  autoTable(doc, {
    startY: 93,
    head: [["Factor", "Measured Value", "Impact Level", "Interpretation"]],
    body: factorRows.length > 0 ? factorRows : [["No factors available", "-", "-", "-"]],
    theme: "striped",
    headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: { 0: { fontStyle: "bold" }, 3: { cellWidth: 70 } }
  });

  const afterFactors = doc.lastAutoTable.finalY + 8;
  if (zone.key_roads && zone.key_roads.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Exposed Lifeline Road Corridors", 14, afterFactors);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(zone.key_roads.join("  |  "), 14, afterFactors + 6);
  }

  const afterRoads = afterFactors + (zone.key_roads?.length > 0 ? 20 : 8);
  const recentAlerts = alertLogs.slice(0, 8);
  if (recentAlerts.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Recent Alert Dispatches", 14, afterRoads);
    const alertRows = recentAlerts.map(a => [
      a.risk_level || "-", `${a.risk_score || 0}%`, a.channel?.toUpperCase() || "-",
      a.language?.toUpperCase() || "-", a.status || "-",
      a.sent_at ? new Date(a.sent_at).toLocaleString("en-IN") : "-"
    ]);
    autoTable(doc, {
      startY: afterRoads + 3,
      head: [["Risk Level", "Score", "Channel", "Lang", "Status", "Time"]],
      body: alertRows,
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [241, 245, 249] }
    });
  }

  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageH - 14, pageW, 14, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text("DRISHTI-AI — AI-Powered Landslide Early Warning System | East Khasi Hills, Meghalaya", 14, pageH - 5);
  doc.text(`Model: ${zone.model_version || "v1.2-rf-calibrated"}`, pageW - 50, pageH - 5);

  const safeName = (zone.name || "zone").replace(/\s+/g, "_").toLowerCase();
  doc.save(`DRISHTI-AI_Risk_Report_${safeName}_${Date.now()}.pdf`);
}
