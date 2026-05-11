# TherapistSlide - SignalR Integration

## Overview

SignalR has been successfully integrated into the TherapistSlide component to enable real-time auto-slide functionality **only when triggered by backend SignalR events**. The slider does NOT auto-slide on a timer - it only moves when the backend sends a `SessionCreated` event.

## ⚠️ Important Behavior Change

**Timer-based auto-slide has been removed.** The slider now ONLY advances when:

- A `SessionCreated` event is received from the backend via SignalR
- User manually navigates (arrows, dots, swipe, or click)

This ensures the slider only moves when there's an actual business event (new session created) rather than on a fixed timer.

## Implementation Details

### File Modified

- **src/app/dashboard/queue/page.tsx**

### Changes Made

#### 1. Import Auth Hook

```typescript
import { useAuth } from "@/contexts/AuthContext";
```

#### 2. Get Authentication Token

```typescript
// Get authentication token from AuthContext
const { token } = useAuth();
```

#### 3. SignalR Hook Integration

```typescript
import { useSignalR } from "@/hooks/useSignalR";

// Initialize SignalR connection for real-time updates
const { on: signalROn } = useSignalR({
  hubName: "hubs/notification",
  accessToken: token || undefined, // Pass authentication token
  autoConnect: true,
  onConnected: () => {
    console.log(
      "[TherapistSlide] SignalR connected - listening for SessionCreated",
    );
  },
  onError: (error) => {
    console.error("[TherapistSlide] SignalR error:", error);
  },
});
```

### About Access Token

**What is it?**
The `accessToken` is the authentication token that proves the user's identity to the backend SignalR hub.

**Where does it come from?**

- The token comes from the `AuthContext` (see `src/contexts/AuthContext.tsx`)
- It's stored in localStorage by `AuthHelper.getToken()`
- It's automatically included in all API requests via the request utility

**Why is it needed?**

- Security: Ensures only authenticated users can connect to SignalR
- Authorization: Backend can validate user permissions
- Personalization: Backend can send events specific to the authenticated user

**How does it work?**

1. User logs in → Token is stored in AuthContext
2. TherapistSlide component mounts → Gets token from `useAuth()`
3. SignalR connection is created → Token is passed as `accessToken`
4. Backend validates token → Connection is established
5. Backend can now send authenticated events to the client

**Token Format:**
The token is typically a JWT (JSON Web Token) that looks like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**If no token is provided:**

- The connection will be unauthenticated (anonymous)
- Backend may reject the connection depending on configuration
- Events may not be delivered if they require authentication

#### 2. SessionCreated Event Listener

```typescript
// Listen for SessionCreated event from backend
useEffect(() => {
  signalROn("SessionCreated", (data: any) => {
    console.log("[TherapistSlide] SessionCreated event received:", data);

    // Trigger auto-slide to next card ONLY on SignalR event
    setCurrent((c) => {
      const total = therapists
        .filter((t) => t.status === "waiting")
        .slice(0, TOP_COUNT).length;
      const maxIndex = Math.max(0, total - 1);
      return c >= maxIndex ? 0 : c + 1;
    });

    // Reset progress bar
    setProgress(0);
  });
}, [signalROn, therapists]);
```

## How It Works

### Connection Flow

1. **Automatic Connection**: When the TherapistSlide component mounts, it automatically connects to the SignalR hub at `hubs/notification`

2. **Event Listening**: The component listens for the `SessionCreated` event broadcasted from the backend

3. **Auto-Slide Trigger (SignalR Only)**: When a `SessionCreated` event is received:
   - The slide automatically advances to the next therapist card
   - The progress bar is reset to 0%
   - The new current card is highlighted with a blue ring

4. **NO Timer-Based Sliding**: The slider does NOT move automatically on any timer - it only advances when:
   - Backend sends `SessionCreated` event via SignalR
   - User manually navigates (click dots, arrows, swipe, or click on card)

### Auto-Slide Logic

```typescript
// Calculate next slide index
setCurrent((c) => {
  const total = therapists
    .filter((t) => t.status === "waiting") // Only waiting therapists
    .slice(0, TOP_COUNT).length; // Top 3 therapists only
  const maxIndex = Math.max(0, total - 1);
  return c >= maxIndex ? 0 : c + 1; // Loop back to start
});
```

## Backend Requirements

Your SignalR backend must implement the following:

### Hub Method to Broadcast SessionCreated

```csharp
using Microsoft.AspNetCore.SignalR;

public class NotificationHub : Hub
{
    /// <summary>
    /// Broadcast a new session creation to all connected clients
    /// </summary>
    public async Task NotifySessionCreated(object sessionData)
    {
        await Clients.All.SendAsync("SessionCreated", sessionData);
    }
}
```

### Example Usage from Backend API

```csharp
[HttpPost("sessions")]
public async Task<IActionResult> CreateSession([FromBody] CreateSessionDto dto)
{
    // Create the session...
    var session = await _sessionService.CreateAsync(dto);

    // Broadcast to all connected clients
    await _hubContext.Clients.All.SendAsync("SessionCreated", new
    {
        SessionId = session.Id,
        TherapistId = session.TherapistId,
        Timestamp = DateTime.UtcNow
    });

    return Ok(session);
}
```

## Event Data Structure

The `SessionCreated` event can send any data structure. Example:

```typescript
interface SessionCreatedEvent {
  sessionId: string;
  therapistId: number;
  therapistName: string;
  branchId: number;
  timestamp: string;
  // ... any additional fields
}
```

## Testing the Implementation

### Method 1: SignalR Demo Page

1. Navigate to: `http://localhost:3000/signalr-demo`
2. Connect to the hub
3. Send a test event manually from backend
4. Observe auto-slide in TherapistSlide

### Method 2: Browser Console

Open the TherapistSlide page and use the browser console:

```javascript
// Check if SignalR is connected
// Look for: "[TherapistSlide] SignalR connected - listening for SessionCreated"

// Trigger manual test (if you have access to the hub)
// This would be done from your backend, not the browser
```

### Method 3: Backend Integration

1. Ensure your backend SignalR hub is running
2. Create a new session via your API
3. Verify the `SessionCreated` event is broadcast
4. Check browser console for event logs
5. Observe the slide automatically advancing

## Console Logging

### Successful Connection

```
[TherapistSlide] SignalR connected - listening for SessionCreated
```

### Event Received

```
[TherapistSlide] SessionCreated event received: { sessionId: "...", therapistId: 123, ... }
```

### Connection Error

```
[TherapistSlide] SignalR error: Error: Connection failed
```

## Configuration

### Environment Variables

Ensure your `.env.local` has the SignalR URL configured:

```env
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5100
```

### Hub Configuration

The TherapistSlide uses hub name: `hubs/notification`

To change the hub name, modify line 57 in `src/app/dashboard/queue/page.tsx`:

```typescript
const { on: signalROn } = useSignalR({
  hubName: "hubs/your-custom-hub", // Change this
  autoConnect: true,
  // ...
});
```

## Behavior Details

### When SessionCreated is Triggered

1. **Immediate Action**: The slide advances immediately (only when triggered by backend)
2. **Progress Reset**: Progress bar resets to 0%
3. **Loop Behavior**: If at the last card, it loops back to the first
4. **No Timer**: There is NO automatic timer-based sliding
5. **Console Log**: Event data is logged for debugging

### Manual Controls

The slider can be controlled manually at any time:

- **Dot Navigation**: Click on dots to manually navigate
- **Arrow Buttons**: Use prev/next arrows
- **Swipe Gestures**: Swipe left/right on touch devices
- **Click on Card**: Click any therapist card to select it

### Removed Features

The following timer-based features have been removed:

- ❌ Auto-slide on interval timer (previously 4 seconds)
- ❌ Progress bar animation based on timer
- ❌ Pause on hover (not needed since no timer)

## Troubleshooting

### Issue: Auto-slide not triggering on SessionCreated

**Important Note**: The slider will NOT auto-slide on a timer. It ONLY slides when:

- Backend sends `SessionCreated` event via SignalR
- User manually navigates

**Possible Causes:**

1. SignalR server not running
2. Backend not broadcasting `SessionCreated` event
3. Event name mismatch (case-sensitive)
4. Hub URL incorrect

**Solutions:**

1. Check browser console for connection logs
2. Verify backend is calling `SendAsync("SessionCreated", ...)`
3. Ensure event name matches exactly: "SessionCreated"
4. Confirm `NEXT_PUBLIC_SIGNALR_URL` is correct

### Issue: Slider not advancing at all

**Possible Causes:**

1. No `SessionCreated` events being sent from backend
2. Therapist list updates while event is processing
3. Zero or one therapist in waiting list

**Solutions:**

1. Check browser console for SignalR connection status
2. Verify backend is broadcasting events
3. Check `therapists` state in React DevTools
4. Ensure at least 2 therapists are in waiting status
5. Use manual navigation (dots, arrows, swipe) to confirm UI works

### Issue: Progress bar not resetting

**Possible Causes:**

1. State update batching
2. Re-render conflicts

**Solutions:**

1. The implementation uses `setProgress(0)` which should work correctly
2. If issues persist, try using functional update: `setProgress(() => 0)`

## Production Considerations

### Error Handling

The implementation includes:

- Connection error logging
- Event error handling via the hook
- Graceful degradation if SignalR fails

### Performance

- Single connection per component
- Automatic cleanup on unmount
- Efficient state updates
- No unnecessary timer intervals

### Security

- Uses environment variables for URL configuration
- Supports authentication tokens (if needed)
- No sensitive data exposed to client

## Future Enhancements

### Potential Improvements

1. **Visual Feedback**: Add a toast/notification when slide changes
2. **Sound Alert**: Optional sound on auto-slide
3. **Filter by Branch**: Only listen to events for selected branch
4. **Event History**: Track and display recent events
5. **Manual Override**: Button to temporarily disable SignalR auto-slide

### Example: Filter by Branch

```typescript
useEffect(() => {
  signalROn("SessionCreated", (data: any) => {
    // Only auto-slide if event matches selected branch
    if (data.branchId === selectedBranch) {
      setCurrent((c) => {
        const total = therapists
          .filter((t) => t.status === "waiting")
          .slice(0, TOP_COUNT).length;
        const maxIndex = Math.max(0, total - 1);
        return c >= maxIndex ? 0 : c + 1;
      });
      setProgress(0);
    }
  });
}, [signalROn, therapists, selectedBranch]);
```

## Related Files

- **src/hooks/useSignalR.ts** - Custom React hook for SignalR
- **src/lib/signalr.ts** - SignalR configuration utilities
- **SIGNALR_SETUP.md** - Complete SignalR setup guide
- **src/app/signalr-demo.tsx** - Interactive demo page

## Support

For issues or questions:

1. Check browser console for error messages
2. Review SignalR connection logs
3. Verify backend hub implementation
4. Consult SIGNALR_SETUP.md for general SignalR issues

## Summary

The TherapistSlide component now supports real-time auto-slide functionality through SignalR integration. When a new session is created on the backend, the slide automatically advances to the next waiting therapist, providing a seamless and dynamic user experience.

**Key Features:**

- ✅ Automatic connection to SignalR hub
- ✅ Listens for SessionCreated events
- ✅ Auto-slides to next card on event (NOT on timer)
- ✅ Resets progress bar
- ✅ Console logging for debugging
- ✅ Error handling and graceful degradation
- ✅ Works with existing manual controls
- ✅ No timer-based sliding (event-driven only)
