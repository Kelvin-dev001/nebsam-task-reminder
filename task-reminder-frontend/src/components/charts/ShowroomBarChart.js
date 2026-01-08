import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ShowroomBarChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="showroomName" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="sales" fill="#ff9800" name="Sales" />
    </BarChart>
  </ResponsiveContainer>
);

export default ShowroomBarChart;