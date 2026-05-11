"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import {
  createSignalRConnection,
  getSignalRHubUrl,
  ConnectionState,
  EventHandler,
  ErrorHandler,
  StateChangeHandler,
} from "@/lib/signalr";

/**
 * Hook options interface
 */
interface UseSignalROptions {
  /** Hub name (default: 'hubs/notifications') */
  hubName?: string;
  /** Optional access token for authentication */
  accessToken?: string;
  /** Whether to automatically connect on mount (default: false) */
  autoConnect?: boolean;
  /** Called when connection state changes */
  onStateChange?: StateChangeHandler;
  /** Called when connection encounters an error */
  onError?: ErrorHandler;
  /** Called when successfully connected */
  onConnected?: () => void;
  /** Called when disconnected */
  onDisconnected?: () => void;
  /** Called when reconnecting */
  onReconnecting?: () => void;
  /** Called when successfully reconnected */
  onReconnected?: () => void;
}

/**
 * SignalR hook return value interface
 */
interface UseSignalRReturn {
  /** Current connection state */
  connectionState: ConnectionState;
  /** Whether the connection is active */
  isConnected: boolean;
  /** Connect to the hub */
  connect: () => Promise<void>;
  /** Disconnect from the hub */
  disconnect: () => Promise<void>;
  /** Listen for a server event */
  on: <T = any>(eventName: string, handler: EventHandler<T>) => void;
  /** Stop listening for a server event */
  off: <T = any>(eventName: string, handler: EventHandler<T>) => void;
  /** Send a message to the server (fire and forget) */
  send: (methodName: string, ...args: any[]) => Promise<void>;
  /** Invoke a server method and get a result */
  invoke: <T = any>(methodName: string, ...args: any[]) => Promise<T>;
  /** Get the underlying SignalR connection instance */
  connection: signalR.HubConnection | null;
}

/**
 * Custom React hook for SignalR connection management
 *
 * @param options - Hook configuration options
 * @returns SignalR connection management interface
 *
 * @example
 * ```tsx
 * const { connect, disconnect, on, invoke, isConnected } = useSignalR({
 *   hubName: 'hubs/notifications',
 *   autoConnect: true,
 *   onConnected: () => console.log('Connected!'),
 *   onError: (err) => console.error('Error:', err)
 * });
 *
 * // Listen for events
 * on('ReceiveNotification', (data) => {
 *   console.log('Notification:', data);
 * });
 *
 * // Send messages
 * await invoke('SendNotification', { message: 'Hello' });
 * ```
 */
export const useSignalR = (
  options: UseSignalROptions = {},
): UseSignalRReturn => {
  const {
    hubName = "hubs/notifications",
    accessToken,
    autoConnect = false,
    onStateChange,
    onError,
    onConnected,
    onDisconnected,
    onReconnecting,
    onReconnected,
  } = options;

  // Refs to prevent multiple connections and persist across renders
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const eventHandlersRef = useRef<Map<string, EventHandler[]>>(new Map());
  const isConnectingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Connection state
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("Disconnected");

  // Update state and notify callback
  const updateState = useCallback(
    (newState: ConnectionState) => {
      if (!isMountedRef.current) return;
      setConnectionState(newState);
      onStateChange?.(newState);
    },
    [onStateChange],
  );

  // Get or create connection
  const getConnection = useCallback((): signalR.HubConnection => {
    if (!connectionRef.current) {
      const hubUrl = getSignalRHubUrl(hubName);
      console.log("[SignalR] Creating connection with URL:", hubUrl);
      console.log("[SignalR] Hub name parameter:", hubName);
      console.log("[SignalR] Access token provided:", !!accessToken);
      const connection = createSignalRConnection(hubUrl, accessToken);
      connectionRef.current = connection;

      // Set up automatic reconnection handlers
      connection.onreconnecting((error) => {
        console.log("[SignalR] Reconnecting...", error);
        updateState("Reconnecting");
        onReconnecting?.();
      });

      connection.onreconnected((connectionId) => {
        console.log("[SignalR] Reconnected with ID:", connectionId);
        updateState("Connected");
        onReconnected?.();
      });

      connection.onclose((error) => {
        console.log("[SignalR] Connection closed", error);
        updateState("Disconnected");
        onDisconnected?.();
      });
    }
    if (!connectionRef.current) {
      throw new Error("[SignalR] Failed to create connection");
    }
    return connectionRef.current;
  }, [
    hubName,
    accessToken,
    updateState,
    onReconnecting,
    onReconnected,
    onDisconnected,
  ]);

  // Connect to the hub
  const connect = useCallback(async () => {
    if (isConnectingRef.current) {
      console.log("[SignalR] Connection already in progress");
      return;
    }

    const connection = getConnection();

    if (connection.state === signalR.HubConnectionState.Connected) {
      console.log("[SignalR] Already connected");
      updateState("Connected");
      return;
    }

    try {
      isConnectingRef.current = true;
      updateState("Connecting");
      console.log("[SignalR] Connecting to hub:", hubName);

      await connection.start();
      console.log("[SignalR] Connected successfully");
      updateState("Connected");
      onConnected?.();
    } catch (error) {
      console.error("[SignalR] Connection failed:", error);
      updateState("Disconnected");
      onError?.(error as Error);
      throw error;
    } finally {
      isConnectingRef.current = false;
    }
  }, [getConnection, hubName, updateState, onConnected, onError]);

  // Disconnect from the hub
  const disconnect = useCallback(async () => {
    const connection = connectionRef.current;
    if (
      connection &&
      connection.state !== signalR.HubConnectionState.Disconnected
    ) {
      try {
        updateState("Disconnecting");
        console.log("[SignalR] Disconnecting...");
        await connection.stop();
        console.log("[SignalR] Disconnected");
        updateState("Disconnected");
      } catch (error) {
        console.error("[SignalR] Disconnect error:", error);
        onError?.(error as Error);
      }
    }
  }, [updateState, onError]);

  // Listen for server events
  const on = useCallback(
    <T = any>(eventName: string, handler: EventHandler<T>) => {
      const connection = getConnection();

      // Store handler for cleanup
      const handlers = eventHandlersRef.current.get(eventName) || [];
      handlers.push(handler as EventHandler);
      eventHandlersRef.current.set(eventName, handlers);

      // Register with SignalR
      connection.on(eventName, handler);

      console.log(`[SignalR] Listening for event: ${eventName}`);
    },
    [getConnection],
  );

  // Stop listening for server events
  const off = useCallback(
    <T = any>(eventName: string, handler: EventHandler<T>) => {
      const connection = connectionRef.current;
      if (!connection) return;

      // Remove from SignalR
      connection.off(eventName, handler as EventHandler);

      // Remove from stored handlers
      const handlers = eventHandlersRef.current.get(eventName) || [];
      const index = handlers.indexOf(handler as EventHandler);
      if (index > -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          eventHandlersRef.current.delete(eventName);
        } else {
          eventHandlersRef.current.set(eventName, handlers);
        }
      }

      console.log(`[SignalR] Stopped listening for event: ${eventName}`);
    },
    [],
  );

  // Send a message to the server (fire and forget)
  const send = useCallback(
    async (methodName: string, ...args: any[]) => {
      const connection = connectionRef.current;
      if (!connection) {
        throw new Error("[SignalR] Connection not established");
      }

      if (connection.state !== signalR.HubConnectionState.Connected) {
        throw new Error("[SignalR] Not connected");
      }

      try {
        await connection.send(methodName, ...args);
        console.log(`[SignalR] Sent: ${methodName}`, args);
      } catch (error) {
        console.error(`[SignalR] Send failed for ${methodName}:`, error);
        onError?.(error as Error);
        throw error;
      }
    },
    [onError],
  );

  // Invoke a server method and get a result
  const invoke = useCallback(
    async <T = any>(methodName: string, ...args: any[]): Promise<T> => {
      const connection = connectionRef.current;
      if (!connection) {
        throw new Error("[SignalR] Connection not established");
      }

      if (connection.state !== signalR.HubConnectionState.Connected) {
        throw new Error("[SignalR] Not connected");
      }

      try {
        const result = await connection.invoke<T>(methodName, ...args);
        console.log(`[SignalR] Invoked: ${methodName}`, args, "->", result);
        return result;
      } catch (error) {
        console.error(`[SignalR] Invoke failed for ${methodName}:`, error);
        onError?.(error as Error);
        throw error;
      }
    },
    [onError],
  );

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      // Cleanup on unmount
      isMountedRef.current = false;

      // Remove all event handlers
      if (connectionRef.current) {
        eventHandlersRef.current.forEach((handlers, eventName) => {
          handlers.forEach((handler) => {
            connectionRef.current?.off(eventName, handler);
          });
        });
        eventHandlersRef.current.clear();
      }

      // Disconnect
      disconnect();
    };
  }, []); // Empty deps - only run on mount/unmount

  return {
    connectionState,
    isConnected: connectionState === "Connected",
    connect,
    disconnect,
    on,
    off,
    send,
    invoke,
    connection: connectionRef.current,
  };
};
