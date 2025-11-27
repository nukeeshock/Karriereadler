Daily log — Karriereadler build

2025-01-15
- Branding/Marketing:
  - Landing neu: „Upgrade deinen Lebenslauf mit KI“, Preise 10 €/10 €/15 €, CTA routed je nach Login/Nutzung (mit Pulse), Story-Sektion ersetzt Terminal-Animation.
  - Header zeigt neues Logo `public/karriereadler_logo.png` (56x56), Meta-Titel/Beschreibung auf Karriereadler angepasst.
  - Pricing-Seite komplett auf Einmalpreise (Lebenslauf 10 €, Anschreiben 10 €, Bundle 15 €), keine Subscriptions.
- Kaufen/Checkout:
  - Buy-Page zeigt Produkte Lebenslauf/Anschreiben/Bundle mit Preisen, neutralere Fehler bei fehlenden Price-ENVs.
  - Checkout-API erwartet productType (cv/letter/bundle), nutzt STRIPE_PRICE_CV_SINGLE / STRIPE_PRICE_LETTER_SINGLE / STRIPE_PRICE_BUNDLE, mode payment, liefert URL.
  - Webhook idempotent über stripe_events (eventId unique); payment_status===paid + productType in metadata; stripe_events um productType erweitert (Migration 0003).
- Credits/Nutzungen:
  - Dashboard Settings: Team/Subscription/Invite entfernt; zeigt nur „Nutzungen“ und „Letzte Käufe“ (Fetch via /api/purchases).
  - Counter-Texte auf „Lebenslauf-Optimierungen“/„Anschreiben“ statt Credits.
  - Buy-CTA auf CV/Letter-Seiten; Buttons disabled bei 0 Nutzungen; Hinweis-Karten bei fehlenden Nutzungen.
  - Landing-CTA leitet eingeloggte Nutzer ohne Nutzungen auf /dashboard/buy, sonst auf /cv.
- AI/Backend:
  - Atomare Credit-Reservierung in /api/cv und /api/cover-letter (UPDATE ... WHERE credits>=1 RETURNING), OpenAI nur nach erfolgreicher Reservierung.
  - OpenAI Responses-Util (extractTextFromOpenAIResponse) + Client (createResponse) für Responses API (Default gpt-4.1-mini).
- DB/Migrationen:
  - stripe_events Tabelle hinzugefügt und später um productType erweitert (Migrationen 0002, 0003); users um cvCredits/letterCredits (0001).
  - Seed idempotent gemacht (User/Team/Member nur anlegen wenn fehlt).
- Misc:
  - Guard entfernt fehlerhaftes globalThis.localStorage bei Node mit --localstorage-file.
  - UI Wording konsequent auf „Lebenslauf“/„Anschreiben“, „Credits“ nur intern verwendet.
