'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Icon from './icon';
import SharedImage from './shared-image';
import { categories, media } from '@/lib/site';

const number = (value) => String(value).padStart(2, '0');

export default function ProductCarousel({ products }) {
  const id = useId();
  const railRef = useRef(null);
  const progressRef = useRef(null);
  const dragRef = useRef(null);
  const settleFrameRef = useRef(0);
  const suppressClickRef = useRef(false);
  const [range, setRange] = useState(null);

  function settle() {
    const rail = railRef.current;
    cancelAnimationFrame(settleFrameRef.current);
    // Keep native snapping off until we have gently reached an actual snap point.
    rail.dataset.settling = 'true';
    const start = rail.scrollLeft;
    const left = rail.getBoundingClientRect().left;
    const max = rail.scrollWidth - rail.clientWidth;
    const points = [...rail.children].map((card) =>
      Math.max(0, Math.min(max, card.getBoundingClientRect().left - left + start)),
    );
    const target = points.reduce((nearest, point) =>
      Math.abs(point - start) < Math.abs(nearest - start) ? point : nearest,
    );
    const distance = target - start;
    function complete() {
      rail.scrollLeft = target;
      delete rail.dataset.settling;
      settleFrameRef.current = 0;
    }
    if (Math.abs(distance) < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      complete();
      return;
    }
    const started = performance.now();
    const duration = 420;
    function tick(now) {
      const progress = Math.min(1, (now - started) / duration);
      rail.scrollLeft = start + distance * (1 - (1 - progress) ** 3);
      if (progress < 1) settleFrameRef.current = requestAnimationFrame(tick);
      else complete();
    }
    settleFrameRef.current = requestAnimationFrame(tick);
  }

  function endDrag() {
    const drag = dragRef.current;
    if (!drag) return;
    const rail = railRef.current;
    dragRef.current = null;
    if (drag.moved || rail.dataset.settling) settle();
    delete rail.dataset.dragging;
    if (rail.hasPointerCapture(drag.id)) rail.releasePointerCapture(drag.id);
  }

  useEffect(() => {
    window.addEventListener('blur', endDrag);
    return () => {
      window.removeEventListener('blur', endDrag);
      cancelAnimationFrame(settleFrameRef.current);
    };
  }, []);

  function onPointerDown(event) {
    suppressClickRef.current = false;
    // Touch keeps the browser's native momentum and vertical page scrolling.
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    cancelAnimationFrame(settleFrameRef.current);
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      scroll: event.currentTarget.scrollLeft,
      moved: false,
    };
  }

  function onPointerMove(event) {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    if (!(event.buttons & 1)) return endDrag();
    const distance = event.clientX - drag.x;
    if (!drag.moved && Math.abs(distance) < 7) return;
    const rail = event.currentTarget;
    if (!drag.moved) {
      drag.moved = true;
      suppressClickRef.current = true;
      rail.dataset.dragging = 'true';
      rail.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    rail.scrollLeft = drag.scroll - distance;
  }

  useEffect(() => {
    const rail = railRef.current;
    let frame = 0;
    function measure() {
      const firstCard = rail.firstElementChild;
      if (!firstCard) return;
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      const step = firstCard.getBoundingClientRect().width + gap;
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const offset = Math.max(0, Math.min(max, rail.scrollLeft));
      const first = Math.min(products.length - 1, Math.round(offset / step));
      const visible = Math.max(1, Math.floor((rail.clientWidth + gap + 1) / step));
      const next = {
        first,
        last: offset >= max - 2 ? products.length : Math.min(products.length, first + visible),
        atStart: offset <= 2,
        atEnd: offset >= max - 2,
      };
      progressRef.current?.style.setProperty('--progress', String(max > 0 ? offset / max : 1));
      setRange((current) =>
        current && Object.keys(next).every((key) => current[key] === next[key]) ? current : next,
      );
    }
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    }
    const resize = new ResizeObserver(measure);
    resize.observe(rail);
    rail.addEventListener('scroll', onScroll, { passive: true });
    measure();
    return () => {
      resize.disconnect();
      rail.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [products.length]);

  function navigate(direction) {
    const rail = railRef.current;
    cancelAnimationFrame(settleFrameRef.current);
    delete rail.dataset.settling;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const step = rail.firstElementChild.getBoundingClientRect().width + gap;
    const target =
      direction === 'start'
        ? 0
        : direction === 'end'
          ? rail.scrollWidth
          : rail.scrollLeft + direction * step;
    rail.scrollTo({
      left: target,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }
  function onKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    const direction = { ArrowLeft: -1, ArrowRight: 1, Home: 'start', End: 'end' }[event.key];
    if (direction !== undefined) {
      event.preventDefault();
      navigate(direction);
    }
  }

  return (
    <div
      className="product-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Produtos em destaque"
    >
      <div className="carousel-toolbar">
        <p>
          <span className="selection-dot" /> Uma seleção para o seu próximo projeto{' '}
          <span className="selection-count">{products.length} produtos</span>
        </p>
        <div className="carousel-controls">
          <button
            type="button"
            aria-label="Produtos anteriores"
            aria-controls={id}
            disabled={!range || range.atStart}
            onClick={() => navigate(-1)}
          >
            <Icon name="previous" size={22} />
          </button>
          <button
            type="button"
            aria-label="Próximos produtos"
            aria-controls={id}
            disabled={!range || range.atEnd}
            onClick={() => navigate(1)}
          >
            <Icon name="next" size={22} />
          </button>
        </div>
      </div>
      <ul
        id={id}
        ref={railRef}
        className="carousel-rail"
        tabIndex={0}
        aria-label="Lista de produtos em destaque. Use as setas para navegar."
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onPointerLeave={() => {
          if (!dragRef.current?.moved) endDrag();
        }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (suppressClickRef.current && event.detail > 0) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {products.map((product, index) => (
          <li className="carousel-slide" key={product.id}>
            <article className="product-card featured-card">
              <Link
                href={`/produtos/${product.slug}`}
                className="featured-card-link"
                aria-label={`Conhecer ${product.nome}`}
              >
                <div className="featured-visual">
                  <div className="featured-card-top">
                    <span>{product.marca}</span>
                    <span className="featured-number">{number(index + 1)}</span>
                  </div>
                  <SharedImage name={`produto-${product.slug}`}>
                    <Image
                      src={media(product.imagem)}
                      alt={product.nome}
                      width={600}
                      height={540}
                      sizes="(max-width: 700px) 85vw, 440px"
                      draggable="false"
                    />
                  </SharedImage>
                  <span className="featured-discover">
                    <Icon name="plus" size={20} />
                  </span>
                </div>
                <div className="featured-card-body">
                  <span className="featured-category">
                    {categories.find((category) => category.slug === product.categoria)?.name}
                  </span>
                  <h3>{product.nome}</h3>
                  {product.detalhe && (
                    <span className="featured-detail">
                      <Icon name="check" size={16} />
                      {product.detalhe}
                    </span>
                  )}
                  <p>
                    {product.configuracoes > 1
                      ? `${product.configuracoes} configurações disponíveis`
                      : 'Encontre a opção ideal para você'}
                  </p>
                  <div className="featured-card-bottom">
                    <span>Conhecer opções</span>
                    <span className="featured-cta">
                      <Icon name="arrow" size={20} />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          </li>
        ))}
      </ul>
      <div className="carousel-footer">
        <span className="carousel-counter" aria-live="polite" aria-atomic="true">
          {range ? (
            <>
              <strong>
                {number(range.first + 1)}–{number(range.last)}
              </strong>{' '}
              de {number(products.length)}
            </>
          ) : (
            `${products.length} produtos selecionados`
          )}
        </span>
        <div className="carousel-progress" ref={progressRef} aria-hidden="true">
          <span />
        </div>
        <span className="carousel-hint">
          Segure e arraste para explorar <Icon name="right" size={16} />
        </span>
      </div>
    </div>
  );
}
