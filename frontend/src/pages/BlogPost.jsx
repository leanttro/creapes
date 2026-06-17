import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// ── Dados mockados (substituir por fetch via lib/api.js depois) ──────────────
const MOCK_POSTS = {
  'showreel-2024': {
    id: '1',
    titulo: 'Como criamos o Showreel 2024',
    slug: 'showreel-2024',
    resumo: 'Bastidores completos da produção mais ambiciosa da Creapes: do conceito ao frame final, passando por colorização, VFX e mixagem de som.',
    imagem_capa: 'https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=1920',
    data_publicacao: '2024-06-01',
    conteudo: `
      <p>Todo showreel começa muito antes das câmeras ligarem. O Showreel 2024 da Creapes foi o resultado de doze meses de projetos, erros calculados e descobertas que só acontecem quando você decide ir além do que já funciona.</p>

      <h2>O conceito: movimento como linguagem</h2>
      <p>A pergunta que nos guiou desde o início foi simples e difícil ao mesmo tempo: <em>o que acontece no intervalo entre dois frames?</em> Não o frame anterior, não o seguinte — o espaço invisível entre eles. É ali que a emoção vive.</p>
      <p>Partimos dessa ideia para construir uma linguagem visual onde a câmera nunca descansa, mas também nunca perturba. Cada movimento foi coreografado com a mesma atenção que um diretor de dança dá a um bailarino.</p>

      <h2>Equipamentos e abordagem técnica</h2>
      <p>Usamos a RED MONSTRO 8K como câmera principal em 80% das cenas, complementada pela ARRI ALEXA Mini LF para situações de baixa luminosidade onde a textura do grain orgânico era parte da intenção estética.</p>
      <p>Os movimentos de câmera foram executados majoritariamente com sistema de gimbal motorizado de 3 eixos, calibrado frame a frame para as sequências de slow motion filmadas a 120fps.</p>

      <blockquote>
        <p>"Filmamos mais de 40 horas de material bruto para chegar a 3 minutos e meio de showreel. Cada segundo sobrevivente passou por pelo menos seis revisões."</p>
        <cite>— João Silva, Diretor de Fotografia</cite>
      </blockquote>

      <h2>Colorização: a paleta que define tudo</h2>
      <p>O color grading foi o processo mais longo de toda a pós-produção. Trabalhamos com DaVinci Resolve em um pipeline HDR, criando LUTs exclusivos para cada conjunto de cenas de acordo com a temperatura emocional desejada.</p>
      <p>A decisão de manter os tons frios nas sequências urbanas e quentes nas sequências humanas não foi aleatória — foi uma escolha consciente para criar contraste emocional sem precisar de corte.</p>

      <h2>Som: o elemento invisível mais importante</h2>
      <p>A trilha sonora foi composta especificamente para o showreel por um compositor parceiro que entendeu o brief em uma única reunião: <em>música que respira junto com a imagem, não sobre ela.</em></p>
      <p>O design de som levou três semanas adicionais para sincronizar cada impacto visual com seu correspondente sonoro, criando a sensação de que imagem e som nasceram juntos — porque nasceram.</p>

      <h2>O que vem a seguir</h2>
      <p>O Showreel 2024 não é um ponto de chegada. É uma declaração de intenção sobre onde queremos chegar em 2025. Cada frame é um compromisso com um padrão que nos obriga a ser melhores no próximo projeto.</p>
      <p>Se você quiser conversar sobre como esse processo pode se traduzir no seu próximo projeto de marca, <a href="https://wa.me/5511999999999">fale com a gente</a>.</p>
    `,
  },
  'color-grading-cinematografico': {
    id: '2',
    titulo: 'Color Grading Cinematográfico: nossa abordagem',
    slug: 'color-grading-cinematografico',
    resumo: 'A cor define a emoção. Exploramos o processo criativo por trás da colorização que transformou a campanha da Nike em uma obra de arte visual.',
    imagem_capa: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1920',
    data_publicacao: '2024-04-18',
    conteudo: `
      <p>A colorização não é o último passo da pós-produção. É o primeiro passo da emoção. Tudo que veio antes — a direção, a fotografia, a montagem — existe para chegar aqui: no momento em que a cor decide o que o espectador vai sentir antes mesmo de processar o que está vendo.</p>

      <h2>O briefing da Nike</h2>
      <p>Quando a Nike nos trouxe o projeto, o briefing era claro: "queremos que as pessoas sintam o suor antes de ver o atleta". Essa frase virou a bússola de todo o processo de colorização.</p>

      <h2>Pipeline e ferramentas</h2>
      <p>Todo o trabalho foi realizado em DaVinci Resolve Studio com monitoramento em painel de referência Flanders Scientific. O ambiente controlado é inegociável — colorizar sem referência calibrada é pintar com os olhos fechados.</p>

      <blockquote>
        <p>"Cor não é sobre fazer bonito. É sobre fazer verdadeiro."</p>
        <cite>— Ana Lima, Colorista Sênior</cite>
      </blockquote>

      <p>Desenvolvemos três LUTs exclusivos para o projeto, cada um correspondendo a um contexto emocional distinto: treino, competição e vitória. A transição entre eles foi o verdadeiro trabalho criativo.</p>
    `,
  },
  'brand-films-contar-historias': {
    id: '3',
    titulo: 'Brand Films: contar histórias que ficam',
    slug: 'brand-films-contar-historias',
    resumo: 'Por que os melhores filmes de marca são aqueles que ninguém percebe como publicidade — e como chegamos lá em cada projeto que produzimos.',
    imagem_capa: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920',
    data_publicacao: '2024-02-10',
    conteudo: `
      <p>O melhor elogio que um brand film pode receber é: "nem parecia publicidade". Isso não é um acidente — é resultado de uma escolha filosófica que fazemos antes de escrever uma linha de roteiro.</p>

      <h2>A diferença entre anunciar e narrar</h2>
      <p>Anunciar é falar sobre o produto. Narrar é falar sobre o mundo em que o produto existe — e fazer isso de um jeito que o espectador se reconheça nesse mundo antes de reconhecer a marca.</p>
      <p>Essa distinção define tudo: a escolha dos personagens, os ambientes, o ritmo de edição, a música. Cada elemento existe para servir à história, não ao logo.</p>

      <h2>Case: Itaú Unibanco</h2>
      <p>O filme institucional do Itaú não começa com números nem com produtos financeiros. Começa com uma avó ensinando a neta a contar moedas numa cozinha de interior. Só no terceiro ato a marca aparece — e quando aparece, já faz sentido.</p>

      <p>Esse é o trabalho: chegar no ponto onde a marca é a conclusão natural da história, não a interrupção dela.</p>
    `,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function estimateReadTime(html) {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = MOCK_POSTS[slug] || MOCK_POSTS['showreel-2024'];
  // Substituir por:
  // useEffect(() => { getBlogPost(slug).then(setPost).catch(() => navigate('/blog')); }, [slug]);

  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // ── Parallax na imagem de capa ────────────────────────────────────────────
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    function onScroll() {
      const scrollY = window.scrollY;
      const img = hero.querySelector('.bp-hero__img');
      if (img) img.style.transform = `translateY(${scrollY * 0.35}px) scale(1.15)`;

      // Barra de progresso de leitura
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(total > 0 ? (scrollY / total) * 100 : 0);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Fade-in do conteúdo ───────────────────────────────────────────────────
  useEffect(() => {
    const els = contentRef.current?.querySelectorAll('.bp-fade') || [];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [post]);

  // Posts relacionados (todos exceto o atual)
  const relacionados = Object.values(MOCK_POSTS)
    .filter(p => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <div className="bp-root">
        {/* ── Barra de progresso de leitura ── */}
        <div className="bp-progress" style={{ width: `${scrollProgress}%` }} />

        {/* ── Navbar inline ── */}
        <nav className="bp-nav">
          <Link to="/" className="bp-nav__logo">Creapes</Link>
          <Link to="/blog" className="bp-nav__back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Blog
          </Link>
        </nav>

        {/* ── Hero com imagem de capa ── */}
        <header className="bp-hero" ref={heroRef}>
          <div className="bp-hero__media">
            {post.imagem_capa ? (
              <img
                className="bp-hero__img"
                src={post.imagem_capa}
                alt={post.titulo}
              />
            ) : (
              <div className="bp-hero__placeholder" />
            )}
            <div className="bp-hero__overlay" />
          </div>

          <div className="bp-hero__content">
            <div className="bp-hero__meta bp-fade">
              <span className="bp-tag">Artigo</span>
              <time className="bp-hero__date">{formatDate(post.data_publicacao)}</time>
              <span className="bp-hero__read">{estimateReadTime(post.conteudo)} min de leitura</span>
            </div>
            <h1 className="bp-hero__titulo bp-fade">{post.titulo}</h1>
            <p className="bp-hero__resumo bp-fade">{post.resumo}</p>
          </div>
        </header>

        {/* ── Conteúdo do post ── */}
        <main className="bp-main" ref={contentRef}>
          <div className="bp-layout">
            {/* Sidebar sticky (compartilhar) */}
            <aside className="bp-sidebar bp-fade">
              <div className="bp-share">
                <p className="bp-share__label">Compartilhar</p>
                <div className="bp-share__buttons">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noreferrer"
                    className="bp-share__btn bp-share__btn--wa"
                    title="WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.523 5.85L0 24l6.335-1.508A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.372l-.36-.214-3.732.888.905-3.636-.234-.373A9.818 9.818 0 1112 21.818z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noreferrer"
                    className="bp-share__btn"
                    title="LinkedIn"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <button
                    className="bp-share__btn"
                    title="Copiar link"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </aside>

            {/* Conteúdo principal */}
            <article className="bp-article bp-fade">
              <div
                className="bp-content"
                dangerouslySetInnerHTML={{ __html: post.conteudo }}
              />

              {/* Divisor */}
              <div className="bp-divider" />

              {/* CTA ao fim do post */}
              <div className="bp-cta bp-fade">
                <p className="bp-cta__eyebrow">
                  <span className="bp-cta__line" />
                  Vamos trabalhar juntos
                </p>
                <h2 className="bp-cta__headline">Tem um projeto<br /><em>em mente?</em></h2>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank" rel="noreferrer"
                  className="bp-btn-primary"
                >
                  Falar com a Creapes
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </article>
          </div>

          {/* ── Posts relacionados ── */}
          {relacionados.length > 0 && (
            <section className="bp-relacionados">
              <p className="bp-relacionados__label bp-fade">
                <span className="bp-relacionados__line" />
                Leia também
              </p>
              <div className="bp-relacionados__grid">
                {relacionados.map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/blog/${p.slug}`}
                    className="bp-rel-card bp-fade"
                    style={{
                      opacity: 0,
                      transform: 'translateY(24px)',
                      transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
                    }}
                  >
                    <div className="bp-rel-card__thumb">
                      {p.imagem_capa
                        ? <img src={p.imagem_capa} alt={p.titulo} loading="lazy" />
                        : <div className="bp-rel-card__placeholder" />
                      }
                      <div className="bp-rel-card__overlay" />
                    </div>
                    <div className="bp-rel-card__body">
                      <time className="bp-rel-card__date">{formatDate(p.data_publicacao)}</time>
                      <h3 className="bp-rel-card__titulo">{p.titulo}</h3>
                      <p className="bp-rel-card__resumo">{p.resumo}</p>
                      <span className="bp-rel-card__cta">
                        Ler artigo
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bp-root {
          --bg: #0b0d0f;
          --bg2: #111416;
          --accent: #d0ff00;
          --text: #f0f0f0;
          --muted: rgba(240,240,240,0.38);
          --border: rgba(240,240,240,0.07);
          --ease: cubic-bezier(0.16,1,0.3,1);
          --font-title: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', -apple-system, sans-serif;

          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          min-height: 100vh;
        }

        a { text-decoration: none; color: inherit; }

        /* ── Progress bar ── */
        .bp-progress {
          position: fixed; top: 0; left: 0; height: 2px;
          background: var(--accent); z-index: 9999;
          transition: width 0.1s linear;
          box-shadow: 0 0 12px rgba(208,255,0,.6);
        }

        /* ── Navbar ── */
        .bp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.4rem 3rem;
          background: linear-gradient(to bottom, rgba(11,13,15,.95), transparent);
          backdrop-filter: blur(12px);
        }
        .bp-nav__logo {
          font-family: var(--font-title);
          font-size: 1.1rem; font-weight: 700; letter-spacing: -0.02em;
          color: var(--text);
        }
        .bp-nav__back {
          display: inline-flex; align-items: center; gap: .5rem;
          font-size: .72rem; text-transform: uppercase; letter-spacing: .18em;
          color: var(--muted); transition: color .3s;
        }
        .bp-nav__back svg { width: 14px; height: 14px; }
        .bp-nav__back:hover { color: var(--accent); }

        /* ── Hero ── */
        .bp-hero {
          position: relative; height: 85vh; min-height: 560px;
          overflow: hidden;
          display: flex; align-items: flex-end;
        }
        .bp-hero__media {
          position: absolute; inset: 0;
          overflow: hidden;
        }
        .bp-hero__img {
          width: 100%; height: 115%;
          object-fit: cover;
          transform-origin: center top;
          will-change: transform;
        }
        .bp-hero__placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #1a1e22, #0b0d0f);
        }
        .bp-hero__overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(11,13,15,1) 0%,
            rgba(11,13,15,0.6) 50%,
            rgba(11,13,15,0.2) 100%
          );
        }
        .bp-hero__content {
          position: relative; z-index: 2;
          padding: 0 4rem 5rem;
          max-width: 900px;
        }
        .bp-hero__meta {
          display: flex; align-items: center; gap: 1.2rem;
          margin-bottom: 1.5rem;
          opacity: 0; transform: translateY(20px);
          transition: opacity .8s ease .1s, transform .8s var(--ease) .1s;
        }
        .bp-tag {
          font-size: .65rem; text-transform: uppercase; letter-spacing: .15em;
          background: var(--accent); color: #000; font-weight: 700;
          padding: .3rem .8rem; border-radius: 100px;
          font-family: var(--font-title);
        }
        .bp-hero__date, .bp-hero__read {
          font-size: .72rem; text-transform: uppercase; letter-spacing: .12em;
          color: var(--muted);
        }
        .bp-hero__date::after { content: '·'; margin-left: 1.2rem; }

        .bp-hero__titulo {
          font-family: var(--font-title);
          font-size: clamp(2.5rem, 5vw, 5.5rem);
          font-weight: 700; line-height: .95;
          letter-spacing: -0.04em;
          margin-bottom: 1.5rem;
          opacity: 0; transform: translateY(24px);
          transition: opacity .8s ease .2s, transform .8s var(--ease) .2s;
        }
        .bp-hero__resumo {
          font-size: 1.1rem; line-height: 1.65;
          color: rgba(240,240,240,0.6); max-width: 600px;
          opacity: 0; transform: translateY(20px);
          transition: opacity .8s ease .35s, transform .8s var(--ease) .35s;
        }

        /* Ativar fade inicial do hero ao montar */
        .bp-hero__meta,
        .bp-hero__titulo,
        .bp-hero__resumo {
          animation: heroFadeIn .8s var(--ease) forwards;
        }
        .bp-hero__titulo { animation-delay: .2s; }
        .bp-hero__resumo { animation-delay: .35s; }
        @keyframes heroFadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Main layout ── */
        .bp-main { background: var(--bg); }

        .bp-layout {
          max-width: 1100px; margin: 0 auto;
          padding: 5rem 4rem;
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 4rem;
          align-items: start;
        }

        /* ── Sidebar ── */
        .bp-sidebar {
          position: sticky; top: 8rem;
          opacity: 0; transform: translateY(20px);
          transition: opacity .6s ease, transform .6s var(--ease);
        }
        .bp-share__label {
          font-size: .62rem; text-transform: uppercase; letter-spacing: .18em;
          color: var(--muted); margin-bottom: .8rem; writing-mode: vertical-rl;
          transform: rotate(180deg); text-align: center; margin: 0 auto 1rem;
        }
        .bp-share__buttons {
          display: flex; flex-direction: column; align-items: center; gap: .6rem;
        }
        .bp-share__btn {
          width: 36px; height: 36px;
          border: 1px solid var(--border); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--muted); background: none; cursor: pointer;
          transition: border-color .3s, color .3s, background .3s;
        }
        .bp-share__btn svg { width: 14px; height: 14px; }
        .bp-share__btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(208,255,0,.06); }
        .bp-share__btn--wa:hover { border-color: #25D366; color: #25D366; background: rgba(37,211,102,.06); }

        /* ── Article content ── */
        .bp-article {
          opacity: 0; transform: translateY(24px);
          transition: opacity .7s ease .15s, transform .7s var(--ease) .15s;
        }

        /* Rich text styles */
        .bp-content { font-size: 1.05rem; line-height: 1.85; color: rgba(240,240,240,0.82); }
        .bp-content p { margin-bottom: 1.6rem; }
        .bp-content p:last-child { margin-bottom: 0; }

        .bp-content h2 {
          font-family: var(--font-title);
          font-size: clamp(1.5rem, 2.5vw, 2.2rem);
          font-weight: 700; letter-spacing: -0.02em;
          color: var(--text); margin: 3rem 0 1.2rem;
          line-height: 1.1;
        }
        .bp-content h3 {
          font-family: var(--font-title);
          font-size: 1.2rem; font-weight: 700;
          color: var(--text); margin: 2.2rem 0 .8rem;
        }

        .bp-content em { font-style: italic; color: var(--accent); }
        .bp-content strong { font-weight: 600; color: var(--text); }

        .bp-content a {
          color: var(--accent); text-decoration: underline;
          text-underline-offset: 3px; transition: opacity .2s;
        }
        .bp-content a:hover { opacity: .7; }

        .bp-content blockquote {
          border-left: 2px solid var(--accent);
          padding: 1.5rem 2rem;
          margin: 2.5rem 0;
          background: rgba(208,255,0,.04);
          border-radius: 0 4px 4px 0;
        }
        .bp-content blockquote p {
          font-family: var(--font-title);
          font-size: 1.2rem; line-height: 1.4;
          font-weight: 500; color: var(--text);
          margin-bottom: .6rem; font-style: italic;
        }
        .bp-content blockquote cite {
          font-size: .75rem; text-transform: uppercase;
          letter-spacing: .12em; color: var(--muted);
          font-style: normal;
        }

        .bp-content ul, .bp-content ol {
          padding-left: 1.5rem; margin-bottom: 1.6rem;
        }
        .bp-content li { margin-bottom: .5rem; }
        .bp-content ul li::marker { color: var(--accent); }

        /* ── Divider ── */
        .bp-divider {
          height: 1px; background: var(--border);
          margin: 4rem 0;
        }

        /* ── CTA ── */
        .bp-cta { text-align: center; }
        .bp-cta__eyebrow {
          display: inline-flex; align-items: center; gap: 1rem;
          font-size: .7rem; text-transform: uppercase; letter-spacing: .2em;
          color: var(--accent); margin-bottom: 1.5rem;
        }
        .bp-cta__line { display: block; width: 28px; height: 1px; background: var(--accent); }
        .bp-cta__headline {
          font-family: var(--font-title);
          font-size: clamp(2.5rem, 5vw, 5rem);
          font-weight: 700; line-height: .95;
          letter-spacing: -0.04em;
          margin-bottom: 2.5rem;
        }
        .bp-cta__headline em { font-style: normal; color: var(--accent); }
        .bp-btn-primary {
          display: inline-flex; align-items: center; gap: .8rem;
          background: var(--accent); color: #000;
          font-family: var(--font-title); font-size: .8rem;
          font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
          padding: 1.1rem 2.5rem; border-radius: 100px;
          transition: transform .3s var(--ease), box-shadow .3s;
        }
        .bp-btn-primary svg { width: 16px; height: 16px; }
        .bp-btn-primary:hover { transform: scale(1.04); box-shadow: 0 10px 40px rgba(208,255,0,.3); color: #000; }

        /* ── Relacionados ── */
        .bp-relacionados {
          border-top: 1px solid var(--border);
          padding: 5rem 4rem 6rem;
          max-width: 1100px; margin: 0 auto;
        }
        .bp-relacionados__label {
          display: flex; align-items: center; gap: 1rem;
          font-size: .7rem; text-transform: uppercase; letter-spacing: .2em;
          color: var(--accent); margin-bottom: 2.5rem;
          opacity: 0; transform: translateY(16px);
          transition: opacity .6s ease, transform .6s var(--ease);
        }
        .bp-relacionados__line { display: block; width: 28px; height: 1px; background: var(--accent); }
        .bp-relacionados__grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;
        }

        /* ── Related card ── */
        .bp-rel-card {
          display: flex; flex-direction: column;
          background: var(--bg2);
          border: 1px solid var(--border); border-radius: 4px;
          overflow: hidden;
          transition: border-color .4s var(--ease), transform .4s var(--ease);
        }
        .bp-rel-card:hover { border-color: rgba(208,255,0,.25); transform: translateY(-4px); }
        .bp-rel-card__thumb {
          position: relative; height: 220px; overflow: hidden;
        }
        .bp-rel-card__thumb img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .8s var(--ease);
        }
        .bp-rel-card:hover .bp-rel-card__thumb img { transform: scale(1.05); }
        .bp-rel-card__placeholder { width: 100%; height: 100%; background: #1a1e22; }
        .bp-rel-card__overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 60%);
        }
        .bp-rel-card__body { padding: 1.8rem 2rem 2.2rem; display: flex; flex-direction: column; gap: .6rem; }
        .bp-rel-card__date {
          font-size: .68rem; text-transform: uppercase; letter-spacing: .15em; color: var(--muted);
        }
        .bp-rel-card__titulo {
          font-family: var(--font-title);
          font-size: 1.1rem; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em;
          transition: color .3s;
        }
        .bp-rel-card:hover .bp-rel-card__titulo { color: var(--accent); }
        .bp-rel-card__resumo {
          font-size: .88rem; line-height: 1.65; color: var(--muted);
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden; flex: 1;
        }
        .bp-rel-card__cta {
          display: inline-flex; align-items: center; gap: .5rem;
          font-size: .7rem; text-transform: uppercase; letter-spacing: .15em;
          color: var(--accent); font-family: var(--font-title); font-weight: 700;
          margin-top: .4rem; transition: gap .3s;
        }
        .bp-rel-card__cta svg { width: 12px; height: 12px; }
        .bp-rel-card:hover .bp-rel-card__cta { gap: .8rem; }

        /* ── Fade utility ── */
        .bp-fade {
          opacity: 0; transform: translateY(20px);
          transition: opacity .7s ease, transform .7s var(--ease);
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .bp-nav { padding: 1.2rem 1.8rem; }
          .bp-hero__content { padding: 0 1.8rem 4rem; }
          .bp-layout {
            grid-template-columns: 1fr;
            padding: 3.5rem 1.8rem;
            gap: 2.5rem;
          }
          .bp-sidebar {
            position: static;
            display: flex; align-items: center; gap: 1rem;
          }
          .bp-share { display: flex; align-items: center; gap: 1rem; }
          .bp-share__label { writing-mode: horizontal-tb; transform: none; margin: 0; }
          .bp-share__buttons { flex-direction: row; }
          .bp-relacionados { padding: 3.5rem 1.8rem 4rem; }
          .bp-relacionados__grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
