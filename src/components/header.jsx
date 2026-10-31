'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Icon from './icon';
import assets from '@/data/assets.json';
import { media, whatsappUrl } from '@/lib/site';

const links = [
  ['/', 'Início'],
  ['/produtos', 'Produtos'],
  ['/servicos', 'Serviços'],
  ['/projetos', 'Projetos'],
  ['/empresa', 'A Triton'],
];
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia('(min-width: 1051px)');
    function closeOnEscape(event) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      menuButtonRef.current?.focus();
    }
    function closeOutside(event) {
      if (!headerRef.current?.contains(event.target)) setOpen(false);
    }
    function closeOnDesktop(event) {
      if (event.matches) setOpen(false);
    }
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOutside);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOutside);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [open]);
  return (
    <>
      <div className="announcement">
        <span>Seu próximo mergulho começa aqui.</span>
        <Link href="/contato">
          Atendimento especializado <Icon name="arrow" size={13} />
        </Link>
      </div>
      <header className="site-header" ref={headerRef}>
        <div className="container header-inner">
          <Link
            href="/"
            aria-label="Triton Piscinas — início"
            onClick={() => setOpen(false)}
            className="brand"
          >
            <img src={media(assets.logo)} alt="Triton Piscinas" width="160" height="58" />
          </Link>
          <nav className="desktop-nav" aria-label="Navegação principal">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  (href === '/' ? pathname === '/' : pathname.startsWith(href)) ? 'page' : undefined
                }
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link className="search-link" href="/produtos#busca" aria-label="Buscar produtos">
              <Icon name="search" />
            </Link>
            <a
              className="button button-blue header-quote"
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Vamos conversar <Icon name="arrow" size={17} />
            </a>
            <button
              ref={menuButtonRef}
              className="menu-button"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              <Icon name={open ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Navegação mobile"
          data-open={open}
          aria-hidden={!open}
          inert={!open}
        >
          {[...links, ['/contato', 'Contato']].map(([href, label], index) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{ '--menu-order': index }}
            >
              {label}
              <Icon name="arrow" size={17} />
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
