// ─────────────────────────────────────────────────────────────────────────────
// text-to-speech.service.ts
// Google Translate TTS with autoplay unlock + queue system
// ─────────────────────────────────────────────────────────────────────────────

interface TextToSpeechRequest {
  text: string;
  language?: string;
}

interface TextToSpeechResponse {
  success: boolean;
  message: string;
  data?: {
    audioUrl?: string;
    textToSpeach?: string;
  };
}

// ─── Module-level singleton state ─────────────────────────────────────────────

let isAudioUnlocked = false;
let isSpeaking = false;
const speechQueue: Array<{ text: string; language: string }> = [];
let currentAudio: HTMLAudioElement | null = null;

// ─── Autoplay unlock ──────────────────────────────────────────────────────────

/**
 * Browser blocks audio.play() until the user has interacted with the page.
 * This function plays a silent audio on first user interaction to "unlock"
 * the audio context, so later programmatic calls (e.g. from SignalR) work.
 *
 * Call InitTTSAutoplayUnlock() once — ideally in your root layout or page.
 */
export function InitTTSAutoplayUnlock(): void {
  if (typeof window === "undefined" || isAudioUnlocked) return;

  const unlock = () => {
    if (isAudioUnlocked) return;

    // Play a silent 0.1s audio to satisfy browser autoplay policy
    const silent = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=",
    );
    silent.volume = 0;
    silent
      .play()
      .then(() => {
        isAudioUnlocked = true;
        console.log("[TTS] Autoplay unlocked");

        // Remove listeners once unlocked
        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
      })
      .catch(() => {
        // Ignore — will retry on next interaction
      });
  };

  window.addEventListener("click", unlock);
  window.addEventListener("touchstart", unlock);
  window.addEventListener("keydown", unlock);

  console.log("[TTS] Waiting for user interaction to unlock autoplay...");
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildGoogleTTSUrl(text: string, language: string): string {
  const lang = language === "id" ? "id" : language;
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
}

function chunkText(text: string, maxLength = 180): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?,])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength) {
      if (current) chunks.push(current.trim());
      if (sentence.length > maxLength) {
        const words = sentence.split(" ");
        let wordChunk = "";
        for (const word of words) {
          if ((wordChunk + " " + word).length > maxLength) {
            if (wordChunk) chunks.push(wordChunk.trim());
            wordChunk = word;
          } else {
            wordChunk += (wordChunk ? " " : "") + word;
          }
        }
        current = wordChunk;
      } else {
        current = sentence;
      }
    } else {
      current += (current ? " " : "") + sentence;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    currentAudio = audio;

    audio.onended = () => {
      currentAudio = null;
      resolve();
    };

    audio.onerror = () => {
      console.warn("[TTS] Audio load error — skipping chunk");
      currentAudio = null;
      resolve();
    };

    audio.play().catch((err) => {
      if (err?.name === "NotAllowedError") {
        console.warn(
          "[TTS] NotAllowedError — audio blocked. " +
            "Make sure InitTTSAutoplayUnlock() is called and user has interacted with the page.",
        );
      } else {
        console.error("[TTS] play() error:", err);
      }
      currentAudio = null;
      resolve();
    });
  });
}

async function speakOne(text: string, language: string): Promise<void> {
  const chunks = chunkText(text);
  for (const chunk of chunks) {
    const url = buildGoogleTTSUrl(chunk, language);
    await playAudioUrl(url);
  }
}

async function drainQueue(): Promise<void> {
  if (isSpeaking) return;
  isSpeaking = true;

  while (speechQueue.length > 0) {
    if (!isAudioUnlocked) {
      console.warn(
        "[TTS] Audio not unlocked yet — waiting for user interaction",
      );
      // Wait until unlocked (poll every 500ms, max 30s)
      await waitForUnlock();
    }

    const item = speechQueue.shift()!;
    console.log("[TTS] Speaking:", item.text);
    await speakOne(item.text, item.language);
  }

  isSpeaking = false;
}

function waitForUnlock(timeoutMs = 30000): Promise<void> {
  return new Promise((resolve) => {
    if (isAudioUnlocked) return resolve();

    const interval = setInterval(() => {
      if (isAudioUnlocked) {
        clearInterval(interval);
        resolve();
      }
    }, 300);

    // Give up after timeout
    setTimeout(() => {
      clearInterval(interval);
      resolve(); // resolve anyway so queue doesn't block forever
    }, timeoutMs);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function PlaySpeech(text: string, language = "id"): Promise<void> {
  if (!text?.trim()) return;
  speechQueue.push({ text: text.trim(), language });
  drainQueue();
}

export function StopSpeech(): void {
  speechQueue.length = 0;
  isSpeaking = false;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }

  console.log("[TTS] Stopped and queue cleared");
}

export async function TextToSpeechAndPlay({
  text,
  language = "id",
}: TextToSpeechRequest): Promise<void> {
  if (!text?.trim()) return;
  console.log("[TTS] Queuing:", text);
  await PlaySpeech(text, language);
}

export async function TextToSpeechService({
  text,
}: TextToSpeechRequest): Promise<TextToSpeechResponse> {
  return {
    success: true,
    message: "Google TTS ready",
    data: { textToSpeach: text },
  };
}
