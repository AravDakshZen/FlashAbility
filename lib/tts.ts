/**
 * Text-to-speech wrapper built on the Web Speech API.
 *
 * Voice preference order: Indian English (en-IN) → British English (en-GB) →
 * US English (en-US), with Hindi (hi-IN) available for multilingual decks.
 *
 * Everything is guarded so this module is safe to import from server code,
 * even though it is only ever *called* from client components.
 */

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

// Indian English is the only voice the app targets.
export const DEFAULT_LANG = "en-IN";

// Read numerals as English words so digits sound correct in Indian English
// (e.g. "10" -> "ten", not a list of digits).
const ONES = [
  "zero", "one", "two", "three", "four", "five",
  "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty",
  "sixty", "seventy", "eighty", "ninety",
];

function numberToWords(n: number): string {
  if (n < 20) return ONES[n] ?? String(n);
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o === 0 ? TENS[t] : `${TENS[t]} ${ONES[o]}`;
  }
  return String(n);
}

function expandNumbers(text: string): string {
  return text.replace(/\b\d{1,2}\b/g, (m) => numberToWords(Number(m)));
}

// Remove emojis and symbols so TTS only reads the words (not "cow emoji", etc).
function stripEmojis(text: string): string {
  return text
    .replace(
      /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]/gu,
      " "
    )
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function isTtsSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

const PREFERRED_LANGS = ["en-IN", "en-GB", "en-US", "hi-IN"];
let cachedVoices: SpeechSynthesisVoice[] | null = null;
let voicesListenerAttached = false;

function attachVoicesListener(): void {
  if (voicesListenerAttached || typeof window === "undefined") return;
  voicesListenerAttached = true;
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoices = window.speechSynthesis.getVoices();
  });
}

function loadVoices(): SpeechSynthesisVoice[] {
  if (!isTtsSupported()) return [];
  attachVoicesListener();
  const v = window.speechSynthesis.getVoices();
  if (v.length > 0) cachedVoices = v;
  return cachedVoices ?? [];
}

export function pickVoice(lang?: string): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (voices.length === 0) return null;

  if (lang) {
    const exact = voices.find((voice) => voice.lang === lang);
    if (exact) return exact;
    const prefix = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(lang.toLowerCase().split("-")[0])
    );
    if (prefix) return prefix;
  }

  for (const preferred of PREFERRED_LANGS) {
    const voice = voices.find((v) => v.lang === preferred);
    if (voice) return voice;
  }

  return voices[0] ?? null;
}

export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!isTtsSupported() || !text.trim()) return;

  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(stripEmojis(expandNumbers(text)));

  const voice = pickVoice(opts.lang);
  if (voice) utterance.voice = voice;
  // Always pronounce in Indian English (unless a lang is explicitly given).
  utterance.lang = opts.lang ?? DEFAULT_LANG;
  utterance.rate = opts.rate ?? 0.9;
  utterance.pitch = opts.pitch ?? 1.05;
  if (opts.onStart) utterance.onstart = () => opts.onStart?.();
  if (opts.onEnd) utterance.onend = () => opts.onEnd?.();

  // Cancel any in-flight speech before queuing to guarantee no overlap.
  try {
    synth.cancel();
  } catch {
    // Ignore — some browsers throw if synthesis is already busy.
  }
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isTtsSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore.
  }
}
