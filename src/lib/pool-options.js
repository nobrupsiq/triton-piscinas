// Shared by the 3D scene (colors) and the configurator UI (labels, WhatsApp summary).
export const finishes = [
  { id: 'azul', label: 'Azul', swatch: '#178ca7', tile: 0x178ca7, water: 0x16a6b9 },
  { id: 'verde', label: 'Verde', swatch: '#2a9d8f', tile: 0x2a9d8f, water: 0x1aae9c },
  { id: 'areia', label: 'Areia', swatch: '#d9c7a0', tile: 0xd9c7a0, water: 0x47c4cc },
  { id: 'grafite', label: 'Grafite', swatch: '#3b4752', tile: 0x3b4752, water: 0x0d6a80 },
];

export const decks = [
  { id: 'madeira', label: 'Madeira', swatch: '#a6754d', color: 0xa6754d, roughness: 0.75 },
  { id: 'pedra', label: 'Pedra clara', swatch: '#d8cfbd', color: 0xd8cfbd, roughness: 0.9 },
  { id: 'porcelanato', label: 'Porcelanato', swatch: '#9c9a95', color: 0x9c9a95, roughness: 0.5 },
];

export const extras = [
  { id: 'beach', label: 'Prainha' },
  { id: 'cascade', label: 'Cascata' },
  { id: 'spa', label: 'Spa acoplado' },
  { id: 'pergola', label: 'Pergolado' },
  { id: 'fire', label: 'Lareira externa' },
];

export const leds = [
  { id: 'azul', label: 'Azul', swatch: '#24b9ff', color: 0x24b9ff },
  { id: 'turquesa', label: 'Turquesa', swatch: '#2be3c0', color: 0x2be3c0 },
  { id: 'lilas', label: 'Lilás', swatch: '#a57bff', color: 0xa57bff },
];

export const defaultConfig = {
  finish: 'azul',
  deck: 'madeira',
  beach: false,
  cascade: false,
  spa: false,
  pergola: false,
  fire: false,
  led: 'azul',
};

export function pick(list, id) {
  return list.find((item) => item.id === id) || list[0];
}

export function summary(config) {
  const chosen = extras.filter((extra) => config[extra.id]).map((extra) => extra.label);
  return [
    `Revestimento: ${pick(finishes, config.finish).label}`,
    `Deck: ${pick(decks, config.deck).label}`,
    `Extras: ${chosen.length ? chosen.join(', ') : 'nenhum'}`,
    `LED: ${pick(leds, config.led).label}`,
  ].join('\n');
}
