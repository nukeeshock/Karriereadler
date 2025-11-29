# Email-Domain einrichten (Resend)

## Option 1: Eigene Domain verwenden (info@karriereadler.com)

### Voraussetzungen
- Du musst Zugriff auf die DNS-Einstellungen deiner Domain haben
- Domain muss bei einem Provider gehostet sein (z.B. Namecheap, GoDaddy, Cloudflare, etc.)

### Schritt-für-Schritt

#### 1. Domain zu Resend hinzufügen

1. Gehe zu: https://resend.com/domains
2. Klicke **Add Domain**
3. Gib ein: `karriereadler.com` (ohne www)
4. Klicke **Add**

#### 2. DNS Records hinzufügen

Resend zeigt dir jetzt mehrere DNS Records. Du musst diese bei deinem Domain-Provider hinzufügen:

**Beispiel DNS Records** (deine werden ähnlich aussehen):

```
TXT Record:
Name: @ oder karriereadler.com
Value: resend_verify=abc123def456...

MX Record:
Name: @ oder karriereadler.com
Priority: 10
Value: feedback-smtp.eu-west-1.amazonses.com

TXT Record (SPF):
Name: @ oder karriereadler.com
Value: v=spf1 include:amazonses.com ~all

TXT Record (DKIM 1):
Name: resend._domainkey
Value: p=MIGfMA0GCS...

TXT Record (DKIM 2):
Name: resend2._domainkey
Value: p=MIGfMA0GCS...

TXT Record (DMARC):
Name: _dmarc
Value: v=DMARC1; p=none; ...
```

#### 3. DNS Records bei deinem Provider eintragen

**Bei Cloudflare:**
1. Gehe zu deinem Cloudflare Dashboard
2. Wähle `karriereadler.com`
3. Klicke **DNS** → **Records**
4. Klicke **Add record** für jeden Record
5. Trage alle Records ein (kann 5-10 Minuten dauern)

**Bei anderen Providern:**
- Der Prozess ist ähnlich, schaue nach "DNS Management" oder "DNS Settings"
- Füge alle TXT, MX Records hinzu wie von Resend angezeigt

#### 4. Warte auf Verifizierung

- DNS-Änderungen können 5 Minuten bis 48 Stunden dauern (meist 10-30 Min)
- In Resend siehst du den Status: **Pending** → **Verified** ✅
- Klicke auf **Verify** um zu prüfen

#### 5. .env aktualisieren

Wenn die Domain verifiziert ist, aktualisiere deine `.env`:

```bash
EMAIL_FROM=info@karriereadler.com  # Oder support@, hello@, etc.
```

## Option 2: Resend Subdomain verwenden (Einfacher, aber weniger professionell)

Wenn du keine eigene Domain einrichten willst:

1. Nutze einfach: `onboarding@resend.dev`
2. In der `.env`:
   ```bash
   EMAIL_FROM=onboarding@resend.dev
   ```

**Nachteil:** Emails werden als "sent via resend.dev" angezeigt

## Option 3: Subdomain verwenden (z.B. mail.karriereadler.com)

Wenn du die Haupt-Domain nicht für Emails nutzen willst:

1. Bei Resend: Füge `mail.karriereadler.com` hinzu
2. Gleiche DNS Records, aber für die Subdomain
3. In `.env`:
   ```bash
   EMAIL_FROM=info@mail.karriereadler.com
   ```

## Testen

Nach der Einrichtung teste die Email-Verifizierung:

```bash
# Registriere einen Test-Account
# Du solltest eine Email erhalten mit schönem Design
```

## Troubleshooting

### "Domain not verified"
- Warte noch ein paar Minuten
- Prüfe ob alle DNS Records korrekt eingetragen sind
- Nutze https://mxtoolbox.com/ um DNS zu überprüfen

### "Email not sent"
- Prüfe Resend API Key in `.env`
- Schaue in Resend Dashboard unter **Logs**
- Prüfe Server Console für Fehler

## Empfehlung 🎯

**Für den Start:** Nutze Option 2 (`onboarding@resend.dev`) zum Testen

**Für Production:** Richte deine eigene Domain ein (Option 1) für professionelles Auftreten
