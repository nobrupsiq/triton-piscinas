import localFont from 'next/font/local';
import { site } from '@/lib/site';

const bogue = localFont({
  src: [
    { path: '../fonts/Bogue-Regular.woff2', weight: '400' },
    { path: '../fonts/Bogue-Medium.woff2', weight: '500' },
  ],
  variable: '--font-bogue',
  display: 'swap',
  preload: false,
});
const lexend = localFont({
  src: [
    { path: '../fonts/Lexend-Regular.woff2', weight: '400' },
    { path: '../fonts/Lexend-Medium.woff2', weight: '500' },
    { path: '../fonts/Lexend-SemiBold.woff2', weight: '600' },
  ],
  variable: '--font-lexend',
  display: 'swap',
  preload: false,
});
export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Triton Piscinas — Viva o seu melhor momento',
    template: '%s | Triton Piscinas',
  },
  description:
    'Piscinas, spas, banheiras, saunas e aquecimento. Produtos e soluções para transformar seu espaço de lazer, com atendimento especializado da Triton.',
  openGraph: { locale: 'pt_BR', type: 'website', siteName: site.name },
};
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${bogue.variable} ${lexend.variable}`}>
      <body>{children}</body>
    </html>
  );
}
