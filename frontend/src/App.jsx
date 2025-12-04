import React, { useEffect, useMemo, useState } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  parseTranscript,
} from "./api.js";
import { VoiceRecorder } from "./components/VoiceRecorder.jsx";
import { TaskForm } from "./components/TaskForm.jsx";

const STATUS_COLUMNS = [
  { key: "TO_DO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "DONE", label: "Done" },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [view, setView] = useState("board"); // "board" | "list"

  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceParsed, setVoiceParsed] = useState(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [taskToDelete, setTaskToDelete] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchTasks({
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
        dueDate: filterDueDate || undefined,
        search: search || undefined,
      });
      setTasks(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateClick = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, payload);
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } else {
        const created = await createTask(payload);
        setTasks((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditingTask(null);
      setVoiceParsed(null);
      setVoiceTranscript("");
    } catch (e) {
      console.error(e);
      alert("Failed to save task");
    }
  };

  const confirmDelete = (task) => setTaskToDelete(task);

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete task");
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      const updated = await updateTask(task.id, { status });
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleApplyFilters = () => {
    loadTasks();
  };

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterPriority("");
    setFilterDueDate("");
    setSearch("");
    setTimeout(loadTasks, 0);
  };

  const handleVoiceResult = async (transcript) => {
    setVoiceTranscript(transcript);
    setVoiceParsed(null);
    setVoiceError("");
    setVoiceLoading(true);
    try {
      const { parsed } = await parseTranscript(transcript);
      setVoiceParsed(parsed);
      setShowForm(true);
      setEditingTask(null);
    } catch (e) {
      console.error(e);
      setVoiceError("Failed to parse voice input");
    } finally {
      setVoiceLoading(false);
    }
  };

  const initialFormData = useMemo(() => {
    if (editingTask) return editingTask;
    if (!voiceParsed) return null;
    return {
      title: voiceParsed.title || "",
      description: voiceParsed.description || "",
      status: voiceParsed.status || "TO_DO",
      priority: voiceParsed.priority || "MEDIUM",
      dueDate: voiceParsed.dueDate || null,
    };
  }, [editingTask, voiceParsed]);

  const handleCardDragStart = (event, task) => {
    event.dataTransfer.setData("text/plain", String(task.id));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleColumnDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleColumnDrop = async (event, status) => {
    event.preventDefault();
    const idStr = event.dataTransfer.getData("text/plain");
    const id = Number(idStr);
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    await handleStatusChange(task, status);
  };

  const renderTaskCard = (task) => {
    const dateStr = task.dueDate
      ? new Date(task.dueDate).toLocaleString()
      : "No due date";

    return (
      <div
        key={task.id}
        className="task-card"
        draggable
        onDragStart={(e) => handleCardDragStart(e, task)}
      >
        <div className="task-card-header">
          <div className="task-title">{task.title}</div>
          <span className={`pill pill-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>
        {task.description && (
          <div className="task-description">{task.description}</div>
        )}
        <div className="task-meta">
          <span>Due: {dateStr}</span>
        </div>
        <div className="task-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleEditClick(task)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => confirmDelete(task)}
          >
            Delete
          </button>
        </div>
        <div className="task-status-actions">
          {STATUS_COLUMNS.map((col) => (
            <button
              key={col.key}
              className={`btn btn-light btn-xs ${
                task.status === col.key ? "btn-selected" : ""
              }`}
              onClick={() => handleStatusChange(task, col.key)}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderBoard = () => {
    return (
      <div className="board">
        {STATUS_COLUMNS.map((col) => (
          <div
            key={col.key}
            className="board-column"
            onDragOver={handleColumnDragOver}
            onDrop={(e) => handleColumnDrop(e, col.key)}
          >
            <div className="board-column-header">
              <h3>{col.label}</h3>
              <span className="column-count">
                {
                  tasks.filter((t) => t.status === col.key)
                    .length
                }{" "}
                tasks
              </span>
            </div>
            <div className="board-column-body">
              {tasks
                .filter((t) => t.status === col.key)
                .map((t) => renderTaskCard(t))}
              {tasks.filter((t) => t.status === col.key).length === 0 && (
                <div className="empty-column">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderList = () => {
    if (!tasks.length) {
      return <div className="empty-list">No tasks found</div>;
    }
    return (
      <div className="task-list">
        {tasks.map((t) => (
          <div key={t.id} className="task-row">
            <div className="task-row-main">
              <div className="task-title">{t.title}</div>
              {t.description && (
                <div className="task-description">{t.description}</div>
              )}
            </div>
            <div className="task-row-meta">
              <span className={`pill pill-${t.priority.toLowerCase()}`}>
                {t.priority}
              </span>
              <span className="status-label">{t.status}</span>
              <span className="due-label">
                {t.dueDate
                  ? new Date(t.dueDate).toLocaleString()
                  : "No due date"}
              </span>
            </div>
            <div className="task-row-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleEditClick(t)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
              onClick={() => confirmDelete(t)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Voice-Enabled Task Tracker</h1>
          <p className="subtitle">
            Create and manage tasks manually or with natural voice commands.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreateClick}>
            + Add Task
          </button>
          <VoiceRecorder
            onResult={handleVoiceResult}
            disabled={voiceLoading}
          />
        </div>
      </header>

      <section className="toolbar">
        <div className="filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="TO_DO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <input
            type="date"
            value={filterDueDate}
            onChange={(e) => setFilterDueDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search title or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={handleApplyFilters}>
            Apply
          </button>
          <button className="btn btn-light" onClick={handleClearFilters}>
            Clear
          </button>
        </div>
        <div className="view-toggle">
          <button
            className={`btn btn-light ${view === "board" ? "btn-selected" : ""}`}
            onClick={() => setView("board")}
          >
            Board View
          </button>
          <button
            className={`btn btn-light ${view === "list" ? "btn-selected" : ""}`}
            onClick={() => setView("list")}
          >
            List View
          </button>
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}
      {voiceError && <div className="alert alert-error">{voiceError}</div>}
      {voiceLoading && (
        <div className="alert alert-info">Parsing voice input...</div>
      )}

      {voiceTranscript && (
        <section className="voice-preview">
          <h2>Voice Capture</h2>
          <p className="transcript">{voiceTranscript}</p>
          {voiceParsed && (
            <div className="parsed-preview">
              <div>
                <strong>Title:</strong> {voiceParsed.title || "(not detected)"}
              </div>
              <div>
                <strong>Priority:</strong>{" "}
                {voiceParsed.priority || "MEDIUM (default)"}
              </div>
              <div>
                <strong>Status:</strong> {voiceParsed.status || "TO_DO"}
              </div>
              <div>
                <strong>Due Date:</strong>{" "}
                {voiceParsed.dueDate
                  ? new Date(voiceParsed.dueDate).toLocaleString()
                  : "(none)"}
              </div>
            </div>
          )}
        </section>
      )}

      <main className="content">
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : view === "board" ? (
          renderBoard()
        ) : (
          renderList()
        )}
      </main>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>
            <p className="modal-subtitle">
              Review and adjust the details before saving.
            </p>
            <TaskForm
              initial={initialFormData || editingTask}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}

      {taskToDelete && (
        <div className="modal-backdrop">
          <div className="modal small-modal">
            <h2>Delete Task</h2>
            <p className="modal-subtitle">
              Are you sure you want to delete “{taskToDelete.title}”? This action cannot be undone.
            </p>
            <div className="form-actions">
              <button
                className="btn btn-light"
                onClick={() => setTaskToDelete(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


