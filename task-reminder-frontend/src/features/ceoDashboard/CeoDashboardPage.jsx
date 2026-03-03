import React, { useState } from "react";
import {
  Box, Grid, Typography, ThemeProvider, Button, CircularProgress,
  Alert, Chip, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SpeedIcon from "@mui/icons-material/Speed";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import RadioIcon from "@mui/icons-material/Radio";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";

import ceoTheme from "./theme";
import useCeoDashboardData from "./useCeoDashboardData";
import MonthYearPicker from "./MonthYearPicker";
import KpiCard from "./KpiCard";
import KpiDrilldownModal from "./KpiDrilldownModal";
import DailySalesChart from "./DailySalesChart";
import GovDailyChart from "./GovDailyChart";
import DepartmentComparisonChart from "./DepartmentComparisonChart";
import ShowroomLeaderboard from "./ShowroomLeaderboard";
import MonthlySalesTrendChart from "./MonthlySalesTrendChart";
import SpeedGovernorBreakdownChart from "./SpeedGovernorBreakdownChart";
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
    data, monthlySeries, loading, error, lastUpdated,
    selectedMonth, setSelectedMonth, refetch,
  } = useCeoDashboardData();

  const [drillKpi, setDrillKpi] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const kpi = data?.kpi || {};
  const monthLabel = formatMonthLabel(selectedMonth);

  const kpiList = [
    {
      key: "totalSales", title: "Total Sales", icon: <TrendingUpIcon />,
      value: data?.selectedSales ?? "—",
      percent: data?.pctChange, showPercent: true,
    },
    { key: "govInstalls", title: "Gov Installs", icon: <SpeedIcon />, value: kpi.govInstalls ?? "—" },
    { key: "govRenewals", title: "Gov Renewals", icon: <SpeedIcon />, value: kpi.govRenewals ?? "—" },
    { key: "fuelInstalls", title: "Fuel Installs", icon: <LocalGasStationIcon />, value: kpi.fuelInstalls ?? "—" },
    { key: "fuelRenewals", title: "Fuel Renewals", icon: <LocalGasStationIcon />, value: kpi.fuelRenewals ?? "—" },
    { key: "radioSales", title: "Radio Sales", icon: <RadioIcon />, value: kpi.radioSales ?? "—" },
    { key: "radioRenewals", title: "Radio Renewals", icon: <RadioIcon />, value: kpi.radioRenewals ?? "—" },
    { key: "trackingInstalls", title: "Tracking Installs", icon: <GpsFixedIcon />, value: kpi.trackingInstalls ?? "—" },
    { key: "trackingRenewals", title: "Tracking Renewals", icon: <GpsFixedIcon />, value: kpi.trackingRenewals ?? "—" },
    {
      key: "topShowroom", title: "Top Showroom",
      value: kpi.trackingTopShowroom || "—",
      subtitle: kpi.trackingTopShowroomInstalls ? `${kpi.trackingTopShowroomInstalls} installs` : "",
    },
  ];

  const handleExportPdf = () => {
    exportCeoPdf({
      trends: {
        thisMonthSales: data?.selectedSales,
        pctVsLastMonth: data?.pctChange,
        kpi: data?.kpi,
      },
      monthly: data?.departments,
    });
  };

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
          {/* Header */}
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
              <MonthYearPicker
                value={selectedMonth}
                onChange={setSelectedMonth}
                label="Month"
              />
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

          {/* Selected month label */}
          <Chip
            label={`Viewing: ${monthLabel}`}
            color="primary"
            variant="outlined"
            sx={{ mb: 2, fontWeight: 700, fontSize: { xs: 13, md: 14 } }}
          />

          {/* Error */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Loading */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={48} />
            </Box>
          )}

          {!loading && data && (
            <>
              {/* KPI Strip */}
              <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 4 } }}>
                {kpiList.map((k) => (
                  <Grid item xs={6} sm={4} md={2.4} key={k.key}>
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

              {/* KPI Drilldown */}
              <KpiDrilldownModal
                open={!!drillKpi}
                onClose={() => setDrillKpi(null)}
                title={drillKpi?.title}
              >
                <Typography color="text.secondary">
                  Detailed breakdown for <strong>{drillKpi?.title}</strong> — {monthLabel}
                </Typography>
              </KpiDrilldownModal>

              {/* Daily Sales for Selected Month */}
              <DailySalesChart dailySeries={data.dailySeries} month={selectedMonth} />

              {/* Department Comparison: Selected vs Previous */}
              <DepartmentComparisonChart monthly={data.departments} />

              {/* Gov Daily Breakdown */}
              <GovDailyChart govDaily={data.govDaily} month={selectedMonth} />

              {/* 6-Month Trends (always shows last 6 months regardless of selection) */}
              <MonthlySalesTrendChart monthlySeries={monthlySeries} />

              {/* Speed Governor Multi-Month Breakdown */}
              <SpeedGovernorBreakdownChart monthlySeries={monthlySeries} />

              {/* Showroom Leaderboard for Selected Month */}
              <ShowroomLeaderboard showroomRanking={data.showroomRanking} />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CeoDashboardPage;