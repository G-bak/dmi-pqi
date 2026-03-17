// /assets/js/sheet-quality-json.js

// ----------------------
// path 유틸
// ----------------------
function setByPath(obj, path, value) {
  if (!path) return;
  const parts = path.split(".");
  let cur = obj;

  parts.forEach((key, idx) => {
    const last = idx === parts.length - 1;

    if (last) {
      if (cur[key] === undefined) {
        cur[key] = value;
      } else if (Array.isArray(cur[key])) {
        cur[key].push(value);
      } else {
        cur[key] = [cur[key], value];
      }
    } else {
      if (cur[key] == null || typeof cur[key] !== "object" || Array.isArray(cur[key])) {
        cur[key] = {};
      }
      cur = cur[key];
    }
  });
}

function getByPath(obj, path) {
  if (!path) return undefined;
  const parts = path.split(".");
  let cur = obj;

  for (const key of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[key];
  }
  return cur;
}

// ----------------------
// export (폼 -> JSON)
// ----------------------
export function exportSheetJson(root = document) {
  const data = {};

  // 1) 텍스트 필드 (textarea, input, select)
  const textFields = root.querySelectorAll("[data-field]:is(textarea, input, select)");
  textFields.forEach((el) => {
    const path = el.getAttribute("data-field");
    if (!path) return;
    const value = (el.value ?? "").trim();
    setByPath(data, path, value);
  });

  // 2) 미디어 드롭존 (이미지/영상)
  //    image-drop.js 에서 이미 zone.dataset.src / kind / filename / ext 세팅해둔 것 사용
  const mediaZones = root.querySelectorAll("[data-field][data-type]");
  mediaZones.forEach((zone) => {
    const path = zone.getAttribute("data-field");
    if (!path) return;

    const src = zone.dataset.src || "";          // 이미지: dataURL, 동영상: 현재 blob URL
    if (!src) return;                            // 파일 없으면 스킵

    const kind = zone.dataset.kind || "";        // "image" or "video"
    const filename = zone.dataset.filename || "";
    const ext = zone.dataset.ext || "";

    const value = { src, thumb: zone.dataset.thumb || "", kind, filename, ext };
    setByPath(data, path, value);
  });

  return data;
}

// ----------------------
// import (JSON -> 폼)
// ----------------------
function applyZoneMediaFromValue(zone, value) {
  if (!zone || !value || !value.src) return;

  // 🔥 thumb까지 같이 구조분해
  const { src, kind, filename, ext, thumb } = value;

  zone.dataset.src = src;

  // 🔥 JSON에 thumb가 있으면 dataset에도 복원
  if (thumb) {
    zone.dataset.thumb = thumb;
  } else {
    // 없으면 기존 값 삭제(선택)
    delete zone.dataset.thumb;
  }

  if (kind) zone.dataset.kind = kind;
  else {
    // kind가 비어있으면 src 보고 추정
    zone.dataset.kind = src.startsWith("data:video") ? "video" : "image";
  }
  if (filename) zone.dataset.filename = filename;
  if (ext) zone.dataset.ext = ext;

  const textEl = zone.querySelector(".dz-text");
  if (textEl) textEl.textContent = "";

  // 드롭존 스타일 재설정
  if (zone.dataset.kind === "image") {
    // 이미지는 src 그대로 배경으로
    zone.style.backgroundImage = `url('${src}')`;
    zone.classList.add("has-image");
    zone.classList.remove("has-video");
  } else if (zone.dataset.kind === "video") {
    // 🔥 우선순위: thumb 있으면 썸네일, 없으면 배경 없음(혹은 src로 대체 가능)
    if (thumb) {
      zone.style.backgroundImage = `url('${thumb}')`;
    } else {
      zone.style.backgroundImage = "";
      // 또는: zone.style.backgroundImage = `url('${src}')`;  // src가 썸네일 이미지인 구조라면
    }
    zone.classList.add("has-video");
    zone.classList.remove("has-image");
  }
}

export function importSheetJson(jsonData, root = document) {
  const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

  // 1) 텍스트 필드 복원
  const textFields = root.querySelectorAll("[data-field]:is(textarea, input, select)");
  textFields.forEach((el) => {
    const path = el.getAttribute("data-field");
    if (!path) return;

    const v = getByPath(data, path);
    if (v === undefined || v === null) return;

    if (Array.isArray(v)) {
      el.value = v[0] ?? "";
    } else {
      el.value = v;
    }
  });

  // 2) 미디어 드롭존 복원
  const mediaZones = Array.from(root.querySelectorAll("[data-field][data-type]"));
  const byPath = {};

  mediaZones.forEach((zone) => {
    const path = zone.getAttribute("data-field");
    if (!path) return;
    if (!byPath[path]) byPath[path] = [];
    byPath[path].push(zone);
  });

  Object.entries(byPath).forEach(([path, zones]) => {
    const v = getByPath(data, path);
    if (!v) return;

    if (Array.isArray(v)) {
      zones.forEach((zone, idx) => {
        const val = v[idx];
        if (val) applyZoneMediaFromValue(zone, val);
      });
    } else {
      const zone = zones[0];
      if (zone) applyZoneMediaFromValue(zone, v);
    }
  });
}

// export function resetSheet(root = document) {
//   // 텍스트 초기화
//   root.querySelectorAll("[data-field]:is(textarea, input, select)").forEach(el => {
//     el.value = "";
//   });

//   // 드롭존 초기화
//   root.querySelectorAll("[data-field][data-type]").forEach(zone => {
//     zone.style.backgroundImage = "";
//     zone.classList.remove("has-image", "has-video");
//     delete zone.dataset.src;
//     delete zone.dataset.kind;
//     delete zone.dataset.filename;
//     delete zone.dataset.ext;

//     const textEl = zone.querySelector(".dz-text");
//     if (textEl) textEl.textContent = "이미지를 끌어다 놓거나 클릭";
//   });
// }

// ----------------------
// 콘솔용 헬퍼 (테스트)
// ----------------------
if (typeof window !== "undefined") {
  window.QualitySheetJSON = {
    // export: () => exportSheetJson(document),
    // exportString: () => JSON.stringify(exportSheetJson(document), null, 2),
    load: (json) => importSheetJson(json, document),
  };
}
