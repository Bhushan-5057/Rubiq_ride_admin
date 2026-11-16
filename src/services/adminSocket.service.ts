import { io, type Socket } from "socket.io-client";

export type AdminSocketState = "connected" | "connecting" | "disconnected" | "error";

export type AdminSocketEvent =
  | "admin:registered"
  | "admin:dashboard_stats"
  | "admin:live_booking_feed"
  | "admin:driver_location"
  | "admin:new_complaint"
  | "admin:payout_notification"
  | "admin:support_chat_monitor"
  | "admin:driver_online"
  | "admin:driver_offline"
  | "admin:driver_status_updated"
  | "admin:driver_approval_updated"
  | "admin:passenger_activity"
  | "admin:broadcast_notification"
  | "admin:sos_alert"
  | "connect"
  | "disconnect"
  | "connect_error";

type AckResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
};

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const ACK_TIMEOUT_MS = 10000;

class AdminSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string): Socket {
    if (!API_BASE_URL) {
      throw new Error("Missing VITE_BASE_URL for admin socket connection.");
    }

    if (this.socket && this.token === token) {
      return this.socket;
    }

    this.disconnect();
    this.token = token;
    this.socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      autoConnect: true,
    });

    return this.socket;
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.token = null;
  }

  getSocket() {
    return this.socket;
  }

  on(event: AdminSocketEvent, listener: (...args: unknown[]) => void) {
    this.socket?.off(event, listener);
    this.socket?.on(event, listener);
  }

  off(event: AdminSocketEvent, listener: (...args: unknown[]) => void) {
    this.socket?.off(event, listener);
  }

  emitWithAck<T = unknown>(
    event: string,
    payload?: unknown
  ): Promise<AckResponse<T>> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Admin socket is not connected."));
        return;
      }

      const ackHandler = (error: Error | null, response: AckResponse<T>) => {
          if (error) {
            reject(error);
            return;
          }

          if (response?.success === false) {
            reject(new Error(response.message || "Socket request failed."));
            return;
          }

          resolve(response ?? {});
        };

      if (payload === undefined) {
        this.socket.timeout(ACK_TIMEOUT_MS).emit(event, ackHandler);
        return;
      }

      this.socket.timeout(ACK_TIMEOUT_MS).emit(event, payload, ackHandler);
    });
  }

  joinDashboard() {
    return this.emitWithAck("admin:join_dashboard");
  }

  leaveDashboard() {
    return this.emitWithAck("admin:leave_dashboard");
  }

  requestDashboardStats() {
    return this.emitWithAck("admin:request_dashboard_stats");
  }

  broadcastNotification(payload: {
    title: string;
    message: string;
    type?: string;
    targetRole?: string;
  }) {
    return this.emitWithAck("admin:broadcast_notification", payload);
  }
}

export const adminSocketService = new AdminSocketService();
