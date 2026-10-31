'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Icon from './icon';
import { media } from '@/lib/site';

export default function ProjectGallery({ images, name, slug }) {
  const [active, setActive] = useState(null);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();
  const captionId = useId();
  const isOpen = active !== null;

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousGutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      root.style.overflow = previousOverflow;
      root.style.scrollbarGutter = previousGutter;
    };
  }, [isOpen]);

  function caption(index) {
    const credit =
      slug === 'vasco-da-gama' && /(?:13|14|15)$/.test(images[index].nome)
        ? ' · Foto: Paulo Fernandes / Vasco.com.br'
        : '';
    return `${name} · Registro ${String(index + 1).padStart(2, '0')}${credit}`;
  }
  function move(direction) {
    setActive((index) =>
      index === null ? null : (index + direction + images.length) % images.length,
    );
  }
  function onKeyDown(event) {
    if (event.key === 'Tab') {
      const buttons = dialogRef.current.querySelectorAll('button:not(:disabled)');
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  }
  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <div className="project-gallery">
        {images.map((image, index) => (
          <figure key={image.src}>
            <button
              type="button"
              className="project-photo"
              aria-label={`Ampliar foto ${index + 1} do projeto ${name}`}
              aria-haspopup="dialog"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setActive(index);
              }}
            >
              <img
                src={media(image.src)}
                alt={`Registro ${index + 1} do projeto ${name}`}
                width="500"
                height="360"
                loading="lazy"
              />
              <span className="project-photo-expand" aria-hidden="true">
                <Icon name="plus" size={20} />
              </span>
            </button>
            <figcaption>{caption(index)}</figcaption>
          </figure>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        className="project-lightbox"
        aria-labelledby={titleId}
        aria-describedby={captionId}
        onKeyDown={onKeyDown}
        onClose={() => {
          setActive(null);
          triggerRef.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (
            event.target === event.currentTarget ||
            event.target.classList.contains('lightbox-shell') ||
            event.target.classList.contains('lightbox-stage')
          )
            close();
        }}
      >
        {isOpen && (
          <div className="lightbox-shell">
            <div className="lightbox-header">
              <div>
                <span className="lightbox-eyebrow">GALERIA DO PROJETO</span>
                <h2 id={titleId}>{name}</h2>
              </div>
              <div className="lightbox-header-actions">
                <span className="lightbox-count" aria-live="polite" aria-atomic="true">
                  {String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  className="lightbox-button"
                  aria-label="Fechar galeria"
                  autoFocus
                  onClick={close}
                >
                  <Icon name="close" size={23} />
                </button>
              </div>
            </div>
            <div className="lightbox-stage">
              <button
                type="button"
                className="lightbox-button lightbox-previous"
                aria-label="Foto anterior"
                onClick={() => move(-1)}
                disabled={images.length < 2}
              >
                <Icon name="previous" size={25} />
              </button>
              <figure className="lightbox-figure">
                <div
                  className="lightbox-image-frame"
                  onClick={(event) => {
                    if (event.target === event.currentTarget) close();
                  }}
                >
                  <img
                    key={images[active].src}
                    className="gallery-image-enter"
                    src={media(images[active].src)}
                    alt={`Registro ${active + 1} do projeto ${name}`}
                    width="1400"
                    height="1000"
                    draggable="false"
                  />
                </div>
                <figcaption id={captionId}>{caption(active)}</figcaption>
              </figure>
              <button
                type="button"
                className="lightbox-button lightbox-next"
                aria-label="Próxima foto"
                onClick={() => move(1)}
                disabled={images.length < 2}
              >
                <Icon name="next" size={25} />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
