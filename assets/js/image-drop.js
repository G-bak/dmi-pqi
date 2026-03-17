// image-drop.js

// =============================
// 모달 생성/제어
// =============================
function ensureMediaModal() {
  let modal = document.querySelector(".media-modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.className = "media-modal";
  modal.innerHTML = `
    <div class="media-modal-dialog">
      <header class="media-modal-header">
        <div class="media-modal-title"></div>
        <button type="button" class="media-modal-close" aria-label="닫기">✕</button>
      </header>
      <div class="media-modal-body">
        <img class="media-modal-img" alt="">
        <video class="media-modal-video" controls></video>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector(".media-modal-close");
  closeBtn.addEventListener("click", () => closeMediaModal());

  // 바깥(오버레이) 클릭 → 닫기
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeMediaModal();
    }
  });

  // ESC로 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMediaModal();
    }
  });

  return modal;
}

function closeMediaModal() {
  const modal = document.querySelector(".media-modal");
  if (!modal) return;
  const video = modal.querySelector(".media-modal-video");
  if (video) {
    video.pause();
    // src를 비워줘야 모바일에서 재생 꼬임 방지
    video.removeAttribute("src");
  }
  modal.classList.remove("open");
}

/**
 * 모달 열기
 * @param {Object} opts
 * @param {string} opts.src  - 이미지 dataURL 또는 비디오 blob/object URL
 * @param {"image"|"video"} opts.kind
 * @param {string} [opts.label] - 상단 타이틀(예: "양품", "불량", "클립 #1")
 */
function openMediaModal({ src, kind, label = "" }) {
  if (!src) return;

  const modal = ensureMediaModal();
  const titleEl = modal.querySelector(".media-modal-title");
  const imgEl = modal.querySelector(".media-modal-img");
  const videoEl = modal.querySelector(".media-modal-video");

  if (titleEl) {
    titleEl.textContent = label || (kind === "video" ? "동영상 보기" : "이미지 보기");
  }

  if (!imgEl || !videoEl) return;

  if (kind === "video") {
    // 이미지 숨김
    imgEl.style.display = "none";
    imgEl.removeAttribute("src");

    // 비디오 설정
    videoEl.style.display = "block";
    videoEl.src = src;
    videoEl.load();

    // 🔥 기본 볼륨 절반
    videoEl.volume = 0.5;

    // 🔥 자동재생 금지 (play 호출 X)
  } else {
    // 비디오 숨기고 리셋
    videoEl.pause();
    videoEl.style.display = "none";
    videoEl.removeAttribute("src");

    imgEl.style.display = "block";
    imgEl.src = src;
  }

  modal.classList.add("open");
}

// =============================
// 드롭존 미리보기
// =============================
/**
 * dropzone에 올린 파일을 미리보기로 표시
 * - 이미지: 배경 썸네일 + zone.dataset.src / zone.dataset.kind="image"
 * - 동영상: 텍스트 "동영상: 파일명" + zone.dataset.src / zone.dataset.kind="video"
 */
function previewFileOnZone(zone, file, { acceptVideo } = { acceptVideo: true }) {
  if (!file) return;

  const type = file.type;
  const textEl = zone.querySelector(".dz-text");

  // 이미지
  if (type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      zone.style.backgroundImage = `url('${dataUrl}')`;
      zone.classList.add("has-image");
      zone.classList.remove("has-video");
      zone.dataset.src = dataUrl;
      zone.dataset.kind = "image";
      zone.dataset.filename = file.name || "";
      zone.dataset.ext = file.name.split(".").pop().toUpperCase();

      if (textEl) {
        textEl.textContent = "";
      }
    };
    reader.readAsDataURL(file);
    return;
  }

  // 동영상
  if (type.startsWith("video/")) {
    if (!acceptVideo) {
      alert("이 영역은 동영상 업로드를 지원하지 않습니다. 이미지만 올려주세요.");
      return;
    }

    // 1) 비디오를 Base64로 저장 (영상 전체)
    const reader = new FileReader();
    reader.onload = (e) => {
      const videoBase64 = e.target.result;     // data:video/mp4;base64,...

      // 2) 썸네일 생성
      generateVideoThumbnail(file, ({ thumbUrl }) => {
        // dataset에 모두 저장
        zone.dataset.src = videoBase64;
        zone.dataset.thumb = thumbUrl || "";   // 🔥 JSON 저장용
        zone.dataset.kind = "video";
        zone.dataset.filename = file.name || "";
        zone.dataset.ext = file.name.split(".").pop().toUpperCase();

        // 화면 표시
        if (thumbUrl) {
          zone.style.backgroundImage = `url('${thumbUrl}')`;
        } else {
          zone.style.backgroundImage = "";
        }
        zone.classList.add("has-video");
        zone.classList.remove("has-image");

        const textEl = zone.querySelector(".dz-text");
        if (textEl) textEl.textContent = "";
      });
    };

    // Base64 읽기 시작
    reader.readAsDataURL(file);
    return;
  }

  // 그 외 타입
  alert("이미지 또는 동영상 파일만 업로드할 수 있습니다.");
}

/**
 * 개별 dropzone에 드래그앤드롭 + 클릭 업로드 연결
 * @param {HTMLElement} zone
 * @param {Object} options
 * @param {boolean} options.acceptVideo - 동영상 허용 여부
 */
function attachDropzone(zone, { acceptVideo } = { acceptVideo: true }) {
  const input = zone.querySelector(".dz-input");
  if (!input) return;

  // 클릭 → 파일 선택
  zone.addEventListener("click", () => {
    input.click();
  });

  // 파일 선택 → 미리보기
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    previewFileOnZone(zone, file, { acceptVideo });
  });

  // 드래그오버
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.remove("dragover");
  });

  // 드롭
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.remove("dragover");

    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;

    previewFileOnZone(zone, file, { acceptVideo });
  });

  // 더블클릭으로 바로 모달 열기 (이미지/동영상 공통)
  zone.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openZoneMedia(zone);
  });
}

/**
 * dropzone에 저장해둔 데이터(src/kind/filename) 기반으로 모달 열기
 */
function openZoneMedia(zone, fallbackLabel) {
  const src = zone.dataset.src;
  const kind = zone.dataset.kind;
  const filename = zone.dataset.filename || "";
  if (!src || !kind) {
    alert("파일이 없습니다.");
    return;
  }

  let label = fallbackLabel || "";
  if (!label && filename) {
    label = filename;
  }

  openMediaModal({ src, kind, label });
}

// =============================
// 확대보기 버튼 연결
// =============================

/**
 * .photo-pair 안의 양품/불량 figure용 확대버튼
 */
function attachPhotoPairZoomButtons(root) {
  const buttons = root.querySelectorAll("figure .btn-zoom");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const figure = btn.closest("figure");
      if (!figure) return;
      const zone = figure.querySelector(".dropzone");
      if (!zone) return;

      const title = figure.querySelector(".title");
      const label = title ? title.textContent.trim() : "";

      openZoneMedia(zone, label);
    });
  });
}

/**
 * .thumbs-video 안의 dropzone-box + 
 * .box.improve .box.pair 안의 개선전/개선후 dropzone-box 확대버튼
 * — 기본은 파일명을 타이틀로, 개선전/후 영역은 h2.cap 텍스트를 타이틀로 사용
 */
function attachClipZoomButtons(root) {
  const boxes = root.querySelectorAll(".dropzone-box");
  const boxesArr = Array.from(boxes);

  boxesArr.forEach((box, idx) => {
    const btn = box.querySelector(".btn-zoom");
    const zone = box.querySelector(".dropzone.clip");
    if (!btn || !zone) return;

    btn.addEventListener("click", () => {
      let label = "";

      // 개선전/개선후 영역인지 체크
      const improveBox = box.closest(".box.improve");
      if (improveBox) {
        const caps = improveBox.querySelectorAll("h2.cap");
        if (caps && caps.length >= 2) {
          // idx: 0 → 개선전, 1 → 개선후
          const cap = caps[idx] || caps[0];
          if (cap) {
            label = cap.textContent.trim();
          }
        }
      }

      // 일반 thumbs-video 영역이거나, cap을 못 찾았으면 파일명 사용
      if (!label) {
        const filename = zone.dataset.filename || "";
        label = filename || "파일 미지정";
      }

      openZoneMedia(zone, label);
    });
  });
}

// =============================
// 초기화 함수 (외부로 export)
// =============================

/**
 * .photo-pair (양품/불량) 초기화
 * - 이미지 전용
 * - 확대보기 버튼 사용
 */
export function initPhotoDropPairs(selector = ".photo-pair") {
  const pairs = document.querySelectorAll(selector);
  pairs.forEach((pair) => {
    // 이미지 전용
    pair.querySelectorAll(".dropzone").forEach((zone) => {
      attachDropzone(zone, { acceptVideo: false });
    });
    attachPhotoPairZoomButtons(pair);
  });
}

/**
 * 원인 영역 등 썸네일 클립(이미지+동영상) 초기화
 * - 기존: .thumbs-video
 * - 추가: .box.improve 안의 .box.pair (개선전/개선후)
 */
export function initClipDropzones(
  selector = ".thumbs-video, .box.improve .box.pair"
) {
  const roots = document.querySelectorAll(selector);
  roots.forEach((root) => {
    root.querySelectorAll(".dropzone.clip").forEach((zone) => {
      attachDropzone(zone, { acceptVideo: true });
    });
    attachClipZoomButtons(root);
  });
}

// 비디오 파일로부터 썸네일(dataURL) 생성
function generateVideoThumbnail(file, callback) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");

  video.preload = "metadata";
  video.src = url;
  video.muted = true;
  video.playsInline = true;

  // 1) 메타데이터가 로드되면 길이/크기 알 수 있음
  video.addEventListener("loadedmetadata", () => {
    const targetTime = 0;
    video.currentTime = targetTime;
  });

  // 3) seeked 이벤트가 오면 실제 프레임 캡처
  video.addEventListener("seeked", () => {
    const w = video.videoWidth;
    const h = video.videoHeight;

    if (!w || !h) {
      callback({ thumbUrl: "", videoUrl: url });
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, w, h);

    const thumbUrl = canvas.toDataURL("image/jpeg", 0.8);
    callback({ thumbUrl, videoUrl: url });

    // 리소스 정리
    video.pause();
  });

  // 실패 대비
  video.addEventListener("error", () => {
    callback({ thumbUrl: "", videoUrl: url });
  });
}
