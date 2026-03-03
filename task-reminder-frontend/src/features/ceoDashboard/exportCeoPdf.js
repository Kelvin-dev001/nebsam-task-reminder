const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatMonthLabel(monthStr) {
  if (!monthStr) {
    const now = new Date();
    return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  }
  const [y, m] = monthStr.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

const buildRow = (label, value) =>
  `<tr><td style="padding:8px 16px;font-weight:600;border-bottom:1px solid #e0e0e0">${label}</td>
   <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${value}</td></tr>`;

export function exportCeoPdf({ data, selectedMonth }) {
  const kpi = data?.kpi || {};
  const cur = data?.departments?.current || {};
  const monthLabel = formatMonthLabel(selectedMonth);

  const html = `
    <html>
    <head>
      <title>CEO Report — ${monthLabel}</title>
      <style>
        body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; }
        h1 { color: #0a1929; margin-bottom: 4px; }
        h2 { color: #1565c0; margin-top: 32px; border-bottom: 2px solid #1565c0; padding-bottom: 6px; }
        .subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
        th { background: #0a1929; color: #fff; padding: 10px 16px; text-align: left; }
        .footer { margin-top: 40px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <h1>NEBSAM — CEO Monthly Report</h1>
      <div class="subtitle">${monthLabel} | Generated ${new Date().toLocaleString()}</div>

      <h2>Executive KPIs — ${monthLabel}</h2>
      <table>
        <thead><tr><th>Metric</th><th style="text-align:right">Value</th></tr></thead>
        <tbody>
          ${buildRow("Total Sales", data?.selectedSales ?? "—")}
          ${buildRow("Growth vs Previous Month", data?.pctChange != null ? `${data.pctChange.toFixed(1)}%` : "—")}
          ${buildRow("Gov Installs", kpi.govInstalls ?? "—")}
          ${buildRow("Gov Renewals", kpi.govRenewals ?? "—")}
          ${buildRow("Fuel Installs", kpi.fuelInstalls ?? "—")}
          ${buildRow("Fuel Renewals", kpi.fuelRenewals ?? "—")}
          ${buildRow("Radio Sales", kpi.radioSales ?? "—")}
          ${buildRow("Radio Renewals", kpi.radioRenewals ?? "—")}
          ${buildRow("Tracking Installs", kpi.trackingInstalls ?? "—")}
          ${buildRow("Tracking Renewals", kpi.trackingRenewals ?? "—")}
          ${buildRow("Top Showroom", kpi.trackingTopShowroom ?? "—")}
        </tbody>
      </table>

      <h2>Department Performance — ${monthLabel}</h2>
      <table>
        <thead><tr><th>Department</th><th style="text-align:right">Installs/Sales</th><th style="text-align:right">Renewals</th></tr></thead>
        <tbody>
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e0e0e0">Speed Governor</td>
              <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${cur.gov?.installs ?? 0}</td>
              <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${cur.gov?.renewals ?? 0}</td></tr>
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e0e0e0">Tracking</td>
              <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${cur.tracking?.installs ?? 0}</td>
              <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${cur.tracking?.renewals ?? 0}</td></tr>
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e0e0e0">Fuel</td>
              <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${cur.fuel?.installs ?? 0}</td>
              <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${cur.fuel?.renewals ?? 0}</td></tr>
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e0e0e0">Radio</td>
              <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${cur.radio?.sales ?? 0}</td>
              <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${cur.radio?.renewals ?? 0}</td></tr>
          <tr><td style="padding:8px 16px;border-bottom:1px solid #e0e0e0">Video Telematics</td>
              <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${cur.vtel?.installs ?? 0}</td>
              <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${cur.vtel?.renewals ?? 0}</td></tr>
        </tbody>
      </table>

      <h2>Showroom Rankings — ${monthLabel}</h2>
      <table>
        <thead><tr><th>Showroom</th><th style="text-align:right">Installs</th><th style="text-align:right">Renewals</th></tr></thead>
        <tbody>
          ${(data?.showroomRanking || [])
            .filter((s) => s.showroomName)
            .slice(0, 15)
            .map(
              (s) =>
                `<tr><td style="padding:8px 16px;border-bottom:1px solid #e0e0e0">${s.showroomName}</td>
                     <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${s.installs}</td>
                     <td style="padding:8px 16px;text-align:right;border-bottom:1px solid #e0e0e0">${s.renewals || 0}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div class="footer">
        NEBSAM Executive Report — Confidential | Auto-generated by CEO Dashboard
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}