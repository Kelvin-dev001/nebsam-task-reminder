import React from "react";
import { Paper, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const GovDailyChart = ({ govDaily = [], month }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!govDaily || govDaily.length === 0) return null;

  const data = govDaily.map((d) => ({
    day: new Date(d._id).getUTCDate(),
    nebsamInst: d.nebsamInst || 0,
    nebsamRen: d.nebsamRen || 0,
    sinoInst: d.sinoInst || 0,
    sinoRen: d.sinoRen || 0,
    mockRen: d.mockRen || 0,
  }));

  const monthName = month
    ? new Date(month + "-01").toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "";

  return (
    <Paper elevation={3} sx={{ p: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} sx={{ mb: 1.5 }}>
        ⚙️ Speed Governor Daily — {monthName}
      </Typography>
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 320}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="day" stroke="#90a4ae" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis allowDecimals={false} stroke="#90a4ae" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }} />
          {!isMobile && <Legend />}
          <Bar dataKey="nebsamInst" name="Nebsam Inst" fill="#90caf9" radius={[3, 3, 0, 0]} />
          <Bar dataKey="sinoInst" name="Sino Inst" fill="#66bb6a" radius={[3, 3, 0, 0]} />
          <Line dataKey="nebsamRen" name="Nebsam Ren" stroke="#f6b800" strokeWidth={2} dot={false} />
          <Line dataKey="sinoRen" name="Sino Ren" stroke="#ef5350" strokeWidth={2} dot={false} />
          <Line dataKey="mockRen" name="Mock Ren" stroke="#ab47bc" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default GovDailyChart;