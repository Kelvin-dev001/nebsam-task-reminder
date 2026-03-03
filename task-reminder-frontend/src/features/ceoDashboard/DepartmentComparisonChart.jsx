import React from "react";
import { Paper, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const DepartmentComparisonChart = ({ monthly }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!monthly) return null;
  const { current, previous } = monthly;

  const departments = [
    { key: "gov", label: "Speed Gov", instField: "installs", renField: "renewals" },
    { key: "tracking", label: "Tracking", instField: "installs", renField: "renewals" },
    { key: "fuel", label: "Fuel", instField: "installs", renField: "renewals" },
    { key: "radio", label: "Radio", instField: "sales", renField: "renewals" },
    { key: "vtel", label: "V.Tel", instField: "installs", renField: "renewals" },
  ];

  const data = departments.map((d) => ({
    department: d.label,
    currentInstalls: current?.[d.key]?.[d.instField] || 0,
    previousInstalls: previous?.[d.key]?.[d.instField] || 0,
    currentRenewals: current?.[d.key]?.[d.renField] || 0,
    previousRenewals: previous?.[d.key]?.[d.renField] || 0,
  }));

  return (
    <Paper elevation={3} sx={{ p: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} sx={{ mb: 1.5 }}>
        Selected Month vs Previous — Departments
      </Typography>
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 350}>
        <BarChart data={data} barGap={2} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="department" stroke="#90a4ae" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis allowDecimals={false} stroke="#90a4ae" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }} />
          {!isMobile && <Legend />}
          <Bar dataKey="currentInstalls" name="Selected Installs" fill="#90caf9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="previousInstalls" name="Prev Installs" fill="#37474f" radius={[4, 4, 0, 0]} />
          <Bar dataKey="currentRenewals" name="Selected Renewals" fill="#f6b800" radius={[4, 4, 0, 0]} />
          <Bar dataKey="previousRenewals" name="Prev Renewals" fill="#5d4037" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DepartmentComparisonChart;