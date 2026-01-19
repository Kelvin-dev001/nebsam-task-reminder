import React from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import ShowroomAutocomplete from './ShowroomAutocomplete';

const Filters = ({ filters, onChange, departments = [], showrooms = [] }) => {
  const handleChange = (field, value) => onChange({ ...filters, [field]: value });

  const selectedDept = departments.find((d) => d._id === filters.departmentId);
  const isTracking = selectedDept?.code === 'TRACK';

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
      <TextField
        label="Start Date"
        type="date"
        value={filters.startDate || ''}
        onChange={(e) => handleChange('startDate', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="End Date"
        type="date"
        value={filters.endDate || ''}
        onChange={(e) => handleChange('endDate', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel>Department</InputLabel>
        <Select
          value={filters.departmentId || ''}
          label="Department"
          onChange={(e) => handleChange('departmentId', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d._id} value={d._id}>
              {d.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {isTracking && (
        <ShowroomAutocomplete
          label="Showroom"
          showrooms={showrooms}
          value={filters.showroomId || ''}
          onChange={(val) => handleChange('showroomId', val)}
          allowAll
        />
      )}
    </Stack>
  );
};

export default Filters;