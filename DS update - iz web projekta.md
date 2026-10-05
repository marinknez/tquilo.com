# T’quilo DS: promjene iz projekta „T’quilo web design“ (listopad 2026)

Ovaj dokument je **ulaz za ažuriranje design systema**. Svaka stavka sadrži dvije stvari:
1. **gdje** ide u `readme.md` (ili u koju datoteku);
2. **što** se mijenja: novo pravilo ili zamjena postojećeg.

**Web je finalan i on je izvor istine.** Gdje se design system razlikuje od weba, mijenja se design system.

> ⚠ **Dokument ima dva dijela.**
> **Dio A** (odjeljci 1-8) nastao je u fazi dizajna, prije nego je web izgrađen.
> **Dio B** (odjeljak 9 nadalje) nastao je iz **izgrađenog i objavljenog sitea**.
> Gdje se razlikuju, **vrijedi dio B** - ondje je izričito navedeno što iz dijela A
> ispada. Dio A se ne briše da ostane vidljivo zašto je nešto promijenjeno.

---

## 1. Proizvod i kontekst (§1)

### 1.1 More i jezera
- U svakom copyju T’quilo je **„na vodi“**, ne samo „na moru“. Platforma se koristi i na jezerima.
- Zabranjeno je pisati naslove koji isključuju jezera („Građeno za more“ i slično).
- Odobrene formulacije:
  - „na moru i jezerima“
  - „mir na vodi“
  - „za more i jezera“

### 1.2 Kampovi među B2B kupcima
- Popis partnera u copyju glasi: **Hoteli · resorti · kampovi · marine · beach klubovi**.
- Isti redoslijed vrijedi i za `label` liniju.

### 1.3 Koncesija umjesto posade
- B2B argument je: *gostima ne treba dozvola, a partneru je dovoljna koncesija na dio plaže, na moru ili jezeru.*
- Odobreni zapis (HR): „Vašim gostima ne treba dozvola, a vama je dovoljna koncesija na dio plaže, na moru ili jezeru. T’quilo može nositi i boje vašeg brenda.“
- Odobreni zapis (EN): „Your guests need no licence, and all you need is a concession on part of the beach, by the sea or on a lake. T’quilo can also wear your brand colours.“

### 1.4 Tradicija i iskustvo
Na webu se podrijetlo komunicira **bez imena proizvođača u naslovu i bez nabrajanja** (trup, laminat…).

| Label | HR | EN |
|---|---|---|
| Nautički standardi | „Hrvatski proizvod, napravljen po najvišim standardima gradnje - za more i jezera.“ | — |
| 20+ godina iskustva | „Iza T’quila stoji više od dvadeset godina tradicije i iskustva u brodogradnji.“ | „More than twenty years of boatbuilding tradition and experience stand behind T’quilo.“ |

- Tvrdnja „sukladan svim pomorskim normama“ se **ne koristi**.
- `ProvenanceNote` ostaje za spec list, ponudu i footer dokumentacije.

### 1.5 Pravni potpis tvrtke
Na zadnjem ekranu weba i u PDF-ovima (konfiguracija, ponuda) stoji, sitno (12 px / 8 pt, `--text-muted`):

```
Arba Nautika d.o.o. za proizvodnju i trgovinu
OIB 00720431425
```

Zapis „ARBA NAUTIKA“ verzalno se ne koristi. Ime se piše **Arba Nautika d.o.o.**

---

## 2. Izvedbe Pure / Signature (§1, „Izvedbe“)

### 2.1 Službeni opisi (zamjenjuju postojeće)
- **T’quilo Pure:** *„Luksuzni lounge na vodi za dvoje, bez električnih dodataka.“* (bez promjene)
- **T’quilo Signature:** **„Luksuzni lounge na vodi za dvoje, u punoj opremi.“** / EN *„A luxury lounge on water for two, fully equipped.“*
- Opis se ne proširuje nabrajanjem. Oprema se prikazuje kao lista s ikonama ispod opisa (2.2).

### 2.2 Prikaz izvedbi u usporedbi
- Naslov: „Ista platforma. Dvije izvedbe.“ / „One platform. Two versions.“
- „Pure“ i „Signature“ u usporedbi se pišu **velikim Marcellusom u `--accent` (Champagne)**. Iznad svakog naziva stoji malo „T’quilo“ u `--text-muted`.
- Ispod svake izvedbe ide **ista lista zajedničke opreme s ikonama**, a Signature dodaje svoju opremu (tablica ispod).
- Rečenica *„Svedeno na bit: sunce, sjena i tišina.“* **se ne koristi** na webu (klijent ju je maknuo). U DS-u ostaje kao interni opis tona, ne kao copy.
- Oznaka „U obje izvedbe“ se ne koristi. Zajednička oprema se prikazuje ponovljena ispod svake izvedbe.

| Lista | Stavke (ikona → naziv) |
|---|---|
| zajedničko (obje izvedbe) | `motor` Električni motor · `cushions` Jastuci · `awning` Tenda · `module-curtain` Zavjese · `steps` Stepenice |
| samo Signature | `shower` Tuš · `fridge` Hladnjak · `sound` Glazbeni sustav · `lights` Rasvjeta |

### 2.3 Konfigurator i izvedbe
- U konfiguratoru boja **nema razlike** između Pure i Signature.
- Uz sažetak stoji: „Boje vrijede za obje izvedbe, T’quilo Pure i T’quilo Signature.“

---

## 3. Content fundamentals (§2)

### 3.1 Nazivlje opreme: jedan naziv za svaki pojam
**Zamijeniti u cijelom DS-u** (§1 oprema, §2 primjeri, `FeatureItem` primjeri, ikone):

| Staro | Novo (HR) | EN |
|---|---|---|
| frižider | **hladnjak** | fridge |
| Bluetooth zvučnici / zvučnici | **glazbeni sustav** (u opisnom copyju: „vaša glazba“) | sound system |
| stepenice za izlaz iz vode | **stepenice** | steps |
| — | **električni motor** | electric motor |
| tenda sa zavjesama | **tenda** + **zavjese** (dva modula) | awning, curtains |

Primjer iz §2 *„Frižider - 40 l, tiho hlađenje.“* treba glasiti **„Hladnjak - 40 l, tiho hlađenje.“**

### 3.2 Crtice
- Klijent je tražio **„-“ umjesto „—“ svugdje** u web copyju.
- Pravilo za DS:
  - **web i UI:** spojnica s razmacima ( - );
  - **print:** po želji en-dash (–).
- Duga crtica (—) se ne koristi.

### 3.3 Pozivi na akciju
| Kontekst | Odobreno | Zamjenjuje |
|---|---|---|
| partneri, prvi kontakt | **„Javite nam se“** / „Get in touch“ | „Zatraži ponudu“ |
| konfigurator | **„Konfigurirajte svoj T’quilo“** / „Configure your T’quilo“ | „Otvori konfigurator“, „Složi svoju platformu“ |
| forma | „Pošalji upit“ / „Send enquiry“ | (bez promjene) |
| dokument | „Specifikacija (PDF)“ | (bez promjene) |

Obećanje vremena odgovora („javljamo se u jednom radnom danu“) **se ne koristi**. Primjer iz §2 „Osoba“ treba zamijeniti s **„Javit ćemo vam se uskoro.“**

### 3.4 Toast poruke
| Situacija | HR | EN |
|---|---|---|
| poslan upit | „Upit je poslan.“ + „Javit ćemo vam se uskoro.“ | „Enquiry sent.“ + „We’ll be in touch soon.“ |
| kopiran link | „Link je kopiran.“ | „Link copied.“ |

### 3.5 Fjaka
- Tagline **„Engineered for fjaka.“** koristi se kao **naslov** (EN u obje jezične verzije).
- Uz naslov ide subline i rječnička definicija.
- Subline (HR): „Vrijeme koje nitko ne mjeri. A kad se vratite na obalu, već ćete htjeti natrag.“
- **Službena definicija** (koristi se doslovno, ikona `fjaka` + „Fjaka“ u Marcellusu):
  - HR: *Fjaka je dalmatinsko stanje opuštenog ništaneradenja, lagane dosade i bezvoljnosti, ali bez stresa. To je meditativni odmor od obaveza u kojem samo „bivaš“ i promatraš svijet oko sebe, uz more, sunce i polagani ritam obale.*
  - EN: *Fjaka is a Dalmatian state of relaxed doing-nothing, a gentle boredom and lack of motivation, but without stress. It is a meditative break from obligations in which you simply “be” and watch the world around you, accompanied by the sea, the sun, and the slow rhythm of coastal life.*

### 3.6 Potpis brenda
- „Sun. Silence. **T’quilo.**“ koristi se kao završni potpis (kontakt, footer).
- „T’quilo.“ je u `--accent`, ostatak u `--text-muted`, sve u Marcellusu.

### 3.7 Odobreni web naslovi
| Ekran | HR | EN |
|---|---|---|
| Hero | Vaših par kvadrata mira. | Your tranquilo place on water. |
| Voda | Gužva ostaje na obali. | The crowd stays ashore. |
| Kvaliteta | Mirna voda, čvrsta gradnja. | Calm water, solid build. |
| Partneri | Za one koji nude mir na vodi. | For those who offer calm on water. |
| Brendiranje | U bojama vašeg brenda. | In your brand colours. |
| Izvedbe | Ista platforma. Dvije izvedbe. | One platform. Two versions. |
| Fjaka | Engineered for fjaka. | Engineered for fjaka. |
| Kontakt | Pišite nam. | Write to us. |

Labeli koji idu uz naslove:
- **„Bez dozvole, bez posade“** (Voda) uz copy: *„Tihi električni motor i jednostavno upravljanje. Isplovite kad želite, stanite gdje je najmirnije.“*
- **„Na dohvat ruke“** uz copy: *„Piće iz hladnjaka, tuš nakon kupanja, hlad ispod tende i vaša glazba.“*

**Izmjena §1 „Nije brod“:** pravilo se ublažava. T’quilo i dalje nije plovilo ni brod, a riječi „plovilo“, „brod“ i „charter“ ostaju zabranjene. Dopušteni su glagoli kretanja po vodi („isplovite“, „stanite“) i spominjanje električnog motora kao opreme.

---

## 4. Brendiranje i boje proizvoda (§3, `tokens/product-colors.css`)

### 4.1 Brendiranje kao poruka
- Mogućnost brendiranja je **samostalan ekran i prodajni argument**, ne fusnota.
- Copy: „Tenda, zavjese, jastuci, tikovina i oba dijela trupa biraju se zasebno. Krenite od jedne od tri linije boja ili složite vlastitu kombinaciju.“
- Broj modula („šest modula“, „4 modula“) **se ne navodi** u copyju.

### 4.2 Napomene uz linije boja
Kratka napomena za svaku liniju, za `ColorwayStack note`:

| Linija | HR | EN |
|---|---|---|
| Midnight | Gradske marine i večernji termini. | City marinas and evening slots. |
| Riviera | Duga dnevna sunčanja. | Long days in the sun. |
| Salt | Wellness, spa i jezera. | Wellness, spa and lakes. |

Interne oznake „Linija I / II / III“ koriste se kao sekundarni label na desktopu. Na mobitelu se ne prikazuju.

### 4.3 Nedostajući tokeni (`product-colors.css`)
Konfigurator koristi segmente i vrijednosti koje DS još nema:

**Zaštita ruba (fender)** je novi modul:
```css
--fender-rubber: #1E1F21;  /* crna guma */
--fender-rope:   #8A6A45;  /* konop */
```

**Zavjese** dobivaju vlastite tokene, ne posuđuju one od tende:
```css
--curtain-white: #F2F1EE;
--curtain-beige: #DCCFB6;
```

**Dekori tikovine** (17, prosječni ton za ekran; u tisku se uvijek koristi fotografirani uzorak):
```
Aged #8C7F6B · Ash #BAB1A4 · Black cherry #5C302C · Champagne #CDBB97 · Graphite #8E8C88 ·
Mediterranean #9C7B52 · Modern Elite #7B7466 · Beech #C9A776 · New Classic #B5884E ·
Collection Multi Bright #C3A26E · Collection Multi Dark #6E5540 · Collection Weathered #9A9287 ·
Platinum #C9C6BF · Sandstone #C2A887 · Traditional #A8742F · Walnut #8A6A4A · Weathered #908A7F
```

**Ispuna između letvica:**
```css
--teak-fill-black:  #111111;
--teak-fill-white:  #F2F1EE;
--teak-fill-silver: #B4B8B9;
```

Ovo su vrijednosti s weba i one vrijede u digitalnim materijalima. U tisku se dekor uvijek prikazuje fotografiranim uzorkom.

### 4.4 Vlastite boje i brend boje partnera
- Trup, jastuci, tenda i zavjese primaju **vlastiti RAL ili HEX**. Za HEX se prikazuje najbliži RAL i oznaka „po narudžbi“.
- Format vrijednosti:
  - iz palete: `RAL 7016 - antracit siva · #383E42`
  - po narudžbi: `#5A6F80 · ≈ RAL 7031 · po narudžbi`
- **Brendirane sheme partnera prikazuju se bez imena brenda** (samo trake boja, aria-label „Shema n“). Ime partnera se nikad ne piše.

---

## 5. Ikonografija (§7)

### 5.1 Ikone u upotrebi na webu
Ikone stoje uz opremu (Voda, Izvedbe), uz definiciju fjake i u UI-ju. Veličina je 24 px, boja `--accent`, razmak do teksta 12 px.

```
no-licence · fridge · shower · awning · sound · lights · motor · cushions ·
module-curtain · steps · fjaka · download · arrow-right · share-network · check
```

### 5.2 Zavjese
- U listi opreme ikona za zavjese je `module-curtain`. Dodati alias `curtains` → `module-curtain`.
- Sidro nije dio liste opreme na webu i ne dodaje se u set.

---

## 6. Fotografija (§3, „Slikovni jezik“)

- **Obrada za web.** Fotografije na webu podižu se filterom `contrast(1.06) brightness(1.03) saturate(1.18)` kad su prikazane preko cijelog ekrana. Kad se vide kroz slova naslova, privremeno su spljoštene (tamni ekran `contrast(0.72) brightness(1.18)`, svijetli `contrast(0.9) brightness(0.72)`) da rubovi slova ostanu čitljivi.
- **Nove fotografije** (`assets/photography/` u web projektu):

| Datoteka | Prikazuje | Napomena |
|---|---|---|
| `tquilo-voda-aerial.png` | platforma sama u uvali, iz zraka (retuširano) | referenca za boju i oštrinu („sjaj“ koji klijent želi) |
| `tquilo-quality.png` | detalj gradnje | — |
| `tquilo-partneri.jpg` | platforma u partnerskom okruženju | **tuđa oznaka motora**, retuš prije objave |
| `tquilo-fjaka.png` | dvoje na platformi | — |
| `fjaka-detail-1..3.jpg` | detalji interijera | `fjaka-detail-3` ima **tuđu oznaku motora** |
| `assets/video/hero-2.mp4` | hero video | privremeni, treba komprimirati |

- **Karakter fotografije:** kadar `tquilo-voda-aerial` (oštro, zasićeno, prozirno more, platforma sama u kadru) je referenca za boju i oštrinu svih fotografija.

---

## 7. Novi web obrasci (§3 Layout / §5 UI kit)

Obrasci s weba postaju dio jezika brenda.

### 7.1 Naslov kao prozor (knockout headline)
- Fotografija ili video vidi se **samo kroz slova** velikog Marcellus naslova.
- Završna točka naslova raste u krug dok fotografija ne ispuni ekran.
- Tehnika:
  - **tamni ekran:** crna ploha s bijelim tekstom, medij u `multiply`, tint Abyss u `lighten`;
  - **svijetli ekran:** bijela ploha s crnim tekstom, medij u `screen`, tint Salt u `darken`.
- Ovo je **iznimka od pravila „tekst preko fotografije dobiva punu plohu“**: tekst *jest* fotografija, a podloga ostaje puna boja.
- Dodati kao dopušten obrazac u §3 „Protection“.

### 7.2 Horizontalna prezentacija
- Web nema vertikalni scroll. Ekrani se nižu vodoravno; kotačić, strelice, swipe i tipke dolje desno idu naprijed i natrag, u beskonačnoj petlji.
- **Donja traka (56 px)** je drugi dopušteni fiksni element, uz header. Sadrži broj i ime ekrana, strelice i liniju napretka od 1 px u `--accent`.
- **Ažurirati §3 „Fiksni elementi“:** header + donja navigacijska traka (samo za web prezentaciju).

### 7.3 Mobilna pravila za naslove
- Svi naslovi na mobitelu imaju **istu veličinu** na svim ekranima i u oba jezika.
- Prijelomi redova su zadani ručno: hero 4 reda; Voda, Partneri i Boje 3 reda; ostali 2 reda.
- Naslov je sidren na vrhu (76 px + 7vh), da se tekst ne pomiče između ekrana i jezika.

### 7.4 Konfigurator
- Raspored: lijevo 3D prikaz (sticky), desno panel s odabirom boja.
- Panel redom sadrži: linije boja, brendirane sheme, segmente, tikovinu i sažetak.
- Završne akcije: „Pošalji upit“, „Preuzmi PDF“ (A4 sažetak u light temi) i „Kopiraj link“ (konfiguracija je zapisana u URL-u).
- Komponente: `Button`, `IconButton`, `Input`, `Toast`, `Wordmark`.
- Swatch je kvadrat 40 × 40 px s rubom od 1 px. Odabrani swatch ima `outline: 2px solid var(--accent); outline-offset: 2px`.

---

## 8. Popis izmjena u `readme.md` (sažetak)

1. §1 Oprema: frižider → hladnjak, Bluetooth zvučnici → glazbeni sustav, dodati električni motor, tenda i zavjese razdvojiti.
2. §1: dodati more i jezera, kampove, koncesiju i pravni potpis.
3. §1 Izvedbe: novi opis Signature („u punoj opremi“), liste opreme s ikonama, Pure i Signature u `--accent`.
4. §1 „Nije brod“: ublažiti pravilo (2.1 i 3.7).
5. §2: crtice „-“ umjesto „—“, novi CTA-i, maknuti obećanje „u jednom radnom danu“, primjer s hladnjakom.
6. §2: fjaka (naslov, subline, definicija), potpis „Sun. Silence. T’quilo.“, tablica web naslova.
7. §3 Boje proizvoda: tokeni za zaštitu ruba, zavjese, 17 dekora i ispunu; napomene uz linije; vlastite boje i anonimne sheme partnera.
8. §3 Fotografija: privremeni web filter, nove datoteke, oznake za retuš.
9. §3 Layout: obrazac naslova kao prozora, donja navigacijska traka kao drugi fiksni element.
10. §7 Ikone: alias `curtains`, popis ikona u upotrebi.
11. §5 UI kit: dodati obrasce horizontalnog weba i konfiguratora (reference: `TQuilo Web.dc.html`, `Konfigurator.dc.html`).

---
---

# DIO B · iz izgrađenog sitea (tquilo.com, listopad 2026)

Sve niže je očitano iz **objavljenog sitea**, ne iz dizajna. Gdje se kosi s dijelom A, vrijedi ovo.

---

## 9. Ispravci dijela A

Stavke koje su u međuvremenu postale netočne. Svaka navodi odjeljak koji mijenja.

### 9.1 Pravni potpis (mijenja §1.5)

„za proizvodnju i trgovinu" **ispada sa svih mjesta**. Potpis je u dva retka, a razlikuje se **samo naziv države** - tvrtka i pravni oblik se ne prevode, a oznaka broja ostaje OIB u oba jezika:

| | redak 1 | redak 2 |
|---|---|---|
| HR | `Arba Nautika d.o.o., Hrvatska` | `OIB: 00720431425` |
| EN | `Arba Nautika d.o.o., Croatia` | `OIB: 00720431425` |

PDV broj (`HR00720431425`) postoji u structured dataju, ali se **na stranici ne prikazuje**.

### 9.2 Naslov ekrana Brendiranje (mijenja §3.7)

EN naslov je **„In your brand's colours."** - s posvojnim apostrofom. U §3.7 je bio zapisan bez njega.

### 9.3 Dekori tikovine (mijenja §4.3)

**Šesnaest od sedamnaest vrijednosti u dijelu A ne odgovara webu** - poklapa se samo Aged. Tri odstupaju toliko da se vide kao druga boja (Graphite, Platinum, Walnut). Mjerodavna tablica:

| Dekor | Dio A | **Web (vrijedi)** |
|---|---|---|
| Aged | `#8C7F6B` | `#8C7F6B` |
| Ash | `#BAB1A4` | **`#BBB4A7`** |
| Black cherry | `#5C302C` | **`#5B322C`** |
| Champagne | `#CDBB97` | **`#CDBA96`** |
| Graphite | `#8E8C88` | **`#4A4A4D`** ⚠ |
| Mediterranean | `#9C7B52` | **`#9C7B50`** |
| Modern Elite | `#7B7466` | **`#7D7567`** |
| Beech | `#C9A776` | **`#C8A877`** |
| New Classic | `#B5884E` | **`#B5894E`** |
| Collection Multi Bright | `#C3A26E` | **`#C3A26C`** |
| Collection Multi Dark | `#6E5540` | **`#6E5740`** |
| Collection Weathered | `#9A9287` | **`#9A948A`** |
| Platinum | `#C9C6BF` | **`#B6B3AC`** ⚠ |
| Sandstone | `#C2A887` | **`#C2A98A`** |
| Traditional | `#A8742F` | **`#A9772F`** |
| Walnut | `#8A6A4A` | **`#5B4632`** ⚠ |
| Weathered | `#908A7F` | **`#8F897E`** |

Naziv dekora je **isti u oba jezika** - to je komercijalni kod, ne riječ za prijevod.

### 9.4 Ispuna između letvica (mijenja §4.3)

Sve tri vrijednosti su druge, a nazivi su hrvatski:

| | Dio A | **Web (vrijedi)** |
|---|---|---|
| crna / black | `#111111` | **`#222222`** |
| bijela / white | `#F2F1EE` | **`#EEEEEE`** |
| srebrna / silver | `#B4B8B9` | **`#AAB0B3`** |

### 9.5 Zaštita ruba (mijenja §4.3)

| | Dio A | **Web (vrijedi)** |
|---|---|---|
| crna guma / black rubber | `#1E1F21` | **`#1B1B1D`** |
| smeđi konop / brown rope | `#8A6A45` | `#8A6A45` |

Naziv je **„smeđi konop"**, ne samo „konop".

### 9.6 Zavjese nemaju vlastite tokene (mijenja §4.3)

Dio A uvodi `--curtain-white` i `--curtain-beige`. **Toga nema.** Zavjese koriste **istu paletu kao tenda** - svih šest boja, s bijelom kao polaznom. Modul je zaseban u konfiguratoru, ali paleta je zajednička. Dva tokena iz dijela A se brišu.

### 9.7 Ikone (mijenja §5.1 i §5.2)

Set je **zatvoren na trinaest glifova** iz handoffa:

```
arrow-right · awning · cushions · download · fjaka · fridge · lights ·
module-curtain · motor · no-licence · shower · sound · steps
```

Iz popisa u §5.1 **ispadaju `share-network` i `check` - ne postoje**. Komponenta `Icon` baca grešku na nepoznato ime, pa svaki novi glif znači svjesnu odluku o proširenju seta.

Alias `curtains` → `module-curtain` iz §5.2 **nije uveden**; web koristi `module-curtain` izravno. Ako se alias želi, uvodi se u DS-u, ne na webu.

### 9.8 Obrada fotografije (mijenja §6)

Filter `contrast(1.06) brightness(1.03) saturate(1.18)` preko cijelog ekrana **ispada**. Kad se fotografija ili video vide preko cijelog ekrana, **nema nikakve obrade** - gleda se kadar kakav je snimljen.

Obrada ostaje **samo u knockout stanju**, gdje se medij vidi kroz slova naslova i bez spljoštavanja se ne čita:

| Ekran | Vrijednost |
|---|---|
| tamni | `contrast(0.72) brightness(1.18)` |
| svijetli | `contrast(0.9) brightness(0.72)` |

Prijelaz između ta dva stanja prati rast kruga.

### 9.9 Veličina naslova na mobitelu (mijenja §7.3)

Pravilo „svi naslovi iste veličine na svim ekranima" **ne vrijedi**. Isprobano je i pada: veličinu određuje najgori slučaj, pa je najuži naslov („Za partnere" / „For those who") spustio i naslovnicu na istu, sitnu veličinu.

Umjesto toga **tri skupine**; unutar skupine je veličina jednaka, pa naslov ne poskakuje pri listanju i oba jezika daju isti broj i istu veličinu redaka:

| Skupina | Ekrani | Zašto |
|---|---|---|
| `hero` | Naslovnica | Sama u skupini. Prvo što se vidi i mora dominirati. |
| `a` | Voda, **Privatnost**, Kvaliteta, Fjaka | Naslov je glavni element ekrana. |
| `b` | Za partnere, Boje, Izvedbe, Kontakt | Naslov je naslov sekcije; sadržaj nosi ekran. |

Prijelomi redaka na mobitelu (zadani ručno, isti broj redaka u oba jezika):

| Ekran | HR | EN |
|---|---|---|
| Naslovnica | Vaših / par / kvadrata / mira | Your / tranquilo / place on / water |
| Voda | Gužva / ostaje na / obali | The crowd / stays / ashore |
| Privatnost | Samo / za vas / dvoje | Just / the two / of you |
| Kvaliteta | Mirna / voda, / čvrsta / gradnja | Calm / water, / solid / build |
| Partneri | Za one koji / nude mir / na vodi | For those who / offer calm / on water |
| Brendiranje | U bojama / vašeg / brenda. | In your / brand's / colours. |
| Izvedbe | Ista platforma. / Dvije izvedbe. | One platform. / Two versions. |
| Fjaka | Engineered / for / fjaka | Engineered / for / fjaka |
| Kontakt | Pišite nam. | Write to us. |

Tokeni tipografije s weba:

```css
--lh-headline: 1.06;
--fs-display: clamp(30px, min(11.7vw, 10.6dvh), 96px);
--fs-lede:    clamp(15px, min(4.5vw, 2.6dvh), 20px);
```

### 9.9b Novi ekran: Privatnost (mijenja §3.7 i §7.2)

Prezentacija ima **devet ekrana, ne osam**. Novi je **treći**, između Vode i Kvalitete.

| | HR | EN |
|---|---|---|
| izbornik | Privatnost | Privacy |
| sidro | `#privatnost` | `#privacy` |
| naslov | Samo za vas dvoje. | Just the two of you. |
| oznaka | VAŠ MALI SVIJET NA VODI | YOUR OWN LITTLE WORLD ON WATER |
| tekst | Navucite zavjese i ostavite ostatak svijeta s druge strane. Za razgovore koji ostaju među vama i tišinu koju je lijepo dijeliti. | Draw the curtains and leave the rest of the world outside. For conversations kept between you and silence worth sharing. |

Prijelomi na mobitelu (tri retka u oba jezika): `Samo / za vas / dvoje` ·
`Just / the two / of you`.

**Raspored legende je kao Vodin i Kvalitetin:** podnaslov je **oznaka u verzalu**
(12 px, `champagne`, tracking 0,16 em), tekst ispod u `mist`. Oznaka **nema točku** -
nijedna druga na siteu je nema. Skupina naslova je `a`, kao Voda, Kvaliteta i Fjaka.

**Fotografija:** platforma sama u uvali, zavjese navučene, snimljeno iz zraka. Isti
karakter kao `voda-aerial` - oštro, prozirno more, platforma sama u kadru.

Sudar imena s politikom privatnosti **riješen je preimenovanjem stranice**, ne sidra:
politika je sada `/privacy-policy` i `/hr/politika-privatnosti`, pa `#privacy` ostaje
ekranu. Sidro i putanja više ne dijele ime.

### 9.10 Tradicija i iskustvo (mijenja §1.4)

Brojka je **30+, ne 20+**, i uz nju ide dokaz o broju isporučenih plovila.

| | Staro (dio A) | **Novo (vrijedi)** |
|---|---|---|
| label HR | 20+ godina iskustva | **30+ godina iskustva** |
| label EN | 20+ years of experience | **30+ years of experience** |
| copy HR | Iza T'quila stoji više od dvadeset godina tradicije i iskustva u brodogradnji. | **Iza T'quila stoji više od trideset godina tradicije i iskustva u brodogradnji te preko tisuću prodanih brodova.** |
| copy EN | Behind T'quilo stand more than twenty years of boatbuilding tradition and experience. | **Behind T'quilo stand more than thirty years of boatbuilding tradition and experience, and over a thousand boats sold.** |

⚠ **Pravilo „nije brod" treba precizirati.** Dio A (§3.7) kaže da riječi „plovilo",
„brod" i „charter" ostaju zabranjene. Taj se zabran odnosi na **T'quilo**, ne na
brodogradilište: „preko tisuću prodanih brodova" govori o proizvođaču i njegov je
najjači dokaz vjerodostojnosti. U DS-u pravilo zapisati kao: *T'quilo se nikad ne
opisuje kao brod ili plovilo; brodogradnja i brodovi se spominju samo kao podrijetlo
i iskustvo proizvođača.*

Tvrdnja „sukladan svim pomorskim normama" (`q3`) i dalje **se ne koristi** - postoji u
rječniku, ali se ne prikazuje.

---

### 9.11 RAL vrijednosti trupa (nije bilo u dijelu A)

Dvije vrijednosti iz handoffa bile su neispravne i ispravljene su:

- **RAL 5004** je u handoffu bio `#1F3A5F`. To nije RAL 5004 - „Schwarzblau" je gotovo crna, **`#20232C`**. `#1F3A5F` je mornarsko plava, bliža RAL 5011/5013. Ako dizajn želi svjetliju plavu za liniju Midnight, **mijenja se RAL kod, ne hex pod istim kodom**.
- **RAL 1013** je bio `#ea9a5` - pet znamenki, nevažeći hex, boja je tiho padala na crnu. Ispravljeno na **`#E3D9C6`**.

Mjerodavne vrijednosti trupa:

| RAL | Naziv | Hex |
|---|---|---|
| 1013 | oyster bijela / oyster white | `#E3D9C6` |
| 5004 | crno plava / black blue | `#20232C` |
| 7016 | antracit siva / anthracite grey | `#383E42` |
| 7035 | svijetlo siva / light grey | `#C7CAC6` |

---

## 10. Novo: pristanak, kolačići i analitika

Dio A ovo ne spominje - u fazi dizajna nije ni postojalo. Site sada ima **Google Analytics 4** i uz njega pristanak.

### 10.1 Pravilo

**Bez pristanka se ne postavlja ništa.** GA se ne učitava dok pristanka nema; nema piksela, nema trećih strana osim onih poimence navedenih.

„Samo nužno" nije ukrasni gumb: GA se ne učita, a ako je od ranije učitan, **gasi se i briše svoje kolačiće**. Traka bez stvarne posljedice nije pristanak nego kulisa.

### 10.2 Obrazac: traka i kap

Novi UI obrazac, dodati u §5 UI kit.

- **Traka** - dolje desno (kao `Toast`), iznad fiksne donje trake. Na mobitelu se razvlači preko obje margine jer bi inače bila pretijesna. Maks. širina 440 px.
- **Kap** - skupljeno stanje, 44 × 44 px, brandov znak (`kap-champagne.svg`) na `--surface-elevated` s rubom. Radijus je ovdje dopušten - oblik znaka ga traži.
- **× ne znači pristanak.** Skuplja traku u kap; do izbora vrijedi „samo nužno".
- **Kap ostaje i nakon izbora.** Povlačenje pristanka mora biti jednako dostupno kao davanje. Otvorena traka tada ispisuje trenutno stanje.
- **Prvi pomak skuplja traku** (kotačić, dodir, strelice, scroll). Tko krene gledati stranicu, traku je pročitao ili ju je odlučio preskočiti.

### 10.3 Copy

| | HR | EN |
|---|---|---|
| tekst | Uz vaš pristanak koristimo Google Analytics i pamtimo gdje ste stali na stranici. Bez pristanka se ne postavlja ništa. | With your consent we use Google Analytics and remember where you left off. Without it, nothing is set. |
| prihvat | Prihvaćam | Accept |
| odbijanje | Samo nužno | Essential only |
| poveznica | Politika privatnosti | Privacy policy |
| stanje (sve) | Trenutno: analitika uključena. | Currently: analytics on. |
| stanje (nužno) | Trenutno: samo nužno. | Currently: essential only. |
| naziv / kap | Postavke privatnosti | Privacy settings |
| × | Smanji | Minimise |

---

## 11. Novo: politika privatnosti

Zasebna stranica, `/privacy-policy` i `/hr/politika-privatnosti`.

- **Jedina poveznica na nju je u traci za pristanak** - ne ide u navigaciju ni u podnožje.
- Namjerno kratka: svaki odlomak odgovara nečemu što stvarno postoji. Odlomci: voditelj obrade, kontakt forma, analitika, lokalna pohrana, hosting i zapisi, prava, izmjene.
- Navodi obrađivače poimence: **Web3Forms** (forma), **Google Ireland** (analitika), **Hostinger** (hosting).
- **Ako se doda nova vanjska usluga, dodaje se i odlomak.**

---

## 12. Novo: kontakt e-mail

Ranija uputa „e-mail ne stoji nigdje" **više ne vrijedi**.

- Adresa je **`aboard@tquilo.com`**.
- Stoji **ispod naslova na ekranu Kontakt** (champagne, podcrtano, `mailto:`) i u politici privatnosti kao kanal za ostvarivanje prava.
- U structured data i `llms.txt` **namjerno ne ide** - ondje je ubiru skupljači adresa.
- Ista adresa je kontakt u `security.txt` (RFC 9116). Zaseban `security@` alias ne postoji, a datoteka koja upućuje na sandučić koji ne prima poštu gora je od nepostojeće.

---

## 13. Novo: 3D prikaz i obavezna napomena

Uz svaki 3D prikaz proizvoda **obavezno** stoji napomena o približnosti - i na ekranu i u PDF-u koji nosi istu snimku.

| | |
|---|---|
| HR | Približan 3D prikaz. Stvarni proizvod može odstupati u detaljima i nijansama. |
| EN | Approximate 3D view. The real product may differ in detail and shade. |

„i nijansama" nije višak: ovo je konfigurator **boja**, a boja na ekranu ne odgovara lakiranom proizvodu. Napomena koja spominje samo oblik prešutno tvrdi da su boje točne.

**Oblikovanje:** gore lijevo u prozoru prikaza, rečenica u `--text-muted`, 11 px, bez okvira. Namjerno drukčije od upute za rotaciju dolje lijevo, koja je UI (verzal, razmaknuto, u okviru) - tako se ne čitaju kao dva gumba.

---

## 14. Konfigurator - dopune §7.4

- **„Resetiraj prikaz" vraća i kut kamere I boje** na polaznu liniju (Midnight), briše polja za prilagođeni RAL/HEX i miče oznaku „po narudžbi". Gumb koji vraća samo kameru ostavlja korisnika s pola vraćenog stanja.
- **Uzorak dekora tikovine** je kartica, ne kvadrat: min. 104 px široka, traka boje 26 px visine, naziv ispod. Sadržaj je poravnat **uz vrh**, a naziv ima rezervirana **dva retka** - inače dvoredni nazivi („Collection Multi Bright") razbiju poravnanje cijelog retka mreže.
- **Završni gumbi** („Pošalji upit", „Preuzmi PDF") na mobitelu su **pune širine, jedan ispod drugoga**; od 640 px nadalje u redu. Prirodna širina u jednom redu daje nejednake gumbe i raspored koji ovisi o duljini natpisa, dakle o jeziku.
- Na mobitelu „Preuzmi PDF" stoji **samo uz sažetak**, ne i u traci ispod 3D prikaza.

---

## 15. Novo: PDF konfiguracije

A4, light tema, nastaje iz ispisa - nije zaseban dokument.

**Raspored:** logotip lijevo i datum desno uz tanku crtu ispod · naslov · **render preko pune širine** · napomena o približnosti · **dvostupčana tablica** specifikacije · podnožje s imenom brenda i domenom.

- **Tablica:** dva stupca, u svakom red `naziv segmenta / mrlja boje + vrijednost`, odvojeni tankom linijom. Isti jezik kao sažetak na ekranu.
- **Render se snima u fiksnom omjeru** (okvir 178 × 108 mm). Snimka platna kakvo zatekne daje čas prugu, čas panoramu.
- **Kadar je fiksiran**: kut gledanja ostaje korisnikov, udaljenost ne - inače PDF nosi i korisnikov zum.
- `print-color-adjust: exact` je obavezan - bez njega preglednik izbacuje pozadine i mrlje boja nestaju.
- U podnožju stoji **samo domena** (`tquilo.com`), ne puna adresa s konfiguracijom.
- Pravni potpis **ne ide u PDF konfiguracije**.

---

## 16. Novo: jezik, adrese i sidra

### 16.1 Primarni jezik nema prefiks

| | EN | HR |
|---|---|---|
| naslovnica | `/` | `/hr` |
| konfigurator | `/configurator` | `/hr/konfigurator` |
| privatnost | `/privacy-policy` | `/hr/politika-privatnosti` |

**I slug je na jeziku stranice.** Engleska verzija ne nosi hrvatske riječi u adresi.

### 16.2 Sidra ekrana su na jeziku stranice

| HR | EN |
|---|---|
| `#mir` | `#quiet` |
| `#voda` | `#water` |
| `#privatnost` | `#privacy` |
| `#kvaliteta` | `#quality` |
| `#partneri` | `#partners` |
| `#boje` | `#colours` |
| `#izvedbe` | `#versions` |
| `#fjaka` | `#fjaka` |
| `#kontakt` | `#contact` |

„Fjaka" ostaje fjaka - brendirani pojam, ne riječ za prijevod.

**Jezični prekidač prevodi sidro**: s `/#water` vodi na `/hr#voda`.

### 16.3 Gola adresa ostaje gola

Sidro se u adresu upisuje **tek kad posjetitelj ode s prvog ekrana**. Dolazak na `tquilo.com` ostaje `tquilo.com`, bez `#mir`.

### 16.4 Naslov dokumenta

Naslov stranice je **naslov prvog ekrana**, ne proizvoljnog:

- EN: `T'quilo - Your tranquilo place on water.`
- HR: `T'quilo - Vaših par kvadrata mira.`

---

## 17. Novo: društvena kartica (OG)

Pravila za sliku koja ide u `og:image`.

- **Sve stane u središnji kvadrat.** Dio aplikacija (WhatsApp, Signal, Slack) ne prikazuje široku karticu nego **malu kvadratnu sličicu** i sam izreže 1200 × 630 na 1:1. Raspored poravnat lijevo preko pune širine u izrezu daje komade riječi. Sadržaj mora stati između `x = 285` i `x = 915`.
- **Deklarirane mjere moraju odgovarati datoteci.** `og:image:width/height` i stvarna slika moraju biti isti broj; scraperi koji vjeruju deklariranom odustanu od velike kartice kad se ne poklapaju.
- **Kompozicija:** znak centriran, kratka crta, naslov u dva retka (salt + champagne), podnaslov. Bez dugog teksta - na sličici se ionako ne čita.
- Mala sličica u nekim aplikacijama **nije greška oznaka** nego odluka te aplikacije; oznake je ne mogu prisiliti na široku karticu.

---

## 18. Novo: stanje „nedostupno" za poveznice

Kad dokument ili odredište još ne postoji, stavka **ostaje vidljiva, ali nije poveznica**: `<span>`, ne `<a href="#">`.

- siva (`#6E7681` na 60 % neprozirnosti) nasuprot aktivne poveznice u punoj boji
- kursor ostaje strelica, bez hover efekta, **ne prima fokus**

Mrtva poveznica izgleda kao živa, prima fokus tipkovnicom i klik ne vodi nikamo - to je gore od toga da je nema. Trenutno se tako ponaša **„Specifikacija (PDF)"** na ekranu Partneri.

---

## 19. Kontakt forma - dopune

- **Nema captche.** hCaptcha je bila ugrađena i uklonjena: Web3Forms na besplatnom planu odbija zahtjev s *„You are trying to use a Pro feature"* - prekidač za captchu u njihovoj nadzornoj ploči je Pro značajka. Protiv robota ostaje honeypot.
- **Provjera e-maila.** `type=email` propušta `ime@domena` bez vršne domene - formalno valjano, u praksi uvijek tipfeler. Traži se i vršna domena, uz poruku:

  | HR | EN |
  |---|---|
  | Provjerite e-mail adresu - nedostaje domena, npr. ime@tvrtka.hr | Check the email address - the domain is missing, e.g. name@company.com |

- Forma radi **i bez JavaScripta** (obični POST).

---

## 20. Otvorene odluke

Stvari koje čekaju odluku dizajna, ne izvedbe.

### 20.1 Gumb za dijeljenje

Razmatra se stavka za dijeljenje desno od jezičnog prekidača, preko `navigator.share` (sistemski izbornik uređaja, bez ikona društvenih mreža i bez tuđih skripti).

Dvije izvedbe, uživo na internoj stranici **`/pregled/share`**:

- **A · tekstualna stavka** (`HR / EN / PODIJELI`). Zaglavlje je danas isključivo tekst, pa se uklapa bez ostatka i **ne traži nijedan novi element brend sustava**.
- **B · ikona.** Sitnija i jezično neutralna, ali bi bila **jedini glif u zaglavlju** i tražila bi **četrnaestu ikonu u zatvorenom setu**.

Preporuka: **A**, dok se set ne otvara svjesno.

### 20.2 Specifikacija (PDF) - riješeno

Dokument postoji, **zaseban po jeziku**, i poveznica je živa:

| | Datoteka | Veličina |
|---|---|---|
| HR | `/dokumenti/tquilo-specifikacija.pdf` | 180 kB |
| EN | `/dokumenti/tquilo-specification.pdf` | 160 kB |

Oba su A4, jedna stranica. Otvaraju se **u novoj kartici** - PDF u istoj kartici odvede posjetitelja s vodoravne prezentacije. Čitačima ekrana se to kaže kroz `aria-label`.

Stanje „nedostupno" iz §18 ostaje opisano kao obrazac i vrijedi za svaki budući dokument koji još ne postoji.

### 20.3 Ostalo

- **Tuđe oznake motora** na `fjaka-detail-3.jpg` i `partneri.jpg` - retuš prije daljnje upotrebe (prijavljeno i u dijelu A, §6).
- `sameAs` u structured dataju čeka da profili na društvenim mrežama postoje.

---

## 21. Sažetak izmjena u `readme.md` - druga runda

Nastavlja numeraciju iz §8.

12. §1.5 Pravni potpis: nova dvoretčana forma, „za proizvodnju i trgovinu" briše se.
13. §3.7: EN naslov Brendiranja dobiva apostrof.
12a. §3.7 / §7.2: **novi ekran Privatnost** kao treći; prezentacija ima devet ekrana. Brojač u donjoj traci čita ukupan broj iz popisa, ne iz konstante.
13a. §1.4 Tradicija: 20+ → **30+ godina**, uz dokaz **preko tisuću prodanih brodova**; precizirati pravilo „nije brod" tako da se odnosi na T'quilo, ne na brodogradilište.
14. §4.3 Dekori tikovine: zamijeniti 11 vrijednosti; ispuna i zaštita ruba u cijelosti; tokeni za zavjese se brišu.
15. §4.3: dodati ispravljene RAL vrijednosti trupa i bilješku zašto RAL 5004 nije `#1F3A5F`.
16. §5.1/§5.2 Ikone: set je zatvoren na 13; maknuti `share-network` i `check`; alias `curtains` nije uveden.
17. §6 Fotografija: maknuti filter preko cijelog ekrana; ostaje samo knockout obrada.
18. §7.3: jedna veličina naslova na mobitelu zamjenjuje se trima skupinama.
19. §5 UI kit: novi obrasci - traka za pristanak i kap, stanje „nedostupno" za poveznice.
20. §2 Copy: dodati copy pristanka, napomenu o približnom 3D prikazu i poruku provjere e-maila.
21. §3 Layout: dodati pravila za društvenu karticu (središnji kvadrat) i PDF konfiguracije.
22. Novo poglavlje: jezik i adrese (prefiks, slugovi, sidra, naslov dokumenta).
23. Novo poglavlje: privatnost i analitika (politika, obrađivači, kontakt adresa).
