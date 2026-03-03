import { createTheme } from "@mui/material/styles";

const ceoTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f6b800" },
    background: {
      default: "#0a1929",
      paper: "#0d2137",
    },
    text: {
      primary: "#e3f2fd",
      secondary: "#90a4ae",
    },
    success: { main: "#66bb6a" },
    error: { main: "#ef5350" },
    warning: { main: "#ffa726" },
    divider: "rgba(144,202,249,0.12)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 12,
        },
      },
    },
  },
});

export default ceoTheme;