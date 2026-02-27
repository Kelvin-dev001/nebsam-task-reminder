import React from "react";
import { Dialog, DialogTitle, DialogContent, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const KpiDrilldownModal = ({ open, onClose, title, children }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span>{title}</span>
      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <Box>{children}</Box>
    </DialogContent>
  </Dialog>
);

export default KpiDrilldownModal;