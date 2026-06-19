import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Home from './pages/Home';
import { isLoggedIn } from './lib/api';

const Case     = lazy(() => import('./pages/Case'));
const Painel   = lazy(() => import('./pages/Painel'));
const Login    = lazy(() => import('./pages/Login'));
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

/** Protege rotas de admin: redireciona para /login se não autenticado */
function RotaProtegida({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/case/:id" element={
          <Suspense fallback={<Loading />}><Case /></Suspense>
        } />

        {/* Login — redireciona pro painel se já autenticado */}
        <Route path="/login" element={
          <Suspense fallback={<Loading />}><Login /></Suspense>
        } />

        {/* Painel — exige login */}
        <Route path="/painel" element={
          <RotaProtegida>
            <Suspense fallback={<Loading />}><Painel /></Suspense>
          </RotaProtegida>
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
