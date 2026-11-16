import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from "../components/ui/toast/ToastContext";
import {
  adminSocketService,
  type AdminSocketEvent,
  type AdminSocketState,
} from "../services/adminSocket.service";
import type { RootState } from "../store/redux/store";

type AdminSocketHandlers = Partial<
  Record<AdminSocketEvent, (...args: unknown[]) => void>
>;

export function useAdminSocket(handlers: AdminSocketHandlers = {}) {
  const token = useSelector((state: RootState) => state.auth.token);
  const { showToast } = useToast();
  const [status, setStatus] = useState<AdminSocketState>("disconnected");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      adminSocketService.disconnect();
      setStatus("disconnected");
      setError(null);
      return;
    }

    let socket;

    try {
      setStatus("connecting");
      socket = adminSocketService.connect(token);
    } catch (connectError) {
      const message =
        connectError instanceof Error
          ? connectError.message
          : "Unable to connect admin socket.";
      setStatus("error");
      setError(message);
      showToast(message, "error");
      return;
    }

    const handleConnect = (...args: unknown[]) => {
      setStatus("connected");
      setError(null);
      handlers.connect?.(...args);
    };

    const handleDisconnect = (...args: unknown[]) => {
      setStatus("disconnected");
      handlers.disconnect?.(...args);
    };

    const handleConnectError = (connectError: unknown) => {
      const message =
        connectError instanceof Error
          ? connectError.message
          : "Admin socket authentication failed.";
      setStatus("error");
      setError(message);
      showToast(message, "error");
      handlers.connect_error?.(connectError);
    };

    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
    socket.off("connect_error", handleConnectError);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      adminSocketService.disconnect();
    };
  }, [handlers, showToast, token]);

  useEffect(() => {
    const socket = adminSocketService.getSocket();
    if (!socket) return;

    const registeredEvents = Object.entries(handlers).filter(
      ([event]) =>
        event !== "connect" &&
        event !== "disconnect" &&
        event !== "connect_error"
    ) as [AdminSocketEvent, (...args: unknown[]) => void][];

    registeredEvents.forEach(([event, listener]) => {
      adminSocketService.on(event, listener);
    });

    return () => {
      registeredEvents.forEach(([event, listener]) => {
        adminSocketService.off(event, listener);
      });
    };
  }, [handlers, status]);

  const joinDashboard = useCallback(
    () => adminSocketService.joinDashboard(),
    []
  );
  const leaveDashboard = useCallback(
    () => adminSocketService.leaveDashboard(),
    []
  );
  const requestDashboardStats = useCallback(
    () => adminSocketService.requestDashboardStats(),
    []
  );
  const broadcastNotification = useCallback(
    (payload: {
      title: string;
      message: string;
      type?: string;
      targetRole?: string;
    }) => adminSocketService.broadcastNotification(payload),
    []
  );

  return useMemo(
    () => ({
      status,
      connected: status === "connected",
      connecting: status === "connecting",
      disconnected: status === "disconnected",
      error,
      joinDashboard,
      leaveDashboard,
      requestDashboardStats,
      broadcastNotification,
    }),
    [
      broadcastNotification,
      error,
      joinDashboard,
      leaveDashboard,
      requestDashboardStats,
      status,
    ]
  );
}
