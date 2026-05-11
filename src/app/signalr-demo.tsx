"use client";

import React, { useState } from "react";
import { useSignalR } from "@/hooks/useSignalR";

/**
 * SignalR Demo Component
 * Demonstrates real-time notification functionality using SignalR
 */
export default function SignalRDemo() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  // Initialize SignalR connection
  const { connect, disconnect, invoke, isConnected, connectionState, on } =
    useSignalR({
      hubName: "hubs/notifications",
      autoConnect: true,
      onConnected: () => {
        console.log("[Demo] Connected to SignalR Hub!");
      },
      onDisconnected: () => {
        console.log("[Demo] Disconnected from SignalR Hub");
      },
      onReconnecting: () => {
        console.log("[Demo] Reconnecting to SignalR Hub...");
      },
      onReconnected: () => {
        console.log("[Demo] Successfully reconnected!");
      },
      onError: (error) => {
        console.error("[Demo] SignalR Error:", error);
      },
      onStateChange: (state) => {
        console.log("[Demo] Connection state changed:", state);
      },
    });

  // Listen for incoming notifications
  React.useEffect(() => {
    on("ReceiveNotification", (data: any) => {
      console.log("[Demo] Received notification:", data);
      const message = typeof data === "string" ? data : JSON.stringify(data);
      setNotifications((prev) => [
        `[${new Date().toLocaleTimeString()}] ${message}`,
        ...prev,
      ]);
    });

    return () => {
      // Cleanup is handled by the hook
    };
  }, [on]);

  // Send notification to server
  const handleSendNotification = async () => {
    if (!inputMessage.trim()) return;

    try {
      await invoke("SendNotification", {
        message: inputMessage,
        timestamp: new Date().toISOString(),
      });
      console.log("[Demo] Sent notification:", inputMessage);
      setInputMessage("");
    } catch (error) {
      console.error("[Demo] Failed to send notification:", error);
      alert("Failed to send notification. Make sure you're connected.");
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    try {
      await connect();
      console.log("[Demo] Manual connect successful");
    } catch (error) {
      console.error("[Demo] Manual connect failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SignalR Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time notification system using SignalR
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Connection Status
            </h2>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                {connectionState}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleTestConnection}
              disabled={isConnected}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isConnected ? "Connected" : "Connect"}
            </button>
            <button
              onClick={disconnect}
              disabled={!isConnected}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Send Notification */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Send Notification
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Enter notification message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={!isConnected}
              onKeyPress={(e) => e.key === "Enter" && handleSendNotification()}
            />
            <button
              onClick={handleSendNotification}
              disabled={!isConnected || !inputMessage.trim()}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>

        {/* Received Notifications */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Received Notifications
            </h2>
            <button
              onClick={() => setNotifications([])}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">
                  {isConnected
                    ? "Waiting for incoming messages..."
                    : "Connect to start receiving notifications"}
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 animate-fade-in"
                >
                  <p className="text-sm text-gray-800">{notification}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Test
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Ensure your SignalR server is running at the configured URL</li>
            <li>
              Click "Connect" to establish a WebSocket connection (or it will
              auto-connect)
            </li>
            <li>
              Enter a message and click "Send" to broadcast a notification
            </li>
            <li>
              Watch notifications appear in real-time in the received list
            </li>
            <li>
              Test reconnection by temporarily stopping your server and starting
              it again
            </li>
          </ol>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
