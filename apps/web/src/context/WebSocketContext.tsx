import { createContext } from "react";
import type { Socket } from "socket.io-client";

export interface WebSocketContextValue {
  socket: Socket
  connected: boolean
}

export const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined)
