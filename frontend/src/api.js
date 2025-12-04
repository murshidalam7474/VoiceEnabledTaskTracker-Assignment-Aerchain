import axios from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const client = axios.create({
  baseURL: API_BASE_URL,
});

export async function fetchTasks(params = {}) {
  const res = await client.get("/tasks", { params });
  return res.data;
}

export async function createTask(payload) {
  const res = await client.post("/tasks", payload);
  return res.data;
}

export async function updateTask(id, payload) {
  const res = await client.put(`/tasks/${id}`, payload);
  return res.data;
}

export async function deleteTask(id) {
  await client.delete(`/tasks/${id}`);
}

export async function parseTranscript(transcript) {
  const res = await client.post("/parse", { transcript });
  return res.data;
}

export async function speechToText(audioBlob) {
  const res = await fetch(`${API_BASE_URL}/speech-to-text`, {
    method: "POST",
    headers: {
      "Content-Type": audioBlob.type || "audio/webm",
    },
    body: audioBlob,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to convert speech to text");
  }

  return res.json();
}



