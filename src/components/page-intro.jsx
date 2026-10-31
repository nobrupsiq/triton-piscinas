import Link from 'next/link';
import Icon from './icon';
export default function PageIntro({ eyebrow, title, description, breadcrumb }) {
  return (
    <section className="page-intro">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Caminho da página">
          <Link href="/">Início</Link>
          <Icon name="next" />
          <span aria-current="page">{breadcrumb || title}</span>
        </nav>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}
