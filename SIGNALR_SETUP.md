# SignalR Integration Guide

Complete guide for setting up and using SignalR real-time communication in TheGreenFE project.

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This implementation provides a production-ready SignalR integration for Next.js with the following features:

- ✅ Automatic reconnection with exponential backoff
- ✅ Connection state management
- ✅ Event listeners with cleanup
- ✅ TypeScript support with full type safety
- ✅ Error handling and logging
- ✅ Multiple connection prevention
- ✅ Clean cleanup on unmount
- ✅ Support for authenticated connections
- ✅ Configurable logging levels

## 📦 Installation

The SignalR package has been installed:

```bash
npm install @microsoft/signalr
```

## 📁 Project Structure

```
src/
├── lib/
│   └── signalr.ts              # SignalR configuration and utilities
├── hooks/
│   └── useSignalR.ts           # Custom React hook for SignalR
├── app/
│   ├── signalr-demo.tsx        # Demo component for testing
│   └── page.tsx               # Example usage
└── .env.local                 # Environment variables
```

## ⚙️ Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```env
# SignalR Hub URL (public - accessible in browser)
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5100

# Alternative: use API_DESTINATION if you want consistency
# NEXT_PUBLIC_SIGNALR_URL=http://localhost:5100
```

### TypeScript Configuration

The following path aliases are configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/hooks/*": ["./src/hooks/*"]
  }
}
```

## 🚀 Usage

### Basic Usage

```tsx
"use client";

import { useSignalR } from "@/hooks/useSignalR";

function MyComponent() {
  const { connect, disconnect, on, invoke, isConnected } = useSignalR({
    hubName: "hubs/notifications",
    autoConnect: true,
    onConnected: () => console.log("Connected!"),
    onError: (error) => console.error("Error:", error),
  });

  // Listen for events
  React.useEffect(() => {
    on("ReceiveNotification", (data) => {
      console.log("Received:", data);
    });
  }, [on]);

  return (
    <div>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <button onClick={() => invoke("SendMessage", "Hello!")}>
        Send Message
      </button>
    </div>
  );
}
```

### Advanced Usage with Authentication

```tsx
"use client";

import { useSignalR } from "@/hooks/useSignalR";

function AuthenticatedComponent() {
  const token = useAuthStore((state) => state.token); // Your auth token

  const { connect, disconnect, on, send, invoke, connectionState } = useSignalR(
    {
      hubName: "hubs/chat",
      accessToken: token,
      autoConnect: false, // Manual connect
      onStateChange: (state) => {
        console.log("State changed:", state);
      },
      onReconnecting: () => {
        showToast("Reconnecting...");
      },
      onReconnected: () => {
        showToast("Reconnected!");
      },
    },
  );

  React.useEffect(() => {
    // Listen for messages
    on("ReceiveMessage", (message) => {
      console.log("New message:", message);
    });

    // Listen for user joined
    on("UserJoined", (user) => {
      console.log(`${user.name} joined`);
    });
  }, [on]);

  const handleJoinRoom = async (roomId: string) => {
    try {
      await invoke("JoinRoom", roomId);
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  return (
    <div>
      <div>Connection: {connectionState}</div>
      <button onClick={() => connect()}>Connect</button>
      <button onClick={() => handleJoinRoom("room-1")}>Join Room</button>
    </div>
  );
}
```

## 📚 API Reference

### `useSignalR` Hook

#### Options

| Option           | Type                               | Default                | Description                                      |
| ---------------- | ---------------------------------- | ---------------------- | ------------------------------------------------ |
| `hubName`        | `string`                           | `"hubs/notifications"` | The name of the SignalR hub                      |
| `accessToken`    | `string`                           | `undefined`            | Optional JWT token for authenticated connections |
| `autoConnect`    | `boolean`                          | `false`                | Automatically connect on mount                   |
| `onConnected`    | `() => void`                       | `undefined`            | Callback when successfully connected             |
| `onDisconnected` | `() => void`                       | `undefined`            | Callback when disconnected                       |
| `onReconnecting` | `() => void`                       | `undefined`            | Callback when reconnecting                       |
| `onReconnected`  | `() => void`                       | `undefined`            | Callback when successfully reconnected           |
| `onStateChange`  | `(state: ConnectionState) => void` | `undefined`            | Callback when connection state changes           |
| `onError`        | `(error: Error) => void`           | `undefined`            | Callback when an error occurs                    |

#### Return Value

| Property          | Type                                                       | Description                              |
| ----------------- | ---------------------------------------------------------- | ---------------------------------------- |
| `connectionState` | `ConnectionState`                                          | Current connection state                 |
| `isConnected`     | `boolean`                                                  | Whether the connection is active         |
| `connect`         | `() => Promise<void>`                                      | Connect to the hub                       |
| `disconnect`      | `() => Promise<void>`                                      | Disconnect from the hub                  |
| `on`              | `<T>(eventName: string, handler: EventHandler<T>) => void` | Listen for server events                 |
| `off`             | `<T>(eventName: string, handler: EventHandler<T>) => void` | Stop listening for events                |
| `send`            | `(methodName: string, ...args: any[]) => Promise<void>`    | Send message to server (fire and forget) |
| `invoke`          | `<T>(methodName: string, ...args: any[]) => Promise<T>`    | Call server method and get result        |
| `connection`      | `HubConnection \| null`                                    | The underlying SignalR connection        |

#### Connection States

```typescript
type ConnectionState =
  | "Disconnected" // Not connected
  | "Connecting" // Attempting to connect
  | "Connected" // Successfully connected
  | "Reconnecting" // Attempting to reconnect
  | "Disconnecting"; // Attempting to disconnect
```

### Utility Functions

#### `createSignalRConnection(hubUrl: string, accessToken?: string)`

Creates and configures a new SignalR connection with:

- Automatic reconnection with exponential backoff
- Configured transport types (WebSockets, Server-Sent Events)
- Environment-based logging (Information in dev, Warning in prod)

#### `getSignalRHubUrl(hubName?: string)`

Returns the full hub URL based on environment variables.

## 🧪 Testing

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Access the Demo Page

Navigate to: `http://localhost:3000/signalr-demo`

### 3. Test Connection

1. The demo page will automatically attempt to connect
2. Watch the connection status indicator (green = connected, red = disconnected)
3. Check browser console for connection logs

### 4. Send Test Notifications

1. Enter a message in the input field
2. Click "Send" to broadcast to the server
3. Watch notifications appear in real-time in the received list

### 5. Test Reconnection

1. Temporarily stop your SignalR server
2. Observe the status change to "Reconnecting"
3. Restart your SignalR server
4. Watch it automatically reconnect

### 6. Test Multiple Browser Tabs

1. Open the demo page in multiple browser tabs
2. Send a notification from one tab
3. Watch it appear in all tabs simultaneously

## 🔧 Server-Side Requirements

Your SignalR server needs to implement the following hub methods:

```csharp
[Hub]
public class NotificationHub : Hub
{
    // Send notification to all connected clients
    public async Task SendNotification(object message)
    {
        await Clients.All.SendAsync("ReceiveNotification", message);
    }

    // Example: Join a specific room/group
    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
    }

    // Example: Send to specific room
    public async Task SendToRoom(string roomId, object message)
    {
        await Clients.Group(roomId).SendAsync("ReceiveNotification", message);
    }
}
```

## 🎯 Best Practices

### 1. Use `use client` Directive

Always mark components using SignalR with `"use client"`:

```tsx
"use client";

import { useSignalR } from "@/hooks/useSignalR";
```

### 2. Prevent Multiple Connections

The hook automatically prevents multiple connections, but be mindful:

```tsx
// ✅ Good - Single connection per component
const signalR = useSignalR({ hubName: "hubs/notifications" });

// ❌ Bad - Don't create multiple instances
const signalR1 = useSignalR({ hubName: "hubs/notifications" });
const signalR2 = useSignalR({ hubName: "hubs/notifications" });
```

### 3. Clean Up Event Listeners

The hook handles cleanup automatically, but you can manually remove listeners:

```tsx
const handleNotification = (data) => console.log(data);

// Add listener
on("ReceiveNotification", handleNotification);

// Remove listener (optional - hook cleans up on unmount)
off("ReceiveNotification", handleNotification);
```

### 4. Handle Errors Gracefully

Always wrap SignalR calls in try-catch:

```tsx
const handleSend = async () => {
  try {
    await invoke("SendMessage", message);
    showSuccess("Message sent!");
  } catch (error) {
    console.error("Failed to send:", error);
    showError("Failed to send message");
  }
};
```

### 5. Show Connection Status to Users

Provide visual feedback about connection state:

```tsx
<div className="flex items-center gap-2">
  <div
    className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
  />
  <span>{connectionState}</span>
</div>
```

### 6. Use Appropriate Connection Modes

- **Auto-connect**: For persistent connections (notifications, chat)
- **Manual connect**: For on-demand connections (live updates only when needed)

```tsx
// Persistent connection
const { on } = useSignalR({
  hubName: "hubs/notifications",
  autoConnect: true,
});

// On-demand connection
const { connect, invoke } = useSignalR({
  hubName: "hubs/live-updates",
  autoConnect: false,
});

const handleEnableLiveUpdates = async () => {
  await connect();
};
```

### 7. Optimize Performance

- Minimize the number of events listened to
- Unsubscribe from unused events
- Use server-side filtering to reduce client-side processing

## 🔍 Troubleshooting

### Connection Issues

**Problem**: Cannot connect to SignalR server

**Solutions**:

1. Verify server is running at configured URL
2. Check CORS settings on the server
3. Ensure `NEXT_PUBLIC_SIGNALR_URL` is correct
4. Check browser console for specific error messages
5. Verify WebSocket support in your browser

### Reconnection Issues

**Problem**: Connection doesn't automatically reconnect

**Solutions**:

1. Check server's keep-alive settings
2. Verify network stability
3. Monitor connection state in browser console
4. Check server logs for disconnection reasons

### TypeScript Errors

**Problem**: Type errors with SignalR

**Solutions**:

1. Ensure `@microsoft/signalr` is installed
2. Check TypeScript configuration in `tsconfig.json`
3. Verify path aliases are correct
4. Run `npm run build` to catch all errors

### Event Not Firing

**Problem**: Event listeners don't trigger

**Solutions**:

1. Ensure `on()` is called after connection
2. Verify event name matches server-side exactly
3. Check for typos in event names
4. Use `autoConnect: true` or call `connect()` first

## 📝 Example: Complete Chat Component

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useSignalR } from "@/hooks/useSignalR";

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

export default function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const currentUser = "User" + Math.floor(Math.random() * 1000);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { connect, invoke, isConnected, on } = useSignalR({
    hubName: "hubs/chat",
    autoConnect: true,
    onConnected: async () => {
      console.log("Connected to chat hub");
      await invoke("JoinRoom", roomId);
    },
  });

  useEffect(() => {
    on("ReceiveMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {};
  }, [on]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;

    const message: Message = {
      id: Date.now().toString(),
      user: currentUser,
      text: input,
      timestamp: new Date(),
    };

    try {
      await invoke("SendMessage", roomId, message);
      setInput("");
    } catch (error) {
      console.error("Failed to send:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow p-4 flex items-center justify-between">
        <h2 className="font-bold">Room: {roomId}</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.user === currentUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.user === currentUser
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <div className="text-xs opacity-70 mb-1">{msg.user}</div>
              <div>{msg.text}</div>
              <div className="text-xs opacity-50 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white shadow p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!isConnected}
        />
        <button
          onClick={handleSend}
          disabled={!isConnected || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

## 📚 Additional Resources

- [SignalR Documentation](https://docs.microsoft.com/aspnet/core/signalr/)
- [@microsoft/signalr npm package](https://www.npmjs.com/package/@microsoft/signalr)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)

## 🤝 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review browser console logs
3. Check server-side SignalR logs
4. Ensure all dependencies are properly installed

## 📄 License

This SignalR integration is part of TheGreenFE project.
