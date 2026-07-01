import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropicClient";
import { COMPETENCY_KEYWORDS, WORK_INTERVIEW_QUESTIONS } from "@/lib/constants";
import { mockExtractKeywords } from "@/lib/keywordExtractionMock";

interface RequestBody {
  answers: string[];
}

function buildSystemPrompt(): string {
  return `당신은 구직자-채용공고 매칭 서비스의 백엔드 시스템입니다.
사용자가 직장 경험에 대해 4가지 질문에 답한 내용이 주어집니다. 이 내용을 분석해서, 이 경험이 보여주는 역량과 의미상 가장 가까운 표현을 아래 [키워드 사전]에서만 골라주세요. 사전에 없는 표현은 절대로 새로 만들지 마세요.

이 결과는 사용자에게 보여지지 않고, 채용공고와의 매칭을 위해 회사 내부 시스템에서만 사용됩니다.

[키워드 사전]
${COMPETENCY_KEYWORDS.join(", ")}

JSON으로만 응답하세요: {"keywords": ["...", "..."]}`;
}

function buildUserMessage(answers: string[]): string {
  return WORK_INTERVIEW_QUESTIONS.map(
    (q, i) => `Q${i + 1}. ${q}\nA${i + 1}. ${answers[i] ?? ""}`,
  ).join("\n\n");
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const { answers } = body;

  if (
    !Array.isArray(answers) ||
    answers.length !== WORK_INTERVIEW_QUESTIONS.length
  ) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ keywords: mockExtractKeywords(answers) });
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: buildSystemPrompt(),
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              keywords: { type: "array", items: { type: "string" } },
            },
            required: ["keywords"],
            additionalProperties: false,
          },
        },
      },
      messages: [{ role: "user", content: buildUserMessage(answers) }],
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );
    const parsed = textBlock
      ? (JSON.parse(textBlock.text) as { keywords: string[] })
      : { keywords: [] };
    return NextResponse.json({ keywords: parsed.keywords ?? [] });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status ?? 500 },
      );
    }
    return NextResponse.json({ error: "unexpected error" }, { status: 500 });
  }
}
