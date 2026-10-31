'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { whatsappUrl } from '@/lib/site';
import { decks, defaultConfig, extras, finishes, leds, summary } from '@/lib/pool-options';
import Icon from './icon';

function Swatches({ label, options, value, onChange }) {
  return (
    <fieldset className="pool-option">
      <legend>
        {label} <span>{options.find((option) => option.id === value)?.label}</span>
      </legend>
      <div className="pool-swatches">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-label={option.label}
            aria-pressed={value === option.id}
            title={option.label}
            style={{ '--swatch': option.swatch }}
            onClick={() => onChange(option.id)}
          />
        ))}
      </div>
    </fieldset>
  );
}

export default function PoolExperience({ poster }) {
  const host = useRef(null);
  const api = useRef(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('idle');
  const [dusk, setDusk] = useState(false);
  const [top, setTop] = useState(false);
  const [paused, setPaused] = useState(false);
  const [config, setConfig] = useState(defaultConfig);
  useEffect(() => {
    if (!active) return;
    let disposed = false;
    const element = host.current;
    const failed = () => {
      api.current?.dispose();
      api.current = null;
      setStatus('error');
    };
    element.addEventListener('pool-lost', failed);
    (async () => {
      try {
        const { createPoolScene } = await import('@/lib/pool-scene');
        if (disposed) return;
        const scene = await createPoolScene(element);
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
      element.removeEventListener('pool-lost', failed);
      api.current?.dispose();
      api.current = null;
    };
  }, [active]);
  const ready = status === 'ready';
  useEffect(() => {
    if (ready) api.current?.configure(config);
  }, [ready, config]);
  const update = (change) => setConfig((current) => ({ ...current, ...change }));
  const lighting = (value) => {
    setDusk(value);
    api.current?.lighting(value);
  };
  const start = () => {
    setStatus('loading');
    setActive(true);
  };
  return (
    <section className="pool-experience section" aria-labelledby="pool-title">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MONTE A SUA PISCINA</span>
            <h2 id="pool-title">
              Entre no seu
              <br />
              <em>próximo refúgio.</em>
            </h2>
          </div>
          <p>
            Escolha o revestimento, o deck e os extras, e veja tudo em 3D.
            <br />
            Quando gostar do resultado, envie a combinação para a nossa equipe.
          </p>
        </div>
        <div className="pool-layout">
          <div className="pool-stage" data-light={dusk ? 'dusk' : 'day'}>
            <div className="pool-canvas" ref={host} />
            {!ready && (
              <div className="pool-poster">
                <Image
                  src={poster}
                  alt="Piscina e área de lazer ao pôr do sol"
                  width={1400}
                  height={700}
                  sizes="(max-width: 1050px) 100vw, 900px"
                />
                <div>
                  {status === 'idle' && (
                    <button className="button button-white" onClick={start}>
                      Montar minha piscina em 3D <Icon name="arrow" />
                    </button>
                  )}
                  <p role="status">
                    {status === 'loading'
                      ? 'Preparando seu passeio…'
                      : status === 'error'
                        ? 'A visualização 3D não está disponível neste dispositivo. Você ainda pode montar sua combinação ao lado.'
                        : 'Uma nova forma de imaginar seu espaço.'}
                  </p>
                </div>
              </div>
            )}
            {ready && (
              <>
                <span className="pool-hint">Arraste para girar · role para aproximar</span>
                <div className="pool-lighting" role="group" aria-label="Iluminação da piscina">
                  <button aria-pressed={!dusk} onClick={() => lighting(false)}>
                    Dia
                  </button>
                  <button aria-pressed={dusk} onClick={() => lighting(true)}>
                    Entardecer
                  </button>
                </div>
                <div className="pool-controls" role="group" aria-label="Controles da visualização">
                  <button aria-label="Afastar" onClick={() => api.current?.zoom(-1)}>
                    <Icon name="minus" size={18} />
                  </button>
                  <button aria-label="Aproximar" onClick={() => api.current?.zoom(1)}>
                    <Icon name="plus" size={18} />
                  </button>
                  <span className="pool-divider" aria-hidden="true" />
                  <button
                    aria-label="Girar piscina para a esquerda"
                    onClick={() => api.current?.rotate(-1)}
                  >
                    <Icon name="previous" />
                  </button>
                  <button
                    aria-pressed={top}
                    onClick={() => {
                      setTop(!top);
                      api.current?.view(!top);
                    }}
                  >
                    {top ? 'Vista perspectiva' : 'Vista aérea'}
                  </button>
                  <button
                    aria-label="Girar piscina para a direita"
                    onClick={() => api.current?.rotate(1)}
                  >
                    <Icon name="next" />
                  </button>
                  <span className="pool-divider" aria-hidden="true" />
                  <button
                    aria-pressed={paused}
                    onClick={() => {
                      setPaused(!paused);
                      api.current?.pause(!paused);
                    }}
                  >
                    {paused ? 'Animar água' : 'Pausar água'}
                  </button>
                </div>
              </>
            )}
          </div>
          <aside className="pool-panel" aria-label="Personalize sua piscina">
            <Swatches
              label="Revestimento"
              options={finishes}
              value={config.finish}
              onChange={(finish) => update({ finish })}
            />
            <fieldset className="pool-option">
              <legend>Deck</legend>
              <div className="pool-chips">
                {decks.map((deck) => (
                  <button
                    key={deck.id}
                    type="button"
                    aria-pressed={config.deck === deck.id}
                    onClick={() => update({ deck: deck.id })}
                  >
                    <i style={{ '--swatch': deck.swatch }} aria-hidden="true" />
                    {deck.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="pool-option">
              <legend>Extras</legend>
              <div className="pool-chips">
                {extras.map((extra) => (
                  <button
                    key={extra.id}
                    type="button"
                    aria-pressed={config[extra.id]}
                    onClick={() => update({ [extra.id]: !config[extra.id] })}
                  >
                    {config[extra.id] && <Icon name="check" size={15} />}
                    {extra.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <Swatches
              label="Iluminação LED"
              options={leds}
              value={config.led}
              onChange={(led) => {
                update({ led });
                // LEDs only show at dusk, so jump there to make the choice visible.
                if (ready && !dusk) lighting(true);
              }}
            />
            <a
              className="button button-blue pool-send"
              href={whatsappUrl(
                `Olá, Triton! Montei uma piscina no configurador 3D do site e quero conversar sobre um projeto assim:\n\n${summary(config)}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Quero uma assim <Icon name="arrow" />
            </a>
            {status === 'idle' && (
              <button type="button" className="pool-panel-start" onClick={start}>
                Ver minhas escolhas em 3D
              </button>
            )}
          </aside>
        </div>
        <p className="pool-caption">
          Ambiente conceitual para inspiração. Seu projeto é pensado para o seu espaço.
        </p>
      </div>
    </section>
  );
}
