import Image from 'next/image';
import Link from 'next/link';
import Icon from './icon';
import SharedImage from './shared-image';
import { media } from '@/lib/site';

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link
        href={`/produtos/${product.slug}`}
        className="product-image-link"
        aria-label={`Conhecer ${product.nome}`}
      >
        <span className="product-label">{product.marca}</span>
        <SharedImage name={`produto-${product.slug}`}>
          <Image
            src={media(product.imagem)}
            alt={product.nome}
            width={480}
            height={420}
            sizes="(max-width: 700px) 50vw, 340px"
          />
        </SharedImage>
        <span className="product-arrow">
          <Icon name="arrow" />
        </span>
      </Link>
      <div className="product-card-body">
        <p className="product-kind">
          {product.configuracoes > 1
            ? `${product.configuracoes} configurações disponíveis`
            : 'Detalhes que fazem a diferença'}
        </p>
        <h3>
          <Link href={`/produtos/${product.slug}`}>{product.nome}</Link>
        </h3>
        <Link className="text-link" href={`/produtos/${product.slug}`}>
          Conhecer produto <Icon name="right" size={16} />
        </Link>
      </div>
    </article>
  );
}
