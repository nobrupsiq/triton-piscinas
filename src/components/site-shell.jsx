import Header from './header';
import Footer from './footer';
import MotionController from './motion-controller';
import '@/app/globals.css';

// Site chrome, kept out of the root layout so the Keystatic panel has its own styles.
export default function SiteShell({ children }) {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
      <MotionController />
    </>
  );
}
