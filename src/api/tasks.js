import axios from 'axios';

// Use Vite env variables. Define VITE_API_URL in .env for production/dev overrides.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6060/api';
const USE_DUMMY = import.meta.env.VITE_USE_DUMMY === 'true';

// simple in-memory tasks for dev when USE_DUMMY is enabled
// shape the dummy data to resemble the backend TaskResponse DTO
let _now = new Date().toISOString();
let _dummyTasks = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    projectId: null,
    title: 'Sample task A',
    description: 'Example to do',
    status: 'TODO',
    assigneeAuth0Id: null,
    dueDate: null,
    priority: 3,
    createdAt: _now,
    updatedAt: _now,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    projectId: null,
    title: 'Sample task B',
    description: 'Working on this',
    status: 'INPROGRESS',
    assigneeAuth0Id: null,
    dueDate: null,
    priority: 2,
    createdAt: _now,
    updatedAt: _now,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    projectId: null,
    title: 'Sample task C',
    description: 'Already done',
    status: 'DONE',
    assigneeAuth0Id: null,
    dueDate: null,
    priority: 4,
    createdAt: _now,
    updatedAt: _now,
  },
];


function makeHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeStatus(s) {
  if (!s && s !== 0) return s;
  const map = {
    todo: 'TODO',
    inprogress: 'INPROGRESS',
    done: 'DONE',
    blocked: 'BLOCKED',
    TODO: 'TODO',
    INPROGRESS: 'INPROGRESS',
    DONE: 'DONE',
    BLOCKED: 'BLOCKED',
  };
  return map[String(s).toLowerCase()] || String(s).toUpperCase();
}

export async function fetchTasks(token, projectId = null) {
  if (USE_DUMMY) {
    // emulate network
    await new Promise((r) => setTimeout(r, 120));
    // return a shallow clone and filter by projectId when provided
    return _dummyTasks.filter((t) => (projectId ? String(t.projectId) === String(projectId) : true)).map((t) => ({ ...t }));
  }
  const url = projectId ? `${API_BASE}/tasks-by-project/${encodeURIComponent(projectId)}` : `${API_BASE}/tasks`;
  const res = await axios.get(url, { headers: makeHeaders(token) });
  return res.data;
}

export async function createTask(task, token) {
  if (USE_DUMMY) {
    const id = String(Date.now());
    const now = new Date().toISOString();
    const t = {
      id,
      projectId: task.projectId || null,
      title: task.title,
      description: task.description || null,
      status: normalizeStatus(task.status) || 'TODO',
      assigneeAuth0Id: task.assigneeAuth0Id || null,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      priority: typeof task.priority === 'number' ? task.priority : 3,
      createdAt: now,
      updatedAt: now,
    };
    _dummyTasks.unshift(t);
    await new Promise((r) => setTimeout(r, 90));
    return { ...t };
  }
  // ensure status enum matches backend expectations
  const payload = { ...task };
  console.log(payload);
  if (payload.status) payload.status = normalizeStatus(payload.status);
  if (payload.dueDate) payload.dueDate = new Date(payload.dueDate).toISOString();
  const res = await axios.post(`${API_BASE}/tasks`, payload, { headers: makeHeaders(token) });
  return res.data;
}

export async function updateTask(id, updates, token) {
  if (USE_DUMMY) {
    const idx = _dummyTasks.findIndex((d) => d.id === String(id));
    if (idx !== -1) {
      const upd = { ...updates };
      if (upd.status) upd.status = normalizeStatus(upd.status);
      if (upd.dueDate) upd.dueDate = new Date(upd.dueDate).toISOString();
      _dummyTasks[idx] = { ..._dummyTasks[idx], ...upd, updatedAt: new Date().toISOString() };
      await new Promise((r) => setTimeout(r, 90));
      return { ..._dummyTasks[idx] };
    }
    throw new Error('Not found');
  }
  const payload = { ...updates };
  if (payload.status) payload.status = normalizeStatus(payload.status);
  if (payload.dueDate) payload.dueDate = new Date(payload.dueDate).toISOString();
  const res = await axios.put(`${API_BASE}/tasks/${id}`, payload, { headers: makeHeaders(token) });
  return res.data;
}

export async function moveTask(id, body = {}, token) {
  if (USE_DUMMY) {
    // naive local update: find task and set columnId/status/positionIndex if provided
    const idx = _dummyTasks.findIndex((d) => d.id === String(id));
    if (idx !== -1) {
      const upd = { ...body };
      if (upd.status) upd.status = normalizeStatus(upd.status);
      _dummyTasks[idx] = { ..._dummyTasks[idx], ...upd, updatedAt: new Date().toISOString() };
      await new Promise((r) => setTimeout(r, 80));
      return { ..._dummyTasks[idx] };
    }
    throw new Error('Not found');
  }
  const res = await axios.post(`${API_BASE}/api/tasks/${id}/move`, body, { headers: makeHeaders(token) });
  return res.data;
}

export async function deleteTask(id, token) {
  if (USE_DUMMY) {
    _dummyTasks = _dummyTasks.filter((d) => d.id !== String(id));
    await new Promise((r) => setTimeout(r, 80));
    return { ok: true };
  }
  const res = await axios.delete(`${API_BASE}/tasks/${id}`, { headers: makeHeaders(token) });
  return res.data;
}

export default { fetchTasks, createTask, updateTask, deleteTask };
