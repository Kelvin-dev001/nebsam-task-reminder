import React, { useMemo } from "react";
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Generates a list of available months from the earliest report date
 * up to the current month.
 * Format: { label: "March 2026", value: "2026-03" }
 */
function generateMonthOptions(startYear = 2024) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const options = [];

  for (let y = currentYear; y >= startYear; y--) {
    const endMonth = y === currentYear ? currentMonth : 11;
    const startMonth = y === startYear ? 0 : 0;
    for (let m = endMonth; m >= startMonth; m--) {
      options.push({
        label: `${MONTH_NAMES[m]} ${y}`,
        value: `${y}-${String(m + 1).padStart(2, "0")}`,
        year: y,
        month: m,
      });
    }
  }
  return options;
}

const MonthYearPicker = ({ value, onChange, label = "Select Month", startYear = 2024 }) => {
  const options = useMemo(() => generateMonthOptions(startYear), [startYear]);

  return (
    <FormControl size="small" sx={{ minWidth: { xs: 160, md: 200 } }}>
      <InputLabel sx={{ color: "text.secondary" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CalendarMonthIcon sx={{ fontSize: 16 }} />
          {label}
        </Box>
      </InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        sx={{ color: "text.primary" }}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 300,
              bgcolor: "background.paper",
            },
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            <Typography variant="body2" fontWeight={500}>
              {opt.label}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MonthYearPicker;