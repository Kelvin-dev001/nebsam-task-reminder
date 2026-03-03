import React, { useState } from "react";
import {
  Box, Grid, Typography, ThemeProvider, Button, CircularProgress,
  Alert, FormControl, Select, MenuItem, InputLabel, useMediaQuery,
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
import KpiCard from "./KpiCard";
import KpiDrilldownModal from "./KpiDrilldownModal";
import MonthlySalesTrendChart from "./MonthlySalesTrendChart";
import GrowthTrendChart from "./GrowthTrendChart";
import DepartmentComparisonChart from "./DepartmentComparisonChart";
import ShowroomLeaderboard from "./ShowroomLeaderboard";
import SpeedGovernorBreakdownChart from "./SpeedGovernorBreakdownChart";
import CeoSidebar, { DRAWER_WIDTH } from "./CeoSidebar";
import { exportCeoPdf } from "./exportCeoPdf";

const CeoDashboardPage = () => {
  const {
    trends, monthly, monthlySeries,
    loading, error, lastUpdated,
    months, setMonths, refetch,
  } = useCeoDashboardData(6);

  const [drillKpi, setDrillKpi] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const kpi = trends?.kpi || {};

  const kpiList = [
    {
      key: "totalSales", title: "Total Sales", icon: <TrendingUpIcon />,
      value: trends?.thisMonthSales ?? "—",
      percent: trends?.pctVsLastMonth, showPercent: true,
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

  const handleExportPdf = () => exportCeoPdf({ trends, monthly });

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
              <Typography
                variant={isMobile ? "h5" : "h4"}
                fontWeight={800}
                color="primary.main"
              >
                Executive Dashboard
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                Monthly Analytics&nbsp;•&nbsp;
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel sx={{ color: "text.secondary" }}>Months</InputLabel>
                <Select
                  value={months}
                  label="Months"
                  onChange={(e) => setMonths(e.target.value)}
                  sx={{ color: "text.primary" }}
                >
                  {[3, 6, 9, 12].map((m) => (
                    <MenuItem key={m} value={m}>{m} mo</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={!isMobile && <RefreshIcon />}
                onClick={refetch}
                disabled={loading}
                size={isMobile ? "small" : "medium"}
                sx={{ fontWeight: 700, minWidth: { xs: 80, md: 120 } }}
              >
                {loading ? <CircularProgress size={16} /> : isMobile ? "↻" : "Refresh"}
              </Button>
            </Box>
          </Box>

          {/* Error */}
          {error && <Alert severity="error" sx={{ mb: 2, fontSize: { xs: 13, md: 14 } }}>{error}</Alert>}

          {/* Loading */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={48} />
            </Box>
          )}

          {!loading && (
            <>
              {/* KPI Grid — responsive: 2 cols mobile, 5 cols desktop */}
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
                  Detailed breakdown for <strong>{drillKpi?.title}</strong> coming soon.
                </Typography>
              </KpiDrilldownModal>

              {/* Charts */}
              <MonthlySalesTrendChart monthlySeries={monthlySeries} />
              <DepartmentComparisonChart monthly={monthly} />
              <GrowthTrendChart monthlySeries={monthlySeries} />
              <SpeedGovernorBreakdownChart monthlySeries={monthlySeries} />
              <ShowroomLeaderboard showroomRanking={trends?.showroomRanking} />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CeoDashboardPage;