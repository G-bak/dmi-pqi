// /assets/js/snapshot.js
import { getParamsFromUrl, getYearMonth, makeTimestamp, updatePageFrameHeight, initAutoResizeAll } from "/assets/js/utils.js";
import { importSheetJson, exportSheetJson } from "/assets/js/sheet-quality-json.js";
import { PQI } from "/assets/js/common/pqi-api.js";

// 서버에서 불러오기
async function loadFromServer() {
  // url 파라미터 rel_path, filename 을 읽는다. type = object
  const params = getParamsFromUrl();

  if (!params) {
    showToast("⚠ URL에 파라미터가 없습니다.", "warning");
    return;
  }  

  if (!params.rel_file_path) return;

  showToast("파일을 불러오는 중입니다.", "warning");
  
  const res = await PQI.loadSnapshotByPath(params.rel_file_path);
  console.log("✅ 파일 불러오기 완료 응답:", res);  

  if (res.ok) {
    // 먼저 ui를 그리고 초기화 진행해야함
    importSheetJson(res.data.snapshot, document);

    // 초기화
    initAutoResizeAll("textarea");
    updatePageFrameHeight();      

    showToast(
      `서버에서 파일을 불러왔습니다.
      <br>폴더명: <b>${params.folder_name}</b>
      <br>파일명: <b>${res.data.filename}</b>`, "success"
    );
  } else {
    console.error("load exception:", res);
    showToast("불러오는 중 오류가 발생했습니다.", "danger");
  }
}

// 제목에서 경로 문제 문자 제거
function sanitizeTitle(str) {
  if (!str) return "";
  return str.replaceAll("/", "");   // 🔥 슬래시 제거
}

async function saveToServer() {
  const btnSave = document.getElementById("btnSaveJson");
  btnSave.disabled = true;

  const params = getParamsFromUrl();
  console.log("params: ", params);

  const { year, month } = getYearMonth();   // 예: 2025, 11
  console.log(year, month);

  const titleEl = document.querySelector('[data-field="title"]');
  const titleRaw = titleEl?.value?.trim() ?? "";
  const safeTitle = sanitizeTitle(titleRaw);     // 🔥 여기서 제목 정제    
  const filename = makeTimestamp();
  const foldername = `${safeTitle || "제목없음"}_${params.writer || "이름없음"}`;  

  // 🔹 연/월 라벨 만들기
  const yearLabel = `${year}년`;
  const monthLabel = `${month}월`; // 1~12 그대로 쓰고 싶으면 이렇게
  // const monthLabel = `${String(month).padStart(2, "0")}월`; // 01월, 02월 형태 원하면 이걸로

  // 🔹 공정품질 경로 생성
  const rel_path = `/공정품질 문제 개선안/${yearLabel}/${monthLabel}/${foldername}`;
  console.log("rel_path:", rel_path);
  console.log("파일명: ", filename);

  const jsonFile = exportSheetJson(document);
  console.log(jsonFile);

  const res = await PQI.saveSnapshot(rel_path, filename, jsonFile);
  console.log("✅ 서버 저장 완료 응답:", res);

  if (res.ok) {
    btnSave.disabled = false;
    showToast(`저장 되었습니다.<br>파일명: <b>${foldername}</b>`, "success");

    setTimeout(() => {
      history.back();
    }, 800);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const btnSave = document.getElementById("btnSaveJson");
  if (btnSave) btnSave.addEventListener("click", saveToServer);

  await loadFromServer();
});