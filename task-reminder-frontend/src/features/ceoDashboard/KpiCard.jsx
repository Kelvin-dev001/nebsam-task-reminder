import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

const KpiCard = ({ title, value, percent, showPercent, icon, onClick }) => {
  const getArrow = (val) => {
    if (typeof val !== "number") return <TrendingFlatIcon sx={{ color: "grey.500", fontSize: 20 }} />;
    if (val > 0) return <TrendingUpIcon sx={{ color: "success.main", fontSize: 20 }} />;
    if (val < 0) return <TrendingDownIcon sx={{ color: "error.main", fontSize: 20 }} />;
    return <TrendingFlatIcon sx={{ color: "grey.500", fontSize: 20 }} />;
  };

  const getColor = (val) => {
    if (typeof val !== "number") return "text.secondary";
    return val > 0 ? "success.main" : val < 0 ? "error.main" : "text.secondary";
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        borderColor: "divider",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": onClick
          ? { transform: "translateY(-2px)", boxShadow: 6 }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600, letterSpacing: 1 }}>
            {title}
          </Typography>
          {icon && <Box sx={{ color: "primary.main", opacity: 0.7 }}>{icon}</Box>}
        </Box>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            {value}
          </Typography>
          {showPercent && typeof percent === "number" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              {getArrow(percent)}
              <Typography variant="body2" fontWeight={700} color={getColor(percent)}>
                {Math.abs(percent).toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;