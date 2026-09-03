export interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "qredi-chat-history";

const GREETING: Message = {
  role: "assistant",
  content:
    "Halo! Saya Qredibot \ud83d\udc4b Saya siap membantu Anda memahami skor kredit dan menemukan informasi pembiayaan yang sesuai.",
};

const SERVER_SNAPSHOT: Message[] = [GREETING];

let cached: Message[] | null = null;
const listeners = new Set<() => void>();

function read(): Message[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SERVER_SNAPSHOT;
    const parsed = JSON.parse(raw) as Message[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SERVER_SNAPSHOT;
  } catch {
    return SERVER_SNAPSHOT;
  }
}

function getSnapshot(): Message[] {
  if (cached === null) cached = read();
  return cached;
}

function getServerSnapshot(): Message[] {
  return SERVER_SNAPSHOT;
}

function emit() {
  for (const fn of listeners) fn();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cached = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function setMessages(
  updater: Message[] | ((prev: Message[]) => Message[]),
): void {
  const prev = getSnapshot();
  const next =
    typeof updater === "function"
      ? (updater as (p: Message[]) => Message[])(prev)
      : updater;
  if (next === prev) return;
  cached = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  emit();
}

export const chatHistory = {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  setMessages,
};

export { GREETING };
