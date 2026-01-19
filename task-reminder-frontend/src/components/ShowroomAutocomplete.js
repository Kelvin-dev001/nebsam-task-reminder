import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

/**
 * ShowroomAutocomplete
 * - Supports "All" option (value: empty string)
 * - Searchable by showroom name
 */
const ShowroomAutocomplete = ({
  label = 'Showroom',
  showrooms = [],
  value,
  onChange,
  allowAll = true,
}) => {
  const options = allowAll
    ? [{ _id: '', name: 'All Showrooms' }, ...showrooms]
    : showrooms;

  const selected = options.find((o) => o._id === value) || (allowAll ? options[0] : null);

  return (
    <Autocomplete
      size="small"
      options={options}
      getOptionLabel={(option) => option.name || ''}
      value={selected}
      onChange={(_, newValue) => {
        if (!newValue) {
          onChange && onChange(allowAll ? '' : '');
        } else {
          onChange && onChange(newValue._id || '');
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Type to search showrooms"
          variant="outlined"
        />
      )}
      isOptionEqualToValue={(opt, val) => opt._id === val._id}
    />
  );
};

export default ShowroomAutocomplete;