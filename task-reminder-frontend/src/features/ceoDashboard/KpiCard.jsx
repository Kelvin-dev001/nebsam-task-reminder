import React from "react";
import { Card, CardContent, Typography, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

const KpiCard = ({ title, value, percent, showPercent, icon, subtitle, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getArrow = (val) => {
    const size = isMobile ? 16 : 20;
    if (typeof val !== "number") return <TrendingFlatIcon sx={{ color: "grey.500", fontSize: size }} />;
    if (val > 0) return <TrendingUpIcon sx={{ color: "success.main", fontSize: size }} />;
    if (val < 0) return <TrendingDownIcon sx={{ color: "error.main", fontSize: size }} />;
    return <TrendingFlatIcon sx={{ color: "grey.500", fontSize: size }} />;
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
        "&:hover": onClick ? { transform: "translateY(-2px)", boxShadow: 6 } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, "&:last-child": { pb: { xs: 1.5, sm: 2, md: 2.5 } } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              letterSpacing: 0.8,
              fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.75rem" },
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
          {icon && !isMobile && <Box sx={{ color: "primary.main", opacity: 0.7 }}>{icon}</Box>}
        </Box>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
          <Typography
            variant={isMobile ? "h6" : "h4"}
            fontWeight={800}
            color="text.primary"
            sx={{ lineHeight: 1.2 }}
          >
            {value}
          </Typography>
          {showPercent && typeof percent === "number" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
              {getArrow(percent)}
              <Typography
                variant="caption"
                fontWeight={700}
                color={getColor(percent)}
                sx={{ fontSize: { xs: "0.65rem", md: "0.8rem" } }}
              >
                {Math.abs(percent).toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Box>
        {subtitle && (
          <Typography color="text.secondary" variant="caption" sx={{ fontSize: { xs: "0.6rem", md: "0.75rem" } }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;