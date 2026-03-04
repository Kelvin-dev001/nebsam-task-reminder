import React from "react";
import { Paper, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const monthLabel = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
};

const TrackingTrendChart = ({ monthlySeries }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!monthlySeries?.months) return null;
  const months = monthlySeries.months;

  const data = months.map((month, idx) => {
    const t = monthlySeries.track?.[idx] || {};
    const installs = (t.tracker1Inst || 0) + (t.tracker2Inst || 0) + (t.magneticInst || 0);
    const renewals = (t.tracker1Ren || 0) + (t.tracker2Ren || 0) + (t.magneticRen || 0);
    return {
      month,
      label: monthLabel(month),
      "Tracker 1 Inst": t.tracker1Inst || 0,
      "Tracker 2 Inst": t.tracker2Inst || 0,
      "Magnetic Inst": t.magneticInst || 0,
      "Total Renewals": renewals,
    };
  });

  return (
    <Paper elevation={3} sx={{ p: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} sx={{ mb: 1.5 }}>
        🛰️ Tracking — Monthly Installs vs Renewals
      </Typography>
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 360}>
        <ComposedChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="label" stroke="#90a4ae" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis allowDecimals={false} stroke="#90a4ae" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
          <Bar dataKey="Tracker 1 Inst" fill="#90caf9" radius={[4, 4, 0, 0]} stackId="inst" />
          <Bar dataKey="Tracker 2 Inst" fill="#66bb6a" radius={[4, 4, 0, 0]} stackId="inst" />
          <Bar dataKey="Magnetic Inst" fill="#ffa726" radius={[4, 4, 0, 0]} stackId="inst" />
          <Line type="monotone" dataKey="Total Renewals" stroke="#ef5350" strokeWidth={3} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TrackingTrendChart;