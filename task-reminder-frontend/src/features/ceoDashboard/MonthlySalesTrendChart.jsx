import React from "react";
import { Paper, Typography } from "@mui/material";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const monthLabel = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
};

const MonthlySalesTrendChart = ({ monthlySeries }) => {
  if (!monthlySeries?.months) return null;
  const months = monthlySeries.months;

  const data = months.map((month, idx) => {
    const govN = monthlySeries.gov?.nebsam?.[idx] || {};
    const govS = monthlySeries.gov?.sinotrack?.[idx] || {};
    const govM = monthlySeries.gov?.mock?.[idx] || {};
    const fuel = monthlySeries.fuel?.[idx] || {};
    const radio = monthlySeries.radio?.[idx] || {};
    const vtel = monthlySeries.vtel?.[idx] || {};
    const track = monthlySeries.track?.[idx] || {};

    const govTotal = (govN.officeInst || 0) + (govN.agentInst || 0) + (govN.officeRen || 0) + (govN.agentRen || 0) +
      (govS.officeInst || 0) + (govS.agentInst || 0) + (govS.officeRen || 0) + (govS.agentRen || 0) +
      (govM.officeRen || 0) + (govM.agentRen || 0);
    const fuelTotal = (fuel.officeInst || 0) + (fuel.agentInst || 0) + (fuel.officeRen || 0);
    const radioTotal = (radio.officeSale || 0) + (radio.agentSale || 0) + (radio.officeRen || 0);
    const vtelTotal = (vtel.officeInst || 0) + (vtel.agentInst || 0) + (vtel.officeRen || 0);
    const trackTotal = (track.tracker1Inst || 0) + (track.tracker1Ren || 0) + (track.tracker2Inst || 0) +
      (track.tracker2Ren || 0) + (track.magneticInst || 0) + (track.magneticRen || 0);

    return {
      month,
      label: monthLabel(month),
      gov: govTotal,
      fuel: fuelTotal,
      radio: radioTotal,
      vtel: vtelTotal,
      tracking: trackTotal,
      total: govTotal + fuelTotal + radioTotal + vtelTotal + trackTotal,
    };
  });

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        📈 Monthly Business Performance
      </Typography>
      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#90caf9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#90caf9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="label" stroke="#90a4ae" />
          <YAxis allowDecimals={false} stroke="#90a4ae" />
          <Tooltip
            contentStyle={{ backgroundColor: "#0d2137", border: "1px solid #1e3a5f", borderRadius: 8 }}
            labelStyle={{ color: "#90caf9", fontWeight: 700 }}
          />
          <Legend />
          <Area type="monotone" dataKey="total" name="Total Sales" fill="url(#totalGradient)" stroke="#90caf9" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="gov" name="Speed Governor" stroke="#66bb6a" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="tracking" name="Tracking" stroke="#ffa726" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="fuel" name="Fuel" stroke="#ef5350" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="radio" name="Radio" stroke="#ab47bc" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="vtel" name="Video Telematics" stroke="#26c6da" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default MonthlySalesTrendChart;