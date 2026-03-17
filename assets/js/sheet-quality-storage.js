// /assets/js/sheet-quality-storage.js
import { initAutoResizeAll, updatePageFrameHeight } from "/assets/js/utils.js";
import { exportSheetJson, importSheetJson, resetSheet } from "/assets/js/sheet-quality-json.js";
import { PQI } from "/assets/js/common/pqi-api.js";

// 필요하면 여기만 바꿔서 엔드포인트 맞추면 됨
const BASE_HOST = "127.0.0.1:5502";
// const API_SAVE_URL = `${BASE_HOST}/api/quality-sheet/save`;
const API_LOAD_URL = `${BASE_HOST}/api/quality-sheet/load`;

// function buildUniqueFilename(title) {
//   const base = title.replace(/[\\/:*?"<>|]/g, "_");

//   const now = new Date();
//   const y = now.getFullYear();
//   const m = String(now.getMonth() + 1).padStart(2, "0");
//   const d = String(now.getDate()).padStart(2, "0");
//   const hh = String(now.getHours()).padStart(2, "0");
//   const mm = String(now.getMinutes()).padStart(2, "0");
//   const ss = String(now.getSeconds()).padStart(2, "0");

//   return `${base}__$${y}${m}${d}_${hh}${mm}${ss}.json`;
// }

function getFilenameFromUrl() {
  const params = new URLSearchParams(window.location.search);
  console.log(params);
  const filename = params.get("filename");
  return filename ? filename.trim() : "";
}

// // 실패시 JSON 파일 다운로드
// function downloadJsonFile(filename, dataObj) {
//   const jsonStr = JSON.stringify(dataObj, null, 2);
//   const blob = new Blob([jsonStr], { type: "application/json" });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);

//   URL.revokeObjectURL(url);
// }

// 서버로 저장
// async function saveToServer() {
//   const titleEl = document.querySelector('[data-field="title"]');
//   const titleRaw = titleEl?.value?.trim() ?? "";

//   if (!titleRaw) {
//     showToast("⚠ 제목을 입력해주세요.", "warning");
//     titleEl.focus();
//     titleEl.select();
//     return;
//   }

//   const filename = buildUniqueFilename(titleRaw);
//   const dataObj = exportSheetJson(document);

//   try {
//     showToast("저장 중...", "primary");
//     const res = await fetch(API_SAVE_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ filename, data: dataObj })
//     });

//     if (!res.ok) {
//       console.error("save error:", res.status, await res.text().catch(() => ""));
//       showToast("❌ 서버 오류: JSON 파일로 다운로드합니다.", "danger");
//       downloadJsonFile(filename, dataObj);
//       return;
//     }

//     showToast(`💾 저장 완료: ${filename}`);
//   } catch (err) {
//     console.error("save exception:", err);
//     showToast("❌ 서버 연결 실패: JSON 파일로 다운로드합니다.", "danger");
//     downloadJsonFile(filename, dataObj);
//   }
// }

// 서버에서 불러오기
async function loadFromServer() {
  // filename을 URL 파라미터에서 가져옴
  const filename = getFilenameFromUrl();

  if (!filename) {
    showToast("⚠ URL에 filename 파라미터가 없습니다.", "warning");
    return;
  }  

  try {
    showToast("불러오는 중...", "primary");
    const url = API_LOAD_URL + "?filename=" + encodeURIComponent(filename);
    const res = await fetch(url, { method: "GET" });

    if (!res.ok) {
      console.error("load error:", res.status, await res.text().catch(() => ""));
      showToast("서버에서 파일을 불러오지 못했습니다.", "danger");
      return;
    }

    const json = await res.json();
    // 서버에서 {data: {...}} 로 보낸다고 가정
    const payload = json.data ?? json;
    importSheetJson(payload, document);
    showToast("서버에서 불러오기 완료!", "success");

    initAutoResizeAll("textarea");
    updatePageFrameHeight();
  } catch (err) {
    console.error("load exception:", err);
    showToast("불러오는 중 오류가 발생했습니다.", "danger");
  }
}

// -------------------------------
// 로컬 JSON 업로드
// -------------------------------
// function triggerLocalUpload() {
//   const input = document.getElementById("jsonUploadInput");
//   if (!input) return;
//   input.value = ""; // 같은 파일 다시 선택할 때도 change 이벤트 발생하도록 초기화
//   input.click();
// }

// function handleLocalFileChange() {
//   const input = document.getElementById("jsonUploadInput");
//   if (!input || !input.files || !input.files[0]) return;

//   const file = input.files[0];
//   const reader = new FileReader();

//   showToast(`로컬 파일(${file.name}) 불러오는 중...`, "primary");

//   reader.onload = (e) => {
//     try {
//       const text = e.target.result;
//       const json = JSON.parse(text);

//       // 📌 먼저 전체 리셋 후
//       resetSheet(document);      

//       importSheetJson(json, document);

//       initAutoResizeAll("textarea");
//       updatePageFrameHeight();

//       showToast("로컬 JSON 업로드 완료!", "success");
//     } catch (err) {
//       console.error("upload parse error:", err);
//       showToast("JSON 파일 형식이 올바르지 않습니다.", "danger");
//     }
//   };

//   reader.onerror = (e) => {
//     console.error("upload read error:", e);
//     showToast("파일을 읽는 중 오류가 발생했습니다.", "danger");
//   };

//   reader.readAsText(file, "utf-8");
// }

// -------------------------------
// 초기화
// -------------------------------
export async function initStorageControls() {
  // const btnSave = document.getElementById("btnSaveJson");
  const btnLoad = document.getElementById("btnLoadJson");
  // const btnUpload = document.getElementById("btnUploadJson");
  // const uploadInput = document.getElementById("jsonUploadInput");

  // if (btnSave) btnSave.addEventListener("click", saveToServer);
  if (btnLoad) btnLoad.addEventListener("click", loadFromServer);
  // if (btnUpload) btnUpload.addEventListener("click", triggerLocalUpload);
  // if (uploadInput) uploadInput.addEventListener("change", handleLocalFileChange);

  const response = await PQI.health();  
  if (response.ok) loadFromServer(); 

  const writer = new URLSearchParams(window.location.search).get("writer");
  const signPerson = document.querySelector('[data-field="sign.person"]');
  signPerson.value = writer;
}