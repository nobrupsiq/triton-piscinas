'use client';
import Link from 'next/link';
import Icon from './icon';
import { whatsappUrl } from '@/lib/site';
export default function ContactForm() {
  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      'Olá, Triton! Gostaria de conversar com a equipe.',
      `Nome: ${data.get('nome')}`,
      data.get('empresa') ? `Empresa: ${data.get('empresa')}` : '',
      data.get('email') ? `E-mail: ${data.get('email')}` : '',
      `Interesse: ${data.get('interesse')}`,
      '',
      data.get('mensagem'),
    ]
      .filter(Boolean)
      .join('\n');
    window.location.assign(whatsappUrl(message));
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <h2>Conte sua ideia.</h2>
      <p>Preencha os campos e continue o atendimento pelo WhatsApp.</p>
      <div className="form-row">
        <label className="field">
          <span>Seu nome *</span>
          <input name="nome" required autoComplete="name" maxLength={100} />
        </label>
        <label className="field">
          <span>Empresa (opcional)</span>
          <input name="empresa" autoComplete="organization" maxLength={120} />
        </label>
      </div>
      <label className="field">
        <span>E-mail (opcional)</span>
        <input name="email" type="email" autoComplete="email" maxLength={150} />
      </label>
      <label className="field">
        <span>Como podemos ajudar?</span>
        <select name="interesse">
          <option>Orçamento de produtos</option>
          <option>Construção de piscina</option>
          <option>Reforma e modernização</option>
          <option>Instalação de equipamentos</option>
          <option>Outros assuntos</option>
        </select>
      </label>
      <label className="field">
        <span>Sua mensagem *</span>
        <textarea
          name="mensagem"
          required
          placeholder="Fale um pouco sobre o seu espaço e o que você procura."
          maxLength={1500}
        />
      </label>
      <label className="form-consent">
        <input type="checkbox" required />
        <span>
          Concordo em compartilhar os dados acima com a Triton pelo WhatsApp para este atendimento.{' '}
          <Link href="/politicas/privacidade">Política de privacidade.</Link>
        </span>
      </label>
      <button className="button button-blue" type="submit">
        Continuar no WhatsApp <Icon name="arrow" size={19} />
      </button>
      <p>O envio da mensagem será confirmado por você no WhatsApp.</p>
    </form>
  );
}
