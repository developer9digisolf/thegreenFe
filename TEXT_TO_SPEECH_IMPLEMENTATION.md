# Text-to-Speech Implementation - TherapistSlide

## Overview

This document describes the text-to-speech (TTS) functionality implemented in the TherapistSlide component using the text-to-speech.online API.

## Implementation Details

### Files Created/Modified

1. **New File**: `src/services/text-to-speech.service.tsx`
   - Contains the text-to-speech service functions
   - Handles API calls to text-to-speech.online
   - Provides audio playback functionality

2. **Modified File**: `src/app/dashboard/queue/page.tsx`
   - Added import for `TextToSpeechAndPlay` function
   - Modified the `SessionCreated` SignalR event handler to play TTS

## How It Works

### 1. SignalR Event Flow

When a new session is created, the backend sends a SignalR event with the following structure:

```typescript
{
  "textToSpeach": "Nomor antrian A001, silakan menuju ruang treatment"
}
```

### 2. Text-to-Speech Service

The service (`TextToSpeechAndPlay`) performs the following steps:

1. **API Call**: Sends the text to `https://text-to-speech.online/api/tts`
2. **Response Handling**: Receives an audio URL from the API
3. **Audio Playback**: Plays the audio using the HTML5 Audio API

### 3. Integration in TherapistSlide

The `SessionCreated` event handler now:

```typescript
// Play text-to-speech if textToSpeach is provided
if (data?.textToSpeach) {
  console.log("[TherapistSlide] Playing text-to-speech:", data.textToSpeach);
  TextToSpeechAndPlay({ text: data.textToSpeach, language: "id" }).catch(
    (error) => {
      console.error("[TherapistSlide] Failed to play text-to-speech:", error);
    },
  );
}
```

## Service API

### TextToSpeechAndPlay

Converts text to speech and plays it automatically.

**Parameters:**

- `text` (string): The text to convert to speech
- `language` (string): Language code (default: "id" for Indonesian)

**Returns:** Promise that resolves when audio finishes playing

### TextToSpeechService

Converts text to speech without playing.

**Parameters:**

- `text` (string): The text to convert to speech
- `language` (string): Language code (default: "id" for Indonesian)

**Returns:** Promise with audio URL

### PlayAudio

Plays audio from a URL.

**Parameters:**

- `audioUrl` (string): URL of the audio file

**Returns:** Promise that resolves when audio finishes playing

## Expected Backend Response Format

When the backend sends a `SessionCreated` event, it should include:

```json
{
  "textToSpeach": "Nomor antrian A001, silakan menuju ruang treatment"
  // ... other session data
}
```

**Note:** The field name is `textToSpeach` (with typo preserved to match requirements)

## Testing

### Manual Testing

1. **Start the application:**

   ```bash
   npm run dev
   ```

2. **Navigate to the TherapistSlide page:**
   - Open browser to `http://localhost:3000/dashboard/queue`

3. **Simulate a SessionCreated event:**
   - Use the SignalR test page or backend to send a SessionCreated event
   - Include the `textToSpeach` field in the event data

4. **Verify:**
   - Check console for `"[TherapistSlide] Playing text-to-speech:"` log
   - Verify that the audio plays in Indonesian
   - Check that the therapist queue refreshes after the audio plays

### Example Test Data

```json
{
  "textToSpeach": "Nomor antrian satu, Budi Santoso, silakan menunggu"
}
```

## Language Support

The implementation currently supports Indonesian (`id`) language. To add support for other languages:

1. Modify the `language` parameter in the `TextToSpeechAndPlay` call
2. Ensure the text-to-speech.online API supports the desired language
3. Update the `voice` parameter in the API call if needed

## Error Handling

The implementation includes comprehensive error handling:

1. **API Errors**: Logged to console with `[TextToSpeechService] Error:` prefix
2. **Playback Errors**: Logged to console with `[PlayAudio] Error:` prefix
3. **Graceful Degradation**: If TTS fails, the queue update continues normally

## Browser Compatibility

The implementation uses the HTML5 Audio API, which is supported by:

- Chrome 4+
- Firefox 3.5+
- Safari 3.1+
- Edge 12+

## Notes

1. **Audio Autoplay Policies**: Some browsers may block autoplay. Ensure the user has interacted with the page before expecting audio to play.

2. **Network Requirements**: The text-to-speech.online API requires an internet connection.

3. **API Limitations**: Check the text-to-speech.online documentation for rate limits and usage restrictions.

4. **Audio Format**: The API returns audio in a format supported by the Audio API (typically MP3 or WAV).

## Troubleshooting

### Audio Not Playing

- Check browser console for errors
- Verify the text-to-speech.online API is responding
- Ensure the audio URL is valid
- Check if the browser has blocked autoplay

### Wrong Language

- Verify the `language` parameter is set to "id" for Indonesian
- Check if the API supports the desired language

### No Audio from API

- Verify the API endpoint is correct
- Check network requests in browser dev tools
- Ensure the API key (if required) is configured

## Future Enhancements

Potential improvements for the text-to-speech feature:

1. **Voice Selection**: Allow users to choose from different voices
2. **Speed Control**: Add ability to adjust speech rate
3. **Volume Control**: Implement volume adjustment
4. **Offline Support**: Cache previously generated audio
5. **Fallback TTS**: Implement browser-native TTS as fallback
6. **Visual Feedback**: Show audio playing indicator
7. **Queue Management**: Handle multiple TTS requests with a queue system

## Related Documentation

- [SIGNALR_IMPLEMENTATION_SUMMARY.md](./SIGNALR_IMPLEMENTATION_SUMMARY.md) - SignalR implementation details
- [THERAPIST_SLIDE_SIGNALR.md](./THERAPIST_SLIDE_SIGNALR.md) - TherapistSlide SignalR specifics
