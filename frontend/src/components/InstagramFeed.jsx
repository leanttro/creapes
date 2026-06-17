import { useRef } from 'react';

// Props:
// posts: array de { embedUrl: string } — URLs de posts do Instagram para embed
// Valores de exemplo fixos; conectar ao backend depois via lib/api.js
const DEFAULT_POSTS = [
  { embedUrl: 'https://www.instagram.com/p/exemplo1/embed' },
  { embedUrl: 'https://www.instagram.com/p/exemplo2/embed' },
  { embedUrl: 'https://www.instagram.com/p/exemplo3/embed' },
  { embedUrl: 'https://www.instagram.com/p/exemplo4/embed' },
  { embedUrl: 'https://www.instagram.com/p/exemplo5/embed' },
];

export default function InstagramFeed({ posts = DEFAULT_POSTS }) {
  const trackRef = useRef(null);

  function scrollInsta(direction) {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: direction * 340, behavior: 'smooth' });
  }

  // Se não há posts, não renderiza a seção
  if (!posts || posts.length === 0) return null;

  return (
    <section className="insta-feed-wrapper fade-in">
      <h2 className="insta-feed-title fade-in">Siga nosso Instagram</h2>

      <div className="insta-carousel-container fade-in">
        <button
          onClick={() => scrollInsta(-1)}
          className="insta-nav-btn insta-prev"
          aria-label="Post anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="insta-track" id="insta-track" ref={trackRef}>
          {posts.map((post, i) => (
            <div className="insta-card" key={i}>
              <iframe
                src={post.embedUrl}
                width="100%"
                height="540"
                frameBorder="0"
                scrolling="no"
                allowTransparency="true"
                title={`Instagram post ${i + 1}`}
                style={{ background: '#111' }}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollInsta(1)}
          className="insta-nav-btn insta-next"
          aria-label="Próximo post"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <style>{`
        .insta-feed-wrapper {
          padding: 6rem 4rem;
          background-color: var(--bg);
          border-top: 1px solid rgba(255,255,255,0.05);
          position: relative;
          z-index: 5;
        }
        .insta-feed-title {
          font-size: 2.5rem;
          margin-bottom: 3rem;
          text-align: center;
          font-family: 'Space Grotesk', sans-serif;
          text-transform: uppercase;
          color: var(--text);
        }
        .insta-carousel-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .insta-track {
          display: flex;
          gap: 2rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          -ms-overflow-style: none;
          scrollbar-width: none;
          padding-bottom: 1rem;
          scroll-snap-type: x mandatory;
          flex: 1;
        }
        .insta-track::-webkit-scrollbar { display: none; }
        .insta-card {
          flex: 0 0 320px;
          scroll-snap-align: start;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          background: #0a0a0a;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          transition: transform 0.3s var(--ease), border-color 0.3s var(--ease);
        }
        .insta-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent);
        }
        .insta-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: #111;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s var(--ease);
          flex-shrink: 0;
        }
        .insta-nav-btn:hover {
          background: var(--accent);
          color: #000;
          border-color: var(--accent);
        }
        .insta-prev { left: -25px; }
        .insta-next { right: -25px; }

        @media (max-width: 900px) {
          .insta-feed-wrapper { padding: 4rem 2rem; }
          .insta-prev { left: 10px; }
          .insta-next { right: 10px; }
          .insta-card { flex: 0 0 280px; }
        }
      `}</style>
    </section>
  );
}
