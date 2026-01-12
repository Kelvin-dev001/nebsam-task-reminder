import React from 'react';
import { Grid, Paper, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const palette = ['#1976d2','#ff9800','#4caf50','#9c27b0','#ef5350','#26c6da','#8bc34a','#ff7043'];

const Section = ({ title, children, defaultExpanded = false }) => (
  <Accordion defaultExpanded={defaultExpanded} disableGutters>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);

const ChartBlock = ({ title, data, bars, height=320 }) => (
  <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
    <ResponsiveContainer width="100%" height={height - 50}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        {bars.map((b, idx) => (
          <Bar key={b.dataKey} dataKey={b.dataKey} fill={palette[idx % palette.length]} stackId={b.stackId} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </Paper>
);

const mapSeries = (months, seriesArray, mapper) =>
  months.map((m, idx) => ({ month: m, ...mapper(seriesArray[idx] || {}) }));

const BossMonthlyOverviewV2 = ({ monthlySeries }) => {
  if (!monthlySeries) return null;
  const months = monthlySeries.months || [];

  // GOV
  const govN = mapSeries(months, monthlySeries.gov?.nebsam || [], s => ({
    officeInst: s.officeInst||0, agentInst:s.agentInst||0,
    officeRen: s.officeRen||0, agentRen:s.agentRen||0,
    offline:s.offline||0, checkups:s.checkups||0
  }));
  const govM = mapSeries(months, monthlySeries.gov?.mock || [], s => ({
    officeRen: s.officeRen||0, agentRen:s.agentRen||0,
    offline:s.offline||0, checkups:s.checkups||0
  }));
  const govS = mapSeries(months, monthlySeries.gov?.sinotrack || [], s => ({
    officeInst: s.officeInst||0, agentInst:s.agentInst||0,
    officeRen: s.officeRen||0, agentRen:s.agentRen||0,
    offline:s.offline||0, checkups:s.checkups||0
  }));

  // RADIO
  const radio = mapSeries(months, monthlySeries.radio || [], s => ({
    officeSale:s.officeSale||0, agentSale:s.agentSale||0, officeRen:s.officeRen||0
  }));

  // FUEL
  const fuel = mapSeries(months, monthlySeries.fuel || [], s => ({
    officeInst:s.officeInst||0, agentInst:s.agentInst||0, officeRen:s.officeRen||0, offline:s.offline||0, checkups:s.checkups||0
  }));

  // VTEL
  const vtel = mapSeries(months, monthlySeries.vtel || [], s => ({
    officeInst:s.officeInst||0, agentInst:s.agentInst||0, officeRen:s.officeRen||0, offline:s.offline||0, checkups:s.checkups||0
  }));

  // TRACK
  const track = mapSeries(months, monthlySeries.track || [], s => ({
    tracker1Inst:s.tracker1Inst||0, tracker1Ren:s.tracker1Ren||0,
    tracker2Inst:s.tracker2Inst||0, tracker2Ren:s.tracker2Ren||0,
    magneticInst:s.magneticInst||0, magneticRen:s.magneticRen||0,
    offline:s.offline||0
  }));

  // ONLINE
  const online = mapSeries(months, monthlySeries.online || [], s => ({
    instBt:s.instBt||0, instHy:s.instHy||0, instCo:s.instCo||0, instHa:s.instHa||0,
    renBt:s.renBt||0, renHy:s.renHy||0, renCo:s.renCo||0, renHa:s.renHa||0
  }));

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {/* Speed Governor */}
      <Grid item xs={12}>
        <Section title="Speed Governor (Nebsam / Mock / Sinotrack)" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Nebsam installs (office vs agent)" data={govN}
                bars={[{dataKey:'officeInst'},{dataKey:'agentInst'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Nebsam renewals (office vs agent)" data={govN}
                bars={[{dataKey:'officeRen'},{dataKey:'agentRen'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Nebsam offline & checkups" data={govN}
                bars={[{dataKey:'offline'},{dataKey:'checkups'}]} />
            </Grid>

            <Grid item xs={12} md={6}>
              <ChartBlock title="Mock renewals (office vs agent)" data={govM}
                bars={[{dataKey:'officeRen'},{dataKey:'agentRen'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Mock offline & checkups" data={govM}
                bars={[{dataKey:'offline'},{dataKey:'checkups'}]} />
            </Grid>

            <Grid item xs={12} md={6}>
              <ChartBlock title="Sinotrack installs (office vs agent)" data={govS}
                bars={[{dataKey:'officeInst'},{dataKey:'agentInst'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Sinotrack renewals (office vs agent)" data={govS}
                bars={[{dataKey:'officeRen'},{dataKey:'agentRen'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Sinotrack offline & checkups" data={govS}
                bars={[{dataKey:'offline'},{dataKey:'checkups'}]} />
            </Grid>
          </Grid>
        </Section>
      </Grid>

      {/* Fuel Monitoring */}
      <Grid item xs={12}>
        <Section title="Fuel Monitoring" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Installs (office vs agent)" data={fuel}
                bars={[{dataKey:'officeInst'},{dataKey:'agentInst'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Renewals (office)" data={fuel}
                bars={[{dataKey:'officeRen'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Offline" data={fuel}
                bars={[{dataKey:'offline'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Checkups" data={fuel}
                bars={[{dataKey:'checkups'}]} />
            </Grid>
          </Grid>
        </Section>
      </Grid>

      {/* Radio Calls */}
      <Grid item xs={12}>
        <Section title="Radio Calls" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Sales (office vs agent)" data={radio}
                bars={[{dataKey:'officeSale'},{dataKey:'agentSale'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Renewals (office)" data={radio}
                bars={[{dataKey:'officeRen'}]} />
            </Grid>
          </Grid>
        </Section>
      </Grid>

      {/* Video Telematics */}
      <Grid item xs={12}>
        <Section title="Video Telematics" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Installs (office vs agent)" data={vtel}
                bars={[{dataKey:'officeInst'},{dataKey:'agentInst'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Renewals (office)" data={vtel}
                bars={[{dataKey:'officeRen'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Offline" data={vtel}
                bars={[{dataKey:'offline'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Checkups" data={vtel}
                bars={[{dataKey:'checkups'}]} />
            </Grid>
          </Grid>
        </Section>
      </Grid>

      {/* Tracking */}
      <Grid item xs={12}>
        <Section title="Tracking" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Installs by tracker type" data={track}
                bars={[{dataKey:'tracker1Inst'},{dataKey:'tracker2Inst'},{dataKey:'magneticInst'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Renewals by tracker type" data={track}
                bars={[{dataKey:'tracker1Ren'},{dataKey:'tracker2Ren'},{dataKey:'magneticRen'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Offline" data={track}
                bars={[{dataKey:'offline'}]} />
            </Grid>
          </Grid>
        </Section>
      </Grid>

      {/* Online */}
      <Grid item xs={12}>
        <Section title="Online (Product Mix)" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Installs (Bluetooth/Hybrid/Comprehensive/HybridAlarm)" data={online}
                bars={[{dataKey:'instBt'},{dataKey:'instHy'},{dataKey:'instCo'},{dataKey:'instHa'}]} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock title="Renewals (Bluetooth/Hybrid/Comprehensive/HybridAlarm)" data={online}
                bars={[{dataKey:'renBt'},{dataKey:'renHy'},{dataKey:'renCo'},{dataKey:'renHa'}]} />
            </Grid>
          </Grid>
        </Section>
      </Grid>
    </Grid>
  );
};

export default BossMonthlyOverviewV2;