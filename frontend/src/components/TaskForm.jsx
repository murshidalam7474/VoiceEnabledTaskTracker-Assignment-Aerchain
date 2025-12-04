import React, { useState } from "react";

const STATUS_OPTIONS = [
  { value: "TO_DO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export function TaskForm({ initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState(initial?.status || "TO_DO");
  const [priority, setPriority] = useState(initial?.priority || "MEDIUM");
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.slice(0, 16) : ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Due Date</label>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}


