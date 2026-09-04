import { NextResponse } from "next/server";

const AGENT_SERVICE_URL =
  process.env.AGENT_SERVICE_URL ?? "https://api.qredi.id";
const AGENT_DEV_USER_ID = process.env.AGENT_DEV_USER_ID ?? "";
const HISTORY_MAX_TURNS = Number(process.env.HISTORY_MAX_TURNS ?? 10);

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  question: string;
  history?: ChatMessage[];
  /** UUID user yang sedang login, dikirim dari client. */
  userId?: string;
}

interface ChatTurnResult {
  answer: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return error("Invalid JSON body", 400);
  }

  const question = body.question?.trim();
  if (!question) {
    return error("`question` is required", 400);
  }

  // Agent service memakai dev auth seam `X-User-Id`. Sumbernya user yang
  // sedang login; AGENT_DEV_USER_ID hanya override untuk pengujian lokal.
  const userId = AGENT_DEV_USER_ID || body.userId?.trim() || "";
  if (!UUID_PATTERN.test(userId)) {
    return error(
      "Sesi pengguna tidak ditemukan. Silakan login ulang sebelum memakai asisten.",
      401,
    );
  }

  const history = (body.history ?? [])
    .slice(-HISTORY_MAX_TURNS * 2)
    .filter(
      (m): m is ChatMessage =>
        m != null &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    );

  let upstream: Response;
  try {
    upstream = await fetch(`${AGENT_SERVICE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
      },
      body: JSON.stringify({ question, history }),
    });
  } catch {
    return error("Failed to reach the agent service", 502);
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return error(
      `Agent service responded ${upstream.status}` + (text ? `: ${text}` : ""),
      upstream.status,
    );
  }

  const result = (await upstream.json()) as ChatTurnResult;
  return NextResponse.json({ answer: result.answer });
}
