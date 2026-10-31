import { collection, config, fields } from '@keystatic/core';
import { categories } from './src/lib/site.js';

// Without a repository the panel edits local files, which only works with `npm run dev`.
const repo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;
export const storage = repo ? { kind: 'github', repo } : { kind: 'local' };

const brands = ['Albacete', 'Incisor', 'Namarra', 'GDA Fundidos', 'Nature Rio'];
const values = (label) =>
  fields.array(fields.text({ label: 'Valor' }), { label, itemLabel: (props) => props.value });

export default config({
  storage,
  ui: { brand: { name: 'Triton Piscinas' } },
  collections: {
    produtos: collection({
      label: 'Produtos',
      path: 'content/produtos/*',
      slugField: 'nome',
      format: { contentField: 'descricao' },
      entryLayout: 'content',
      columns: ['nomeCurto', 'marca', 'categoria', 'publicado'],
      schema: {
        nome: fields.slug({
          name: { label: 'Nome completo', validation: { isRequired: true } },
          slug: {
            label: 'Endereço da página',
            description:
              'Gerado a partir do nome. Não mude em produtos já publicados: links antigos deixariam de funcionar.',
          },
        }),
        nomeCurto: fields.text({
          label: 'Nome de exibição',
          description: 'Versão curta usada nos cards e no título da página.',
          validation: { isRequired: true },
        }),
        id: fields.integer({
          label: 'Referência',
          description:
            'Número único do produto. Em um produto novo, use um número ainda não usado.',
          validation: { isRequired: true, min: 1 },
        }),
        sku: fields.text({ label: 'SKU' }),
        publicado: fields.checkbox({ label: 'Publicado no site', defaultValue: true }),
        marca: fields.select({
          label: 'Marca',
          options: brands.map((brand) => ({ label: brand, value: brand })),
          defaultValue: brands[0],
        }),
        categoria: fields.select({
          label: 'Categoria',
          options: categories.map((category) => ({ label: category.name, value: category.slug })),
          defaultValue: categories[0].slug,
        }),
        categorias: fields.array(fields.text({ label: 'Categoria' }), {
          label: 'Categorias detalhadas',
          description: 'Usadas na busca do catálogo. Ex.: Albacete > Hidromassagem > Spas.',
          itemLabel: (props) => props.value,
        }),
        destaque: fields.checkbox({
          label: 'Destaque',
          description: 'Aparece primeiro na ordenação padrão do catálogo.',
        }),
        posicaoVitrine: fields.integer({
          label: 'Posição na vitrine da página inicial',
          description: 'De 1 a 12. Deixe vazio para não exibir na vitrine.',
          validation: { min: 1, max: 12 },
        }),
        resumo: fields.text({
          label: 'Resumo',
          description: 'Texto curto exibido no topo da página e no Google.',
          multiline: true,
        }),
        imagens: fields.array(
          fields.image({
            label: 'Foto',
            directory: 'public/midia/produtos',
            publicPath: '/midia/produtos/',
            validation: { isRequired: true },
          }),
          {
            label: 'Fotos',
            description: 'A primeira foto é a capa. Prefira imagens WebP ou JPG com até 1600 px.',
            itemLabel: (props) => props.value?.filename ?? 'Foto',
          },
        ),
        especificacoes: fields.array(
          fields.object({
            nome: fields.text({ label: 'Nome', validation: { isRequired: true } }),
            valores: values('Valores'),
            visivel: fields.checkbox({ label: 'Exibir no site', defaultValue: true }),
          }),
          {
            label: 'Ficha técnica',
            itemLabel: (props) => props.fields.nome.value || 'Especificação',
          },
        ),
        variacoes: fields.array(
          fields.object({
            id: fields.integer({ label: 'Referência', validation: { isRequired: true, min: 1 } }),
            nome: fields.text({ label: 'Nome' }),
            sku: fields.text({ label: 'SKU' }),
            publicado: fields.checkbox({ label: 'Disponível para orçamento', defaultValue: true }),
            atributos: fields.array(
              fields.object({
                nome: fields.text({ label: 'Nome', validation: { isRequired: true } }),
                valores: values('Valores'),
              }),
              {
                label: 'Características',
                itemLabel: (props) => props.fields.nome.value || 'Característica',
              },
            ),
            descricao: fields.text({ label: 'Itens inclusos', multiline: true }),
            precos: fields.object(
              {
                regular: fields.text({ label: 'Preço' }),
                promocional: fields.text({ label: 'Preço promocional' }),
              },
              { label: 'Preços (ainda não exibidos no site)' },
            ),
          }),
          {
            label: 'Configurações',
            description: 'Opções que o cliente escolhe ao pedir orçamento.',
            itemLabel: (props) => props.fields.nome.value || 'Configuração',
            validation: { length: { min: 1 } },
          },
        ),
        descricao: fields.markdoc({
          label: 'Descrição',
          options: {
            heading: [2, 3, 4],
            image: { directory: 'public/midia/produtos', publicPath: '/midia/produtos/' },
            table: false,
            codeBlock: false,
            code: false,
            blockquote: false,
            divider: false,
          },
        }),
      },
    }),
  },
});
