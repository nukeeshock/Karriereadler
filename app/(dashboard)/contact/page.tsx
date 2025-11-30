'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs: { question: string; answer: string }[] = [
    {
      question: 'Wie läuft der Prozess ab, wenn ich meinen Lebenslauf optimieren lassen möchte?',
      answer:
        'Du schickst uns deinen aktuellen Lebenslauf und die Zielstelle. Wir analysieren deine Unterlagen, stellen bei Bedarf Rückfragen und senden dir eine erste Version. Danach gibt es eine Feedback-Runde, bis die finale Fassung steht.'
    },
    {
      question: 'Welche Unterlagen soll ich euch schicken?',
      answer:
        'Am hilfreichsten sind dein aktueller Lebenslauf, die Stellenausschreibung, ein vorhandenes Anschreiben und gern dein LinkedIn-Profil. Je mehr Kontext, desto präziser können wir optimieren.'
    },
    {
      question: 'Für welche Branchen optimiert ihr Bewerbungsunterlagen?',
      answer:
        'Wir arbeiten branchenübergreifend: Technik, Handwerk, IT, Büro/Verwaltung, Ausbildung, Quereinstieg und mehr. Wichtig ist die Zielrolle – darauf richten wir Struktur und Inhalte aus.'
    },
    {
      question: 'Wie lange dauert es, bis ich die überarbeiteten Unterlagen zurückbekomme?',
      answer:
        'In der Regel 2–3 Werktage nach Eingang aller Infos. Wenn es eilig ist, gib Bescheid – wir finden meist eine schnellere Lösung.'
    },
    {
      question: 'Können meine Unterlagen ein Bewerbungs-Tracking-System (ATS) bestehen?',
      answer:
        'Ja. Wir achten auf klare Struktur, saubere Formatierung und relevante Keywords, damit ATS-Systeme Inhalte korrekt auslesen können, ohne an Lesbarkeit für Menschen zu sparen.'
    },
    {
      question: 'Wie geht ihr mit vertraulichen Daten um?',
      answer:
        'Deine Daten bleiben vertraulich, werden nicht weitergegeben und sorgfältig gespeichert. Auf Wunsch löschen wir Unterlagen nach Abschluss des Auftrags.'
    },
    {
      question: 'Bietet ihr auch Hilfe beim Anschreiben oder beim LinkedIn-Profil an?',
      answer:
        'Ja. Neben dem Lebenslauf können wir Anschreiben formulieren und dein LinkedIn-Profil optimieren, damit alles konsistent wirkt.'
    }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('failed');
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 bg-white">
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Hero Logo */}
          <div className="flex justify-center mb-8">
            <div className="group relative hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo_adler_notagline.png"
                alt="Karriereadler - Professionelle Bewerbungsunterlagen"
                width={600}
                height={200}
                className="w-full max-w-2xl h-auto"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 text-center sm:text-left">
            <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">
              Kontakt
            </p>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Lass uns deinen Lebenslauf aufs nächste Level bringen
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl">
              Fragen zum Ablauf, individuelle Angebote oder Firmenanfragen? Schreib uns, wenn du
              deinen Lebenslauf, dein Anschreiben oder dein LinkedIn-Profil optimieren lassen
              möchtest.
            </p>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm">
              <a
                href="#faq"
                className="text-orange-600 font-semibold hover:text-orange-700 underline underline-offset-4"
              >
                Direkt zu den FAQ springen
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 shadow-lg border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-gray-900">Schreib uns</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-900">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        required
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Vor- und Nachname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-900">
                        E-Mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="deine@email.de"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-900">
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+49 ..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-900">
                      Betreff *
                    </Label>
                    <Input
                      id="subject"
                      required
                      value={form.subject}
                      onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Worum geht es?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-900">
                      Nachricht *
                    </Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="Beschreibe kurz dein Ziel, die Stelle oder deine Fragen."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                    >
                      {loading ? 'Wird gesendet...' : 'Nachricht senden'}
                    </Button>
                    <p className="text-sm text-gray-600">
                      Wir melden uns in der Regel innerhalb von 24–48 Stunden zurück.
                    </p>
                  </div>

                  {status === 'success' && (
                    <p className="text-sm text-green-600">
                      Danke für deine Nachricht! Wir melden uns schnellstmöglich.
                    </p>
                  )}
                  {status === 'error' && (
                    <p className="text-sm text-red-600">
                      Senden fehlgeschlagen. Bitte versuche es erneut.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-gray-900">So erreichst du uns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Am schnellsten erreichst du uns per Formular oder per E-Mail an{' '}
                  <span className="font-semibold text-gray-900">info@karriereadler.com</span>.
                </p>
                <p>Gemeinsam bringen wir deinen Lebenslauf, dein Anschreiben oder dein LinkedIn-Profil auf Kurs.</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 scroll-mt-32" id="faq">
            <h2 className="text-3xl font-bold text-gray-900">Häufige Fragen (FAQ)</h2>
            <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-sm">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                      <span className="font-semibold text-gray-900">{item.question}</span>
                      <span className="text-orange-500 text-xl">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-6 pb-4 text-gray-700 text-base">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
