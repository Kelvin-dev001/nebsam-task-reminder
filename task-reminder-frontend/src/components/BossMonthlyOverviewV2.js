import React from 'react';
import { Grid, Paper, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

// Simple, consistent palette – brand blue plus complementary colors
const palette = ['#1976d2','#ff9800','#4caf50','#9c27b0','#ef5350','#26c6da','#8bc34a','#ff7043'];

// Format "YYYY-MM" -> "Jan 25" style
const monthLabel = (ym) => {
  if (!ym) return '';
  const [y,m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
};

const Section = ({ title, children, defaultExpanded = false }) => (
  <Accordion defaultExpanded={defaultExpanded} disableGutters>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);

const ChartBlock = ({ title, data, bars, height = 320 }) => (
  <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
    <ResponsiveContainer width="100%" height={height - 50}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" /> {/* pretty month label */}
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        {bars.map((b, idx) => (
          <Bar
            key={b.dataKey}
            dataKey={b.dataKey}
            name={b.name || b.dataKey}
            fill={palette[idx % palette.length]}
            stackId={b.stackId}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </Paper>
);

// generic helper: map backend series into recharts data with human labels
const mapSeries = (months, seriesArray, mapper) =>
  months.map((m, idx) => ({
    month: m,
    label: monthLabel(m),
    ...mapper(seriesArray[idx] || {})
  }));

const BossMonthlyOverviewV2 = ({ monthlySeries }) => {
  if (!monthlySeries) return null;
  const months = monthlySeries.months || [];

  // GOV
  const govN = mapSeries(months, monthlySeries.gov?.nebsam || [], s => ({
    officeInst: s.officeInst || 0,
    agentInst:  s.agentInst  || 0,
    officeRen:  s.officeRen  || 0,
    agentRen:   s.agentRen   || 0,
    offline:    s.offline    || 0,
    checkups:   s.checkups   || 0
  }));
  const govM = mapSeries(months, monthlySeries.gov?.mock || [], s => ({
    officeRen: s.officeRen || 0,
    agentRen:  s.agentRen  || 0,
    offline:   s.offline   || 0,
    checkups:  s.checkups  || 0
  }));
  const govS = mapSeries(months, monthlySeries.gov?.sinotrack || [], s => ({
    officeInst: s.officeInst || 0,
    agentInst:  s.agentInst  || 0,
    officeRen:  s.officeRen  || 0,
    agentRen:   s.agentRen   || 0,
    offline:    s.offline    || 0,
    checkups:   s.checkups   || 0
  }));

  // RADIO
  const radio = mapSeries(months, monthlySeries.radio || [], s => ({
    officeSale: s.officeSale || 0,
    agentSale:  s.agentSale  || 0,
    officeRen:  s.officeRen  || 0
  }));

  // FUEL
  const fuel = mapSeries(months, monthlySeries.fuel || [], s => ({
    officeInst: s.officeInst || 0,
    agentInst:  s.agentInst  || 0,
    officeRen:  s.officeRen  || 0,
    offline:    s.offline    || 0,
    checkups:   s.checkups   || 0
  }));

  // VTEL
  const vtel = mapSeries(months, monthlySeries.vtel || [], s => ({
    officeInst: s.officeInst || 0,
    agentInst:  s.agentInst  || 0,
    officeRen:  s.officeRen  || 0,
    offline:    s.offline    || 0,
    checkups:   s.checkups   || 0
  }));

  // TRACK
  const track = mapSeries(months, monthlySeries.track || [], s => ({
    tracker1Inst: s.tracker1Inst || 0,
    tracker1Ren:  s.tracker1Ren  || 0,
    tracker2Inst: s.tracker2Inst || 0,
    tracker2Ren:  s.tracker2Ren  || 0,
    magneticInst: s.magneticInst || 0,
    magneticRen:  s.magneticRen  || 0,
    offline:      s.offline      || 0
  }));

  // ONLINE
  const online = mapSeries(months, monthlySeries.online || [], s => ({
    instBt: s.instBt || 0,
    instHy: s.instHy || 0,
    instCo: s.instCo || 0,
    instHa: s.instHa || 0,
    renBt:  s.renBt  || 0,
    renHy:  s.renHy  || 0,
    renCo:  s.renCo  || 0,
    renHa:  s.renHa  || 0
  }));

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {/* Speed Governor */}
      <Grid item xs={12}>
        <Section title="Speed Governor (Nebsam / Mock / Sinotrack)" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Nebsam – Installs (Office vs Agent)"
                data={govN}
                bars={[
                  { dataKey: 'officeInst', name: 'Office Installs' },
                  { dataKey: 'agentInst',  name: 'Agent Installs' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Nebsam – Renewals (Office vs Agent)"
                data={govN}
                bars={[
                  { dataKey: 'officeRen', name: 'Office Renewals' },
                  { dataKey: 'agentRen',  name: 'Agent Renewals' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Nebsam – Offline & Checkups"
                data={govN}
                bars={[
                  { dataKey: 'offline',  name: 'Offline' },
                  { dataKey: 'checkups', name: 'Checkups' }
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Mock Mombasa – Renewals (Office vs Agent)"
                data={govM}
                bars={[
                  { dataKey: 'officeRen', name: 'Office Renewals' },
                  { dataKey: 'agentRen',  name: 'Agent Renewals' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Mock Mombasa – Offline & Checkups"
                data={govM}
                bars={[
                  { dataKey: 'offline',  name: 'Offline' },
                  { dataKey: 'checkups', name: 'Checkups' }
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Sinotrack – Installs (Office vs Agent)"
                data={govS}
                bars={[
                  { dataKey: 'officeInst', name: 'Office Installs' },
                  { dataKey: 'agentInst',  name: 'Agent Installs' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Sinotrack �� Renewals (Office vs Agent)"
                data={govS}
                bars={[
                  { dataKey: 'officeRen', name: 'Office Renewals' },
                  { dataKey: 'agentRen',  name: 'Agent Renewals' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Sinotrack – Offline & Checkups"
                data={govS}
                bars={[
                  { dataKey: 'offline',  name: 'Offline' },
                  { dataKey: 'checkups', name: 'Checkups' }
                ]}
              />
            </Grid>
          </Grid>
        </Section>
      </Grid>

      {/* Fuel Monitoring */}
      <Grid item xs={12}>
        <Section title="Fuel Monitoring" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Fuel – Installs (Office vs Agent)"
                data={fuel}
                bars={[
                  { dataKey: 'officeInst', name: 'Office Installs' },
                  { dataKey: 'agentInst',  name: 'Agent Installs' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Fuel – Renewals (Office)"
                data={fuel}
                bars={[
                  { dataKey: 'officeRen', name: 'Office Renewals' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Fuel – Offline"
                data={fuel}
                bars={[
                  { dataKey: 'offline', name: 'Offline' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Fuel – Checkups"
                data={fuel}
                bars={[
                  { dataKey: 'checkups', name: 'Checkups' }
                ]}
              />
            </Grid>
          </Grid>
        </Section>
      </Grid>

      {/* Radio Calls */}
      <Grid item xs={12}>
        <Section title="Radio Calls" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Radio – Sales (Office vs Agent)"
                data={radio}
                bars={[
                  { dataKey: 'officeSale', name: 'Office Sales' },
                  { dataKey: 'agentSale',  name: 'Agent Sales' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Radio – Renewals (Office)"
                data={radio}
                bars={[
                  { dataKey: 'officeRen', name: 'Office Renewals' }
                ]}
              />
            </Grid>
          </Grid>
        </Section>
      </Grid>

      {/* Video Telematics */}
      <Grid item xs={12}>
        <Section title="Video Telematics" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Video Telematics – Installs (Office vs Agent)"
                data={vtel}
                bars={[
                  { dataKey: 'officeInst', name: 'Office Installs' },
                  { dataKey: 'agentInst',  name: 'Agent Installs' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Video Telematics – Renewals (Office)"
                data={vtel}
                bars={[
                  { dataKey: 'officeRen', name: 'Office Renewals' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Video Telematics – Offline"
                data={vtel}
                bars={[
                  { dataKey: 'offline', name: 'Offline' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Video Telematics – Checkups"
                data={vtel}
                bars={[
                  { dataKey: 'checkups', name: 'Checkups' }
                ]}
              />
            </Grid>
          </Grid>
        </Section>
      </Grid>

      {/* Tracking */}
      <Grid item xs={12}>
        <Section title="Tracking" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Tracking – Installs by Tracker Type"
                data={track}
                bars={[
                  { dataKey: 'tracker1Inst', name: 'Tracker 1 Installs' },
                  { dataKey: 'tracker2Inst', name: 'Tracker 2 Installs' },
                  { dataKey: 'magneticInst', name: 'Magnetic Installs' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Tracking – Renewals by Tracker Type"
                data={track}
                bars={[
                  { dataKey: 'tracker1Ren', name: 'Tracker 1 Renewals' },
                  { dataKey: 'tracker2Ren', name: 'Tracker 2 Renewals' },
                  { dataKey: 'magneticRen', name: 'Magnetic Renewals' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Tracking – Offline"
                data={track}
                bars={[
                  { dataKey: 'offline', name: 'Offline' }
                ]}
              />
            </Grid>
          </Grid>
        </Section>
      </Grid>

      {/* Online */}
      <Grid item xs={12}>
        <Section title="Online (Product Mix)" defaultExpanded>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Online – Installs by Product"
                data={online}
                bars={[
                  { dataKey: 'instBt', name: 'Bluetooth Installs' },
                  { dataKey: 'instHy', name: 'Hybrid Installs' },
                  { dataKey: 'instCo', name: 'Comprehensive Installs' },
                  { dataKey: 'instHa', name: 'Hybrid Alarm Installs' }
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartBlock
                title="Online – Renewals by Product"
                data={online}
                bars={[
                  { dataKey: 'renBt', name: 'Bluetooth Renewals' },
                  { dataKey: 'renHy', name: 'Hybrid Renewals' },
                  { dataKey: 'renCo', name: 'Comprehensive Renewals' },
                  { dataKey: 'renHa', name: 'Hybrid Alarm Renewals' }
                ]}
              />
            </Grid>
          </Grid>
        </Section>
      </Grid>
    </Grid>
  );
};

export default BossMonthlyOverviewV2;