import React, { useContext, useState } from "react";
import {
  Drawer, Box, Typography, List, ListItemButton, ListItemIcon,
  ListItemText, Divider, Avatar, IconButton, useMediaQuery, AppBar, Toolbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const DRAWER_WIDTH = 260;

const DrawerContent = ({ user, onExportPdf, onLogout, onClose }) => (
  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
      <img src={logo} alt="Logo" style={{ width: 42, height: 42, borderRadius: 10 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={800} color="primary.main">NEBSAM</Typography>
        <Typography variant="caption" color="text.secondary">CEO Portal</Typography>
      </Box>
      {onClose && (
        <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      )}
    </Box>

    <Divider sx={{ borderColor: "rgba(144,202,249,0.08)" }} />

    <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
      <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontWeight: 700 }}>
        {user?.name?.[0]?.toUpperCase() || "C"}
      </Avatar>
      <Box sx={{ overflow: "hidden" }}>
        <Typography variant="body2" fontWeight={600} noWrap>{user?.name || "CEO"}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>{user?.email || ""}</Typography>
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
        <ListItemText primary="Export PDF" primaryTypographyProps={{ fontWeight: 600 }} />
      </ListItemButton>
    </List>

    <Divider sx={{ borderColor: "rgba(144,202,249,0.08)" }} />

    <Box sx={{ p: 1 }}>
      <ListItemButton onClick={onLogout} sx={{ borderRadius: 2 }}>
        <ListItemIcon><LogoutIcon sx={{ color: "#ef5350" }} /></ListItemIcon>
        <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 600, color: "#ef5350" }} />
      </ListItemButton>
    </Box>
  </Box>
);

const CeoSidebar = ({ onExportPdf }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/ceo-login");
  };

  const drawerProps = {
    user,
    onExportPdf: () => { onExportPdf(); if (isMobile) setMobileOpen(false); },
    onLogout: handleLogout,
  };

  // Mobile: top app bar + temporary drawer
  if (isMobile) {
    return (
      <>
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "#071525",
            backgroundImage: "none",
            borderBottom: "1px solid rgba(144,202,249,0.08)",
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ minHeight: 56 }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1.5 }}
            >
              <MenuIcon />
            </IconButton>
            <img src={logo} alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, marginRight: 10 }} />
            <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ flex: 1 }}>
              NEBSAM CEO
            </Typography>
            <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32, fontSize: 14, fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() || "C"}
            </Avatar>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              bgcolor: "#071525",
              color: "#e3f2fd",
              borderRight: "1px solid rgba(144,202,249,0.08)",
            },
          }}
        >
          <DrawerContent {...drawerProps} onClose={() => setMobileOpen(false)} />
        </Drawer>
      </>
    );
  }

  // Desktop: permanent drawer
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
      <DrawerContent {...drawerProps} />
    </Drawer>
  );
};

export default CeoSidebar;
export { DRAWER_WIDTH };