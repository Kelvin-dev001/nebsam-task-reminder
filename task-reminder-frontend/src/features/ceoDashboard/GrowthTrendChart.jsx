import React from "react";
import { Paper, Typography } from "@mui/material";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const monthLabel = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
};

const GrowthTrendChart = ({ monthlySeries }) => {
  if (!monthlySeries?.months) return null;
  const months = monthlySeries.months;

  const data = months.map((month, idx) => {
    const govN = monthlySeries.gov?.nebsam?.[idx] || {};
    const govS = monthlySeries.gov?.sinotrack?.[idx] || {};

    return {
      month,
      label: monthLabel(month),
      installs: (govN.officeInst || 0) + (govN.agentInst || 0) + (govS.officeInst || 0) + (govS.agentInst || 0),
      renewals: (govN.officeRen || 0) + (govN.agentRen || 0) + (govS.officeRen || 0) + (govS.agentRen || 0),
    };
  });

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        ⚡ Speed Governor — Installs vs Renewals Trend
      </Typography>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="label" stroke="#90a4ae" />
          <YAxis allowDecimals={false} stroke="#90a4ae" />
          <Tooltip contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }} />
          <Legend />
          <Bar dataKey="installs" name="Total Installs" fill="#90caf9" radius={[4, 4, 0, 0]} />
          <Line dataKey="renewals" name="Total Renewals" stroke="#f6b800" strokeWidth={3} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default GrowthTrendChart;