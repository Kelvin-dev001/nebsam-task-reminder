import React, { useState } from "react";
import {
  Box, Grid, Typography, ThemeProvider, Button, CircularProgress,
  Alert, FormControl, Select, MenuItem, InputLabel, Chip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SpeedIcon from "@mui/icons-material/Speed";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import RadioIcon from "@mui/icons-material/Radio";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import VideocamIcon from "@mui/icons-material/Videocam";

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
            ml: `${DRAWER_WIDTH}px`,
            bgcolor: "background.default",
            minHeight: "100vh",
            p: { xs: 2, md: 4 },
            overflow: "auto",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                Executive Dashboard
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                Monthly Business Analytics &nbsp;•&nbsp; Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: "text.secondary" }}>Months</InputLabel>
                <Select
                  value={months}
                  label="Months"
                  onChange={(e) => setMonths(e.target.value)}
                  sx={{ color: "text.primary" }}
                >
                  {[3, 6, 9, 12].map((m) => (
                    <MenuItem key={m} value={m}>{m} months</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={refetch}
                disabled={loading}
                sx={{ fontWeight: 700, minWidth: 120 }}
              >
                {loading ? <CircularProgress size={18} /> : "Refresh"}
              </Button>
            </Box>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={48} />
            </Box>
          )}

          {!loading && (
            <>
              {/* KPI Strip */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {kpiList.map((k) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={k.key}>
                    <KpiCard
                      title={k.title}
                      value={k.value}
                      percent={k.percent}
                      showPercent={k.showPercent}
                      icon={k.icon}
                      subtitle={k.subtitle}
                      onClick={() => setDrillKpi(k)}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Drilldown Modal */}
              <KpiDrilldownModal
                open={!!drillKpi}
                onClose={() => setDrillKpi(null)}
                title={drillKpi?.title}
              >
                <Typography color="text.secondary">
                  Detailed breakdown for <strong>{drillKpi?.title}</strong> coming soon.
                </Typography>
              </KpiDrilldownModal>

              {/* Monthly Sales Trend */}
              <MonthlySalesTrendChart monthlySeries={monthlySeries} />

              {/* Department Comparison: This vs Last Month */}
              <DepartmentComparisonChart monthly={monthly} />

              {/* Speed Governor Trend */}
              <GrowthTrendChart monthlySeries={monthlySeries} />

              {/* Speed Governor Breakdown */}
              <SpeedGovernorBreakdownChart monthlySeries={monthlySeries} />

              {/* Showroom Leaderboard */}
              <ShowroomLeaderboard showroomRanking={trends?.showroomRanking} />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CeoDashboardPage;