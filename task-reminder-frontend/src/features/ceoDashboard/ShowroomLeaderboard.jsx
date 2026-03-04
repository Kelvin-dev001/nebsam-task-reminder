import React from "react";
import { Paper, Typography, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["#90caf9", "#66bb6a", "#ffa726", "#ef5350", "#ab47bc", "#26c6da", "#8bc34a", "#ff7043", "#7e57c2", "#78909c"];

const ShowroomLeaderboard = ({ showroomRanking = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!showroomRanking || showroomRanking.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
          🏆 Showroom Leaderboard — Top 10
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No showroom data available for this month.
        </Typography>
      </Paper>
    );
  }

  const sorted = [...showroomRanking]
    .filter((s) => s.showroomName)
    .sort((a, b) => b.installs - a.installs)
    .slice(0, 10);

  const chartHeight = isMobile ? Math.max(250, sorted.length * 40) : Math.max(300, sorted.length * 50);

  return (
    <Paper elevation={3} sx={{ p: { xs: 1.5, md: 3 }, mb: { xs: 2, md: 3 } }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} sx={{ mb: 2 }}>
        🏆 Showroom Leaderboard — Top 10 by Tracking Installs
      </Typography>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={sorted} layout="vertical" barSize={isMobile ? 16 : 24}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis type="number" stroke="#90a4ae" allowDecimals={false} tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis
            type="category"
            dataKey="showroomName"
            stroke="#90a4ae"
            width={isMobile ? 100 : 140}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <Tooltip contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
          <Bar dataKey="installs" name="Installs" radius={[0, 6, 6, 0]}>
            {sorted.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
          <Bar dataKey="renewals" name="Renewals" fill="#f6b800" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ShowroomLeaderboard;