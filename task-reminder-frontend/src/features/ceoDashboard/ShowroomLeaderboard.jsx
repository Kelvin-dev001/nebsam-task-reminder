import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["#90caf9", "#66bb6a", "#ffa726", "#ef5350", "#ab47bc", "#26c6da", "#8bc34a", "#ff7043"];

const ShowroomLeaderboard = ({ showroomRanking = [] }) => {
  if (!showroomRanking || showroomRanking.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>🏆 Showroom Leaderboard</Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>No showroom data available this month.</Typography>
      </Paper>
    );
  }

  const sorted = [...showroomRanking]
    .filter((s) => s.showroomName)
    .sort((a, b) => b.installs - a.installs);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
         Showroom Leaderboard 🏆 — Tracking Installs This Month
      </Typography>
      <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 50)}>
        <BarChart data={sorted} layout="vertical" barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis type="number" stroke="#90a4ae" allowDecimals={false} />
          <YAxis type="category" dataKey="showroomName" stroke="#90a4ae" width={140} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }}
            labelStyle={{ color: "#90caf9", fontWeight: 700 }}
          />
          <Legend />
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