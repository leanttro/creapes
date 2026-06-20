/**
 * lib/api.js
 * Camada de comunicação com o backend FastAPI.
 * Rotas de escrita e leitura de dados sensíveis enviam o JWT automaticamente.
 */

const BASE = '/api';

// ── Token (localStorage) ─────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem('creapes_admin_token');
}

export function setToken(token) {
  localStorage.setItem('creapes_admin_token', token);
}

export function removeToken() {
  localStorage.removeItem('creapes_admin_token');
}

export function isLoggedIn() {
  return !!getToken();
}

// ── Helpers de request ────────────────────────────────────────────────────────

/** Requisição sem autenticação (rotas públicas). */
async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

/** Requisição autenticada (rotas de admin). Lança erro 401 se sem token. */
async function authRequest(method, path, body) {
  const token = getToken();
  if (!token) throw new Error('Não autenticado.');

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);

  // Token expirado ou inválido → limpa e força novo login
  if (res.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ── Autenticação ──────────────────────────────────────────────────────────────

export async function login(email, senha) {
  const data = await request('POST', '/auth/login', { email, senha });
  setToken(data.access_token);
  return data;
}

export async function logout() {
  removeToken();
  window.location.href = '/login';
}

export async function checkAuth() {
  return authRequest('GET', '/auth/me');
}

// ── Cases / Projetos ──────────────────────────────────────────────────────────
export const getCases       = ()         => request('GET',         '/cases');
export const getCase        = (id)       => request('GET',         `/cases/${id}`);
export const createCase     = (data)     => authRequest('POST',    '/cases', data);
export const updateCase     = (id, data) => authRequest('PUT',     `/cases/${id}`, data);
export const deleteCase     = (id)       => authRequest('DELETE',  `/cases/${id}`);

// ── Categorias ────────────────────────────────────────────────────────────────
export const getCategorias   = ()         => request('GET',        '/categorias');
export const createCategoria = (data)     => authRequest('POST',   '/categorias', data);
export const updateCategoria = (id, data) => authRequest('PUT',    `/categorias/${id}`, data);
export const deleteCategoria = (id)       => authRequest('DELETE', `/categorias/${id}`);

// ── Serviços ──────────────────────────────────────────────────────────────────
export const getServicos   = ()         => request('GET',          '/servicos');
export const createServico = (data)     => authRequest('POST',     '/servicos', data);
export const updateServico = (id, data) => authRequest('PUT',      `/servicos/${id}`, data);
export const deleteServico = (id)       => authRequest('DELETE',   `/servicos/${id}`);

// ── Leads ─────────────────────────────────────────────────────────────────────
export const getLeads = () => authRequest('GET', '/leads');

// ── Agenda ────────────────────────────────────────────────────────────────────
export const getAgenda     = ()         => authRequest('GET',      '/agenda');
export const createHorario = (data)     => authRequest('POST',     '/agenda', data);
export const updateHorario = (id, data) => authRequest('PUT',      `/agenda/${id}`, data);
export const deleteHorario = (id)       => authRequest('DELETE',   `/agenda/${id}`);

// ── Configurações ─────────────────────────────────────────────────────────────
export const getConfig    = ()     => request('GET',       '/config');
export const updateConfig = (data) => authRequest('PUT',   '/config', data);

// ── Contato (formulário público) ──────────────────────────────────────────────
export const enviarContato = (data) => request('POST', '/contato', data);

// ── Blog ──────────────────────────────────────────────────────────────────────
export const getBlogPosts   = ()         => request('GET',         '/blog');
export const getBlogPost    = (slug)     => request('GET',         `/blog/${slug}`);
export const createBlogPost = (data)     => authRequest('POST',    '/blog', data);
export const updateBlogPost = (id, data) => authRequest('PUT',     `/blog/${id}`, data);
export const deleteBlogPost = (id)       => authRequest('DELETE',  `/blog/${id}`);

// ── Upload de arquivos (multipart) ────────────────────────────────────────────
export async function uploadFile(file, endpoint = '/upload') {
  const token = getToken();
  if (!token) throw new Error('Não autenticado.');

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form,
  });

  if (res.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Sessão expirada.');
  }

  if (!res.ok) throw new Error(`Upload error ${res.status}`);
  return res.json();
}
