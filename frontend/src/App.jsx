import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Home from './pages/Home';

const Case     = lazy(() => import('./pages/Case'));
const Painel   = lazy(() => import('./pages/Painel'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

const Loading = () => (
  <div style={{
    background: 'var(--bg)',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--accent)',
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: '1.5rem',
    letterSpacing: '0.2em',
  }}>
    LOADING
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/case/:id" element={
          <Suspense fallback={<Loading />}><Case /></Suspense>
        } />

        <Route path="/painel" element={
          <Suspense fallback={<Loading />}><Painel /></Suspense>
        } />

        <Route path="/blog" element={
          <Suspense fallback={<Loading />}><BlogPost /></Suspense>
        } />

        <Route path="/blog/:slug" element={
          <Suspense fallback={<Loading />}><BlogPost /></Suspense>
        } />

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}