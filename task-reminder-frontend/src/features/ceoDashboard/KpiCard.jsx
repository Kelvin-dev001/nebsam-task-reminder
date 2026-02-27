import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Tooltip } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const getColor = (value) => {
  if (typeof value !== "number") return "";
  return value > 0 ? "success.main" : value < 0 ? "error.main" : "grey.700";
};

const getArrow = (value) => {
  if (typeof value !== "number") return null;
  return value > 0 ? <ArrowUpwardIcon color="success" fontSize="small" /> :
         value < 0 ? <ArrowDownwardIcon color="error" fontSize="small" /> :
         null;
};

const KpiCard = ({
  title, value, subtitle, percent, showPercent, onClick, color
}) => (
  <Card
    variant="outlined"
    sx={{
      minWidth: 180,
      height: "100%",
      cursor: onClick ? "pointer" : "default",
      borderLeft: color ? `4px solid ${color}` : undefined,
      boxShadow: onClick ? 3 : 1,
      transition: "box-shadow 0.2s"
    }}
    onClick={onClick}
  >
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5, mb: 0.5 }}>
        <Typography variant="h5" component="div" fontWeight={700}>
          {value}
        </Typography>
        {showPercent && typeof percent === "number" && (
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            {getArrow(percent)}
            <Typography
              variant="body2"
              color={getColor(percent)}
              fontWeight={600}
              sx={{ ml: 0.2 }}
            >
              {Math.abs(percent).toFixed(1)}%
            </Typography>
          </Box>
        )}
      </Box>
      {subtitle && <Typography color="text.secondary" variant="body2">{subtitle}</Typography>}
    </CardContent>
  </Card>
);

export default KpiCard;