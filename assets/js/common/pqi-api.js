// /assets/js/pqi-api.js
import { apiGet, apiPost, loadJsonFile } from "./api.js";

console.log("PQI.JS Load On!");

export const PQI = {
  health: () => apiGet("/api/pqi/health"),
  saveSnapshot: (rel_path, filename, snapshot) =>
    apiPost("/api/pqi/snapshot", { rel_path, filename, snapshot, }, { expect: "json" }),
  loadSnapshotByPath: (relFilePath) =>
    apiGet("/api/pqi/snapshot/file-path", { rel_file_path: relFilePath }, { expect: "json" }),
};
