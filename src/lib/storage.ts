import type { Project } from "./types";
import { emptyProject, normalizeRoom } from "./types";

const STORAGE_KEY = "rapp-order-form-v2";

export function loadProject(): Project {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("rapp-order-form-v1");
    if (!raw) return emptyProject();
    const parsed = JSON.parse(raw) as {
      name?: string;
      notes?: string;
      rooms?: Record<string, unknown>[];
    };
    if (!parsed || !Array.isArray(parsed.rooms)) return emptyProject();
    return {
      name: parsed.name ?? "",
      notes: parsed.notes ?? "",
      rooms: parsed.rooms.length
        ? parsed.rooms.map((r, i) => normalizeRoom(r, i + 1))
        : emptyProject().rooms,
    };
  } catch {
    return emptyProject();
  }
}

export function saveProject(project: Project): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
}

export function clearProject(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("rapp-order-form-v1");
}
