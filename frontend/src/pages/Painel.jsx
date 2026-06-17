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
} from '../lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.classList.add('modal-active');
    else document.body.classList.remove('modal-active');
    return () => document.body.classList.remove('modal-active');
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 py-6">
      <div className="absolute inset-0 bg-black opacity-80" onClick={onClose} />
      <div className="relative bg-neutral-900 border border-neutral-700 w-11/12 max-w-2xl mx-auto rounded shadow-2xl z-50 overflow-y-auto max-h-[90vh]">
        <div className="py-6 px-8">
          <div className="flex justify-between items-center pb-6 border-b border-neutral-800">
            <p className="text-2xl font-bold text-white">{title}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2 text-gray-300">{label}</label>
      {children}
    </div>
  );
}

function LoadingRow({ cols }) {
  return (
    <tr>
      <td colSpan={cols} className="px-6 py-10 text-center text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </div>
      </td>
    </tr>
  );
}

const inputCls = "w-full bg-neutral-800 border border-neutral-700 rounded p-3 text-white focus:border-yellow-500 outline-none";
const btnPrimary = "bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded flex items-center gap-2 text-sm";
const btnCancel = "px-6 py-3 rounded text-gray-400 hover:text-white";
const btnSave = "px-8 py-3 rounded text-black bg-yellow-500 hover:bg-yellow-600 font-bold flex items-center gap-2";

// ── ABAS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'categorias', label: 'Seções (Categorias)', icon: Layers },
  { id: 'produtos',   label: 'Vídeos / Projetos',   icon: Video },
  { id: 'servicos',   label: 'Serviços',             icon: Briefcase },
  { id: 'blog',       label: 'Blog',                 icon: BookOpen },
  { id: 'inscritos',  label: 'Leads (Inscritos)',    icon: Users },
  { id: 'agenda',     label: 'Agenda / Horários',    icon: Calendar },
  { id: 'sobre',      label: 'Sobre a Produtora',    icon: Users },
  { id: 'visual',     label: 'Identidade Visual',    icon: Palette },
  { id: 'config',     label: 'Configurações Base',   icon: Settings },
];

const CONFIG_DEFAULT = {
  nome: '', whatsapp_comercial: '', instagram_url: '',
  cor_fundo: '#0f1923', cor_texto: '#f5f5f7', cor_primaria: '#d0ff00',
  fonte_titulo: "'Space Grotesk', sans-serif",
  fonte_texto: "'Inter', -apple-system, sans-serif",
  sobre_titulo: '', sobre_texto: '', logos_clientes: '',
  logo_url: null, banner1_url: null, bannermenor1_url: null, bannermenor2_url: null,
};

export default function Painel() {
  const [tab, setTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || localStorage.getItem('activePainelCreapesTab') || 'categorias';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── State de cada entidade ────────────────────────────────────────────────
  const [categorias, setCategorias] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);

  const [servicos, setServicos] = useState([]);
  const [servLoading, setServLoading] = useState(false);

  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const [agenda, setAgenda] = useState([]);
  const [agendaLoading, setAgendaLoading] = useState(false);

  const [config, setConfig] = useState(CONFIG_DEFAULT);
  const [configLoading, setConfigLoading] = useState(false);

  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);

  // ── Modais ────────────────────────────────────────────────────────────────
  const [catModal, setCatModal]         = useState(false);
  const [catForm, setCatForm]           = useState({ id: '', nome: '' });

  const [prodModal, setProdModal]       = useState(false);
  const [prodForm, setProdForm]         = useState({ id:'', nome:'', categoria_id:'', estoque:'', sort:0, descricao:'', link_projeto:'', whatsapp_projeto:'' });

  const [servicoModal, setServicoModal] = useState(false);
  const [servicoForm, setServicoForm]   = useState({ id:'', titulo:'', resumo:'' });

  const [agendaModal, setAgendaModal]   = useState(false);
  const [agendaForm, setAgendaForm]     = useState({ id:'', data_hora:'', disponivel:true, cliente_nome:'' });

  const [blogModal, setBlogModal]       = useState(false);
  const [blogForm, setBlogForm]         = useState({ id:'', titulo:'', slug:'', resumo:'', conteudo:'', imagem_capa:'', data_publicacao:'' });

  // ── Toast helper ──────────────────────────────────────────────────────────
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

  // ── Carregamento de dados por aba ─────────────────────────────────────────
  const loadCategorias = useCallback(async () => {
    setCatLoading(true);
    try { setCategorias(await getCategorias()); }
    catch { showToast('Erro ao carregar seções.', 'error'); }
    finally { setCatLoading(false); }
  }, []);

  const loadProdutos = useCallback(async () => {
    setProdLoading(true);
    try { setProdutos(await getCases()); }
    catch { showToast('Erro ao carregar projetos.', 'error'); }
    finally { setProdLoading(false); }
  }, []);

  const loadServicos = useCallback(async () => {
    setServLoading(true);
    try { setServicos(await getServicos()); }
    catch { showToast('Erro ao carregar serviços.', 'error'); }
    finally { setServLoading(false); }
  }, []);

  const loadLeads = useCallback(async () => {
    setLeadsLoading(true);
    try { setLeads(await getLeads()); }
    catch { showToast('Erro ao carregar leads.', 'error'); }
    finally { setLeadsLoading(false); }
  }, []);

  const loadAgenda = useCallback(async () => {
    setAgendaLoading(true);
    try { setAgenda(await getAgenda()); }
    catch { showToast('Erro ao carregar agenda.', 'error'); }
    finally { setAgendaLoading(false); }
  }, []);

  const loadConfig = useCallback(async () => {
    setConfigLoading(true);
    try { setConfig(c => ({ ...CONFIG_DEFAULT, ...(c || {}), ...await getConfig() })); }
    catch { showToast('Erro ao carregar configurações.', 'error'); }
    finally { setConfigLoading(false); }
  }, []);

  const loadBlog = useCallback(async () => {
    setBlogLoading(true);
    try { setBlogPosts(await getBlogPosts()); }
    catch { showToast('Erro ao carregar posts.', 'error'); }
    finally { setBlogLoading(false); }
  }, []);

  // Carrega dados sempre que muda de aba
  useEffect(() => {
    if (tab === 'categorias') loadCategorias();
    if (tab === 'produtos')   { loadProdutos(); loadCategorias(); }
    if (tab === 'servicos')   loadServicos();
    if (tab === 'inscritos')  loadLeads();
    if (tab === 'agenda')     loadAgenda();
    if (tab === 'blog')       loadBlog();
    if (['sobre','visual','config'].includes(tab)) loadConfig();
  }, [tab]);

  // ── CRUD Categorias ───────────────────────────────────────────────────────
  function openNovaCat() { setCatForm({ id:'', nome:'' }); setCatModal(true); }
  function openEditCat(cat) { setCatForm({ id: cat.id, nome: cat.nome }); setCatModal(true); }
  async function saveCat() {
    setSaving(true);
    try {
      const slug = catForm.nome.toLowerCase().replace(/\s+/g,'-');
      if (catForm.id) {
        const updated = await updateCategoria(catForm.id, { nome: catForm.nome, slug });
        setCategorias(prev => prev.map(c => c.id === catForm.id ? updated : c));
      } else {
        const created = await createCategoria({ nome: catForm.nome, slug });
        setCategorias(prev => [...prev, created]);
      }
      setCatModal(false);
      showToast('Seção salva!');
    } catch { showToast('Erro ao salvar seção.', 'error'); }
    finally { setSaving(false); }
  }
  async function deleteCat(id) {
    if (!confirm('Excluir esta seção?')) return;
    try {
      await deleteCategoria(id);
      setCategorias(prev => prev.filter(c => c.id !== id));
      showToast('Seção excluída.', 'error');
    } catch { showToast('Erro ao excluir seção.', 'error'); }
  }

  // ── CRUD Produtos ─────────────────────────────────────────────────────────
  function openNovoProd() { setProdForm({ id:'', nome:'', categoria_id:'', estoque:'', sort:0, descricao:'', link_projeto:'', whatsapp_projeto:'' }); setProdModal(true); }
  function openEditProd(prod) { setProdForm({ ...prod, sort: prod.sort || 0 }); setProdModal(true); }
  async function saveProd() {
    setSaving(true);
    try {
      if (prodForm.id) {
        const updated = await updateCase(prodForm.id, prodForm);
        setProdutos(prev => prev.map(p => p.id === prodForm.id ? updated : p));
      } else {
        const created = await createCase(prodForm);
        setProdutos(prev => [...prev, created]);
      }
      setProdModal(false);
      showToast('Projeto salvo!');
    } catch { showToast('Erro ao salvar projeto.', 'error'); }
    finally { setSaving(false); }
  }
  async function deleteProd(id) {
    if (!confirm('Excluir este projeto?')) return;
    try {
      await deleteCase(id);
      setProdutos(prev => prev.filter(p => p.id !== id));
      showToast('Projeto excluído.', 'error');
    } catch { showToast('Erro ao excluir projeto.', 'error'); }
  }

  // ── CRUD Serviços ─────────────────────────────────────────────────────────
  function openNovoServico() { setServicoForm({ id:'', titulo:'', resumo:'' }); setServicoModal(true); }
  function openEditServico(s) { setServicoForm({ ...s }); setServicoModal(true); }
  async function saveServico() {
    setSaving(true);
    try {
      if (servicoForm.id) {
        const updated = await updateServico(servicoForm.id, servicoForm);
        setServicos(prev => prev.map(s => s.id === servicoForm.id ? updated : s));
      } else {
        const created = await createServico(servicoForm);
        setServicos(prev => [...prev, created]);
      }
      setServicoModal(false);
      showToast('Serviço salvo!');
    } catch { showToast('Erro ao salvar serviço.', 'error'); }
    finally { setSaving(false); }
  }
  async function deleteServico(id) {
    if (!confirm('Excluir este serviço?')) return;
    try {
      await deleteServico(id);
      setServicos(prev => prev.filter(s => s.id !== id));
      showToast('Serviço excluído.', 'error');
    } catch { showToast('Erro ao excluir serviço.', 'error'); }
  }

  // ── CRUD Agenda ───────────────────────────────────────────────────────────
  function openNovoHorario() { setAgendaForm({ id:'', data_hora:'', disponivel:true, cliente_nome:'' }); setAgendaModal(true); }
  function openEditHorario(h) { setAgendaForm({ ...h, data_hora: h.data_hora?.substring(0,16).replace(' ','T') || '' }); setAgendaModal(true); }
  async function saveHorario() {
    setSaving(true);
    try {
      if (agendaForm.id) {
        const updated = await updateHorario(agendaForm.id, agendaForm);
        setAgenda(prev => prev.map(h => h.id === agendaForm.id ? updated : h));
      } else {
        const created = await createHorario(agendaForm);
        setAgenda(prev => [...prev, created]);
      }
      setAgendaModal(false);
      showToast('Horário salvo!');
    } catch { showToast('Erro ao salvar horário.', 'error'); }
    finally { setSaving(false); }
  }
  async function deleteHorario(id) {
    if (!confirm('Excluir este horário?')) return;
    try {
      await deleteHorario(id);
      setAgenda(prev => prev.filter(h => h.id !== id));
      showToast('Horário excluído.', 'error');
    } catch { showToast('Erro ao excluir horário.', 'error'); }
  }

  // ── CRUD Blog ─────────────────────────────────────────────────────────────
  function openNovoBlog() { setBlogForm({ id:'', titulo:'', slug:'', resumo:'', conteudo:'', imagem_capa:'', data_publicacao: new Date().toISOString().split('T')[0] }); setBlogModal(true); }
  function openEditBlog(post) { setBlogForm({ ...post }); setBlogModal(true); }
  async function saveBlog() {
    setSaving(true);
    const slug = blogForm.slug || blogForm.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    try {
      if (blogForm.id) {
        const updated = await updateBlogPost(blogForm.id, { ...blogForm, slug });
        setBlogPosts(prev => prev.map(p => p.id === blogForm.id ? updated : p));
      } else {
        const created = await createBlogPost({ ...blogForm, slug });
        setBlogPosts(prev => [...prev, created]);
      }
      setBlogModal(false);
      showToast('Post salvo!');
    } catch { showToast('Erro ao salvar post.', 'error'); }
    finally { setSaving(false); }
  }
  async function deleteBlog(id) {
    if (!confirm('Excluir este post?')) return;
    try {
      await deleteBlogPost(id);
      setBlogPosts(prev => prev.filter(p => p.id !== id));
      showToast('Post excluído.', 'error');
    } catch { showToast('Erro ao excluir post.', 'error'); }
  }

  // ── Salvar configurações ──────────────────────────────────────────────────
  async function saveConfig(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig(config);
      showToast('Configurações salvas!');
    } catch { showToast('Erro ao salvar configurações.', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="bg-black font-sans leading-normal tracking-normal text-gray-200 min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'} text-white px-6 py-4 rounded shadow-lg flex items-center gap-2`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* ── Topbar ── */}
      <nav className="bg-neutral-900 shadow-sm fixed w-full z-10 top-0 border-b border-neutral-800">
        <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-4 px-6">
          <span className="text-white text-xl font-bold flex items-center gap-2">
            <Film size={20} className="text-yellow-400" /> Painel Produtora: {config.nome || 'Creapes'}
          </span>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-yellow-400 flex items-center gap-1 text-sm font-bold">
              <ExternalLink size={16} /> Ver Site
            </a>
            <a href="/logout" className="text-red-500 hover:text-red-400 flex items-center gap-1 text-sm font-bold">
              <LogOut size={16} /> Sair
            </a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto mt-24 px-6 md:px-0 flex flex-col md:flex-row gap-6 pb-24">

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-64 bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-4 h-fit sticky top-24">
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden w-full flex items-center justify-between bg-neutral-800 p-3 rounded-lg border border-neutral-700 text-white font-bold hover:bg-neutral-700 transition-colors mb-2"
          >
            <span className="flex items-center gap-2"><Menu size={16} /> Menu Principal</span>
            <ChevronDown size={16} style={{ transform: mobileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          </button>
          <nav className={`space-y-1 ${mobileOpen ? 'block' : 'hidden md:block'}`}>
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-bold text-left text-sm ${tab === t.id ? 'bg-neutral-800 text-yellow-400' : 'text-gray-300 hover:bg-neutral-800 hover:text-yellow-400'}`}
                >
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 space-y-6">

          {/* ══ CATEGORIAS ══ */}
          {tab === 'categorias' && (
            <section className="bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Layers size={20} className="text-yellow-400" /> Seções do Site</h2>
                  <p className="text-sm text-gray-400 mt-1">Crie as categorias 'Hero' e 'Portfolio' para organizar onde os vídeos aparecem.</p>
                </div>
                <button onClick={openNovaCat} className={btnPrimary}><Plus size={16} /> Nova Seção</button>
              </div>
              <div className="bg-neutral-800 rounded-lg border border-neutral-700">
                <ul className="divide-y divide-neutral-700">
                  {catLoading && <li className="p-6 text-center text-gray-500 flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Carregando...</li>}
                  {!catLoading && categorias.length === 0 && <li className="p-6 text-center text-gray-500">Nenhuma seção cadastrada.</li>}
                  {categorias.map(cat => (
                    <li key={cat.id} className="flex items-center justify-between p-4 hover:bg-neutral-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <GripVertical size={16} className="text-gray-500 cursor-move" />
                        <span className="font-bold text-white">{cat.nome} <span className="text-xs text-gray-400 ml-2 font-normal">(slug: {cat.slug})</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditCat(cat)} className="text-blue-400 hover:text-blue-300 p-2"><Edit2 size={16} /></button>
                        <button onClick={() => deleteCat(cat.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* ══ PRODUTOS ══ */}
          {tab === 'produtos' && (
            <section className="bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Video size={20} className="text-yellow-400" /> Vídeos / Projetos</h2>
                <button onClick={openNovoProd} className={btnPrimary}><Plus size={16} /> Novo Vídeo</button>
              </div>
              <div className="overflow-x-auto bg-neutral-800 rounded-lg border border-neutral-700">
                <table className="min-w-full divide-y divide-neutral-700">
                  <thead className="bg-neutral-900">
                    <tr>
                      {['Ordem','Nome','Local/Estilo','Ano','Ações'].map(h => (
                        <th key={h} className={`px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider ${h==='Ações'?'text-right':'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                    {prodLoading && <LoadingRow cols={5} />}
                    {!prodLoading && produtos.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum vídeo cadastrado.</td></tr>}
                    {produtos.map(prod => (
                      <tr key={prod.id} className="hover:bg-neutral-700 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400 font-bold">{prod.sort || 0}</td>
                        <td className="px-6 py-4 text-sm font-bold text-white">{prod.nome}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{prod.descricao}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{prod.estoque}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button onClick={() => openEditProd(prod)} className="text-blue-400 hover:text-blue-300 mr-3"><Edit2 size={16} /></button>
                          <button onClick={() => deleteProd(prod.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ══ SERVIÇOS ══ */}
          {tab === 'servicos' && (
            <section className="bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Briefcase size={20} className="text-yellow-400" /> Serviços (Capabilities)</h2>
                <button onClick={openNovoServico} className={btnPrimary}><Plus size={16} /> Novo Serviço</button>
              </div>
              <div className="bg-neutral-800 rounded-lg border border-neutral-700 divide-y divide-neutral-700">
                {servLoading && <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Carregando...</div>}
                {!servLoading && servicos.length === 0 && <div className="p-6 text-center text-gray-500">Nenhum serviço cadastrado.</div>}
                {servicos.map(s => (
                  <div key={s.id} className="p-4 flex justify-between items-center hover:bg-neutral-700 transition-colors">
                    <div>
                      <h3 className="font-bold text-white">{s.titulo}</h3>
                      {s.resumo && <p className="text-sm text-gray-400 mt-1">{s.resumo}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditServico(s)} className="text-blue-400 hover:text-blue-300 p-2"><Edit2 size={16} /></button>
                      <button onClick={() => deleteServico(s.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ══ BLOG ══ */}
          {tab === 'blog' && (
            <section className="bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen size={20} className="text-yellow-400" /> Blog</h2>
                <button onClick={openNovoBlog} className={btnPrimary}><Plus size={16} /> Novo Post</button>
              </div>
              <div className="overflow-x-auto bg-neutral-800 rounded-lg border border-neutral-700">
                <table className="min-w-full divide-y divide-neutral-700">
                  <thead className="bg-neutral-900">
                    <tr>
                      {['Título','Data','Slug','Ações'].map(h => (
                        <th key={h} className={`px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider ${h==='Ações'?'text-right':'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                    {blogLoading && <LoadingRow cols={4} />}
                    {!blogLoading && blogPosts.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum post cadastrado.</td></tr>}
                    {blogPosts.map(post => (
                      <tr key={post.id} className="hover:bg-neutral-700 transition-colors">
                        <td className="px-6 py-4 font-bold text-white text-sm">{post.titulo}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{post.data_publicacao}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">{post.slug}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button onClick={() => openEditBlog(post)} className="text-blue-400 hover:text-blue-300 mr-3"><Edit2 size={16} /></button>
                          <button onClick={() => deleteBlog(post.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ══ LEADS ══ */}
          {tab === 'inscritos' && (
            <section className="bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6"><Users size={20} className="text-yellow-400" /> Todos os Inscritos (Leads)</h2>
              <div className="overflow-x-auto bg-neutral-800 rounded-lg border border-neutral-700">
                <table className="min-w-full divide-y divide-neutral-700">
                  <thead className="bg-neutral-900">
                    <tr>
                      {['Nome','WhatsApp','E-mail','Data'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                    {leadsLoading && <LoadingRow cols={4} />}
                    {!leadsLoading && leads.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum lead inscrito ainda.</td></tr>}
                    {leads.map(lead => (
                      <tr key={lead.id} className="hover:bg-neutral-700 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-white">{lead.nome}</td>
                        <td className="px-6 py-4 text-sm">
                          <a href={`https://wa.me/55${lead.whatsapp?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300 flex items-center gap-1">
                            <MessageCircle size={14} /> {lead.whatsapp}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{lead.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{lead.date_created?.slice(0,10) || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ══ AGENDA ══ */}
          {tab === 'agenda' && (
            <section className="bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Calendar size={20} className="text-yellow-400" /> Agenda / Horários</h2>
                <button onClick={openNovoHorario} className={btnPrimary}><Plus size={16} /> Novo Horário</button>
              </div>
              <div className="overflow-x-auto bg-neutral-800 rounded-lg border border-neutral-700">
                <table className="min-w-full divide-y divide-neutral-700">
                  <thead className="bg-neutral-900">
                    <tr>
                      {['Data / Hora','Status','Cliente','Ações'].map(h => (
                        <th key={h} className={`px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider ${h==='Ações'?'text-right':'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                    {agendaLoading && <LoadingRow cols={4} />}
                    {!agendaLoading && agenda.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum horário cadastrado.</td></tr>}
                    {agenda.map(h => (
                      <tr key={h.id} className="hover:bg-neutral-700 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-white">{h.data_hora?.replace('T',' ')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${h.disponivel ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                            {h.disponivel ? 'Disponível' : 'Ocupado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{h.cliente_nome || '--'}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button onClick={() => openEditHorario(h)} className="text-blue-400 hover:text-blue-300 mr-3"><Edit2 size={16} /></button>
                          <button onClick={() => deleteHorario(h.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ══ SOBRE ══ */}
          {tab === 'sobre' && (
            <form onSubmit={saveConfig} className="bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6"><Users size={20} className="text-yellow-400" /> Sobre a Produtora</h2>
              {configLoading ? (
                <div className="py-10 text-center text-gray-500 flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Carregando...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Field label="Título da Seção">
                      <input type="text" className={inputCls} value={config.sobre_titulo || ''} onChange={e => setConfig(c => ({...c, sobre_titulo: e.target.value}))} placeholder="Ex: We Are Creapes" />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Manifesto / Texto Principal">
                      <textarea rows={4} className={inputCls} value={config.sobre_texto || ''} onChange={e => setConfig(c => ({...c, sobre_texto: e.target.value}))} />
                    </Field>
                  </div>
                  <div className="md:col-span-2 bg-neutral-800 p-4 rounded border border-neutral-700">
                    <h4 className="font-bold text-yellow-400 text-sm mb-3">Logos dos Clientes</h4>
                    <textarea rows={4} className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white focus:border-yellow-500 outline-none" value={config.logos_clientes || ''} onChange={e => setConfig(c => ({...c, logos_clientes: e.target.value}))} placeholder="Cole os links das imagens aqui (um por linha)..." />
                    <p className="text-xs text-gray-400 mt-1">Insira a URL direta da imagem (uma por linha).</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <button type="submit" className={btnSave} disabled={saving || configLoading}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar
                </button>
              </div>
            </form>
          )}

          {/* ══ VISUAL ══ */}
          {tab === 'visual' && (
            <form onSubmit={saveConfig} className="bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6"><Palette size={20} className="text-yellow-400" /> Identidade Visual</h2>
              {configLoading ? (
                <div className="py-10 text-center text-gray-500 flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Carregando...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[['cor_fundo','Cor do Fundo'],['cor_texto','Cor do Texto']].map(([field, label]) => (
                    <div key={field}>
                      <Field label={label}>
                        <div className="flex items-center gap-2">
                          <input type="color" value={config[field] || '#000000'} onChange={e => setConfig(c => ({...c, [field]: e.target.value}))} className="h-10 w-14 p-0 border border-neutral-700 rounded cursor-pointer bg-neutral-800" />
                          <input type="text" value={config[field] || ''} onChange={e => setConfig(c => ({...c, [field]: e.target.value}))} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white text-sm uppercase" />
                        </div>
                      </Field>
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <Field label="Cor Destaque (Accent)">
                      <div className="flex items-center gap-2 md:w-1/2">
                        <input type="color" value={config.cor_primaria || '#d0ff00'} onChange={e => setConfig(c => ({...c, cor_primaria: e.target.value}))} className="h-10 w-14 p-0 border border-neutral-700 rounded cursor-pointer bg-neutral-800" />
                        <input type="text" value={config.cor_primaria || ''} onChange={e => setConfig(c => ({...c, cor_primaria: e.target.value}))} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white text-sm uppercase" />
                      </div>
                    </Field>
                  </div>
                  <div>
                    <Field label="Fonte dos Títulos">
                      <select className={inputCls} value={config.fonte_titulo || ''} onChange={e => setConfig(c => ({...c, fonte_titulo: e.target.value}))}>
                        <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                        <option value="'Inter', sans-serif">Inter</option>
                        <option value="'Playfair Display', serif">Playfair Display</option>
                        <option value="'Montserrat', sans-serif">Montserrat</option>
                        <option value="'Oswald', sans-serif">Oswald</option>
                      </select>
                    </Field>
                  </div>
                  <div>
                    <Field label="Fonte dos Textos">
                      <select className={inputCls} value={config.fonte_texto || ''} onChange={e => setConfig(c => ({...c, fonte_texto: e.target.value}))}>
                        <option value="'Inter', -apple-system, sans-serif">Inter</option>
                        <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                        <option value="'Roboto', sans-serif">Roboto</option>
                        <option value="'Lora', serif">Lora</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <button type="submit" className={btnSave} disabled={saving || configLoading}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar
                </button>
              </div>
            </form>
          )}

          {/* ══ CONFIG ══ */}
          {tab === 'config' && (
            <form onSubmit={saveConfig} className="bg-neutral-900 rounded-lg shadow-sm border border-neutral-800 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6"><Settings size={20} className="text-yellow-400" /> Configurações Base</h2>
              {configLoading ? (
                <div className="py-10 text-center text-gray-500 flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Carregando...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Nome da Produtora">
                    <input type="text" className={inputCls} value={config.nome || ''} onChange={e => setConfig(c => ({...c, nome: e.target.value}))} />
                  </Field>
                  <Field label="WhatsApp Comercial (Apenas números)">
                    <input type="text" className={inputCls} value={config.whatsapp_comercial || ''} onChange={e => setConfig(c => ({...c, whatsapp_comercial: e.target.value}))} />
                  </Field>
                  <Field label="Link do Instagram">
                    <input type="text" className={inputCls} value={config.instagram_url || ''} onChange={e => setConfig(c => ({...c, instagram_url: e.target.value}))} placeholder="https://instagram.com/suaempresa" />
                  </Field>
                </div>
              )}
              <div className="pt-4 border-t border-neutral-800">
                <Field label="Nova Senha do Painel">
                  <input type="password" className={`${inputCls} md:w-1/2`} placeholder="Deixe em branco para manter a atual" />
                </Field>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className={btnSave} disabled={saving || configLoading}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar
                </button>
              </div>
            </form>
          )}

        </main>
      </div>

      {/* ══ MODAIS ══════════════════════════════════════════════════════════ */}

      {/* Modal Categoria */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title={catForm.id ? 'Editar Seção' : 'Nova Seção'}>
        <div className="space-y-4">
          <Field label="Nome da Seção (Ex: hero, portfolio)">
            <input type="text" className={inputCls} value={catForm.nome} onChange={e => setCatForm(f => ({...f, nome: e.target.value}))} required />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnCancel} onClick={() => setCatModal(false)}>Cancelar</button>
            <button type="button" className="px-4 bg-yellow-500 p-2 rounded text-black font-bold hover:bg-yellow-600 flex items-center gap-2" onClick={saveCat} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} Salvar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Produto */}
      <Modal open={prodModal} onClose={() => setProdModal(false)} title={prodForm.id ? 'Editar Projeto / Vídeo' : 'Novo Projeto / Vídeo'}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Field label="Título do Projeto">
                <input type="text" className={inputCls} value={prodForm.nome} onChange={e => setProdForm(f => ({...f, nome: e.target.value}))} required />
              </Field>
            </div>
            <Field label="Seção (Onde aparece)">
              <select className={inputCls} value={prodForm.categoria_id} onChange={e => setProdForm(f => ({...f, categoria_id: e.target.value}))}>
                <option value="">Sem Seção</option>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ano de Lançamento">
                <input type="text" className={inputCls} value={prodForm.estoque} onChange={e => setProdForm(f => ({...f, estoque: e.target.value}))} placeholder="Ex: 2026" />
              </Field>
              <Field label="Ordem de Exibição">
                <input type="number" className={inputCls} value={prodForm.sort} onChange={e => setProdForm(f => ({...f, sort: e.target.value}))} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Subtítulo / Estilo">
                <input type="text" className={inputCls} value={prodForm.descricao} onChange={e => setProdForm(f => ({...f, descricao: e.target.value}))} placeholder="Ex: Film / Motion | Monaco" />
              </Field>
            </div>
            <div className="md:col-span-2 bg-neutral-800 p-4 rounded border border-neutral-700">
              <h4 className="font-bold text-yellow-400 text-sm mb-3">Integração Vimeo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Link MP4 Direto (Fundo / Loop)">
                  <input type="text" className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white focus:border-yellow-500 outline-none" value={prodForm.link_projeto} onChange={e => setProdForm(f => ({...f, link_projeto: e.target.value}))} />
                </Field>
                <Field label="Link Vimeo Player (Abre no clique)">
                  <input type="text" className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white focus:border-yellow-500 outline-none" value={prodForm.whatsapp_projeto} onChange={e => setProdForm(f => ({...f, whatsapp_projeto: e.target.value}))} placeholder="https://player.vimeo.com/video/ID" />
                </Field>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-800">
            <button type="button" className={btnCancel} onClick={() => setProdModal(false)}>Cancelar</button>
            <button type="button" className={btnSave} onClick={saveProd} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar Projeto
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Serviço */}
      <Modal open={servicoModal} onClose={() => setServicoModal(false)} title={servicoForm.id ? 'Editar Serviço' : 'Novo Serviço'}>
        <div className="space-y-6">
          <Field label="Nome do Serviço">
            <input type="text" className={inputCls} value={servicoForm.titulo} onChange={e => setServicoForm(f => ({...f, titulo: e.target.value}))} required />
          </Field>
          <Field label="Descrição">
            <textarea rows={4} className={inputCls} value={servicoForm.resumo} onChange={e => setServicoForm(f => ({...f, resumo: e.target.value}))} />
          </Field>
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-800">
            <button type="button" className={btnCancel} onClick={() => setServicoModal(false)}>Cancelar</button>
            <button type="button" className={btnSave} onClick={saveServico} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar Serviço
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Agenda */}
      <Modal open={agendaModal} onClose={() => setAgendaModal(false)} title={agendaForm.id ? 'Editar Horário' : 'Novo Horário'}>
        <div className="space-y-4">
          <Field label="Selecione o Dia e Horário">
            <input type="datetime-local" className={inputCls} value={agendaForm.data_hora} onChange={e => setAgendaForm(f => ({...f, data_hora: e.target.value}))} required />
          </Field>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="agDisponivel" className="w-5 h-5 accent-yellow-500 bg-neutral-800 border-neutral-700 rounded" checked={agendaForm.disponivel} onChange={e => setAgendaForm(f => ({...f, disponivel: e.target.checked}))} />
            <label htmlFor="agDisponivel" className="text-sm font-bold text-gray-300 cursor-pointer">Horário Disponível</label>
          </div>
          <Field label="Nome do Cliente (Opcional)">
            <input type="text" className={inputCls} value={agendaForm.cliente_nome} onChange={e => setAgendaForm(f => ({...f, cliente_nome: e.target.value}))} placeholder="Ex: Cliente XPTO" />
          </Field>
          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-800">
            <button type="button" className={btnCancel} onClick={() => setAgendaModal(false)}>Cancelar</button>
            <button type="button" className="px-4 py-2 bg-yellow-500 rounded text-black font-bold hover:bg-yellow-600 flex items-center gap-2" onClick={saveHorario} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} Salvar Horário
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Blog */}
      <Modal open={blogModal} onClose={() => setBlogModal(false)} title={blogForm.id ? 'Editar Post' : 'Novo Post'}>
        <div className="space-y-6">
          <Field label="Título">
            <input type="text" className={inputCls} value={blogForm.titulo} onChange={e => setBlogForm(f => ({...f, titulo: e.target.value}))} required />
          </Field>
          <Field label="Slug (deixe vazio para gerar automaticamente)">
            <input type="text" className={inputCls} value={blogForm.slug} onChange={e => setBlogForm(f => ({...f, slug: e.target.value}))} placeholder="meu-post-incrivel" />
          </Field>
          <Field label="Resumo">
            <textarea rows={2} className={inputCls} value={blogForm.resumo} onChange={e => setBlogForm(f => ({...f, resumo: e.target.value}))} />
          </Field>
          <Field label="Conteúdo (HTML ou Markdown)">
            <textarea rows={8} className={inputCls} value={blogForm.conteudo} onChange={e => setBlogForm(f => ({...f, conteudo: e.target.value}))} />
          </Field>
          <Field label="URL da Imagem de Capa">
            <input type="text" className={inputCls} value={blogForm.imagem_capa} onChange={e => setBlogForm(f => ({...f, imagem_capa: e.target.value}))} placeholder="https://..." />
          </Field>
          <Field label="Data de Publicação">
            <input type="date" className={inputCls} value={blogForm.data_publicacao} onChange={e => setBlogForm(f => ({...f, data_publicacao: e.target.value}))} />
          </Field>
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-800">
            <button type="button" className={btnCancel} onClick={() => setBlogModal(false)}>Cancelar</button>
            <button type="button" className={btnSave} onClick={saveBlog} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar Post
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
