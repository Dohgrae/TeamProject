"use client";

import { useEffect, useRef, useState } from "react";
import { WORK_INTERVIEW_ACKS, WORK_INTERVIEW_QUESTIONS } from "@/lib/constants";

interface Message {
  role: "assistant" | "user";
  text: string;
}

interface WorkExperienceInterviewModalProps {
  onComplete: (answers: string[], keywords: string[]) => void;
  onCancel: () => void;
}

function randomAck(): string {
  return WORK_INTERVIEW_ACKS[Math.floor(Math.random() * WORK_INTERVIEW_ACKS.length)];
}

export function WorkExperienceInterviewModal({ onComplete, onCancel }: WorkExperienceInterviewModalProps) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: WORK_INTERVIEW_QUESTIONS[0] }]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [finishing, setFinishing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, finishing]);

  async function finalize(allAnswers: string[]) {
    setFinishing(true);
    try {
      const res = await fetch("/api/work-interview-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: allAnswers }),
      });
      const data = await res.json();
      onComplete(allAnswers, res.ok && Array.isArray(data.keywords) ? data.keywords : []);
    } catch {
      // 키워드 추출은 내부용 부가 기능이므로, 실패해도 사용자의 답변 자체는 저장한다.
      onComplete(allAnswers, []);
    } finally {
      setFinishing(false);
    }
  }

  function submit() {
    const answer = input.trim();
    if (!answer || finishing) return;

    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setInput("");

    if (nextAnswers.length < WORK_INTERVIEW_QUESTIONS.length) {
      const nextQuestion = WORK_INTERVIEW_QUESTIONS[nextAnswers.length];
      setMessages((prev) => [
        ...prev,
        { role: "user", text: answer },
        { role: "assistant", text: randomAck() },
        { role: "assistant", text: nextQuestion },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: answer },
        { role: "assistant", text: "말씀해주셔서 감사해요! 잘 정리해서 저장할게요." },
      ]);
      finalize(nextAnswers);
    }
  }

  const progress = answers.length;
  const total = WORK_INTERVIEW_QUESTIONS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-900">직장 경험 기록하기</h2>
            <p className="text-xs text-gray-400">
              {Math.min(progress + 1, total)} / {total}
            </p>
          </div>
          <button type="button" onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600">
            취소
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {finishing && <div className="text-sm text-gray-400">저장하는 중이에요...</div>}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex gap-2 border-t border-gray-100 p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={finishing}
            placeholder="답변을 입력해주세요"
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={finishing || !input.trim()}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
