// sheet-zoom.js

let sheetZoom = 1;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;

/**
 * 실제로 CSS 변수에 줌 반영 + 라벨 업데이트
 */
function applySheetZoom() {
  document.documentElement.style.setProperty("--sheet-zoom", sheetZoom.toString());
  const label = document.getElementById("zoomLabel");
  if (label) {
    label.textContent = Math.round(sheetZoom * 100) + "%";
  }
}

/**
 * 줌 인/아웃 버튼 초기화
 * - #zoomIn, #zoomOut, #zoomLabel 기준
 */
export function initSheetZoomControls() {
  const btnIn = document.getElementById("zoomIn");
  const btnOut = document.getElementById("zoomOut");

  if (!btnIn || !btnOut) {
    // 버튼 없으면 그냥 리턴
    return;
  }

  btnIn.addEventListener("click", () => {
    sheetZoom = Math.min(ZOOM_MAX, sheetZoom + ZOOM_STEP);
    applySheetZoom();
  });

  btnOut.addEventListener("click", () => {
    sheetZoom = Math.max(ZOOM_MIN, sheetZoom - ZOOM_STEP);
    applySheetZoom();
  });

  // 초기 1회 적용
  applySheetZoom();
}
