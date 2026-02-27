import React from 'react';
import { Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

// Placeholder data. Connect backend series for real use.
const sampleShowrooms = [
  { showroom: 'Westlands', installations: 48, renewals: 21 },
  { showroom: 'Thika', installations: 36, renewals: 18 },
  { showroom: 'Kisumu', installations: 24, renewals: 13 }
];

const ShowroomComparisonChart = ({ showroomData }) => {
  const data = showroomData || sampleShowrooms;
  const sorted = [...data].sort((a, b) => b.installations - a.installations);
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Showroom Install vs Renewals</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sorted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="showroom" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="installations" name="Installs" fill="#1976d2" />
          <Bar dataKey="renewals" name="Renewals" fill="#F6B800" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};
export default ShowroomComparisonChart;