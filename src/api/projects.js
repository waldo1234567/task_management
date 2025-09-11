import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const USE_DUMMY = import.meta.env.VITE_USE_DUMMY === 'true';

let _dummyProjects = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Personal',
    description: 'Personal tasks and todos',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'Work',
    description: 'Work related projects',
    createdAt: new Date().toISOString(),
  },
];

function makeHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchProjects(token) {
  if (USE_DUMMY) {
    await new Promise((r) => setTimeout(r, 120));
    return _dummyProjects.map((p) => ({ ...p }));
  }
  const res = await axios.get(`${API_BASE}/projects`, { headers: makeHeaders(token) });
  return res.data;
}

export async function createProject(payload, token) {
  if (USE_DUMMY) {
    const id = String(Date.now());
    const p = { id, name: payload.name, description: payload.description || null, createdAt: new Date().toISOString() };
    _dummyProjects.unshift(p);
    await new Promise((r) => setTimeout(r, 90));
    return { ...p };
  }
  const res = await axios.post(`${API_BASE}/projects`, payload, { headers: makeHeaders(token) });
  return res.data;
}

export default { fetchProjects, createProject };
