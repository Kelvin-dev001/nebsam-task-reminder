import React from "react";
import { Paper, Typography, Grid, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const monthLabel = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
};

const GovSubChart = ({ title, data, isMobile }) => (
  <Paper elevation={2} sx={{ p: { xs: 1.5, md: 2 }, height: "100%" }}>
    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{title}</Typography>
    <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
      <BarChart data={data} barGap={2} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="label" stroke="#90a4ae" tick={{ fontSize: isMobile ? 9 : 11 }} />
        <YAxis allowDecimals={false} stroke="#90a4ae" tick={{ fontSize: isMobile ? 9 : 11 }} />
        <Tooltip contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: isMobile ? 9 : 11 }} />
        <Bar dataKey="Office" fill="#90caf9" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Agent" fill="#f6b800" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </Paper>
);

const GovInstallsChart = ({ monthlySeries }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!monthlySeries?.months) return null;
  const months = monthlySeries.months;

  const nebsamData = months.map((m, idx) => {
    const s = monthlySeries.gov?.nebsam?.[idx] || {};
    return { label: monthLabel(m), Office: s.officeInst || 0, Agent: s.agentInst || 0 };
  });

  const sinoData = months.map((m, idx) => {
    const s = monthlySeries.gov?.sinotrack?.[idx] || {};
    return { label: monthLabel(m), Office: s.officeInst || 0, Agent: s.agentInst || 0 };
  });

  // Mock Mombasa has no installs — show message
  return (
    <Paper elevation={3} sx={{ p: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} sx={{ mb: 2 }}>
        ⚙️ Speed Governor — Office vs Agent Installs
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <GovSubChart title="Nebsam Installs" data={nebsamData} isMobile={isMobile} />
        </Grid>
        <Grid item xs={12} md={6}>
          <GovSubChart title="Sinotrack Installs" data={sinoData} isMobile={isMobile} />
        </Grid>
      </Grid>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        Note: Mock Mombasa does not have installs — only renewals.
      </Typography>
    </Paper>
  );
};

export default GovInstallsChart;