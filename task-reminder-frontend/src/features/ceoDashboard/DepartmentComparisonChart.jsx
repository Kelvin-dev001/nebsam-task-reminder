import React from "react";
import { Paper, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const DepartmentComparisonChart = ({ monthly }) => {
  if (!monthly) return null;
  const { current, previous } = monthly;

  const departments = [
    { key: "gov", label: "Speed Governor", instField: "installs", renField: "renewals" },
    { key: "tracking", label: "Tracking", instField: "installs", renField: "renewals" },
    { key: "fuel", label: "Fuel", instField: "installs", renField: "renewals" },
    { key: "radio", label: "Radio", instField: "sales", renField: "renewals" },
    { key: "vtel", label: "Video Telematics", instField: "installs", renField: "renewals" },
  ];

  const data = departments.map((d) => ({
    department: d.label,
    currentInstalls: current?.[d.key]?.[d.instField] || 0,
    previousInstalls: previous?.[d.key]?.[d.instField] || 0,
    currentRenewals: current?.[d.key]?.[d.renField] || 0,
    previousRenewals: previous?.[d.key]?.[d.renField] || 0,
  }));

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        📊 This Month vs Last Month — Department Performance
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} barGap={2} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="department" stroke="#90a4ae" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} stroke="#90a4ae" />
          <Tooltip
            contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }}
            labelStyle={{ color: "#90caf9", fontWeight: 700 }}
          />
          <Legend />
          <Bar dataKey="currentInstalls" name="This Month Installs" fill="#90caf9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="previousInstalls" name="Last Month Installs" fill="#37474f" radius={[4, 4, 0, 0]} />
          <Bar dataKey="currentRenewals" name="This Month Renewals" fill="#f6b800" radius={[4, 4, 0, 0]} />
          <Bar dataKey="previousRenewals" name="Last Month Renewals" fill="#5d4037" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DepartmentComparisonChart;