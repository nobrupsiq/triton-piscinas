export default function SpecificationValues({ name, values }) {
  if (!/^(peso|dimensões) sem embalagem$/i.test(name.trim())) {
    return values.join(' · ');
  }

  const dimensions = /^dimensões/i.test(name);
  return (
    <ul className="measurement-list">
      {values.map((value, index) => {
        const match = dimensions
          ? value.match(
              /^(.*?)(\b(?:Comprimento(?: Eixo Central)?|Largura|Altura|Diâmetro|Profundidade)\s*:[\s\S]*)$/i,
            )
          : value.match(/^(.*?)\s+(\d[\d., ]*\s*kg\.?)\s*$/i);
        const model = match?.[1].trim();
        const measurement = match ? match[2] : value;
        const lines = dimensions
          ? measurement.split(
              /\s+-\s+(?=(?:Comprimento(?: Eixo Central)?|Largura|Altura|Diâmetro|Profundidade)\s*:)/i,
            )
          : [measurement];
        return (
          <li key={index}>
            {model && <strong className="measurement-model">{model}</strong>}
            <span className="measurement-details">
              {lines.map((line, lineIndex) => (
                <span key={lineIndex}>{line}</span>
              ))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
