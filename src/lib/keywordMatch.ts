// keywords.json / personalityKeywords.json 공통 사전 형식과 매칭 규칙(별칭 중 하나라도
// 소문자 변환 후 텍스트에 포함되면 매칭)을 다루는 유틸리티.

export interface KeywordDictEntry {
  category: string;
  id: string;
  aliases: string[];
}

export interface KeywordDict {
  meta?: { total: number; description: string; usage: string };
  keywords: KeywordDictEntry[];
}

// "R", "go", "js", "ts", "ml" 같은 짧은 영문 별칭은 순수 substring 포함 검사로는
// "Oracle"(r), "Django"(go), "JSON/JSP"(js), "results"(ts), "html"(ml) 등 무관한 단어 안에서도
// 매칭돼버린다(예: "r" 별칭 하나로 채용공고 99건 중 88건이 오탐). 영문/숫자 별칭은 앞뒤가
// 영문·숫자로 이어지지 않을 때만(단어 경계) 매칭하고, 한글 별칭은 기존처럼 포함 여부로 매칭한다.
const ALIAS_REGEX_CACHE = new Map<string, RegExp>();

function isAlphanumericAlias(alias: string): boolean {
  return /^[a-z0-9+#.]+$/i.test(alias);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function aliasMatches(haystack: string, alias: string): boolean {
  const lowerAlias = alias.toLowerCase();
  if (!isAlphanumericAlias(alias)) return haystack.includes(lowerAlias);

  let regex = ALIAS_REGEX_CACHE.get(lowerAlias);
  if (!regex) {
    regex = new RegExp(`(?<![a-z0-9])${escapeRegExp(lowerAlias)}(?![a-z0-9])`, "i");
    ALIAS_REGEX_CACHE.set(lowerAlias, regex);
  }
  return regex.test(haystack);
}

export function extractKeywordIds(text: string, dict: KeywordDictEntry[]): Set<string> {
  const haystack = text.toLowerCase();
  const found = new Set<string>();
  if (!haystack.trim()) return found;
  for (const entry of dict) {
    if (entry.aliases.some((alias) => aliasMatches(haystack, alias))) {
      found.add(entry.id);
    }
  }
  return found;
}

export function extractKeywordIdsFromTexts(
  texts: (string | null | undefined)[],
  dict: KeywordDictEntry[]
): Set<string> {
  return extractKeywordIds(texts.filter(Boolean).join("\n"), dict);
}
