import React from "react";
import { Box } from "@mui/material";
import Lottie from "lottie-react";
import loaderAnimation from "../assets/loader.json";
import logo from "../assets/logo.png";

const Loader = () => (
  <Box
    sx={{
      minHeight: "100vh",
      bgcolor: "#e3ecfa",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <Box sx={{ mb: 3 }}>
      <img
        src={logo}
        alt="NEBSAM Digital Solutions"
        style={{ width: 90, height: 90, borderRadius: 20 }}
      />
    </Box>
    <Lottie animationData={loaderAnimation} style={{ width: 120, height: 120 }} />
  </Box>
);

export default Loader;