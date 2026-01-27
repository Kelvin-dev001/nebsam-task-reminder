import React, { useMemo, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const defaultMetricsByCode = {
  TRACK: {
    offlineVehicles: 0,

    tracker1Install: 0,
    tracker1Renewal: 0,
    tracker2Install: 0,
    tracker2Renewal: 0,
    magneticInstall: 0,
    magneticRenewal: 0,

    // transferred from ONLINE
    btInstall: 0,
    btRenewal: 0,
    hybridInstall: 0,
    hybridRenewal: 0,
    compInstall: 0,
    compRenewal: 0,

    expired: 0,
    inactive: 0,
  },
  GOV: {
    nebsam: {
      officeInstall: 0,
      agentInstall: 0,
      officeRenewal: 0,
      agentRenewal: 0,
      offline: 0,
      checkups: 0,
    },
    mockMombasa: {
      officeRenewal: 0,
      agentRenewal: 0,
      offline: 0,
      checkups: 0,
    },
    sinotrack: {
      officeInstall: 0,
      agentInstall: 0,
      officeRenewal: 0,
      agentRenewal: 0,
      offline: 0,
      checkups: 0,
    },
  },
  RADIO: {
    officeSale: 0,
    agentSale: 0,
    officeRenewal: 0,
  },
  FUEL: {
    officeInstall: 0,
    agentInstall: 0,
    officeRenewal: 0,
    offline: 0,
    checkups: 0,
  },
  VTEL: {
    officeInstall: 0,
    agentInstall: 0,
    officeRenewal: 0,
    offline: 0,
    checkups: 0,
  },
  CARLRM: {
    hybridAlarmInstall: 0,
    hybridAlarmRenewal: 0,
  },
};

const GLOBAL_SHOWROOM_VALUE = 'GLOBAL';

const ReportForm = ({ departments = [], showrooms = [], onSubmit }) => {
  const [reportDate, setReportDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [showroomId, setShowroomId] = useState('');
  const [notes, setNotes] = useState('');
  const [metrics, setMetrics] = useState({});

  const selectedDept = useMemo(
    () => departments.find((d) => d._id === departmentId),
    [departments, departmentId]
  );
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
      const key = segments[i];
      if (typeof ref[key] !== 'object' || ref[key] === null) {
        ref[key] = {};
      }
      ref = ref[key];
    }
    ref[segments[segments.length - 1]] = Number(value) || 0;
    setMetrics({ ...m });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reportDate || !departmentId) return;

    // For TRACK: allow global showroom (null) when selected
    const resolvedShowroom =
      deptCode === 'TRACK' && showroomId === GLOBAL_SHOWROOM_VALUE
        ? null
        : deptCode === 'TRACK'
        ? showroomId
        : null;

    const payload = {
      reportDate,
      departmentId,
      showroomId: resolvedShowroom,
      metrics: ensureMetrics(),
      notes,
    };
    onSubmit && onSubmit(payload);
  };

  const renderGovGroup = (label, basePath, fields) => {
    const current = ensureMetrics() || {};
    const groupObj = current[basePath] || {};
    return (
      <Accordion disableGutters defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1.5} sx={{ mb: 0.5 }}>
            {fields.map((f) => (
              <Grid item xs={6} sm={4} key={`${basePath}.${f}`}>
                <TextField
                  label={f}
                  type="number"
                  value={groupObj[f] ?? 0}
                  onChange={(e) => setMetric(`${basePath}.${f}`, e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderOfficeAgent = () => {
    const current = ensureMetrics() || {};
    const fields = ['officeInstall', 'agentInstall', 'officeRenewal', 'offline', 'checkups'];
    return (
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        {fields.map((f) => (
          <Grid item xs={6} sm={4} key={f}>
            <TextField
              label={f}
              type="number"
              value={current[f] ?? 0}
              onChange={(e) => setMetric(f, e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTracking = () => {
    const current = ensureMetrics() || {};
    const gadgets = [
      {
        label: 'Tracker 1',
        installKey: 'tracker1Install',
        renewalKey: 'tracker1Renewal',
      },
      {
        label: 'Tracker 2',
        installKey: 'tracker2Install',
        renewalKey: 'tracker2Renewal',
      },
      {
        label: 'Magnetic',
        installKey: 'magneticInstall',
        renewalKey: 'magneticRenewal',
      },
      {
        label: 'Bluetooth Tracker',
        installKey: 'btInstall',
        renewalKey: 'btRenewal',
      },
      {
        label: 'Hybrid Tracker',
        installKey: 'hybridInstall',
        renewalKey: 'hybridRenewal',
      },
      {
        label: 'Comprehensive Tracker',
        installKey: 'compInstall',
        renewalKey: 'compRenewal',
      },
    ];

    return (
      <Stack spacing={2}>
        {/* Gadget installs/renewals */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Gadget Installs & Renewals
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Gadget
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Installs
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Renewals
              </Typography>
            </Grid>
            {gadgets.map((g) => (
              <React.Fragment key={g.label}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {g.label}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    type="number"
                    label="Installs"
                    value={current[g.installKey] ?? 0}
                    onChange={(e) => setMetric(g.installKey, e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    type="number"
                    label="Renewals"
                    value={current[g.renewalKey] ?? 0}
                    onChange={(e) => setMetric(g.renewalKey, e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Box>

        {/* Totals / status section */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 1 }}>
            Status Totals
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Offline Vehicles"
                type="number"
                value={current.offlineVehicles ?? 0}
                onChange={(e) => setMetric('offlineVehicles', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Expired"
                type="number"
                value={current.expired ?? 0}
                onChange={(e) => setMetric('expired', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Inactive"
                type="number"
                value={current.inactive ?? 0}
                onChange={(e) => setMetric('inactive', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
      </Stack>
    );
  };

  const renderDeptFields = () => {
    const current = ensureMetrics();
    switch (deptCode) {
      case 'TRACK':
        return renderTracking();
      case 'GOV':
        return (
          <Stack spacing={1.5}>
            {renderGovGroup('Nebsam Governor', 'nebsam', [
              'officeInstall',
              'agentInstall',
              'officeRenewal',
              'agentRenewal',
              'offline',
              'checkups',
            ])}
            {renderGovGroup('Mock Mombasa', 'mockMombasa', [
              'officeRenewal',
              'agentRenewal',
              'offline',
              'checkups',
            ])}
            {renderGovGroup('Sinotrack', 'sinotrack', [
              'officeInstall',
              'agentInstall',
              'officeRenewal',
              'agentRenewal',
              'offline',
              'checkups',
            ])}
          </Stack>
        );
      case 'RADIO':
        return (
          <Grid container spacing={1.5}>
            {['officeSale', 'agentSale', 'officeRenewal'].map((f) => (
              <Grid item xs={6} sm={4} key={f}>
                <TextField
                  label={f}
                  type="number"
                  value={current[f] ?? 0}
                  onChange={(e) => setMetric(f, e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        );
      case 'FUEL':
      case 'VTEL':
        return renderOfficeAgent();
      case 'CARLRM':
        return (
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={6} sm={6}>
              <TextField
                label="Hybrid Alarm Installs"
                type="number"
                value={current.hybridAlarmInstall ?? 0}
                onChange={(e) => setMetric('hybridAlarmInstall', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField
                label="Hybrid Alarm Renewals"
                type="number"
                value={current.hybridAlarmRenewal ?? 0}
                onChange={(e) => setMetric('hybridAlarmRenewal', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        );
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Select a department to enter metrics.
          </Typography>
        );
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Report Date"
          type="date"
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />
        <FormControl fullWidth required>
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentId}
            label="Department"
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setMetrics({});
              setShowroomId('');
            }}
          >
            <MenuItem value="">Select</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d._id} value={d._id}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {deptCode === 'TRACK' && (
          <FormControl fullWidth>
            <InputLabel>Showroom</InputLabel>
            <Select
              value={showroomId}
              label="Showroom"
              onChange={(e) => setShowroomId(e.target.value)}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value={GLOBAL_SHOWROOM_VALUE}>Global (All Showrooms)</MenuItem>
              {showrooms.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Metrics {deptCode ? `– ${deptCode}` : ''}
      </Typography>
      {renderDeptFields()}

      <Divider sx={{ my: 1 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Notes
      </Typography>
      <TextField
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        multiline
        rows={3}
        fullWidth
      />

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
        <Button type="submit" variant="contained">
          Submit / Update Report
        </Button>
      </Box>
    </Box>
  );
};

export default ReportForm;