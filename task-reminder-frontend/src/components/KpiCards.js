import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

const KpiCard = ({ title, value, subtitle }) => (
  <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
    <Typography variant="subtitle2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Paper>
);

/**
 * data is the object returned from /analytics/trends
 * where data.kpi contains domain KPIs:
 *  - govInstalls, govRenewals
 *  - fuelInstalls, fuelOffline
 *  - radioSales, radioRenewals
 *  - trackingInstalls, trackingTopShowroom, trackingTopShowroomInstalls
 *  - onlineInstalls, onlineRenewals
 */
const KpiCards = ({ data = {} }) => {
  const { kpi = {} } = data;

  const cards = [
    {
      title: 'Speed Governor Installs (This Month)',
      value: kpi.govInstalls ?? '—',
    },
    {
      title: 'Speed Governor Renewals (This Month)',
      value: kpi.govRenewals ?? '—',
    },
    {
      title: 'Fuel Monitoring Installs (This Month)',
      value: kpi.fuelInstalls ?? '—',
    },
    {
      title: 'Fuel Monitoring Offline (This Month)',
      value: kpi.fuelOffline ?? '—',
    },
    {
      title: 'Radio Calls Unit Sales (This Month)',
      value: kpi.radioSales ?? '—',
    },
    {
      title: 'Radio Calls Renewals (This Month)',
      value: kpi.radioRenewals ?? '—',
    },
    {
      title: 'Tracking Installs (This Month)',
      value: kpi.trackingInstalls ?? '—',
    },
    {
      title: 'Leading Showroom (Tracking Installs)',
      value: kpi.trackingTopShowroom || '—',
      subtitle:
        kpi.trackingTopShowroomInstalls != null
          ? `${kpi.trackingTopShowroomInstalls} installs`
          : '',
    },
    {
      title: 'Online Installs (This Month)',
      value: kpi.onlineInstalls ?? '—',
    },
    {
      title: 'Online Renewals (This Month)',
      value: kpi.onlineRenewals ?? '—',
    },
  ];

  // Only show cards with meaningful values
  const visible = cards.filter(
    (c) => c.value !== undefined && c.value !== null
  );

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {visible.map((c, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <KpiCard title={c.title} value={c.value} subtitle={c.subtitle} />
        </Grid>
      ))}
    </Grid>
  );
};

export default KpiCards;