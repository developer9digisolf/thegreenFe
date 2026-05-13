// ─────────────────────────────────────────────────────────────────────────────
// text-to-speech.service.ts
// Dual-Engine TTS: Web Speech API (Neural) + Google Translate Fallback
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
    textToSpeech?: string;
  };
}

// ─── Module-level singleton state ─────────────────────────────────────────────

let isAudioUnlocked = false;
let isSpeaking = false;
const speechQueue: Array<{ text: string; language: string }> = [];
let currentAudio: HTMLAudioElement | null = null;

// ─── Autoplay unlock ──────────────────────────────────────────────────────────

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

        // Warm up speech synthesis
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance("");
          utterance.volume = 0;
          window.speechSynthesis.speak(utterance);
        }

        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
      })
      .catch(() => {});
  };

  window.addEventListener("click", unlock);
  window.addEventListener("touchstart", unlock);
  window.addEventListener("keydown", unlock);
}

// ─── Voice Management ────────────────────────────────────────────────────────

function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  const targetLang = lang.toLowerCase().replace("_", "-");

  // Priority 1: Female Neural voices (Edge/Chrome) - "Gadis" is the standard female ID voice in Edge
  const femaleNeural = voices.find(
    (v) =>
      v.lang.toLowerCase().includes(targetLang) &&
      v.name.includes("Neural") &&
      (v.name.includes("Gadis") || v.name.includes("Female") || v.name.includes("Google"))
  );
  if (femaleNeural) return femaleNeural;

  // Priority 2: Any Neural voice
  const anyNeural = voices.find(
    (v) => v.lang.toLowerCase().includes(targetLang) && v.name.includes("Neural")
  );
  if (anyNeural) return anyNeural;

  // Priority 3: Google voices (usually very natural female)
  const googleVoice = voices.find(
    (v) => v.lang.toLowerCase().includes(targetLang) && v.name.includes("Google")
  );
  if (googleVoice) return googleVoice;

  // Priority 4: Standard voices for the language
  const langVoice = voices.find((v) => v.lang.toLowerCase().includes(targetLang));
  if (langVoice) return langVoice;

  return null;
}

// ─── Speech Engines ──────────────────────────────────────────────────────────

/**
 * Engine 1: Web Speech API (High Quality / Natural)
 */
function speakWithWebSpeech(text: string, language: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return resolve(false);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getBestVoice(language);

    if (voice) {
      utterance.voice = voice;
      console.log(`[TTS] Using browser voice: ${voice.name}`);
    } else {
      utterance.lang = language === "id" ? "id-ID" : language;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => resolve(true);
    utterance.onerror = (e) => {
      console.warn("[TTS] WebSpeech error, falling back to Google:", e);
      resolve(false);
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Engine 2: Google Translate (Robust Fallback)
 */
function buildGoogleTTSUrl(text: string, language: string): string {
  const lang = language === "id" ? "id" : language;
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
}

function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => { currentAudio = null; resolve(); };
    audio.onerror = () => { currentAudio = null; resolve(); };
    audio.play().catch(() => { currentAudio = null; resolve(); });
  });
}

// ─── Queue Management ────────────────────────────────────────────────────────

function chunkText(text: string, maxLength = 160): string[] {
  if (text.length <= maxLength) return [text];
  return text.match(new RegExp(`.{1,${maxLength}}(\\s|$)`, "g")) || [text];
}

async function speakOne(text: string, language: string): Promise<void> {
  // Try Web Speech API first
  const success = await speakWithWebSpeech(text, language);
  
  // If failed or not supported, fallback to Google Translate
  if (!success) {
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      await playAudioUrl(buildGoogleTTSUrl(chunk, language));
    }
  }
}

async function drainQueue(): Promise<void> {
  if (isSpeaking) return;
  isSpeaking = true;

  while (speechQueue.length > 0) {
    if (!isAudioUnlocked) await waitForUnlock();
    const item = speechQueue.shift()!;
    await speakOne(item.text, item.language);
  }

  isSpeaking = false;
}

function waitForUnlock(timeoutMs = 10000): Promise<void> {
  return new Promise((resolve) => {
    if (isAudioUnlocked) return resolve();
    const start = Date.now();
    const interval = setInterval(() => {
      if (isAudioUnlocked || Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve();
      }
    }, 200);
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
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export async function TextToSpeechAndPlay({
  text,
  language = "id",
}: TextToSpeechRequest): Promise<void> {
  console.log("[TTS] Queuing:", text);
  await PlaySpeech(text, language);
}

export async function TextToSpeechService({
  text,
}: TextToSpeechRequest): Promise<TextToSpeechResponse> {
  return {
    success: true,
    message: "TTS Engine Ready",
    data: { textToSpeech: text },
  };
}
