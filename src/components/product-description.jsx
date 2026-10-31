import Icon from './icon';

export default function ProductDescription({ html, summary }) {
  const content = <div className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />;
  // Markdoc's compact HTML: 1350 keeps the same 141 long descriptions collapsed.
  if (html.length <= 1350) return content;
  const text = summary.trim().replace(/\s+/g, ' ');
  const preview = text.length > 320 ? `${text.slice(0, 320).replace(/\s+\S*$/, '')}…` : text;
  return (
    <>
      <p className="product-overview">{preview}</p>
      <details className="product-description-details">
        <summary>
          <span className="description-expand">Ver descrição completa e componentes</span>
          <span className="description-collapse">Recolher descrição</span>
          <Icon name="down" size={20} />
        </summary>
        {content}
      </details>
    </>
  );
}
