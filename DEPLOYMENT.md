# Karriereadler - Production Deployment Guide

## ✅ Was wurde integriert: Vercel Blob Storage

Alle PDF-Uploads werden jetzt in **Vercel Blob Storage** gespeichert statt im lokalen Filesystem.
Das bedeutet:
- ✅ PDFs bleiben nach Redeploys erhalten
- ✅ Funktioniert mit multi-instance deployments
- ✅ Sicher: Nur authentifizierte User können ihre PDFs downloaden
- ✅ CDN-backed (schnell weltweit)
- ✅ Erste 500MB + 5GB Traffic/Monat **kostenlos**

---

## 🚀 Production Deployment Checklist

### 1. Vercel Blob Storage einrichten (5 Minuten)

1. Gehe zu [Vercel Dashboard → Storage](https://vercel.com/dashboard/stores)
2. Klicke auf **"Create Database"** → Wähle **"Blob"**
3. Name: `karriereadler-pdfs` (oder beliebig)
4. Region: `Frankfurt (fra1)` (nächste Region für DE)
5. Klicke **"Create"**

6. **Environment Variable kopieren:**
   - Im Storage-Dashboard → Tab **"Settings"** → **"Environment Variables"**
   - Kopiere `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXX`

7. **Zu deinem Vercel-Projekt hinzufügen:**
   - Vercel Dashboard → Dein Projekt → **Settings** → **Environment Variables**
   - Add new: `BLOB_READ_WRITE_TOKEN` = `vercel_blob_rw_XXXXXXXX`
   - Scope: **Production**, **Preview**, **Development**

---

### 2. Alle Environment Variables setzen

Stelle sicher, dass **alle** diese Variablen in Vercel gesetzt sind:

#### Erforderlich (App startet nicht ohne):
```bash
POSTGRES_URL=postgresql://...                # Neon DB Connection
AUTH_SECRET=...                              # JWT Secret (generiert mit: openssl rand -base64 32)
BASE_URL=https://karriereadler.com           # Deine Production Domain
STRIPE_SECRET_KEY=sk_live_...                # Stripe LIVE Key (nicht Test!)
STRIPE_WEBHOOK_SECRET=whsec_...              # Stripe Webhook Secret (siehe unten)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...     # Vercel Blob Token (siehe oben)
```

#### Stripe Produkt-IDs (ohne diese kann niemand kaufen):
```bash
STRIPE_PRICE_CV_SINGLE=price_XXXXXXX         # CV Einzelpreis aus Stripe Dashboard
STRIPE_PRICE_LETTER_SINGLE=price_XXXXXXX     # Cover Letter Einzelpreis
STRIPE_PRICE_BUNDLE=price_XXXXXXX            # Bundle Preis
```

#### Email-Versand (Resend):
```bash
RESEND_API_KEY=re_...                        # Resend API Key
EMAIL_FROM=info@karriereadler.com            # Absender-Email
ADMIN_NOTIFY_EMAIL=info@karriereadler.com    # Admin-Benachrichtigungen
```

#### Optional:
```bash
CONTACT_FORWARD_EMAIL=support@karriereadler.com  # Contact-Form Forwarding
MAPBOX_TOKEN=pk.eyJ1I...                         # Falls du Mapbox nutzt
```

---

### 3. Stripe Webhook konfigurieren

**WICHTIG:** Ohne konfigurierte Webhooks bleiben alle Zahlungen auf "PENDING_PAYMENT"!

1. Gehe zu [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Klicke **"Add endpoint"**
3. **Endpoint URL:** `https://karriereadler.com/api/stripe/webhook`
4. **Events to send:** Wähle:
   - `checkout.session.completed` ✅ (WICHTIG!)
   - Optional: `customer.subscription.updated`, `customer.subscription.deleted`
5. Klicke **"Add endpoint"**

6. **Signing Secret kopieren:**
   - Im erstellten Webhook → **"Signing secret"** (Button: "Reveal")
   - Format: `whsec_...`
   - Kopiere zu Vercel Environment Variables als: `STRIPE_WEBHOOK_SECRET`

7. **Redeploy** damit neue Env-Var aktiv wird

---

### 4. Resend Domain verifizieren

Damit Emails nicht im Spam landen:

1. Gehe zu [Resend Dashboard → Domains](https://resend.com/domains)
2. Add Domain: `karriereadler.com`
3. Füge die DNS-Records bei deinem Domain-Provider hinzu:
   - SPF Record
   - DKIM Records (3 Stück)
   - Return-Path
4. Warte auf Verifizierung (meist < 5 Minuten)

---

### 5. Pre-Launch Test Checklist

**Teste vor Go-Live:**

#### Test 1: Email-Verifizierung
- [ ] Neuen Account erstellen
- [ ] Verifizierungs-Email kommt an (nicht im Spam)
- [ ] Link funktioniert und aktiviert Account

#### Test 2: Kauf-Flow (mit Stripe Test-Mode)
- [ ] Produkt auswählen (CV/Letter/Bundle)
- [ ] Checkout öffnet sich
- [ ] Test-Zahlung durchführen (`4242 4242 4242 4242`)
- [ ] Redirect zu Dashboard funktioniert
- [ ] Bestätigungs-Email kommt an
- [ ] Order erscheint in `/dashboard/orders` mit Status "PAID"

#### Test 3: Fragebogen
- [ ] Fragebogen-Link in Dashboard sichtbar
- [ ] Formular ausfüllbar
- [ ] Submit funktioniert
- [ ] Status wechselt zu "READY_FOR_PROCESSING"

#### Test 4: Admin-Upload & Download
- [ ] Als Admin einloggen
- [ ] Order in `/admin/orders` sichtbar
- [ ] Order öffnen → Status wechselt zu "IN_PROGRESS"
- [ ] PDF hochladen
- [ ] Upload erfolgreich
- [ ] Kunden-Email mit Download-Link kommt an
- [ ] Als Kunde: PDF-Download funktioniert
- [ ] Download ist korrektes PDF

---

### 6. Monitoring & Alerts einrichten (empfohlen)

**Fehlerüberwachung:**
```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Warum wichtig:**
- Webhook-Fehler sofort sehen
- Email-Fehler tracken
- Upload-Probleme erkennen

---

## 🔒 Sicherheitscheck

- ✅ PDFs nur via authentifizierte API zugänglich
- ✅ Vercel Blob URLs mit Random-Suffix
- ✅ User-Ownership wird geprüft (`order.userId === user.id`)
- ✅ Webhook-Idempotenz gegen Doppel-Processing
- ✅ File-Type Validation (nur PDFs)
- ✅ File-Size Limit (20MB)

---

## 💰 Kosten-Übersicht

### Geschätzte monatliche Kosten bei 50 Kunden/Monat:

| Service | Nutzung | Kosten |
|---------|---------|--------|
| Vercel Pro | Hosting + Blob | **$20/mo** (feste Grundgebühr) |
| Neon DB | ~100 Queries/Tag | **$0** (Free Tier: 512MB) |
| Resend | 50 Emails/Mo | **$0** (Free: 3000/Mo) |
| Stripe | 50 × €50 = €2500 Umsatz | ~**€75** (3% + €0.25 per transaction) |
| **TOTAL** | | **~€22/Monat + Stripe Fees** |

### Bei 500 Kunden/Monat:
- Vercel Blob: Immer noch im Free Tier (< 500MB)
- Neon: Ggf. Scale auf ~$20/mo (wenn > 512MB DB)
- Resend: Immer noch kostenlos
- **TOTAL: ~€42/Monat + Stripe Fees**

---

## 🚨 Häufige Probleme & Lösungen

### Problem: "Webhook signature verification failed"
**Lösung:** `STRIPE_WEBHOOK_SECRET` in Vercel stimmt nicht mit Webhook-Endpoint überein
- Prüfe: Stripe Dashboard → Webhooks → Signing Secret
- Kopiere exakt (mit `whsec_` Prefix)

### Problem: Orders bleiben "PENDING_PAYMENT"
**Lösung:** Webhook Endpoint nicht konfiguriert oder falsche URL
- Muss exakt sein: `https://karriereadler.com/api/stripe/webhook`
- Teste: Stripe Dashboard → Webhooks → "Send test webhook"

### Problem: "Blob not found" beim Download
**Lösung:** `BLOB_READ_WRITE_TOKEN` fehlt in Vercel
- Check: Vercel Dashboard → Environment Variables
- Muss in **allen** Environments (Production/Preview/Development) gesetzt sein

### Problem: Emails kommen nicht an
**Lösung:** Domain nicht verifiziert oder Resend API Key fehlt
- Check: Resend Dashboard → Domain status muss "Verified" sein
- `RESEND_API_KEY` in Vercel gesetzt?

---

## 📊 Nach Go-Live überwachen

**Erste 24h:**
- [ ] Webhook-Logs in Stripe Dashboard prüfen
- [ ] Vercel Functions Logs checken (Errors?)
- [ ] Erste echte Bestellung testen (mit echtem Geld!)
- [ ] Email-Delivery-Rate in Resend prüfen

**Erste Woche:**
- [ ] Blob Storage Usage prüfen (sollte < 100MB sein)
- [ ] Neon DB Size checken
- [ ] Customer-Feedback zu Download-Speed

---

## ✅ Ready für Launch!

Wenn alle Checkboxen oben gecheckt sind, bist du ready für Production! 🚀

Bei Problemen: Check Vercel Logs → Functions → Filter by `/api/stripe/webhook` und `/api/admin/orders/*/upload-finished`
