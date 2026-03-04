import React, { useState } from "react";
import {
  Box, Grid, Typography, ThemeProvider, Button, CircularProgress,
  Alert, Chip, Divider, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SpeedIcon from "@mui/icons-material/Speed";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import RadioIcon from "@mui/icons-material/Radio";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import BlurOnIcon from "@mui/icons-material/BlurOn";

import ceoTheme from "./theme";
import useCeoDashboardData from "./useCeoDashboardData";
import MonthYearPicker from "./MonthYearPicker";
import KpiCard from "./KpiCard";
import KpiDrilldownModal from "./KpiDrilldownModal";
import ShowroomLeaderboard from "./ShowroomLeaderboard";
import InstallationTrendsChart from "./InstallationTrendsChart";
import RenewalTrendsChart from "./RenewalTrendsChart";
import TrackingTrendChart from "./TrackingTrendChart";
import GovInstallsChart from "./GovInstallsChart";
import GovRenewalsChart from "./GovRenewalsChart";
import CeoSidebar, { DRAWER_WIDTH } from "./CeoSidebar";
import { exportCeoPdf } from "./exportCeoPdf";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatMonthLabel(monthStr) {
  if (!monthStr) return "";
  const [y, m] = monthStr.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

const CeoDashboardPage = () => {
  const {
    monthData, monthlySeries, loading, error, lastUpdated,
    selectedMonth, setSelectedMonth, refetch,
  } = useCeoDashboardData();

  const [drillKpi, setDrillKpi] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const kpi = monthData?.kpi || {};
  const monthLabel = formatMonthLabel(selectedMonth);

  const kpiList = [
    {
      key: "totalSales", title: "Total Sales", icon: <TrendingUpIcon />,
      value: monthData?.selectedSales ?? "—",
      percent: monthData?.pctChange, showPercent: true,
    },
    { key: "govInstalls", title: "Gov Installs", icon: <SpeedIcon />, value: kpi.govInstalls ?? "—" },
    { key: "govRenewals", title: "Gov Renewals", icon: <SpeedIcon />, value: kpi.govRenewals ?? "—" },
    { key: "fuelInstalls", title: "Fuel Installs", icon: <LocalGasStationIcon />, value: kpi.fuelInstalls ?? "—" },
    { key: "fuelRenewals", title: "Fuel Renewals", icon: <LocalGasStationIcon />, value: kpi.fuelRenewals ?? "—" },
    { key: "radioSales", title: "Radio Sales", icon: <RadioIcon />, value: kpi.radioSales ?? "—" },
    { key: "radioRenewals", title: "Radio Renewals", icon: <RadioIcon />, value: kpi.radioRenewals ?? "—" },
    { key: "trackingInstalls", title: "Tracking Installs", icon: <GpsFixedIcon />, value: kpi.trackingInstalls ?? "—" },
    { key: "trackingRenewals", title: "Tracking Renewals", icon: <GpsFixedIcon />, value: kpi.trackingRenewals ?? "—" },
    { key: "hybridAlarm", title: "Hybrid Alarm Inst", icon: <NotificationsActiveIcon />, value: kpi.hybridAlarmInstalls ?? "—" },
    { key: "hybridTracker", title: "Hybrid Tracker Inst", icon: <BlurOnIcon />, value: kpi.hybridTrackerInstalls ?? "—" },
    {
      key: "topShowroom", title: "Top Showroom",
      value: kpi.trackingTopShowroom || "—",
      subtitle: kpi.trackingTopShowroomInstalls ? `${kpi.trackingTopShowroomInstalls} installs` : "",
    },
  ];

  const handleExportPdf = () => exportCeoPdf({ monthData, selectedMonth });

  return (
    <ThemeProvider theme={ceoTheme}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <CeoSidebar onExportPdf={handleExportPdf} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
            mt: { xs: "56px", md: 0 },
            bgcolor: "background.default",
            minHeight: "100vh",
            p: { xs: 1.5, sm: 2, md: 4 },
            overflow: "auto",
          }}
        >
          {/* ─── HEADER ─── */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              mb: { xs: 2, md: 3 },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} color="primary.main">
                Executive Dashboard
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <MonthYearPicker value={selectedMonth} onChange={setSelectedMonth} label="Month" />
              <Button
                variant="outlined"
                startIcon={!isMobile && <RefreshIcon />}
                onClick={refetch}
                disabled={loading}
                size={isMobile ? "small" : "medium"}
                sx={{ fontWeight: 700, minWidth: { xs: 70, md: 110 } }}
              >
                {loading ? <CircularProgress size={16} /> : isMobile ? "↻" : "Refresh"}
              </Button>
            </Box>
          </Box>

          {/* Error */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Loading */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={48} />
            </Box>
          )}

          {!loading && (
            <>
              {/* ─── SECTION 1: Month-Filtered KPIs ─── */}
              <Chip
                label={`📅 KPIs for: ${monthLabel}`}
                color="primary"
                variant="outlined"
                sx={{ mb: 2, fontWeight: 700, fontSize: { xs: 12, md: 14 } }}
              />

              <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
                {kpiList.map((k) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={k.key}>
                    <KpiCard
                      title={k.title}
                      value={k.value}
                      percent={k.percent}
                      showPercent={k.showPercent}
                      icon={!isMobile ? k.icon : undefined}
                      subtitle={k.subtitle}
                      onClick={() => setDrillKpi(k)}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* KPI Drilldown Modal */}
              <KpiDrilldownModal
                open={!!drillKpi}
                onClose={() => setDrillKpi(null)}
                title={drillKpi?.title}
              >
                <Typography color="text.secondary">
                  Detailed breakdown for <strong>{drillKpi?.title}</strong> — {monthLabel}
                </Typography>
              </KpiDrilldownModal>

              {/* ─── SECTION 2: Showroom Leaderboard (Month-Filtered) ─── */}
              <ShowroomLeaderboard showroomRanking={monthData?.showroomRanking} />

              {/* ─── DIVIDER: Charts below are always last 6 months ─── */}
              <Divider sx={{ my: { xs: 2, md: 4 }, borderColor: "rgba(144,202,249,0.15)" }} />
              <Chip
                label="📊 6-Month Trend Analytics"
                color="secondary"
                variant="outlined"
                sx={{ mb: 2, fontWeight: 700, fontSize: { xs: 12, md: 14 } }}
              />

              {/* ─── SECTION 3: Installation Trends (all depts) ─── */}
              <InstallationTrendsChart monthlySeries={monthlySeries} />

              {/* ─── SECTION 4: Renewal Trends (all depts) ─── */}
              <RenewalTrendsChart monthlySeries={monthlySeries} />

              {/* ─── SECTION 5: Tracking Installs vs Renewals ─── */}
              <TrackingTrendChart monthlySeries={monthlySeries} />

              {/* ─── SECTION 6: Speed Gov Installs (Agent vs Office) ─── */}
              <GovInstallsChart monthlySeries={monthlySeries} />

              {/* ─── SECTION 7: Speed Gov Renewals (Agent vs Office) ─── */}
              <GovRenewalsChart monthlySeries={monthlySeries} />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CeoDashboardPage;