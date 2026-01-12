import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const colors = {
  installs: '#1976d2',  // brand blue
  renewals: '#4caf50',  // green
};

// convert 'YYYY-MM' to 'Jan 25'
const monthLabel = (ym) => {
  if (!ym) return '';
  const [y,m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
};

// Build data points: one object per month with installs + renewals
const buildSeries = (months, rawSeries, picker) =>
  months.map((m, idx) => ({
    month: m,
    label: monthLabel(m),
    ...picker(rawSeries[idx] || {})
  }));

const TrendBlock = ({ title, data }) => (
  <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: 280 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
    <ResponsiveContainer width="100%" height={230}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="installs"
          name="Installs"
          stroke={colors.installs}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="renewals"
          name="Renewals"
          stroke={colors.renewals}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </Paper>
);

const DeptTrends = ({ monthlySeries }) => {
  if (!monthlySeries) return null;
  const months = monthlySeries.months || [];

  const govInstRen = buildSeries(months, monthlySeries.gov?.nebsam || [], s => ({
    installs: (s.officeInst || 0) + (s.agentInst || 0),
    renewals: (s.officeRen || 0) + (s.agentRen || 0),
  }));

  const fuelInstRen = buildSeries(months, monthlySeries.fuel || [], s => ({
    installs: (s.officeInst || 0) + (s.agentInst || 0),
    renewals: (s.officeRen || 0),
  }));

  const radioInstRen = buildSeries(months, monthlySeries.radio || [], s => ({
    installs: (s.officeSale || 0) + (s.agentSale || 0), // treat sales as installs
    renewals: (s.officeRen || 0),
  }));

  const vtelInstRen = buildSeries(months, monthlySeries.vtel || [], s => ({
    installs: (s.officeInst || 0) + (s.agentInst || 0),
    renewals: (s.officeRen || 0),
  }));

  const trackInstRen = buildSeries(months, monthlySeries.track || [], s => {
    const inst = (s.tracker1Inst || 0) + (s.tracker2Inst || 0) + (s.magneticInst || 0);
    const ren = (s.tracker1Ren || 0) + (s.tracker2Ren || 0) + (s.magneticRen || 0);
    return { installs: inst, renewals: ren };
  });

  const onlineInstRen = buildSeries(months, monthlySeries.online || [], s => {
    const inst = (s.instBt||0)+(s.instHy||0)+(s.instCo||0)+(s.instHa||0);
    const ren  = (s.renBt||0)+(s.renHy||0)+(s.renCo||0)+(s.renHa||0);
    return { installs: inst, renewals: ren };
  });

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12} md={6}>
        <TrendBlock title="Speed Governor – Installs & Renewals" data={govInstRen} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TrendBlock title="Fuel – Installs & Renewals" data={fuelInstRen} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TrendBlock title="Radio – Installs (Sales) & Renewals" data={radioInstRen} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TrendBlock title="Video Telematics – Installs & Renewals" data={vtelInstRen} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TrendBlock title="Tracking – Installs & Renewals" data={trackInstRen} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TrendBlock title="Online – Installs & Renewals" data={onlineInstRen} />
      </Grid>
    </Grid>
  );
};

export default DeptTrends;