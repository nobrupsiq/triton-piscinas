'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icon from './icon';

const steps = [
  {
    id: 'succao',
    title: 'Sucção',
    text: 'O ralo de fundo e o skimmer puxam a água da piscina, junto com folhas, poeira e outras impurezas.',
  },
  {
    id: 'bomba',
    title: 'Motobomba',
    text: 'É o coração do sistema: impulsiona a água por todo o circuito, num ritmo constante.',
    link: { href: '/produtos?categoria=piscinas', label: 'Ver motobombas e filtros' },
  },
  {
    id: 'filtro',
    title: 'Filtro',
    text: 'A areia ou o cartucho dentro do filtro retém as impurezas. Daqui em diante, a água segue limpa.',
    link: { href: '/produtos?categoria=piscinas', label: 'Ver motobombas e filtros' },
  },
  {
    id: 'aquecimento',
    title: 'Aquecimento',
    text: 'A bomba de calor eleva a temperatura da água, para você aproveitar a piscina o ano todo.',
    link: { href: '/produtos?categoria=aquecimento', label: 'Ver aquecimento' },
  },
  {
    id: 'retorno',
    title: 'Retorno',
    text: 'Os dispositivos de retorno devolvem a água limpa e aquecida, mantendo a piscina em movimento.',
  },
];

export default function SystemExperience() {
  const section = useRef(null);
  const host = useRef(null);
  const api = useRef(null);
  const [near, setNear] = useState(false);
  const [status, setStatus] = useState('loading');
  const [active, setActive] = useState(0);
  const [touring, setTouring] = useState(true);
  // Load the 3D engine only when the visitor gets close to the section.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setNear(true);
      },
      { rootMargin: '300px' },
    );
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!near) return;
    let disposed = false;
    const element = host.current;
    const failed = () => {
      api.current?.dispose();
      api.current = null;
      setStatus('error');
    };
    element.addEventListener('system-lost', failed);
    (async () => {
      try {
        const { createSystemScene } = await import('@/lib/system-scene');
        if (disposed) return;
        const scene = await createSystemScene(element);
        if (disposed) {
          scene.dispose();
          return;
        }
        api.current = scene;
        setStatus('ready');
      } catch {
        if (!disposed) setStatus('error');
      }
    })();
    return () => {
      disposed = true;
      element.removeEventListener('system-lost', failed);
      api.current?.dispose();
      api.current = null;
    };
  }, [near]);
  const ready = status === 'ready';
  useEffect(() => {
    if (ready) api.current?.focus(steps[active].id);
  }, [ready, active]);
  // Walk through the steps on its own until the visitor takes over.
  useEffect(() => {
    if (!ready || !touring || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setActive((current) => (current + 1) % steps.length), 5000);
    return () => clearInterval(timer);
  }, [ready, touring]);
  const choose = (index) => {
    setTouring(false);
    setActive(index);
  };
  const step = steps[active];
  return (
    <section ref={section} className="system-experience section" aria-labelledby="system-title">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">COMO FUNCIONA</span>
            <h2 id="system-title">
              Por dentro da
              <br />
              <em>sua piscina.</em>
            </h2>
          </div>
          <p>
            A água limpa e aquecida passa por um caminho que quase ninguém vê.
            <br />
            Siga cada etapa e conheça os equipamentos que a Triton instala.
          </p>
        </div>
        <div className="system-layout">
          <div className="system-stage">
            <div className="system-canvas" ref={host} onPointerDown={() => setTouring(false)} />
            {!ready && (
              <p className="system-status" role="status">
                {status === 'error'
                  ? 'A visualização 3D não está disponível neste dispositivo. Acompanhe as etapas ao lado.'
                  : 'Preparando a visualização…'}
              </p>
            )}
            {ready && (
              <>
                <span className="system-hint">Arraste para girar · role para aproximar</span>
                <ul className="system-legend" aria-label="Legenda">
                  <li data-stage="dirty">Água a filtrar</li>
                  <li data-stage="clean">Água filtrada</li>
                  <li data-stage="warm">Água aquecida</li>
                </ul>
                <div className="system-zoom" role="group" aria-label="Zoom">
                  <button aria-label="Afastar" onClick={() => api.current?.zoom(-1)}>
                    <Icon name="minus" size={18} />
                  </button>
                  <button aria-label="Aproximar" onClick={() => api.current?.zoom(1)}>
                    <Icon name="plus" size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="system-steps">
            <ol>
              {steps.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={index === active ? 'step' : undefined}
                    onClick={() => choose(index)}
                  >
                    <span>{index + 1}</span>
                    {item.title}
                  </button>
                </li>
              ))}
            </ol>
            <div className="system-detail" aria-live="polite">
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {step.link && (
                <Link className="text-link" href={step.link.href}>
                  {step.link.label} <Icon name="arrow" size={17} />
                </Link>
              )}
            </div>
            {touring && ready && (
              <button type="button" className="system-tour" onClick={() => setTouring(false)}>
                Pausar passeio automático
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
