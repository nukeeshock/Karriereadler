'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export type FaqItem = { question: string; answer: string };

export function ContactPageClient({ faqs }: { faqs: FaqItem[] }) {
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
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? 'Wird gesendet…' : 'Nachricht senden'}
                    </Button>
                    {status === 'success' && (
                      <span className="text-green-600 text-sm">Danke! Wir melden uns zeitnah.</span>
                    )}
                    {status === 'error' && (
                      <span className="text-red-600 text-sm">Etwas ist schiefgelaufen. Bitte erneut versuchen.</span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-gray-900">So erreichst du uns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div>
                  <p className="font-semibold text-gray-900">E-Mail</p>
                  <a href="mailto:info@karriereadler.com" className="text-orange-600 hover:text-orange-700">
                    info@karriereadler.com
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Antwort in der Regel innerhalb eines Werktags.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Telefon</p>
                  <p>+49 (0) 000 0000000</p>
                  <p className="text-sm text-gray-600 mt-1">Mo–Fr, 10–17 Uhr</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Standort</p>
                  <p>Berlin, Deutschland</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div id="faq" className="space-y-6">
            <div className="text-center sm:text-left">
              <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">FAQ</p>
              <h2 className="text-3xl font-bold text-gray-900">Häufige Fragen zum Karriereadler-Service</h2>
              <p className="text-gray-700 mt-2">Alles zu Ablauf, Anforderungen und Qualität.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="border border-gray-200 rounded-xl shadow-sm bg-white"
                >
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                    onClick={() => setOpenFaq((prev) => (prev === index ? null : index))}
                    aria-expanded={openFaq === index}
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <span className="text-orange-600 text-xl">{openFaq === index ? '–' : '+'}</span>
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4 text-gray-700">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
