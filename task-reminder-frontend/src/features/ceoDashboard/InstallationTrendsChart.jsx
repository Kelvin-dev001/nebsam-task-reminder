import React from "react";
import { Paper, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const monthLabel = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
};

const DEPT_COLORS = {
  "Speed Governor": "#66bb6a",
  Tracking: "#ffa726",
  Fuel: "#ef5350",
  Radio: "#ab47bc",
  "Video Telematics": "#26c6da",
};

const InstallationTrendsChart = ({ monthlySeries }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!monthlySeries?.months) return null;
  const months = monthlySeries.months;

  const data = months.map((month, idx) => {
    const govN = monthlySeries.gov?.nebsam?.[idx] || {};
    const govS = monthlySeries.gov?.sinotrack?.[idx] || {};
    const fuel = monthlySeries.fuel?.[idx] || {};
    const radio = monthlySeries.radio?.[idx] || {};
    const vtel = monthlySeries.vtel?.[idx] || {};
    const track = monthlySeries.track?.[idx] || {};

    return {
      label: monthLabel(month),
      "Speed Governor": (govN.officeInst || 0) + (govN.agentInst || 0) + (govS.officeInst || 0) + (govS.agentInst || 0),
      Tracking: (track.tracker1Inst || 0) + (track.tracker2Inst || 0) + (track.magneticInst || 0),
      Fuel: (fuel.officeInst || 0) + (fuel.agentInst || 0),
      Radio: (radio.officeSale || 0) + (radio.agentSale || 0),
      "Video Telematics": (vtel.officeInst || 0) + (vtel.agentInst || 0),
    };
  });

  return (
    <Paper elevation={3} sx={{ p: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} sx={{ mb: 1.5 }}>
        📈 Total Installation Trends — All Departments
      </Typography>
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 380}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="label" stroke="#90a4ae" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis allowDecimals={false} stroke="#90a4ae" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
          {Object.entries(DEPT_COLORS).map(([name, color]) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: color }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default InstallationTrendsChart;