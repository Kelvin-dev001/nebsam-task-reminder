import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const monthLabel = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
};

const ChartBlock = ({ title, data, bars, height = 280 }) => (
  <Paper elevation={2} sx={{ p: 2, height }}>
    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>{title}</Typography>
    <ResponsiveContainer width="100%" height={height - 50}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="label" stroke="#90a4ae" />
        <YAxis allowDecimals={false} stroke="#90a4ae" />
        <Tooltip contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }} />
        <Legend />
        {bars.map((b) => (
          <Bar key={b.dataKey} dataKey={b.dataKey} name={b.name} fill={b.fill} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </Paper>
);

const SpeedGovernorBreakdownChart = ({ monthlySeries }) => {
  if (!monthlySeries?.months) return null;
  const months = monthlySeries.months;

  const mapSeries = (seriesArray) =>
    months.map((m, idx) => ({ label: monthLabel(m), ...(seriesArray[idx] || {}) }));

  const nebsam = mapSeries(monthlySeries.gov?.nebsam || []);
  const mock = mapSeries(monthlySeries.gov?.mock || []);
  const sino = mapSeries(monthlySeries.gov?.sinotrack || []);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        ⚙️ Speed Governor — Monthly Breakdown
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <ChartBlock title="Nebsam" data={nebsam} bars={[
            { dataKey: "officeInst", name: "Office Inst", fill: "#90caf9" },
            { dataKey: "agentInst", name: "Agent Inst", fill: "#66bb6a" },
            { dataKey: "officeRen", name: "Office Ren", fill: "#ffa726" },
            { dataKey: "agentRen", name: "Agent Ren", fill: "#ef5350" },
          ]} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartBlock title="Mock Mombasa" data={mock} bars={[
            { dataKey: "officeRen", name: "Office Ren", fill: "#ffa726" },
            { dataKey: "agentRen", name: "Agent Ren", fill: "#ef5350" },
          ]} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartBlock title="Sinotrack" data={sino} bars={[
            { dataKey: "officeInst", name: "Office Inst", fill: "#90caf9" },
            { dataKey: "agentInst", name: "Agent Inst", fill: "#66bb6a" },
            { dataKey: "officeRen", name: "Office Ren", fill: "#ffa726" },
            { dataKey: "agentRen", name: "Agent Ren", fill: "#ef5350" },
          ]} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SpeedGovernorBreakdownChart;