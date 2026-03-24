import { api } from "./api";

export type ChatHistoryMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

type ChatRequestBody = {
  message: string;
  history?: ChatHistoryMessage[];
};

type ChatResponse = {
  reply: string;
  role: "model";
};

function resolveChatEndpoint(): string {
  const explicitUrl = (process.env.EXPO_PUBLIC_CHATBOT_URL || "").trim();
  if (explicitUrl.length > 0) {
    return explicitUrl;
  }

  const configuredPath = (process.env.EXPO_PUBLIC_CHATBOT_PATH || "/chat").trim();
  return configuredPath.startsWith("/") ? configuredPath : `/${configuredPath}`;
}

export async function sendChatMessage(params: {
  message: string;
  history?: ChatHistoryMessage[];
}): Promise<ChatResponse> {
  const payload: ChatRequestBody = { message: params.message };

  if (params.history && params.history.length > 0) {
    payload.history = params.history;
  }

  const response = await api.post<ChatResponse>(resolveChatEndpoint(), payload, {
    timeout: Number(process.env.EXPO_PUBLIC_CHATBOT_TIMEOUT_MS || 20000),
  });

  return response.data;
}
