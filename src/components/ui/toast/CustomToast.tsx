import React from "react";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ErrorIcon from "@mui/icons-material/Error";
import CircularProgress from "@mui/material/CircularProgress";

import { useToast } from "../toast/ToastContext";
import { CheckCircle } from "lucide-react";

const CustomToast: React.FC = () => {
  const { toast, clearToast } = useToast();

  if (!toast) return null;

  let icon = null;

  switch (toast.type) {
    case "loading":
      icon = <CircularProgress size={20} color="inherit" />;
      break;
    case "success":
      icon = <CheckCircle width={22} style={{ color: "#22C55E" }} />;
      break;
    case "error":
      icon = <ErrorIcon sx={{ fontSize: 20 }} />;
      break;
    default:
      icon = null;
      break;
  }

  return (
    <Snackbar
      open={!!toast}
      autoHideDuration={toast.type !== "loading" ? 3000 : null}
      onClose={clearToast}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={clearToast}
        severity={
          toast.type === "error"
            ? "error"
            : toast.type === "success"
            ? "success"
            : "info"
        }
        icon={icon}
        variant="filled"
        sx={{
          width: "100%",
          maxWidth: { xs: "92%", sm: "560px" },
          backgroundColor: "#fff",
          color:
            toast.type === "success"
              ? "green"
              : toast.type === "error"
              ? "red"
              : "gray",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "none",
          display: "flex",
          alignItems: "center",
          mx: "auto",
          "& .MuiAlert-icon": {
            backgroundColor: "#eee",
            color:
              toast.type === "success"
                ? "#22C55E"
                : toast.type === "error"
                ? "red"
                : "gray",
            padding: "4px",
            marginRight: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "25%",
            width: "28px",
            height: "28px",
          },
          "& .MuiAlert-action": {
            marginRight: 0,
            alignItems: "center",
            "& .MuiIconButton-root": {
              width: "20px",
              height: "20px",
              padding: "2px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "50%",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
              svg: {
                fontSize: "16px",
              },
            },
          },
          "& .MuiAlert-message": {
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: "220px",
            overflowY: "auto",
            fontFamily:
              toast.type === "error"
                ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
                : "inherit",
            fontSize: toast.type === "error" ? "12px" : "14px",
          },
        }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

export default CustomToast;
