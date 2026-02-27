import React, { useState } from 'react';
import {
  Box, Grid, Typography, ThemeProvider, Button, CircularProgress, Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ceoTheme from './theme';
import useCeoDashboardData from './useCeoDashboardData';
import KpiCard from './KpiCard';
import KpiDrilldownModal from './KpiDrilldownModal';
import GrowthTrendChart from './GrowthTrendChart';
import ShowroomComparisonChart from './ShowroomComparisonChart';
import SpeedGovernorBreakdownChart from './SpeedGovernorBreakdownChart';

const kpiList = (trends) => [
  {
    key: 'totalSales',
    title: "Total Sales This Month",
    value: trends?.thisMonthSales != null ? trends.thisMonthSales : "—",
    showPercent: false,
  },
  {
    key: 'growthRate',
    title: "% Growth vs Last Month",
    value: trends?.pctVsLastMonth != null
      ? `${Math.abs(trends.pctVsLastMonth).toFixed(1)}%`
      : "—",
    percent: trends?.pctVsLastMonth,
    showPercent: true,
  },
  {
    key: 'govInstalls',
    title: "Gov Installs",
    value: trends?.kpi?.govInstalls ?? "—"
  },
  {
    key: 'govRenewals',
    title: "Gov Renewals",
    value: trends?.kpi?.govRenewals ?? "—"
  },
  {
    key: 'renewalRate',
    title: "Renewal Rate %",
    value: trends?.kpi?.govInstalls && trends?.kpi?.govRenewals
      ? ((trends.kpi.govRenewals / trends.kpi.govInstalls) * 100).toFixed(1) + "%"
      : "—"
  }
];

const CeoDashboardPage = () => {
  const { trends, monthly, monthlySeries, loading, error, lastUpdated, refetch } = useCeoDashboardData();
  const [drillKpi, setDrillKpi] = useState(null);

  return (
    <ThemeProvider theme={ceoTheme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 1, md: 3 } }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="h5" fontWeight={700}>CEO Dashboard</Typography>
            <Typography color="text.secondary" variant="body2">Executive Growth Analytics</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refetch}
              disabled={loading}
              sx={{ fontWeight: 700, minWidth: 130 }}
            >
              {loading ? <CircularProgress size={18} /> : "Refresh"}
            </Button>
          </Grid>
        </Grid>
        <Typography sx={{ mb: 2, fontSize: 15, color: "text.secondary" }}>
          Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
        </Typography>
        {/* KPI STRIP */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {kpiList(trends).map(kpi => (
            <Grid item xs={12} sm={6} md={2.4} key={kpi.key}>
              <KpiCard {...kpi} onClick={() => setDrillKpi(kpi)} />
            </Grid>
          ))}
        </Grid>
        <KpiDrilldownModal
          open={!!drillKpi}
          onClose={() => setDrillKpi(null)}
          title={drillKpi?.title}
        >
          {/* TODO: Implement detailed breakdown for each KPI as per your needs */}
          <div>Drilldown analytics coming soon.</div>
        </KpiDrilldownModal>
        {/* MAIN CHARTS */}
        {error && <Alert severity="error">{error}</Alert>}
        {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={36} /></Box>}
        {!loading && monthlySeries && (
          <Box>
            <GrowthTrendChart monthlySeries={monthlySeries} />
            <Box sx={{ mt: 4 }}>
              {/* This placeholder will be mapped properly after you plug in actual backend showroom/grouped bar data */}
              <ShowroomComparisonChart />
            </Box>
            <Box sx={{ mt: 4 }}>
              <SpeedGovernorBreakdownChart monthlySeries={monthlySeries} />
            </Box>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default CeoDashboardPage;