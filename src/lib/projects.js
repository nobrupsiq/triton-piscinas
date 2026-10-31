import assets from '@/data/assets.json';
export const projects = [
  {
    slug: 'solares-clube',
    name: 'Solares Clube',
    location: 'Maricá, RJ',
    type: 'Lazer & convivência',
    description:
      'Um espaço de lazer pensado para reunir pessoas. Conheça os registros do projeto realizado pela Triton no Solares Clube, em Maricá.',
    cover: assets.projects.solares.find((p) => p.nome.includes('piscina adulto solares triton 01'))
      ?.src,
    images: assets.projects.solares,
  },
  {
    slug: 'vasco-da-gama',
    name: 'C. R. Vasco da Gama',
    location: 'Rio de Janeiro, RJ',
    type: 'Esporte & performance',
    description:
      'Fornecimento de equipamentos e execução de projeto para a piscina olímpica do clube. O trabalho reúne sistemas de filtragem, aquecimento e tratamento digital da água, com equipamentos Albacete.',
    cover: assets.projects.vasco.find((p) => p.nome.endsWith('14'))?.src,
    images: assets.projects.vasco,
  },
];
