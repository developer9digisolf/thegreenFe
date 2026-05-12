import * as signalR from "@microsoft/signalr";
import { LogLevel } from "@microsoft/signalr";

/**
 * SignalR configuration and connection builder
 * Provides a centralized way to create and configure SignalR connections
 */

export const createSignalRConnection = (
  hubUrl: string,
  accessToken?: string,
): signalR.HubConnection => {
  // Check if we should skip negotiation (better for production/proxies)
  // Skip negotiation ONLY works if transport is restricted to WebSockets
  const isAbsoluteUrl = hubUrl.startsWith("http");
  
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: accessToken ? () => accessToken : undefined,
      skipNegotiation: isAbsoluteUrl, // Skip negotiation for absolute URLs to bypass proxy issues
      transport: isAbsoluteUrl 
        ? signalR.HttpTransportType.WebSockets // Force WebSockets if skipping negotiation
        : signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext: {
        previousRetryCount: number;
        elapsedMilliseconds: number;
        retryReason: Error;
      }) => {
        if (retryContext.previousRetryCount === 0) {
          // First retry: immediate
          return 0;
        } else if (retryContext.previousRetryCount < 3) {
          // Next 2 retries: after 2 seconds
          return 2000;
        } else if (retryContext.previousRetryCount < 6) {
          // Next 3 retries: after 10 seconds
          return 10000;
        } else {
          // After that: every 30 seconds
          return 30000;
        }
      },
    })
    .configureLogging(
      process.env.NODE_ENV === "production"
        ? LogLevel.Warning
        : LogLevel.Information,
    )
    .build();

  return connection;
};

/**
 * Default SignalR hub URL from environment variables
 */
export const getSignalRHubUrl = (
  hubName: string = "hubs/notifications",
): string => {
  const isLocalhost =
    typeof window !== "undefined" && window.location.hostname === "localhost";

  const baseUrl =
    process.env.NEXT_PUBLIC_SIGNALR_URL ||
    (isLocalhost ? "" : "https://green-api-staging.digisolf.com");

  // Remove trailing slash from baseUrl and leading slash from hubName
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanHubName = hubName.replace(/^\//, "");

  // Ensure URL is absolute (starts with http:// or https://)
  const url = `${cleanBaseUrl}/${cleanHubName}`;

  // If URL doesn't start with http/https, it's being treated as relative path
  // This happens in Next.js when the hubName starts with "/"
  if (!url.match(/^https?:\/\//)) {
    console.warn(
      "[SignalR] URL is relative, this may cause routing issues:",
      url,
    );
  }

  return url;
};

/**
 * Connection state types
 */
export type ConnectionState =
  | "Disconnected"
  | "Connecting"
  | "Connected"
  | "Reconnecting"
  | "Disconnecting";

/**
 * Event handler type for SignalR events
 */
export type EventHandler<T = any> = (data: T) => void;

/**
 * Error handler type for SignalR errors
 */
export type ErrorHandler = (error: Error) => void;

/**
 * Connection state change handler
 */
export type StateChangeHandler = (state: ConnectionState) => void;
