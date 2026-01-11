import React, { useMemo, useState } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, Typography, Divider, Stack } from '@mui/material';

const defaultMetricsByCode = {
  TRACK: {
    offlineVehicles: 0,
    tracker1Install: 0,
    tracker1Renewal: 0,
    tracker2Install: 0,
    tracker2Renewal: 0,
    magneticInstall: 0,
    magneticRenewal: 0
  },
  GOV: {
    nebsam: { officeInstall: 0, agentInstall: 0, officeRenewal: 0, agentRenewal: 0, offline: 0, checkups: 0 },
    mockMombasa: { officeInstall: 0, agentInstall: 0, officeRenewal: 0, agentRenewal: 0, offline: 0, checkups: 0 },
    sinotrack: { officeInstall: 0, agentInstall: 0, officeRenewal: 0, agentRenewal: 0, offline: 0, checkups: 0 }
  },
  RADIO: {
    officeSale: 0,
    agentSale: 0,
    officeRenewal: 0,
    agentRenewal: 0
  },
  FUEL: {
    officeInstall: 0, agentInstall: 0,
    officeRenewal: 0, agentRenewal: 0,
    offline: 0, checkups: 0
  },
  VTEL: {
    officeInstall: 0, agentInstall: 0,
    officeRenewal: 0, agentRenewal: 0,
    offline: 0, checkups: 0
  },
  ONLINE: {
    installs: { bluetooth: 0, hybrid: 0, comprehensive: 0, hybridAlarm: 0 },
    renewals: { bluetooth: 0, hybrid: 0, comprehensive: 0, hybridAlarm: 0 }
  }
};

const ReportForm = ({ departments = [], showrooms = [], onSubmit }) => {
  const [reportDate, setReportDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [showroomId, setShowroomId] = useState('');
  const [notes, setNotes] = useState('');
  const [metrics, setMetrics] = useState({});

  const selectedDept = useMemo(() => departments.find(d => d._id === departmentId), [departments, departmentId]);
  const deptCode = selectedDept?.code;

  const ensureMetrics = () => {
    if (!deptCode) return {};
    if (metrics && Object.keys(metrics).length) return metrics;
    return JSON.parse(JSON.stringify(defaultMetricsByCode[deptCode] || {}));
  };

  const setMetric = (path, value) => {
    const m = ensureMetrics();
    const segments = path.split('.');
    let ref = m;
    for (let i = 0; i < segments.length - 1; i++) {
      if (!ref[segments[i]]) ref[segments[i]] = {};
      ref = ref[segments[i]];
    }
    ref[segments[segments.length - 1]] = Number(value) || 0;
    setMetrics(m);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reportDate || !departmentId) return;
    const payload = {
      reportDate,
      departmentId,
      showroomId: deptCode === 'TRACK' ? showroomId : null,
      metrics: ensureMetrics(),
      notes
    };
    onSubmit && onSubmit(payload);
  };

  const renderGovGroup = (label, basePath) => (
    <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
      <Grid item xs={12}><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{label}</Typography></Grid>
      {['officeInstall','agentInstall','officeRenewal','agentRenewal','offline','checkups'].map(f => (
        <Grid item xs={6} sm={4} key={`${basePath}.${f}`}>
          <TextField
            label={f}
            type="number"
            value={ensureMetrics()?.[basePath.split('.')[0]]?.[f] ?? 0}
            onChange={e => setMetric(`${basePath}.${f}`, e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>
      ))}
    </Grid>
  );

  const renderOfficeAgent = (basePath) => (
    <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
      {['officeInstall','agentInstall','officeRenewal','agentRenewal','offline','checkups'].map(f => (
        <Grid item xs={6} sm={4} key={`${basePath}.${f}`}>
          <TextField
            label={f}
            type="number"
            value={ensureMetrics()?.[f] ?? 0}
            onChange={e => setMetric(`${basePath}.${f}`, e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>
      ))}
    </Grid>
  );

  const renderOnline = () => {
    const fields = [
      { label: 'Installs - Bluetooth', path: 'installs.bluetooth' },
      { label: 'Installs - Hybrid', path: 'installs.hybrid' },
      { label: 'Installs - Comprehensive', path: 'installs.comprehensive' },
      { label: 'Installs - Hybrid Alarm', path: 'installs.hybridAlarm' },
      { label: 'Renewals - Bluetooth', path: 'renewals.bluetooth' },
      { label: 'Renewals - Hybrid', path: 'renewals.hybrid' },
      { label: 'Renewals - Comprehensive', path: 'renewals.comprehensive' },
      { label: 'Renewals - Hybrid Alarm', path: 'renewals.hybridAlarm' },
    ];
    return (
      <Grid container spacing={1.5}>
        {fields.map(f => (
          <Grid item xs={6} sm={3} key={f.path}>
            <TextField
              label={f.label}
              type="number"
              value={ensureMetrics()?.[f.path.split('.')[0]]?.[f.path.split('.')[1]] ?? 0}
              onChange={e => setMetric(f.path, e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderDeptFields = () => {
    switch (deptCode) {
      case 'TRACK':
        return (
          <Grid container spacing={1.5}>
            {['offlineVehicles','tracker1Install','tracker1Renewal','tracker2Install','tracker2Renewal','magneticInstall','magneticRenewal'].map(f => (
              <Grid item xs={6} sm={4} key={f}>
                <TextField
                  label={f}
                  type="number"
                  value={ensureMetrics()?.[f] ?? 0}
                  onChange={e => setMetric(f, e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        );
      case 'GOV':
        return (
          <>
            {renderGovGroup('Nebsam Governor', 'nebsam')}
            {renderGovGroup('Mock Mombasa', 'mockMombasa')}
            {renderGovGroup('Sinotrack', 'sinotrack')}
          </>
        );
      case 'RADIO':
        return (
          <Grid container spacing={1.5}>
            {['officeSale','agentSale','officeRenewal','agentRenewal'].map(f => (
              <Grid item xs={6} sm={3} key={f}>
                <TextField
                  label={f}
                  type="number"
                  value={ensureMetrics()?.[f] ?? 0}
                  onChange={e => setMetric(f, e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        );
      case 'FUEL':
      case 'VTEL':
        return renderOfficeAgent('');
      case 'ONLINE':
        return renderOnline();
      default:
        return <Typography variant="body2" color="text.secondary">Select a department to enter metrics.</Typography>;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Report Date"
          type="date"
          value={reportDate}
          onChange={e => setReportDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />
        <FormControl fullWidth required>
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentId}
            label="Department"
            onChange={e => {
              setDepartmentId(e.target.value);
              setMetrics({});
            }}
          >
            <MenuItem value="">Select</MenuItem>
            {departments.map(d => (
              <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {deptCode === 'TRACK' && (
          <FormControl fullWidth required>
            <InputLabel>Showroom</InputLabel>
            <Select value={showroomId} label="Showroom" onChange={e => setShowroomId(e.target.value)}>
              <MenuItem value="">Select</MenuItem>
              {showrooms.map(s => (
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Metrics</Typography>
      {renderDeptFields()}

      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notes</Typography>
      <TextField
        label="Notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        multiline
        rows={3}
        fullWidth
      />

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
        <Button type="submit" variant="contained">Submit / Update Report</Button>
      </Box>
    </Box>
  );
};

export default ReportForm;