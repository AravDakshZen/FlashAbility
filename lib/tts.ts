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

export function isTtsSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

const PREFERRED_LANGS = ["en-IN", "en-GB", "en-US", "hi-IN"];

export function pickVoice(lang?: string): SpeechSynthesisVoice | null {
  if (!isTtsSupported()) return null;
  const voices = window.speechSynthesis.getVoices();

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

/** Speaks `text`. Cancels any utterance currently playing. */
export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!isTtsSupported() || !text) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(opts.lang);
  if (voice) utterance.voice = voice;
  utterance.lang = opts.lang ?? voice?.lang ?? "en-IN";
  utterance.rate = opts.rate ?? 0.9; // slightly slower for learners
  utterance.pitch = opts.pitch ?? 1.05;
  if (opts.onStart) utterance.onstart = () => opts.onStart?.();
  if (opts.onEnd) utterance.onend = () => opts.onEnd?.();

  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isTtsSupported()) return;
  window.speechSynthesis.cancel();
}
