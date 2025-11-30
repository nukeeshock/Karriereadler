import type { Metadata } from 'next';
import Script from 'next/script';
import { ContactPageClient, type FaqItem } from './contact-client';

export const metadata: Metadata = {
  title: 'Kontakt – Fragen zu deinem Lebenslauf-Service | Karriereadler',
  description:
    'Kontakt zu Karriereadler: Stelle deine Fragen rund um Lebenslauf-Optimierung, Anschreiben oder Bundle. Antwort in der Regel innerhalb eines Werktags.',
  alternates: {
    canonical: '/contact'
  }
};

const faqs: FaqItem[] = [
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

export default function ContactPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <>
      <Script id="contact-faq-jsonld" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <ContactPageClient faqs={faqs} />
    </>
  );
}
