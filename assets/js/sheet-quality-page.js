// sheet-quality.js
import { initAutoResizeAll, setNowToKoreanDateTimeTextarea, updatePageFrameHeight } from "./utils.js";
import { initPhotoDropPairs, initClipDropzones } from "./image-drop.js";
import { initSheetZoomControls } from "./sheet-zoom.js"; 
import "./sheet-quality-json.js";
// import { initStorageControls } from "/assets/js/sheet-quality-storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1) 모든 textarea 자동 높이
  initAutoResizeAll("textarea");

  // 2) 발생일 textarea에 현재 일시 자동 세팅
  setNowToKoreanDateTimeTextarea("#occurDate");

  // 3) 드롭존 초기화
  initPhotoDropPairs();   // 양품/불량
  initClipDropzones();  // 원인 + 개선전/후 영역 클립(이미지+동영상)

  // 4) 줌 컨트롤 초기화
  initSheetZoomControls();

  // 5) page-frame 높이 보정
  updatePageFrameHeight();
  window.addEventListener("resize", () => {
    updatePageFrameHeight();
    initAutoResizeAll("textarea");
  });

  // initStorageControls();
});