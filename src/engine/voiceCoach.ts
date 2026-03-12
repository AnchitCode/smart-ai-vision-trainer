const COOLDOWN_MS = 2000;

let lastSpokenTime = 0;

export function speak(text: string) {
  if (typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) return;

  const now = Date.now();
  if (now - lastSpokenTime < COOLDOWN_MS) return;

  const synth = window.speechSynthesis;
  if (!synth || synth.speaking) return;

  lastSpokenTime = now;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  synth.speak(utterance);
}

