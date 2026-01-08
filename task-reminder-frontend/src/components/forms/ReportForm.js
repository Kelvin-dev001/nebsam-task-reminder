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
    mockMombasaInstall: 0,
    mockMombasaRenewal: 0,
    nebsamInstall: 0,
    nebsamRenewal: 0
  },
  RADIO: { unitSales: 0, renewals: 0 },
  FUEL: { installations: 0, renewals: 0 },
  VTEL: { installations: 0, renewals: 0 },
  ONLINE: {
    dailyMessages: 0,
    dailyCalls: 0,
    dailySalesClosed: 0,
    installationsByGadget: {},
    renewalsByGadget: {}
  }
};

const parseMapInput = (str) => {
  if (!str) return {};
  return str.split(',').reduce((acc, pair) => {
    const [k, v] = pair.split(':').map(s => s.trim());
    if (k) acc[k] = Number(v) || 0;
    return acc;
  }, {});
};

const ReportForm = ({ departments = [], showrooms = [], onSubmit }) => {
  const [reportDate, setReportDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [showroomId, setShowroomId] = useState('');
  const [notes, setNotes] = useState('');
  const [revenue, setRevenue] = useState({ currency: 'KES', amount: 0 });
  const [metrics, setMetrics] = useState({});
  const [installMap, setInstallMap] = useState('');
  const [renewMap, setRenewMap] = useState('');

  const selectedDept = useMemo(() => departments.find(d => d._id === departmentId), [departments, departmentId]);
  const deptCode = selectedDept?.code;

  const ensureMetrics = () => {
    if (!deptCode) return {};
    return metrics && Object.keys(metrics).length ? metrics : { ...defaultMetricsByCode[deptCode] };
  };

  const handleMetricChange = (field, value) => {
    setMetrics({ ...ensureMetrics(), [field]: Number(value) || 0 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reportDate || !departmentId) return;

    const payload = {
      reportDate,
      departmentId,
      showroomId: deptCode === 'TRACK' ? showroomId : null,
      metrics: ensureMetrics(),
      notes,
      revenue
    };

    if (deptCode === 'ONLINE') {
      payload.metrics = {
        ...payload.metrics,
        installationsByGadget: parseMapInput(installMap),
        renewalsByGadget: parseMapInput(renewMap)
      };
    }

    onSubmit && onSubmit(payload);
  };

  const renderDeptFields = () => {
    switch (deptCode) {
      case 'TRACK':
        return (
          <>
            {['offlineVehicles', 'tracker1Install', 'tracker1Renewal', 'tracker2Install', 'tracker2Renewal', 'magneticInstall', 'magneticRenewal']
              .map(field => (
                <TextField
                  key={field}
                  label={field}
                  type="number"
                  value={ensureMetrics()[field] ?? 0}
                  onChange={e => handleMetricChange(field, e.target.value)}
                  fullWidth
                />
              ))}
          </>
        );
      case 'GOV':
        return ['mockMombasaInstall', 'mockMombasaRenewal', 'nebsamInstall', 'nebsamRenewal'].map(field => (
          <TextField
            key={field}
            label={field}
            type="number"
            value={ensureMetrics()[field] ?? 0}
            onChange={e => handleMetricChange(field, e.target.value)}
            fullWidth
          />
        ));
      case 'RADIO':
        return ['unitSales', 'renewals'].map(field => (
          <TextField
            key={field}
            label={field}
            type="number"
            value={ensureMetrics()[field] ?? 0}
            onChange={e => handleMetricChange(field, e.target.value)}
            fullWidth
          />
        ));
      case 'FUEL':
      case 'VTEL':
        return ['installations', 'renewals'].map(field => (
          <TextField
            key={field}
            label={field}
            type="number"
            value={ensureMetrics()[field] ?? 0}
            onChange={e => handleMetricChange(field, e.target.value)}
            fullWidth
          />
        ));
      case 'ONLINE':
        return (
          <>
            {['dailyMessages', 'dailyCalls', 'dailySalesClosed'].map(field => (
              <TextField
                key={field}
                label={field}
                type="number"
                value={ensureMetrics()[field] ?? 0}
                onChange={e => handleMetricChange(field, e.target.value)}
                fullWidth
              />
            ))}
            <TextField
              label='Installations by gadget (e.g., "cam:3, router:1")'
              value={installMap}
              onChange={e => setInstallMap(e.target.value)}
              fullWidth
            />
            <TextField
              label='Renewals by gadget (e.g., "cam:1, router:2")'
              value={renewMap}
              onChange={e => setRenewMap(e.target.value)}
              fullWidth
            />
          </>
        );
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack spacing={2}>{renderDeptFields()}</Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notes & Revenue (optional)</Typography>
      <TextField
        label="Notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        multiline
        rows={3}
        fullWidth
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Revenue Amount"
          type="number"
          value={revenue.amount}
          onChange={e => setRevenue({ ...revenue, amount: Number(e.target.value) || 0 })}
        />
        <TextField
          label="Currency"
          value={revenue.currency}
          onChange={e => setRevenue({ ...revenue, currency: e.target.value || 'KES' })}
        />
      </Stack>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
        <Button type="submit" variant="contained">Submit / Update Report</Button>
      </Box>
    </Box>
  );
};

export default ReportForm;