/**
 * lib/api.js
 * Camada de comunicação com o backend FastAPI.
 * Por enquanto apenas assinaturas — implementar quando o backend estiver pronto.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || 'https://apicreapes.leanttro.com/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ── Cases / Projetos ────────────────────────────────────────────────────────
export const getCases       = ()         => request('GET',    '/cases');
export const getCase        = (id)       => request('GET',    `/cases/${id}`);
export const createCase     = (data)     => request('POST',   '/cases', data);
export const updateCase     = (id, data) => request('PUT',    `/cases/${id}`, data);
export const deleteCase     = (id)       => request('DELETE', `/cases/${id}`);

// ── Categorias (Seções) ─────────────────────────────────────────────────────
export const getCategorias   = ()         => request('GET',    '/categorias');
export const createCategoria = (data)     => request('POST',   '/categorias', data);
export const updateCategoria = (id, data) => request('PUT',    `/categorias/${id}`, data);
export const deleteCategoria = (id)       => request('DELETE', `/categorias/${id}`);

// ── Serviços (Posts / Capabilities) ────────────────────────────────────────
export const getServicos   = ()         => request('GET',    '/servicos');
export const createServico = (data)     => request('POST',   '/servicos', data);
export const updateServico = (id, data) => request('PUT',    `/servicos/${id}`, data);
export const deleteServico = (id)       => request('DELETE', `/servicos/${id}`);

// ── Leads / Inscritos ───────────────────────────────────────────────────────
export const getLeads = () => request('GET', '/leads');

// ── Agenda ──────────────────────────────────────────────────────────────────
export const getAgenda     = ()         => request('GET',    '/agenda');
export const createHorario = (data)     => request('POST',   '/agenda', data);
export const updateHorario = (id, data) => request('PUT',    `/agenda/${id}`, data);
export const deleteHorario = (id)       => request('DELETE', `/agenda/${id}`);

// ── Configurações da loja ───────────────────────────────────────────────────
export const getConfig    = ()     => request('GET',  '/config');
export const updateConfig = (data) => request('PUT',  '/config', data);

// ── Contato (formulário público) ─────────────────────────────────────────────
export const enviarContato = (data) => request('POST', '/contato', data);

// ── Blog ─────────────────────────────────────────────────────────────────────
export const getBlogPosts   = ()         => request('GET',    '/blog');
export const getBlogPost    = (slug)     => request('GET',    `/blog/${slug}`);
export const createBlogPost = (data)     => request('POST',   '/blog', data);
export const updateBlogPost = (id, data) => request('PUT',    `/blog/${id}`, data);
export const deleteBlogPost = (id)       => request('DELETE', `/blog/${id}`);

// ── Upload de arquivos (multipart) ───────────────────────────────────────────
export async function uploadFile(file, endpoint = '/upload') {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}${endpoint}`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Upload error ${res.status}`);
  return res.json(); // { url: string }
}
