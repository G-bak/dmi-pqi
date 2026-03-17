console.log("Api.JS load On!");

const BASE_URL = "http://127.0.0.1:8001";

function qs(obj) {
  const p = new URLSearchParams();
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  });
  return p.toString();
}

function pickFilename(res, fallback = "download") {
  const cd = res.headers.get("content-disposition") || "";
  const m = cd.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i);
  const raw = decodeURIComponent(m?.[1] || m?.[2] || m?.[3] || "");
  const safe = raw.trim().replace(/[/\\<>:"|?*\x00-\x1F]/g, "_");
  return safe || fallback;
}

async function apiRequest(
  endpoint,
  { method = "GET", body, params, expect = "json" } = {}
) {
  const url = `${BASE_URL}${endpoint}${params ? `?${qs(params)}` : ""}`;
  const start = performance.now();

  const headers =
    body != null
      ? { "Content-Type": "application/json", Accept: "application/json" }
      : expect === "json"
      ? { Accept: "application/json" }
      : { Accept: "*/*" };

  try {
    const res = await fetch(url, {
      method,
      mode: "cors",
      cache: "no-store",
      headers,
      body: body != null ? JSON.stringify(body) : null,
    });

    const ms = Math.round(performance.now() - start);
    const ctype = res.headers.get("content-type") || "";

    let data, filename;
    if (expect === "text") {
      data = await res.text();
    } else if (expect === "blob") {
      const blob = await res.blob();
      filename = pickFilename(res);
      data = blob;
    } else {
      if (ctype.includes("application/json")) {
        try { data = await res.json(); } catch { data = await res.text(); }
      } else if (ctype.startsWith("text/")) {
        data = await res.text();
      } else {
        const blob = await res.blob();
        filename = pickFilename(res);
        data = blob;
      }
    }

    const mark = res.ok ? "✅" : "⚠️";
    console.log(`${mark} [${method}] ${url} (${res.status}) ${ms}ms`, data);

    return { ok: res.ok, status: res.status, data, ms, url, ctype, filename };
  } catch (err) {
    const ms = Math.round(performance.now() - start);
    console.error(`❌ [${method}] ${url} (${ms}ms)`, err);
    return { ok: false, status: 0, error: err, url, ms };
  }
}

export async function loadJsonFile(endpoint, params) {
  const r = await apiRequest(endpoint, { params, expect: "auto" });
  if (!r.ok) throw new Error(r.data?.message || `HTTP ${r.status}`);
  if (r.ctype?.includes("application/json")) return r.data;
  if (typeof r.data === "string") {
    try { return JSON.parse(r.data); } catch { return r.data; }
  }
  if (r.data instanceof Blob) {
    const text = await r.data.text();
    try { return JSON.parse(text); } catch { return text; }
  }
  return r.data;
}

export const apiGet = (endpoint, params, opts) => apiRequest(endpoint, { ...opts, method: "GET", params });
export const apiPost = (endpoint, body, opts) => apiRequest(endpoint, { ...opts, method: "POST", body });
export const apiPut = (endpoint, body, opts) => apiRequest(endpoint, { ...opts, method: "PUT", body });
export const apiDelete = (endpoint, opts) => apiRequest(endpoint, { ...opts, method: "DELETE" });