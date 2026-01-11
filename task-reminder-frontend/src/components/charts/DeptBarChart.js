import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DeptBarChart = ({ data = [], deptLookup = {} }) => {
  const mapped = data.map(d => ({
    name: deptLookup[d._id] || d._id,
    reports: d.reports ?? 0
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={mapped}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="reports" fill="#2196f3" name="Reports" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DeptBarChart;