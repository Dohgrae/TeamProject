// =============================================
// 뽑아듀오 — server.js (Node.js + Express)
// =============================================
// 역할
//   1. 정적 파일(index.html, style.css, script.js) 서빙
//   2. GET /api/jobs — 공공기관 채용정보 API 대리 호출 후 JSON 반환
//
// 보안 원칙
//   · API Key는 .env에서만 관리 — 코드에 직접 입력 금지
//   · 프론트엔드(script.js)는 /api/jobs만 호출 → Key 노출 없음
// =============================================

require('dotenv').config();

const express = require('express');
const axios   = require('axios');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ★ 수정 필요 구역 ★
// ─────────────────────────────────────────────
// 사용하는 API의 엔드포인트를 여기서 설정합니다.
// 아래 예시 중 하나를 선택해 주석을 해제하거나,
// 직접 입력하세요.
//
// 알리오(ALIO):     "http://alio.go.kr/openApiSrch.do"
// 워크넷(Work24):   "https://www.work24.go.kr/cm/openApi/call/wantedInfoSrch.do"
// 공공데이터포털:    "http://apis.data.go.kr/1051000/recruitment/list"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const API_BASE_URL = "여기에_공공기관_API_ENDPOINT_입력";

// .env 파일의 PUBLIC_JOB_API_KEY를 읽습니다.
// 이 값은 절대 클라이언트(브라우저)에 전달되지 않습니다.
const SERVICE_KEY = process.env.PUBLIC_JOB_API_KEY;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 정적 파일 서빙 (CORS 불필요 — 같은 서버)
app.use(express.static(path.join(__dirname)));

// ──────────────────────────────────────────────
// GET /api/jobs
// 성공: { success: true,  data: [...] }
// 실패: { success: false, message: "..." }
// ──────────────────────────────────────────────
app.get('/api/jobs', async (req, res) => {

  if (!SERVICE_KEY || SERVICE_KEY === '여기에_내_API_KEY_입력') {
    return res.status(500).json({
      success: false,
      message: '.env 파일에 PUBLIC_JOB_API_KEY를 입력해주세요.'
    });
  }

  try {
    const apiData = await fetchJobListings();
    res.json({ success: true, data: apiData });
  } catch (error) {
    console.error('[/api/jobs 오류]', error.message);
    res.status(500).json({
      success: false,
      message: '채용공고 데이터를 불러오지 못했습니다.'
    });
  }
});

// ──────────────────────────────────────────────
// fetchJobListings()
// 공공기관 API를 실제로 호출하는 함수.
//
// ★ 수정 필요: 사용하는 API 문서에 맞게 params를 수정하세요.
// ──────────────────────────────────────────────
async function fetchJobListings() {
  const params = {
    serviceKey: SERVICE_KEY, // 대부분의 공공 API 공통 인증키
    numOfRows:  10,          // 한 번에 가져올 공고 수
    pageNo:     1,           // 페이지 번호
    resultType: 'json',      // 'json' 또는 'xml' (API마다 다름)

    // ── API별 추가 파라미터 예시 ──
    // 알리오(ALIO):
    //   recrutSe: 'NCS',   // 채용구분
    //   workRgn:  '서울',  // 근무지역
    //
    // 워크넷(Work24):
    //   occupation: '',    // 직종코드
    //   region:     '',    // 지역코드
    //
    // 공공데이터포털:
    //   type:   'json',
    //   pIndex: 1,
    //   pSize:  10,
  };

  const response = await axios.get(API_BASE_URL, {
    params,
    timeout: 8000,
    headers: { Accept: 'application/json' }
  });

  return response.data;
}

// 서버 시작
app.listen(PORT, () => {
  console.log('');
  console.log('✅  뽑아듀오 서버가 실행 중입니다!');
  console.log(`🌐  브라우저: http://localhost:${PORT}`);
  console.log(`🔑  API Key: ${SERVICE_KEY ? '✅ 로드됨' : '❌ 미설정 (.env 확인 필요)'}`);
  console.log('');
});
