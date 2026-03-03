import React, { useContext } from "react";
import {
  Drawer, Box, Typography, List, ListItemButton, ListItemIcon,
  ListItemText, Divider, Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const DRAWER_WIDTH = 260;

const CeoSidebar = ({ onExportPdf }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/ceo-login");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: "#071525",
          color: "#e3f2fd",
          borderRight: "1px solid rgba(144,202,249,0.08)",
        },
      }}
    >
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <img src={logo} alt="Logo" style={{ width: 42, height: 42, borderRadius: 10 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={800} color="primary.main">
            NEBSAM
          </Typography>
          <Typography variant="caption" color="text.secondary">
            CEO Portal
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(144,202,249,0.08)" }} />

      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontWeight: 700 }}>
          {user?.name?.[0]?.toUpperCase() || "C"}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>{user?.name || "CEO"}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email || ""}</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(144,202,249,0.08)" }} />

      <List sx={{ flex: 1, pt: 1 }}>
        <ListItemButton selected sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
          <ListItemIcon><DashboardIcon sx={{ color: "primary.main" }} /></ListItemIcon>
          <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>

        <ListItemButton onClick={onExportPdf} sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
          <ListItemIcon><PictureAsPdfIcon sx={{ color: "#ef5350" }} /></ListItemIcon>
          <ListItemText primary="Export PDF Report" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
      </List>

      <Divider sx={{ borderColor: "rgba(144,202,249,0.08)" }} />

      <Box sx={{ p: 1 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon><LogoutIcon sx={{ color: "#ef5350" }} /></ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 600, color: "#ef5350" }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default CeoSidebar;
export { DRAWER_WIDTH };