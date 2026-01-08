import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TrendLineChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="_id" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
      <YAxis />
      <Tooltip labelFormatter={(d) => new Date(d).toLocaleString()} />
      <Line type="monotone" dataKey="sales" stroke="#1976d2" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export default TrendLineChart;