import React from "react";
import { Paper, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";

const DailySalesChart = ({ dailySeries = [], month }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!dailySeries || dailySeries.length === 0) return null;

  const data = dailySeries.map((d) => ({
    date: new Date(d._id).getUTCDate(),
    label: `Day ${new Date(d._id).getUTCDate()}`,
    sales: d.sales || 0,
  }));

  const monthName = month
    ? new Date(month + "-01").toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "";

  return (
    <Paper elevation={3} sx={{ p: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} sx={{ mb: 1.5 }}>
         Daily Sales  — {monthName}
      </Typography>
      <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#90caf9" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#90caf9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="date" stroke="#90a4ae" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis allowDecimals={false} stroke="#90a4ae" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }}
            labelFormatter={(v) => `Day ${v}`}
          />
          <Area type="monotone" dataKey="sales" name="Sales" fill="url(#dailyGrad)" stroke="#90caf9" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DailySalesChart;