'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Pages remain server-rendered. Only below-the-fold elements are prepared for
// motion, after browser support is checked; without JS everything stays visible.
const targets = [
  '.section-heading',
  '.category-grid > *',
  '.product-grid > *',
  '.product-carousel',
  '.project-grid > *',
  '.showcase-grid > *',
  '.service-cards > *',
  '.project-gallery > *',
  '.story-image',
  '.story-copy',
  '.editorial-grid > *',
  '.catalog-help',
  '.brands-section',
  '.contact-banner-inner',
  '.product-information > div > h2',
  '.footer-grid > *',
].join(',');

const staggerGroups =
  '.category-grid, .product-grid, .project-grid, .service-cards, .project-gallery, .footer-grid';

export default function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.getElementById('conteudo');
    if (!main || !window.IntersectionObserver || !Element.prototype.animate) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const seen = new WeakSet();
    const pending = new Set();
    const running = new Map();
    let frame = 0;

    function reveal(element, immediate = false) {
      observer.unobserve(element);
      pending.delete(element);
      element.dataset.motion = 'revealed';
      if (immediate || preference.matches) {
        running.get(element)?.cancel();
        running.delete(element);
        return;
      }
      const siblings = element.parentElement?.matches(staggerGroups)
        ? [...element.parentElement.children]
        : [];
      const delay = Math.max(0, siblings.indexOf(element) % 4) * 65;
      const animation = element.animate(
        [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 620, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' },
      );
      running.set(element, animation);
      animation.onfinish = () => running.delete(element);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target);
          else if (entry.boundingClientRect.bottom < 0) reveal(entry.target, true);
        }
      },
      { rootMargin: '0px 0px -24px 0px', threshold: 0 },
    );

    function scan() {
      if (preference.matches) return;
      for (const element of pending) {
        if (!element.isConnected) {
          observer.unobserve(element);
          pending.delete(element);
        }
      }
      for (const [element, animation] of running) {
        if (!element.isConnected) {
          animation.cancel();
          running.delete(element);
        }
      }
      // Read geometry together before making changes; no scroll-event handlers.
      const candidates = [...document.querySelectorAll(targets)]
        .filter((element) => !seen.has(element))
        .map((element) => ({ element, rect: element.getBoundingClientRect() }));
      for (const { element, rect } of candidates) {
        // Hidden cached routes may become visible again later.
        if (!rect.width || !rect.height) continue;
        seen.add(element);
        if (rect.top < window.innerHeight) continue;
        element.dataset.motion = 'pending';
        pending.add(element);
        observer.observe(element);
      }
    }

    function showAll() {
      for (const element of pending) reveal(element, true);
      for (const animation of running.values()) animation.cancel();
      running.clear();
    }
    function onPreferenceChange() {
      if (preference.matches) showAll();
      else scan();
    }
    function onFocus(event) {
      const element = event.target.closest('[data-motion]');
      if (element) reveal(element, true);
    }

    // Search/pagination and streamed routes can replace content without a new pathname.
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mutations.observe(main, { childList: true, subtree: true });
    preference.addEventListener('change', onPreferenceChange);
    document.addEventListener('focusin', onFocus);
    window.addEventListener('beforeprint', showAll);
    scan();

    return () => {
      mutations.disconnect();
      observer.disconnect();
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', onPreferenceChange);
      document.removeEventListener('focusin', onFocus);
      window.removeEventListener('beforeprint', showAll);
      showAll();
    };
  }, [pathname]);

  return null;
}
