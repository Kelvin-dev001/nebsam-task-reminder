import React, { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Button, TextField, Grid, Box, Typography, Snackbar,
  Paper, Alert, InputAdornment, IconButton,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../../assets/logo.png";

// Light theme for login page so text is clearly visible
const loginTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0a1929" },
    secondary: { main: "#f6b800" },
    background: {
      default: "#0a1929",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
  },
  shape: { borderRadius: 12 },
});

const CeoLoginPage = () => {
  const { ceoLogin } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCeologin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnack({ open: false, message: "", severity: "success" });
    try {
      await ceoLogin(form.email, form.password);
      setSnack({ open: true, message: "Welcome, CEO! 👑", severity: "success" });
      setTimeout(() => navigate("/ceo"), 800);
    } catch (err) {
      setSnack({
        open: true,
        message: err?.response?.data?.error || err.message || "Login failed!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Common input style to ensure black text
  const inputSx = {
    "& .MuiInputBase-input": { color: "#000000" },
    "& .MuiInputLabel-root": { color: "#555555" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#cccccc" },
      "&:hover fieldset": { borderColor: "#0a1929" },
      "&.Mui-focused fieldset": { borderColor: "#0a1929" },
    },
  };

  return (
    <ThemeProvider theme={loginTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#0a1929",
          p: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 420,
            borderRadius: 3,
            bgcolor: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box sx={{ mb: 2 }}>
              <img src={logo} alt="Logo" style={{ width: 90, height: 90, borderRadius: 20 }} />
            </Box>
            <Typography
              component="h1"
              variant="h5"
              sx={{ fontWeight: 700, color: "#0a1929", mb: 0.5 }}
            >
              CEO Portal Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: "#666666", mb: 3, fontWeight: 500 }}>
              Executive access only
            </Typography>

            <Box component="form" noValidate onSubmit={handleCeologin} sx={{ width: "100%" }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleInputChange}
                    type="email"
                    inputProps={{ maxLength: 50 }}
                    autoFocus
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleInputChange}
                    inputProps={{ minLength: 6, maxLength: 30 }}
                    sx={inputSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            size="small"
                            sx={{ color: "#555555" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: "1.1em",
                  bgcolor: "#0a1929",
                  "&:hover": { bgcolor: "#132f4c" },
                }}
                disabled={loading}
                endIcon={<LockOpenIcon />}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnack({ ...snack, open: false })}
            severity={snack.severity}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default CeoLoginPage;