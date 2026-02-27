import React from 'react';
import { Paper, Typography } from '@mui/material';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

const barColor = "#1976d2";
const lineColor = "#F6B800";

const GrowthTrendChart = ({ monthlySeries }) => {
  if (!monthlySeries?.months) return null;
  const months = monthlySeries.months;
  // Primary: Installs = sum Nebsam+Sinotrack office/agent, Renewals = same
  const data = months.map((month, idx) => {
    const govN = monthlySeries.gov?.nebsam?.[idx] || {};
    const govS = monthlySeries.gov?.sinotrack?.[idx] || {};
    return {
      month,
      label: new Date(month + '-01').toLocaleString(undefined, { month: "short", year: "2-digit" }),
      installs: (govN.officeInst||0)+(govN.agentInst||0)+(govS.officeInst||0)+(govS.agentInst||0),
      renewals: (govN.officeRen||0)+(govN.agentRen||0)+(govS.officeRen||0)+(govS.agentRen||0),
    };
  });
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Growth Trend (Speed Governor)</Typography>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="installs" name="Total Installs" fill={barColor} />
          <Line dataKey="renewals" name="Total Renewals" stroke={lineColor} strokeWidth={3} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
};
export default GrowthTrendChart;