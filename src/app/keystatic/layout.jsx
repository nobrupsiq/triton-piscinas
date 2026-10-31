import { notFound } from 'next/navigation';
import { panelEnabled } from '@/lib/keystatic';
import KeystaticApp from './keystatic';

export const metadata = { title: 'Painel', robots: { index: false, follow: false } };

export default function KeystaticLayout() {
  if (!panelEnabled) notFound();
  return <KeystaticApp />;
}
