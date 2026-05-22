import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { useScrollProgress } from '../../hooks/useScrollAnimation';

export default function Layout({ children }) {
  const progress = useScrollProgress();

  return (
    <>
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      <Navbar />

      <main style={{ minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>
        {children}
      </main>

      <Footer />
    </>
  );
}
