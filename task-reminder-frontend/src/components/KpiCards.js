import React from 'react';
import { Grid, Paper, Typography, Stack, Chip } from '@mui/material';

const KpiCard = ({ title, value, subtitle, trend }) => (
  <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
    <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
    <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
    {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
    {trend != null && (
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Chip
          label={`${trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} ${Math.abs(trend).toFixed(1)}% vs last month`}
          color={trend > 0 ? 'success' : trend < 0 ? 'error' : 'default'}
          size="small"
        />
      </Stack>
    )}
  </Paper>
);

const KpiCards = ({ data = {} }) => {
  const {
    thisMonthSales = 0,
    lastMonthSales = 0,
    pctVsLastMonth = null,
    submission = {}
  } = data;

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard title="This Month Activity" value={thisMonthSales} subtitle="Installs/Renewals/Checks" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard title="Last Month Activity" value={lastMonthSales} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard title="% vs Last Month" value={pctVsLastMonth != null ? `${pctVsLastMonth.toFixed(1)}%` : '—'} trend={pctVsLastMonth} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Reports Submitted"
          value={`${submission.submitted || 0}/${submission.expected || 0}`}
          subtitle={submission.date ? new Date(submission.date).toLocaleDateString() : ''}
        />
      </Grid>
    </Grid>
  );
};

export default KpiCards;