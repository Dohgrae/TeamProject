import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

// ANTHROPIC_API_KEY 환경변수를 읽어 서버에서만 생성되는 싱글턴 클라이언트.
export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}
