# Stripe Preise einrichten

## Schritt-für-Schritt Anleitung

### 1. Stripe Dashboard öffnen
- Gehe zu: https://dashboard.stripe.com/
- Logge dich ein
- **Wichtig**: Stelle sicher, dass du im **Test Mode** bist (Toggle oben rechts)

### 2. Produkt 1: Lebenslauf-Optimierung (20€)

1. Gehe zu **Products** im Menü links
2. Klicke **+ Add product**
3. Fülle aus:
   - **Name**: `Lebenslauf-Optimierung`
   - **Description**: `Professionelle Lebenslauf-Optimierung im Karriereadler-Stil`
4. Bei **Pricing**:
   - **One time**: Wähle diese Option
   - **Price**: `20` EUR
   - **Price description**: `Einmalige Zahlung`
5. Bei **Additional options**:
   - Stelle sicher, dass **Payment links** aktiviert ist
6. Klicke **Save product**
7. **WICHTIG**: Kopiere die **Price ID** (z.B. `price_1ABC123...`)
   - Diese steht unter dem Preis im Produkt
   - Sieht aus wie: `price_1ORHasKPZn6HEfHw...`

### 3. Produkt 2: Anschreiben-Paket (20€)

1. Klicke wieder **+ Add product**
2. Fülle aus:
   - **Name**: `Anschreiben-Paket`
   - **Description**: `Zwei individuelle Anschreiben für unterschiedliche Stellenangebote`
3. Bei **Pricing**:
   - **One time**
   - **Price**: `20` EUR
4. Klicke **Save product**
5. Kopiere die **Price ID**

### 4. Produkt 3: Bundle (25€)

1. Klicke wieder **+ Add product**
2. Fülle aus:
   - **Name**: `Komplett-Bundle`
   - **Description**: `Lebenslauf-Optimierung + zwei Anschreiben zum Vorteilspreis`
3. Bei **Pricing**:
   - **One time**
   - **Price**: `25` EUR
4. Klicke **Save product**
5. Kopiere die **Price ID**

### 5. Price IDs in .env eintragen

Öffne deine `.env` Datei und ersetze:

```bash
STRIPE_PRICE_CV_SINGLE=price_1ORHasKPZn6HEfHw...    # Deine kopierte Price ID
STRIPE_PRICE_LETTER_SINGLE=price_1ORHbtKPZn6HEfHw... # Deine kopierte Price ID
STRIPE_PRICE_BUNDLE=price_1ORHcuKPZn6HEfHw...        # Deine kopierte Price ID
```

### 6. Für Production

Wenn du live gehst:
1. Wechsle zu **Live Mode** in Stripe
2. Erstelle die gleichen 3 Produkte nochmal
3. Kopiere die neuen Live-Mode Price IDs
4. Aktualisiere deine Production `.env` Datei

## Fertig! 🎉

Die Kaufen-Seite sollte jetzt funktionieren und Zahlungen über Stripe abwickeln.
