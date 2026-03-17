// /static/js/common/toast.js
// Bootstrap 스타일을 유지한 Custom Toast (Bootstrap JS 필요 없음)

function showToast(message, type = "info", duration = 5000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  // 색상 스타일 (Bootstrap CSS 스타일 그대로 사용)
  const colors = {
    info: "bg-primary text-white",
    success: "bg-success text-white",
    warning: "bg-warning text-dark",
    danger: "bg-danger text-white",
    dark: "bg-dark text-white",
  };
  const colorClass = colors[type] || colors.info;

  // Toast 엘리먼트 생성
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center border-0 show ${colorClass}`;
  toastEl.style.cssText = `
    opacity: 0;
    transition: opacity .25s ease, transform .25s ease;
    transform: translateY(10px);
  `;

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
    </div>
  `;

  container.appendChild(toastEl);

  // fade-in
  requestAnimationFrame(() => {
    toastEl.style.opacity = "1";
    toastEl.style.transform = "translateY(0)";
  });

  // 자동 제거
  setTimeout(() => hideToast(toastEl), duration);
}

// 숨기기 애니메이션 후 삭제
function hideToast(el) {
  el.style.opacity = "0";
  el.style.transform = "translateY(10px)";

  // 애니메이션 후 DOM 삭제
  setTimeout(() => {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }, 300);
}
