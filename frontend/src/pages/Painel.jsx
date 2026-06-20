import { useState, useEffect, useCallback } from 'react';
import {
  Film, Layers, Video, Briefcase, Users, Calendar,
  Settings, Palette, Plus, Edit2, Trash2, X, Save,
  ExternalLink, LogOut, Menu, ChevronDown, GripVertical,
  MessageCircle, CheckCircle, AlertCircle, BookOpen, Loader2,
} from 'lucide-react';
import {
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  getCases, createCase, updateCase, deleteCase,
  getServicos, createServico, updateServico, deleteServico,
  getLeads,
  getAgenda, createHorario, updateHorario, deleteHorario,
  getConfig, updateConfig,
  getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost,
  uploadFile,
} from '../lib/api';

// ── Design tokens (espelha tokens.css) ────────────────────────────────────────
const T = {
  bg:       '#0f1923',
  bg2:      '#111d28',
  bg3:      '#162130',
  border:   '#1e3040',
  text:     '#f5f5f7',
  muted:    '#8a9bb0',
  accent:   '#d0ff00',
  accentDk: '#a8cc00',
  danger:   '#ff4d4d',
  success:  '#22c55e',
  fontHead: "'Space Grotesk', sans-serif",
  fontBody: "'Inter', -apple-system, sans-serif",
};

// ── Estilos base reutilizáveis ────────────────────────────────────────────────
const S = {
  card: {
    background: T.bg2,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: '28px 32px',
  },
  input: {
    width: '100%',
    background: T.bg3,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '10px 14px',
    color: T.text,
    fontFamily: T.fontBody,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: T.accent,
    color: T.bg,
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontFamily: T.fontHead,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    transition: 'background 0.2s, transform 0.1s',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    color: T.muted,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '9px 16px',
    fontFamily: T.fontBody,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'color 0.2s, border-color 0.2s',
  },
  btnSave: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: T.accent,
    color: T.bg,
    border: 'none',
    borderRadius: 8,
    padding: '12px 28px',
    fontFamily: T.fontHead,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    transition: 'background 0.2s',
  },
  th: {
    padding: '12px 20px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: T.muted,
    borderBottom: `1px solid ${T.border}`,
    fontFamily: T.fontHead,
  },
  td: {
    padding: '14px 20px',
    fontSize: 14,
    borderBottom: `1px solid ${T.border}`,
    color: T.text,
    fontFamily: T.fontBody,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: T.fontHead,
    fontSize: 22,
    fontWeight: 700,
    color: T.text,
    textTransform: 'uppercase',
    letterSpacing: '-0.01em',
    marginBottom: 4,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: T.muted,
    marginBottom: 8,
    fontFamily: T.fontHead,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9000, padding:24 }}>
      <div
        onClick={onClose}
        style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(4px)' }}
      />
      <div style={{
        position: 'relative',
        background: T.bg2,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        width: '100%',
        maxWidth: 640,
        maxHeight: '90vh',
        overflowY: 'auto',
        zIndex: 1,
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
      }}>
        <div style={{ padding: '24px 32px', borderBottom: `1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily: T.fontHead, fontWeight: 700, fontSize: 18, color: T.text, textTransform:'uppercase', letterSpacing:'-0.01em' }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color: T.muted, cursor:'pointer', display:'flex', padding:4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: '28px 32px' }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 0 }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function EmptyRow({ cols, text }) {
  return (
    <tr>
      <td colSpan={cols} style={{ ...S.td, textAlign:'center', color: T.muted, padding: '36px 20px' }}>
        {text}
      </td>
    </tr>
  );
}

function LoadingRow({ cols }) {
  return (
    <tr>
      <td colSpan={cols} style={{ ...S.td, textAlign:'center', color: T.muted, padding: '36px 20px' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
          <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> Carregando...
        </span>
      </td>
    </tr>
  );
}

function IconBtn({ onClick, color, children }) {
  return (
    <button onClick={onClick} style={{ background:'none', border:'none', color, cursor:'pointer', padding:6, borderRadius:6, display:'inline-flex', alignItems:'center', transition:'opacity 0.15s' }}>
      {children}
    </button>
  );
}

function AccentBadge({ children, color = T.accent }) {
  return (
    <span style={{
      display: 'inline-block',
      background: color + '18',
      color,
      border: `1px solid ${color}40`,
      borderRadius: 20,
      padding: '2px 10px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.04em',
      fontFamily: T.fontHead,
      textTransform: 'uppercase',
    }}>{children}</span>
  );
}

// ── ABAS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'categorias', label: 'Seções',         icon: Layers },
  { id: 'produtos',   label: 'Vídeos / Projetos', icon: Video },
  { id: 'servicos',   label: 'Serviços',        icon: Briefcase },
  { id: 'blog',       label: 'Blog',            icon: BookOpen },
  { id: 'inscritos',  label: 'Leads',           icon: Users },
  { id: 'agenda',     label: 'Agenda',          icon: Calendar },
  { id: 'sobre',      label: 'Sobre',           icon: Users },
  { id: 'visual',     label: 'Visual',          icon: Palette },
  { id: 'config',     label: 'Config Base',     icon: Settings },
];

const CONFIG_DEFAULT = {
  nome: '', whatsapp_comercial: '', instagram_url: '',
  cor_fundo: '#0f1923', cor_texto: '#f5f5f7', cor_primaria: '#d0ff00',
  fonte_titulo: "'Space Grotesk', sans-serif",
  fonte_texto: "'Inter', -apple-system, sans-serif",
  sobre_titulo: '', sobre_texto: '', logos_clientes: '', audio_url: '',
  logo_url: null,
};

export default function Painel() {
  const [tab, setTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || localStorage.getItem('activePainelCreapesTab') || 'categorias';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [categorias,    setCategorias]    = useState([]);
  const [catLoading,    setCatLoading]    = useState(false);
  const [produtos,      setProdutos]      = useState([]);
  const [prodLoading,   setProdLoading]   = useState(false);
  const [servicos,      setServicos]      = useState([]);
  const [servLoading,   setServLoading]   = useState(false);
  const [leads,         setLeads]         = useState([]);
  const [leadsLoading,  setLeadsLoading]  = useState(false);
  const [agenda,        setAgenda]        = useState([]);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [config,        setConfig]        = useState(CONFIG_DEFAULT);
  const [configLoading, setConfigLoading] = useState(false);
  const [blogPosts,     setBlogPosts]     = useState([]);
  const [blogLoading,   setBlogLoading]   = useState(false);

  const [catModal,   setCatModal]   = useState(false);
  const [catForm,    setCatForm]    = useState({ id:'', nome:'' });
  const [prodModal,  setProdModal]  = useState(false);
  const [prodForm,   setProdForm]   = useState({ id:'', nome:'', categoria_id:'', estoque:'', sort:0, descricao:'', link_projeto:'', whatsapp_projeto:'' });
  const [servicoModal,  setServicoModal]  = useState(false);
  const [servicoForm,   setServicoForm]   = useState({ id:'', titulo:'', resumo:'' });
  const [agendaModal,   setAgendaModal]   = useState(false);
  const [agendaForm,    setAgendaForm]    = useState({ id:'', data_hora:'', disponivel:true, cliente_nome:'' });
  const [blogModal,     setBlogModal]     = useState(false);
  const [blogForm,      setBlogForm]      = useState({ id:'', titulo:'', slug:'', resumo:'', conteudo:'', imagem_capa:'', data_publicacao:'' });

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function selectTab(id) {
    setTab(id);
    localStorage.setItem('activePainelCreapesTab', id);
    window.history.replaceState(null, null, '#' + id);
    setMobileOpen(false);
  }

  const loadCategorias = useCallback(async () => { setCatLoading(true); try { setCategorias(await getCategorias()); } catch { showToast('Erro ao carregar seções.','error'); } finally { setCatLoading(false); } }, []);
  const loadProdutos   = useCallback(async () => { setProdLoading(true); try { setProdutos(await getCases()); } catch { showToast('Erro ao carregar projetos.','error'); } finally { setProdLoading(false); } }, []);
  const loadServicos   = useCallback(async () => { setServLoading(true); try { setServicos(await getServicos()); } catch { showToast('Erro ao carregar serviços.','error'); } finally { setServLoading(false); } }, []);
  const loadLeads      = useCallback(async () => { setLeadsLoading(true); try { setLeads(await getLeads()); } catch { showToast('Erro ao carregar leads.','error'); } finally { setLeadsLoading(false); } }, []);
  const loadAgenda     = useCallback(async () => { setAgendaLoading(true); try { setAgenda(await getAgenda()); } catch { showToast('Erro ao carregar agenda.','error'); } finally { setAgendaLoading(false); } }, []);
  const loadBlog       = useCallback(async () => { setBlogLoading(true); try { setBlogPosts(await getBlogPosts()); } catch { showToast('Erro ao carregar posts.','error'); } finally { setBlogLoading(false); } }, []);
  const loadConfig     = useCallback(async () => {
    setConfigLoading(true);
    try { const data = await getConfig(); setConfig(c => ({ ...CONFIG_DEFAULT, ...(c||{}), ...data })); }
    catch { showToast('Erro ao carregar configurações.','error'); }
    finally { setConfigLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === 'categorias') loadCategorias();
    if (tab === 'produtos')   { loadProdutos(); loadCategorias(); }
    if (tab === 'servicos')   loadServicos();
    if (tab === 'inscritos')  loadLeads();
    if (tab === 'agenda')     loadAgenda();
    if (tab === 'blog')       loadBlog();
    if (['sobre','visual','config'].includes(tab)) loadConfig();
  }, [tab]);

  // CRUD ────
  function openNovaCat()  { setCatForm({ id:'', nome:'' }); setCatModal(true); }
  function openEditCat(c) { setCatForm({ id: c.id, nome: c.nome }); setCatModal(true); }
  async function saveCat() {
    setSaving(true);
    try {
      const slug = catForm.nome.toLowerCase().replace(/\s+/g,'-');
      if (catForm.id) { const u = await updateCategoria(catForm.id,{nome:catForm.nome,slug}); setCategorias(p=>p.map(c=>c.id===catForm.id?u:c)); }
      else { const c = await createCategoria({nome:catForm.nome,slug}); setCategorias(p=>[...p,c]); }
      setCatModal(false); showToast('Seção salva!');
    } catch { showToast('Erro ao salvar seção.','error'); } finally { setSaving(false); }
  }
  async function deleteCat(id) {
    if (!confirm('Excluir esta seção?')) return;
    try { await deleteCategoria(id); setCategorias(p=>p.filter(c=>c.id!==id)); showToast('Seção excluída.','error'); }
    catch { showToast('Erro ao excluir seção.','error'); }
  }

  function openNovoProd()   { setProdForm({ id:'', nome:'', categoria_id:'', estoque:'', sort:0, descricao:'', link_projeto:'', whatsapp_projeto:'' }); setProdModal(true); }
  function openEditProd(p)  { setProdForm({ ...p, sort: p.sort||0 }); setProdModal(true); }
  async function saveProd() {
    setSaving(true);
    try {
      if (prodForm.id) { const u = await updateCase(prodForm.id,prodForm); setProdutos(p=>p.map(x=>x.id===prodForm.id?u:x)); }
      else { const c = await createCase(prodForm); setProdutos(p=>[...p,c]); }
      setProdModal(false); showToast('Projeto salvo!');
    } catch { showToast('Erro ao salvar projeto.','error'); } finally { setSaving(false); }
  }
  async function deleteProd(id) {
    if (!confirm('Excluir este projeto?')) return;
    try { await deleteCase(id); setProdutos(p=>p.filter(x=>x.id!==id)); showToast('Projeto excluído.','error'); }
    catch { showToast('Erro ao excluir.','error'); }
  }

  function openNovoServico()  { setServicoForm({ id:'', titulo:'', resumo:'' }); setServicoModal(true); }
  function openEditServico(s) { setServicoForm({...s}); setServicoModal(true); }
  async function saveServico() {
    setSaving(true);
    try {
      if (servicoForm.id) { const u = await updateServico(servicoForm.id,servicoForm); setServicos(p=>p.map(s=>s.id===servicoForm.id?u:s)); }
      else { const c = await createServico(servicoForm); setServicos(p=>[...p,c]); }
      setServicoModal(false); showToast('Serviço salvo!');
    } catch { showToast('Erro ao salvar.','error'); } finally { setSaving(false); }
  }
  async function deleteServico(id) {
    if (!confirm('Excluir este serviço?')) return;
    try { await deleteServico(id); setServicos(p=>p.filter(s=>s.id!==id)); showToast('Serviço excluído.','error'); }
    catch { showToast('Erro ao excluir.','error'); }
  }

  function openNovoHorario()  { setAgendaForm({ id:'', data_hora:'', disponivel:true, cliente_nome:'' }); setAgendaModal(true); }
  function openEditHorario(h) { setAgendaForm({ ...h, data_hora: h.data_hora?.substring(0,16).replace(' ','T')||'' }); setAgendaModal(true); }
  async function saveHorario() {
    setSaving(true);
    try {
      if (agendaForm.id) { const u = await updateHorario(agendaForm.id,agendaForm); setAgenda(p=>p.map(h=>h.id===agendaForm.id?u:h)); }
      else { const c = await createHorario(agendaForm); setAgenda(p=>[...p,c]); }
      setAgendaModal(false); showToast('Horário salvo!');
    } catch { showToast('Erro ao salvar.','error'); } finally { setSaving(false); }
  }
  async function deleteHorario(id) {
    if (!confirm('Excluir este horário?')) return;
    try { await deleteHorario(id); setAgenda(p=>p.filter(h=>h.id!==id)); showToast('Excluído.','error'); }
    catch { showToast('Erro ao excluir.','error'); }
  }

  function openNovoBlog()   { setBlogForm({ id:'', titulo:'', slug:'', resumo:'', conteudo:'', imagem_capa:'', data_publicacao: new Date().toISOString().split('T')[0] }); setBlogModal(true); }
  function openEditBlog(p)  { setBlogForm({...p}); setBlogModal(true); }
  async function saveBlog() {
    setSaving(true);
    const slug = blogForm.slug || blogForm.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    try {
      if (blogForm.id) { const u = await updateBlogPost(blogForm.id,{...blogForm,slug}); setBlogPosts(p=>p.map(x=>x.id===blogForm.id?u:x)); }
      else { const c = await createBlogPost({...blogForm,slug}); setBlogPosts(p=>[...p,c]); }
      setBlogModal(false); showToast('Post salvo!');
    } catch { showToast('Erro ao salvar.','error'); } finally { setSaving(false); }
  }
  async function deleteBlog(id) {
    if (!confirm('Excluir este post?')) return;
    try { await deleteBlogPost(id); setBlogPosts(p=>p.filter(x=>x.id!==id)); showToast('Post excluído.','error'); }
    catch { showToast('Erro ao excluir.','error'); }
  }

  async function saveConfig(e) {
    e.preventDefault(); setSaving(true);
    try { await updateConfig(config); showToast('Configurações salvas!'); }
    catch { showToast('Erro ao salvar.','error'); } finally { setSaving(false); }
  }

  const activeTabLabel = TABS.find(t => t.id === tab)?.label || '';

  return (
    <div style={{ background: T.bg, minHeight:'100vh', fontFamily: T.fontBody, color: T.text }}>

      {/* ── spin keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 6px; background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        input[type="color"] { -webkit-appearance: none; appearance: none; }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 4px; }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:'fixed', top:20, right:20, zIndex:9999,
          background: toast.type==='error' ? '#3d1212' : '#0f2d1a',
          border: `1px solid ${toast.type==='error' ? T.danger : T.success}`,
          color: toast.type==='error' ? T.danger : T.success,
          borderRadius:10, padding:'14px 20px',
          display:'flex', alignItems:'center', gap:10,
          fontFamily: T.fontBody, fontSize:14, fontWeight:600,
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
          animation:'slideIn 0.25s ease',
          maxWidth: 360,
        }}>
          {toast.type==='error' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* ── Topbar ── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background: T.bg2,
        borderBottom: `1px solid ${T.border}`,
        height: 64,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 32px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}>
        <span style={{ display:'flex', alignItems:'center', gap:10, fontFamily: T.fontHead, fontWeight:700, fontSize:17, color: T.text, letterSpacing:'-0.01em' }}>
          <Film size={20} style={{ color: T.accent }} />
          Painel · <span style={{ color: T.accent }}>{config.nome || 'Creapes'}</span>
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <a href="/" target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:6, color: T.muted, fontSize:13, fontWeight:600, textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.color=T.accent}
            onMouseLeave={e=>e.currentTarget.style.color=T.muted}
          >
            <ExternalLink size={14}/> Ver Site
          </a>
          <a href="/logout" style={{ display:'flex', alignItems:'center', gap:6, color: T.danger, fontSize:13, fontWeight:600, textDecoration:'none', opacity:0.8, transition:'opacity 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='1'}
            onMouseLeave={e=>e.currentTarget.style.opacity='0.8'}
          >
            <LogOut size={14}/> Sair
          </a>
        </div>
      </nav>

      {/* ── Layout ── */}
      <div style={{ display:'flex', paddingTop:64, minHeight:'100vh' }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 220,
          flexShrink: 0,
          background: T.bg2,
          borderRight: `1px solid ${T.border}`,
          padding: '24px 12px',
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            style={{
              display:'none',
              width:'100%', background: T.bg3, border:`1px solid ${T.border}`,
              borderRadius:8, padding:'10px 14px', color: T.text,
              fontFamily: T.fontHead, fontWeight:700, fontSize:13,
              cursor:'pointer', alignItems:'center', justifyContent:'space-between',
              marginBottom:8,
            }}
          >
            <span style={{display:'flex',alignItems:'center',gap:8}}><Menu size={15}/> Menu</span>
            <ChevronDown size={14} style={{ transform: mobileOpen?'rotate(180deg)':'none', transition:'transform 0.3s' }}/>
          </button>

          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color: T.muted, padding:'4px 12px 10px', fontFamily: T.fontHead }}>
            Navegação
          </div>

          <nav>
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap:10,
                    padding:'10px 12px', borderRadius:8, border:'none', cursor:'pointer',
                    fontFamily: T.fontBody, fontWeight: active ? 700 : 500, fontSize:13,
                    color: active ? T.accent : T.muted,
                    background: active ? T.accent + '15' : 'transparent',
                    textAlign:'left', marginBottom:2,
                    transition:'all 0.15s',
                    borderLeft: active ? `2px solid ${T.accent}` : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if(!active) { e.currentTarget.style.background = T.bg3; e.currentTarget.style.color = T.text; }}}
                  onMouseLeave={e => { if(!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.muted; }}}
                >
                  <Icon size={15}/> {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex:1, padding:'32px 36px', maxWidth:1100 }}>

          {/* ══ CATEGORIAS ══ */}
          {tab === 'categorias' && (
            <div style={S.card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
                <div>
                  <div style={S.sectionTitle}><Layers size={18} style={{color:T.accent}}/> Seções do Site</div>
                  <p style={{ color: T.muted, fontSize:13, marginTop:6 }}>Crie categorias <span style={{color:T.accent,fontWeight:700}}>"hero"</span> e <span style={{color:T.accent,fontWeight:700}}>"portfolio"</span> para organizar onde os vídeos aparecem.</p>
                </div>
                <button style={S.btnPrimary} onClick={openNovaCat}><Plus size={14}/> Nova Seção</button>
              </div>
              <div style={{ border:`1px solid ${T.border}`, borderRadius:10, overflow:'hidden' }}>
                {catLoading && (
                  <div style={{ padding:40, textAlign:'center', color: T.muted, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    <Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/> Carregando...
                  </div>
                )}
                {!catLoading && categorias.length === 0 && (
                  <div style={{ padding:40, textAlign:'center', color: T.muted, fontSize:14 }}>Nenhuma seção cadastrada.</div>
                )}
                {categorias.map((cat, i) => (
                  <div key={cat.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'14px 20px',
                    borderBottom: i < categorias.length-1 ? `1px solid ${T.border}` : 'none',
                    transition:'background 0.15s',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background=T.bg3}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <GripVertical size={15} style={{color:T.border,cursor:'move'}}/>
                      <span style={{fontWeight:700,fontSize:14}}>{cat.nome}</span>
                      <span style={{fontSize:11,color:T.muted,fontFamily:'monospace',background:T.bg3,padding:'2px 8px',borderRadius:4}}>/{cat.slug}</span>
                    </div>
                    <div style={{display:'flex',gap:4}}>
                      <IconBtn onClick={()=>openEditCat(cat)} color="#60a5fa"><Edit2 size={15}/></IconBtn>
                      <IconBtn onClick={()=>deleteCat(cat.id)} color={T.danger}><Trash2 size={15}/></IconBtn>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PRODUTOS ══ */}
          {tab === 'produtos' && (
            <div style={S.card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
                <div style={S.sectionTitle}><Video size={18} style={{color:T.accent}}/> Vídeos / Projetos</div>
                <button style={S.btnPrimary} onClick={openNovoProd}><Plus size={14}/> Novo Vídeo</button>
              </div>
              <div style={{ overflowX:'auto', border:`1px solid ${T.border}`, borderRadius:10 }}>
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background: T.bg3}}>
                      {['Ordem','Projeto','Subtítulo / Estilo','Ano','Player Vimeo','Ações'].map((h,i) => (
                        <th key={h} style={{...S.th, textAlign: i===5?'right':'left'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prodLoading && <LoadingRow cols={6}/>}
                    {!prodLoading && produtos.length===0 && <EmptyRow cols={6} text="Nenhum vídeo cadastrado."/>}
                    {produtos.map(prod => (
                      <tr key={prod.id}
                        onMouseEnter={e=>e.currentTarget.style.background=T.bg3}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                        style={{transition:'background 0.15s'}}
                      >
                        <td style={{...S.td, color: T.muted, fontWeight:700, width:70}}>
                          <AccentBadge color={T.muted}>{prod.sort||0}</AccentBadge>
                        </td>
                        <td style={{...S.td, fontWeight:700}}>{prod.nome}</td>
                        <td style={{...S.td, color: T.muted, fontSize:13}}>{prod.descricao}</td>
                        <td style={{...S.td, color: T.muted, fontSize:13}}>{prod.estoque}</td>
                        <td style={{...S.td, fontSize:12}}>
                          {prod.whatsapp_projeto
                            ? <a
                                href={prod.whatsapp_projeto}
                                target="_blank"
                                rel="noreferrer"
                                style={{color:T.accent, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4, fontWeight:600}}
                              >
                                <ExternalLink size={12}/> Ver Player
                              </a>
                            : <span style={{color:T.muted}}>—</span>
                          }
                        </td>
                        <td style={{...S.td, textAlign:'right'}}>
                          <IconBtn onClick={()=>openEditProd(prod)} color="#60a5fa"><Edit2 size={15}/></IconBtn>
                          <IconBtn onClick={()=>deleteProd(prod.id)} color={T.danger}><Trash2 size={15}/></IconBtn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ SERVIÇOS ══ */}
          {tab === 'servicos' && (
            <div style={S.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
                <div style={S.sectionTitle}><Briefcase size={18} style={{color:T.accent}}/> Serviços</div>
                <button style={S.btnPrimary} onClick={openNovoServico}><Plus size={14}/> Novo Serviço</button>
              </div>
              <div style={{border:`1px solid ${T.border}`,borderRadius:10,overflow:'hidden'}}>
                {servLoading && <div style={{padding:40,textAlign:'center',color:T.muted,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}><Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/> Carregando...</div>}
                {!servLoading && servicos.length===0 && <div style={{padding:40,textAlign:'center',color:T.muted,fontSize:14}}>Nenhum serviço cadastrado.</div>}
                {servicos.map((s,i) => (
                  <div key={s.id} style={{
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'16px 20px',
                    borderBottom: i<servicos.length-1 ? `1px solid ${T.border}` : 'none',
                    transition:'background 0.15s',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background=T.bg3}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <div>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{s.titulo}</div>
                      {s.resumo && <div style={{fontSize:13,color:T.muted}}>{s.resumo}</div>}
                    </div>
                    <div style={{display:'flex',gap:4,flexShrink:0}}>
                      <IconBtn onClick={()=>openEditServico(s)} color="#60a5fa"><Edit2 size={15}/></IconBtn>
                      <IconBtn onClick={()=>deleteServico(s.id)} color={T.danger}><Trash2 size={15}/></IconBtn>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ BLOG ══ */}
          {tab === 'blog' && (
            <div style={S.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
                <div style={S.sectionTitle}><BookOpen size={18} style={{color:T.accent}}/> Blog</div>
                <button style={S.btnPrimary} onClick={openNovoBlog}><Plus size={14}/> Novo Post</button>
              </div>
              <div style={{overflowX:'auto',border:`1px solid ${T.border}`,borderRadius:10}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:T.bg3}}>
                    {['Título','Data','Slug','Ações'].map((h,i)=>(
                      <th key={h} style={{...S.th,textAlign:i===3?'right':'left'}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {blogLoading && <LoadingRow cols={4}/>}
                    {!blogLoading && blogPosts.length===0 && <EmptyRow cols={4} text="Nenhum post cadastrado."/>}
                    {blogPosts.map(post=>(
                      <tr key={post.id}
                        onMouseEnter={e=>e.currentTarget.style.background=T.bg3}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                        style={{transition:'background 0.15s'}}
                      >
                        <td style={{...S.td,fontWeight:700}}>{post.titulo}</td>
                        <td style={{...S.td,color:T.muted,fontSize:13}}>{post.data_publicacao}</td>
                        <td style={{...S.td,color:T.muted,fontSize:12,fontFamily:'monospace'}}>{post.slug}</td>
                        <td style={{...S.td,textAlign:'right'}}>
                          <IconBtn onClick={()=>openEditBlog(post)} color="#60a5fa"><Edit2 size={15}/></IconBtn>
                          <IconBtn onClick={()=>deleteBlog(post.id)} color={T.danger}><Trash2 size={15}/></IconBtn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ LEADS ══ */}
          {tab === 'inscritos' && (
            <div style={S.card}>
              <div style={{...S.sectionTitle,marginBottom:28}}><Users size={18} style={{color:T.accent}}/> Leads Inscritos</div>
              <div style={{overflowX:'auto',border:`1px solid ${T.border}`,borderRadius:10}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:T.bg3}}>
                    {['Nome','WhatsApp','E-mail','Data'].map(h=>(
                      <th key={h} style={{...S.th,textAlign:'left'}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {leadsLoading && <LoadingRow cols={4}/>}
                    {!leadsLoading && leads.length===0 && <EmptyRow cols={4} text="Nenhum lead inscrito ainda."/>}
                    {leads.map(lead=>(
                      <tr key={lead.id}
                        onMouseEnter={e=>e.currentTarget.style.background=T.bg3}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                        style={{transition:'background 0.15s'}}
                      >
                        <td style={{...S.td,fontWeight:700}}>{lead.nome}</td>
                        <td style={S.td}>
                          <a href={`https://wa.me/55${lead.whatsapp?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                            style={{display:'inline-flex',alignItems:'center',gap:6,color:T.success,fontWeight:600,fontSize:13,textDecoration:'none'}}>
                            <MessageCircle size={13}/> {lead.whatsapp}
                          </a>
                        </td>
                        <td style={{...S.td,color:T.muted,fontSize:13}}>{lead.email}</td>
                        <td style={{...S.td,color:T.muted,fontSize:13}}>{lead.date_created?.slice(0,10)||'--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ AGENDA ══ */}
          {tab === 'agenda' && (
            <div style={S.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
                <div style={S.sectionTitle}><Calendar size={18} style={{color:T.accent}}/> Agenda / Horários</div>
                <button style={S.btnPrimary} onClick={openNovoHorario}><Plus size={14}/> Novo Horário</button>
              </div>
              <div style={{overflowX:'auto',border:`1px solid ${T.border}`,borderRadius:10}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:T.bg3}}>
                    {['Data / Hora','Status','Cliente','Ações'].map((h,i)=>(
                      <th key={h} style={{...S.th,textAlign:i===3?'right':'left'}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {agendaLoading && <LoadingRow cols={4}/>}
                    {!agendaLoading && agenda.length===0 && <EmptyRow cols={4} text="Nenhum horário cadastrado."/>}
                    {agenda.map(h=>(
                      <tr key={h.id}
                        onMouseEnter={e=>e.currentTarget.style.background=T.bg3}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                        style={{transition:'background 0.15s'}}
                      >
                        <td style={{...S.td,fontWeight:700,fontFamily:'monospace',fontSize:13}}>{h.data_hora?.replace('T',' ')}</td>
                        <td style={S.td}>
                          <AccentBadge color={h.disponivel ? T.success : T.danger}>
                            {h.disponivel ? 'Disponível' : 'Ocupado'}
                          </AccentBadge>
                        </td>
                        <td style={{...S.td,color:T.muted,fontSize:13}}>{h.cliente_nome||'--'}</td>
                        <td style={{...S.td,textAlign:'right'}}>
                          <IconBtn onClick={()=>openEditHorario(h)} color="#60a5fa"><Edit2 size={15}/></IconBtn>
                          <IconBtn onClick={()=>deleteHorario(h.id)} color={T.danger}><Trash2 size={15}/></IconBtn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ SOBRE ══ */}
          {tab === 'sobre' && (
            <form onSubmit={saveConfig} style={S.card}>
              <div style={{...S.sectionTitle,marginBottom:28}}><Users size={18} style={{color:T.accent}}/> Sobre a Produtora</div>
              {configLoading ? (
                <div style={{padding:60,textAlign:'center',color:T.muted,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                  <Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> Carregando...
                </div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
                  <div style={{gridColumn:'1/-1'}}>
                    <Field label="Título da Seção">
                      <input type="text" style={S.input} value={config.sobre_titulo||''} onChange={e=>setConfig(c=>({...c,sobre_titulo:e.target.value}))} placeholder="Ex: We Are Creapes" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                    </Field>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <Field label="Manifesto / Texto Principal">
                      <textarea rows={4} style={{...S.input,resize:'vertical'}} value={config.sobre_texto||''} onChange={e=>setConfig(c=>({...c,sobre_texto:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                    </Field>
                  </div>
                  <div style={{gridColumn:'1/-1',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:20}}>
                    <div style={{fontSize:12,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',color:T.accent,marginBottom:12,fontFamily:T.fontHead}}>Logos dos Clientes</div>
                    <textarea rows={4} style={{...S.input,background:T.bg2,resize:'vertical'}} value={config.logos_clientes||''} onChange={e=>setConfig(c=>({...c,logos_clientes:e.target.value}))} placeholder="Cole os links das imagens (um por linha)..." onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                    <p style={{fontSize:12,color:T.muted,marginTop:8}}>URL direta da imagem, uma por linha.</p>
                  </div>
                </div>
              )}
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:28,paddingTop:20,borderTop:`1px solid ${T.border}`}}>
                <button type="submit" style={S.btnSave} disabled={saving||configLoading}>
                  {saving ? <Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/> : <Save size={15}/>} Salvar
                </button>
              </div>
            </form>
          )}

          {/* ══ VISUAL ══ */}
          {tab === 'visual' && (
            <form onSubmit={saveConfig} style={S.card}>
              <div style={{...S.sectionTitle,marginBottom:28}}><Palette size={18} style={{color:T.accent}}/> Identidade Visual</div>
              {configLoading ? (
                <div style={{padding:60,textAlign:'center',color:T.muted,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                  <Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> Carregando...
                </div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
                  {[['cor_fundo','Cor do Fundo'],['cor_texto','Cor do Texto']].map(([field,label])=>(
                    <Field key={field} label={label}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <input type="color" value={config[field]||'#000000'} onChange={e=>setConfig(c=>({...c,[field]:e.target.value}))}
                          style={{width:44,height:40,border:`1px solid ${T.border}`,borderRadius:8,cursor:'pointer',padding:3,background:T.bg3}}/>
                        <input type="text" value={config[field]||''} onChange={e=>setConfig(c=>({...c,[field]:e.target.value}))}
                          style={{...S.input,fontFamily:'monospace',textTransform:'uppercase'}} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                      </div>
                    </Field>
                  ))}
                  <div style={{gridColumn:'1/-1'}}>
                    <Field label="Cor Destaque (Accent)">
                      <div style={{display:'flex',alignItems:'center',gap:10,maxWidth:300}}>
                        <input type="color" value={config.cor_primaria||'#d0ff00'} onChange={e=>setConfig(c=>({...c,cor_primaria:e.target.value}))}
                          style={{width:44,height:40,border:`1px solid ${T.border}`,borderRadius:8,cursor:'pointer',padding:3,background:T.bg3}}/>
                        <input type="text" value={config.cor_primaria||''} onChange={e=>setConfig(c=>({...c,cor_primaria:e.target.value}))}
                          style={{...S.input,fontFamily:'monospace',textTransform:'uppercase'}} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                      </div>
                    </Field>
                  </div>
                  {[['fonte_titulo','Fonte dos Títulos',["'Space Grotesk', sans-serif","'Inter', sans-serif","'Playfair Display', serif","'Montserrat', sans-serif","'Oswald', sans-serif"]],
                    ['fonte_texto','Fonte dos Textos',["'Inter', -apple-system, sans-serif","'Space Grotesk', sans-serif","'Roboto', sans-serif","'Lora', serif"]]
                  ].map(([field,label,opts])=>(
                    <Field key={field} label={label}>
                      <select style={S.input} value={config[field]||''} onChange={e=>setConfig(c=>({...c,[field]:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}>
                        {opts.map(o=><option key={o} value={o}>{o.split(',')[0].replace(/'/g,'')}</option>)}
                      </select>
                    </Field>
                  ))}
                </div>
              )}
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:28,paddingTop:20,borderTop:`1px solid ${T.border}`}}>
                <button type="submit" style={S.btnSave} disabled={saving||configLoading}>
                  {saving ? <Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/> : <Save size={15}/>} Salvar
                </button>
              </div>
            </form>
          )}

          {/* ══ CONFIG ══ */}
          {tab === 'config' && (
            <form onSubmit={saveConfig} style={S.card}>
              <div style={{...S.sectionTitle,marginBottom:28}}><Settings size={18} style={{color:T.accent}}/> Configurações Base</div>
              {configLoading ? (
                <div style={{padding:60,textAlign:'center',color:T.muted,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                  <Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> Carregando...
                </div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
                  <Field label="Nome da Produtora">
                    <input type="text" style={S.input} value={config.nome||''} onChange={e=>setConfig(c=>({...c,nome:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                  </Field>
                  <Field label="WhatsApp Comercial (só números)">
                    <input type="text" style={S.input} value={config.whatsapp_comercial||''} onChange={e=>setConfig(c=>({...c,whatsapp_comercial:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                  </Field>
                  <div style={{gridColumn:'1/-1'}}>
                    <Field label="Link do Instagram">
                      <input type="text" style={S.input} value={config.instagram_url||''} onChange={e=>setConfig(c=>({...c,instagram_url:e.target.value}))} placeholder="https://instagram.com/creapes" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                    </Field>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <Field label="🎵 Música de Fundo do Site (URL do MP3)">
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <input type="text" style={{...S.input,flex:1}} value={config.audio_url||''} onChange={e=>setConfig(c=>({...c,audio_url:e.target.value}))} placeholder="https://seu-cdn.com/musica.mp3 — ou faça upload abaixo" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                        <label style={{...S.btnSave,cursor:'pointer',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>
                          ⬆ Upload MP3
                          <input type="file" accept="audio/mp3,audio/*" style={{display:'none'}} onChange={async(e)=>{
                            const file=e.target.files[0]; if(!file) return;
                            try{
                              const data=await uploadFile(file);
                              setConfig(c=>({...c,audio_url:data.url}));
                              showToast('MP3 enviado!');
                            }catch{ showToast('Erro no upload.','error'); }
                          }}/>
                        </label>
                      </div>
                      {config.audio_url && (
                        <div style={{marginTop:8,display:'flex',alignItems:'center',gap:12}}>
                          <audio controls src={config.audio_url} style={{height:32,flex:1}}/>
                          <button type="button" style={{background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:'0.75rem'}} onClick={()=>setConfig(c=>({...c,audio_url:''}))}>✕ Remover</button>
                        </div>
                      )}
                    </Field>
                  </div>
                  <div style={{gridColumn:'1/-1',paddingTop:16,borderTop:`1px solid ${T.border}`}}>
                    <Field label="Nova Senha do Painel">
                      <input type="password" style={{...S.input,maxWidth:320}} placeholder="Deixe em branco para manter a atual" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                    </Field>
                  </div>
                </div>
              )}
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:28,paddingTop:20,borderTop:`1px solid ${T.border}`}}>
                <button type="submit" style={S.btnSave} disabled={saving||configLoading}>
                  {saving ? <Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/> : <Save size={15}/>} Salvar
                </button>
              </div>
            </form>
          )}

        </main>
      </div>

      {/* ══ MODAIS ══ */}

      {/* Modal Categoria */}
      <Modal open={catModal} onClose={()=>setCatModal(false)} title={catForm.id?'Editar Seção':'Nova Seção'}>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <Field label="Nome da Seção (ex: hero, portfolio)">
            <input type="text" style={S.input} value={catForm.nome} onChange={e=>setCatForm(f=>({...f,nome:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} required/>
          </Field>
          <div style={{display:'flex',justifyContent:'flex-end',gap:12,paddingTop:8}}>
            <button type="button" style={S.btnGhost} onClick={()=>setCatModal(false)}>Cancelar</button>
            <button type="button" style={S.btnSave} onClick={saveCat} disabled={saving}>
              {saving?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<Save size={14}/>} Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Produto */}
      <Modal open={prodModal} onClose={()=>setProdModal(false)} title={prodForm.id?'Editar Projeto':'Novo Projeto'}>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <Field label="Título do Projeto">
            <input type="text" style={S.input} value={prodForm.nome} onChange={e=>setProdForm(f=>({...f,nome:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} required/>
          </Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <Field label="Seção (onde aparece)">
              <select style={S.input} value={prodForm.categoria_id} onChange={e=>setProdForm(f=>({...f,categoria_id:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}>
                <option value="">Sem Seção</option>
                {categorias.map(cat=><option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </select>
            </Field>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field label="Ano">
                <input type="text" style={S.input} value={prodForm.estoque} onChange={e=>setProdForm(f=>({...f,estoque:e.target.value}))} placeholder="2026" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
              </Field>
              <Field label="Ordem">
                <input type="number" style={S.input} value={prodForm.sort} onChange={e=>setProdForm(f=>({...f,sort:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
              </Field>
            </div>
          </div>
          <Field label="Subtítulo / Estilo">
            <input type="text" style={S.input} value={prodForm.descricao} onChange={e=>setProdForm(f=>({...f,descricao:e.target.value}))} placeholder="Ex: Film / Motion | Monaco" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
          </Field>
          <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:16}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:T.accent,marginBottom:14,fontFamily:T.fontHead}}>Integração Vimeo</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <Field label="Link MP4 / Fundo Loop">
                <input type="text" style={{...S.input,background:T.bg2}} value={prodForm.link_projeto} onChange={e=>setProdForm(f=>({...f,link_projeto:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
              </Field>
              <Field label="Player Vimeo (abre no clique)">
                <input type="text" style={{...S.input,background:T.bg2}} value={prodForm.whatsapp_projeto} onChange={e=>setProdForm(f=>({...f,whatsapp_projeto:e.target.value}))} placeholder="https://player.vimeo.com/..." onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
              </Field>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:12,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
            <button type="button" style={S.btnGhost} onClick={()=>setProdModal(false)}>Cancelar</button>
            <button type="button" style={S.btnSave} onClick={saveProd} disabled={saving}>
              {saving?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<Save size={14}/>} Salvar Projeto
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Serviço */}
      <Modal open={servicoModal} onClose={()=>setServicoModal(false)} title={servicoForm.id?'Editar Serviço':'Novo Serviço'}>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <Field label="Nome do Serviço">
            <input type="text" style={S.input} value={servicoForm.titulo} onChange={e=>setServicoForm(f=>({...f,titulo:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} required/>
          </Field>
          <Field label="Descrição">
            <textarea rows={4} style={{...S.input,resize:'vertical'}} value={servicoForm.resumo} onChange={e=>setServicoForm(f=>({...f,resumo:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
          </Field>
          <div style={{display:'flex',justifyContent:'flex-end',gap:12,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
            <button type="button" style={S.btnGhost} onClick={()=>setServicoModal(false)}>Cancelar</button>
            <button type="button" style={S.btnSave} onClick={saveServico} disabled={saving}>
              {saving?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<Save size={14}/>} Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Agenda */}
      <Modal open={agendaModal} onClose={()=>setAgendaModal(false)} title={agendaForm.id?'Editar Horário':'Novo Horário'}>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <Field label="Data e Horário">
            <input type="datetime-local" style={S.input} value={agendaForm.data_hora} onChange={e=>setAgendaForm(f=>({...f,data_hora:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} required/>
          </Field>
          <label style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
            <input type="checkbox" checked={agendaForm.disponivel} onChange={e=>setAgendaForm(f=>({...f,disponivel:e.target.checked}))}
              style={{width:18,height:18,accentColor:T.accent,cursor:'pointer'}}/>
            <span style={{fontSize:14,fontWeight:600,color:T.text}}>Horário Disponível</span>
          </label>
          <Field label="Nome do Cliente (opcional)">
            <input type="text" style={S.input} value={agendaForm.cliente_nome} onChange={e=>setAgendaForm(f=>({...f,cliente_nome:e.target.value}))} placeholder="Ex: Cliente XPTO" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
          </Field>
          <div style={{display:'flex',justifyContent:'flex-end',gap:12,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
            <button type="button" style={S.btnGhost} onClick={()=>setAgendaModal(false)}>Cancelar</button>
            <button type="button" style={S.btnSave} onClick={saveHorario} disabled={saving}>
              {saving?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<Save size={14}/>} Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Blog */}
      <Modal open={blogModal} onClose={()=>setBlogModal(false)} title={blogForm.id?'Editar Post':'Novo Post'}>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <Field label="Título">
            <input type="text" style={S.input} value={blogForm.titulo} onChange={e=>setBlogForm(f=>({...f,titulo:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} required/>
          </Field>
          <Field label="Slug (deixe vazio para gerar automático)">
            <input type="text" style={S.input} value={blogForm.slug} onChange={e=>setBlogForm(f=>({...f,slug:e.target.value}))} placeholder="meu-post-incrivel" onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
          </Field>
          <Field label="Resumo">
            <textarea rows={2} style={{...S.input,resize:'vertical'}} value={blogForm.resumo} onChange={e=>setBlogForm(f=>({...f,resumo:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
          </Field>
          <Field label="Conteúdo (HTML ou Markdown)">
            <textarea rows={7} style={{...S.input,resize:'vertical',fontFamily:'monospace',fontSize:13}} value={blogForm.conteudo} onChange={e=>setBlogForm(f=>({...f,conteudo:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
          </Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <Field label="URL da Imagem de Capa">
              <input type="text" style={S.input} value={blogForm.imagem_capa} onChange={e=>setBlogForm(f=>({...f,imagem_capa:e.target.value}))} placeholder="https://..." onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
            </Field>
            <Field label="Data de Publicação">
              <input type="date" style={S.input} value={blogForm.data_publicacao} onChange={e=>setBlogForm(f=>({...f,data_publicacao:e.target.value}))} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
            </Field>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:12,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
            <button type="button" style={S.btnGhost} onClick={()=>setBlogModal(false)}>Cancelar</button>
            <button type="button" style={S.btnSave} onClick={saveBlog} disabled={saving}>
              {saving?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<Save size={14}/>} Salvar Post
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
