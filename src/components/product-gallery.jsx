'use client';
import { useState } from 'react';
import { media } from '@/lib/site';
import SharedImage from './shared-image';
export default function ProductGallery({ images, name, slug }) {
  const [active, setActive] = useState(0);
  const [hasChanged, setHasChanged] = useState(false);
  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <SharedImage name={`produto-${slug}`}>
          <img
            key={active}
            onLoad={(event) => {
              if (hasChanged) event.currentTarget.classList.add('gallery-image-enter');
            }}
            src={media(images[active])}
            alt={`${name} — imagem ${active + 1}`}
            width="700"
            height="650"
            fetchPriority="high"
          />
        </SharedImage>
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbnails" role="group" aria-label="Imagens do produto">
          {images.map((image, i) => (
            <button
              key={`${image}-${i}`}
              onClick={() => {
                if (i !== active) {
                  setHasChanged(true);
                  setActive(i);
                }
              }}
              aria-label={`Ver imagem ${i + 1}`}
              aria-pressed={i === active}
            >
              <img src={media(image)} alt="" width="76" height="67" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
