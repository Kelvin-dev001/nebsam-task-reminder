import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const palette = ['#1976d2', '#9c27b0', '#ff9800', '#4caf50', '#ef5350', '#26c6da'];

const PieBlock = ({ title, data }) => (
  <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: 320 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
    <ResponsiveContainer width="100%" height="90%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label>
          {data.map((entry, idx) => <Cell key={idx} fill={palette[idx % palette.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </Paper>
);

const BossMonthlyPies = ({ monthly }) => {
  if (!monthly) return null;
  const { current = {}, previous = {} } = monthly;

  const pieData = (cur, prev, keys) => [
    { name: 'This month', value: keys.reduce((s, k) => s + (cur?.[k] || 0), 0) },
    { name: 'Last month', value: keys.reduce((s, k) => s + (prev?.[k] || 0), 0) },
  ];

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12} md={6} lg={4}>
        <PieBlock title="Tracking (installs+renewals+offline)" data={pieData(current.tracking, previous.tracking, ['installs','renewals','offline'])} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <PieBlock title="Speed Governor (installs+renewals+offline+checkups)" data={pieData(current.gov, previous.gov, ['installs','renewals','offline','checkups'])} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <PieBlock title="Radio (sales+renewals)" data={pieData(current.radio, previous.radio, ['sales','renewals'])} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <PieBlock title="Fuel (installs+renewals+offline+checkups)" data={pieData(current.fuel, previous.fuel, ['installs','renewals','offline','checkups'])} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <PieBlock title="Vehicle Telematics (installs+renewals+offline+checkups)" data={pieData(current.vtel, previous.vtel, ['installs','renewals','offline','checkups'])} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <PieBlock title="Online (installs+renewals)" data={pieData(current.online, previous.online, ['installs','renewals'])} />
      </Grid>
    </Grid>
  );
};

export default BossMonthlyPies;