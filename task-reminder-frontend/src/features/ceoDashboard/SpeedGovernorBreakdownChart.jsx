import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Use color standards
const installColor = "#1976d2";
const renewalColor = "#F6B800";

const breakdownDefs = [
  { key: "nebsam", name: "Nebsam" },
  { key: "mock", name: "Mock Mombasa" },
  { key: "sinotrack", name: "Sinotrack" }
];

const SpeedGovernorBreakdownChart = ({ monthlySeries }) => {
  const months = monthlySeries?.months || [];
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {breakdownDefs.map(({ key, name }) => {
        const series = monthlySeries.gov?.[key] || [];
        // last month data
        const idx = Math.max(0, months.length - 1);
        const last = series[idx - 1] || {};
        let chartData;
        if (key === "mock") {
          chartData = [
            { label: "Office Renewal", value: last.officeRen || 0, color: renewalColor },
            { label: "Agent Renewal", value: last.agentRen || 0, color: renewalColor }
          ];
        } else {
          chartData = [
            { label: "Office Install", value: last.officeInst || 0, color: installColor },
            { label: "Agent Install", value: last.agentInst || 0, color: installColor },
            { label: "Office Renewal", value: last.officeRen || 0, color: renewalColor },
            { label: "Agent Renewal", value: last.agentRen || 0, color: renewalColor }
          ];
        }
        return (
          <Grid item xs={12} md={4} key={key}>
            <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700}>{name}</Typography>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Count" fill={renewalColor} >
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default SpeedGovernorBreakdownChart;