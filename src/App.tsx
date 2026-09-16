import { useEffect, useState } from "react";
import { RoomCard } from "./components/RoomCard";
import { downloadProjectPdf } from "./lib/exportPdf";
import { clearProject, loadProject, saveProject } from "./lib/storage";
import { emptyProject, emptyRoom, type Project, type RoomOrder } from "./lib/types";
import "./App.css";

function startProject(): Project {
  const params = new URLSearchParams(window.location.search);
  const wantsNew = params.has("new") || params.has("fresh");
  if (wantsNew) {
    clearProject();
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    url.searchParams.delete("fresh");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    return emptyProject();
  }
  return loadProject();
}

function shareNewProjectUrl(): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("new", "1");
  return url.toString();
}

export default function App() {
  const [project, setProject] = useState<Project>(() => startProject());
  const [savedFlash, setSavedFlash] = useState(false);
  const [linkFlash, setLinkFlash] = useState(false);

  useEffect(() => {
    saveProject(project);
  }, [project]);

  const updateRoom = (id: string, room: RoomOrder) => {
    setProject((p) => ({
      ...p,
      rooms: p.rooms.map((r) => (r.id === id ? room : r)),
    }));
  };

  const addRoom = () => {
    setProject((p) => ({
      ...p,
      rooms: [...p.rooms, emptyRoom(p.rooms.length + 1)],
    }));
  };

  const removeRoom = (id: string) => {
    setProject((p) => ({
      ...p,
      rooms: p.rooms.filter((r) => r.id !== id),
    }));
  };

  const renameRoom = (id: string, name: string) => {
    setProject((p) => ({
      ...p,
      rooms: p.rooms.map((r) => (r.id === id ? { ...r, name } : r)),
    }));
  };

  const handleSave = () => {
    saveProject(project);
    try {
      downloadProjectPdf(project);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      console.error(err);
      window.alert("Could not create the PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    saveProject(project);
    setProject((p) => ({
      ...p,
      rooms: p.rooms.map((r) => ({ ...r, open: true })),
    }));
    window.setTimeout(() => window.print(), 50);
  };

  const handleReset = () => {
    if (!window.confirm("Clear this project and start fresh?")) return;
    clearProject();
    setProject(emptyProject());
  };

  const handleCopyShareLink = async () => {
    const link = shareNewProjectUrl();
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copy this link to share a new blank order form:", link);
    }
    setLinkFlash(true);
    window.setTimeout(() => setLinkFlash(false), 2000);
  };

  return (
    <div className="app">
      <header className="top">
        <div>
          <p className="brand">RAPP COLLECTIONS</p>
          <h1>Order form</h1>
        </div>
        <div className="top-actions no-print">
          <button type="button" className="btn-secondary" onClick={handleCopyShareLink}>
            {linkFlash ? "Link copied" : "Copy share link"}
          </button>
          <button type="button" className="btn-secondary" onClick={handlePrint}>
            Print
          </button>
          <button type="button" className="btn-secondary" onClick={handleSave}>
            {savedFlash ? "PDF saved" : "Save PDF"}
          </button>
          <button type="button" className="btn-text" onClick={handleReset}>
            New project
          </button>
        </div>
      </header>

      <section className="project-block">
        <label className="field">
          <span>Project name</span>
          <input
            type="text"
            value={project.name}
            onChange={(e) => setProject({ ...project, name: e.target.value })}
            placeholder="Client / project name"
          />
        </label>
      </section>

      <section className="rooms">
        <div className="rooms-toolbar">
          <h2>Rooms</h2>
          <button type="button" className="btn-primary no-print" onClick={addRoom}>
            + Add room
          </button>
        </div>
        {project.rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onChange={(r) => updateRoom(room.id, r)}
            onRename={(name) => renameRoom(room.id, name)}
            onRemove={() => removeRoom(room.id)}
            canRemove={project.rooms.length > 1}
          />
        ))}
      </section>

      <section className="project-block">
        <label className="field">
          <span>Additional notes</span>
          <textarea
            rows={3}
            value={project.notes}
            onChange={(e) => setProject({ ...project, notes: e.target.value })}
            placeholder="Lead time, shipping, special instructions…"
          />
        </label>
      </section>

      <p className="footer-note no-print">
        Draft auto-saves in this browser. Print uses the normal print dialog.
        Blank hand-fill PDF:{" "}
        <a href={`${import.meta.env.BASE_URL}rapp-blank-order-form.pdf`}>
          download blank order form
        </a>
        .
      </p>
    </div>
  );
}
