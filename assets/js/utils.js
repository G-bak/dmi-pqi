// utils.js

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 페이지 내 모든 textarea 자동 높이 적용
 * @param {string} selector - 기본 "textarea"
 */
export function initAutoResizeAll(selector = "textarea") {
  const list = document.querySelectorAll(selector);
  list.forEach((textarea) => {
    textarea.style.overflow = 'hidden';
    textarea.style.resize = 'none';

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    textarea.addEventListener('input', adjustHeight);
    adjustHeight(); // 초기 한 번 맞추기
  });
}

/**
 * 한국식 날짜·시간 포맷 (예: 2025년 07월 05일(토) 14시 25분)
 */
export function formatKoreanDateTime(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const week = WEEK[date.getDay()];
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  return `${y}년 ${m}월 ${d}일(${week}) ${hh}시 ${mm}분`;
}

/**
 * 특정 textarea에 "현재 일시"를 한국식 포맷으로 넣어줌
 * @param {string} selector - "#occurDate" 같은 CSS 셀렉터
 */
export function setNowToKoreanDateTimeTextarea(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  el.value = formatKoreanDateTime(new Date());
}

export function updatePageFrameHeight() {
  const sheet = document.querySelector('.sheet');
  const frame = document.querySelector('.page-container');
  if (!sheet || !frame) return;

  const h = sheet.offsetHeight;     // 실제 렌더링된 sheet 높이(px)
  frame.style.setProperty('--a4-h', h + 'px');
  frame.style.maxHeight = h + 'px';
}

export function getParamsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const obj = {};

  params.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
}

export function getYearMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JS는 0=1월, 11=12월 → +1 보정
  return { year, month };
}

export function makeTimestamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}${m}${d}_${hh}${mm}${ss}`;
}