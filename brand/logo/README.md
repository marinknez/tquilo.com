# T'quilo - logotip, smjer A · Kap

Silueta **1e (humanizirana)**, kap **uspravna (0°)**, zapis **verzalni: T’QUILO**, tracking **+0,10 em**.
Kap je jedini obojeni element: Champagne `#D8C29A` na tamnom, Brass `#9C7C3C` na svijetlom.

## Datoteke
| Datoteka | Namjena |
| --- | --- |
| `kap.svg` | samo znak (kap), `currentColor` - za inline SVG u kodu |
| `kap-champagne.svg` / `kap-brass.svg` | kap u fiksnoj boji - za `<img>`, gdje `currentColor` ne prolazi |
| `tquilo-primary-dark.svg` | primarna horizontalna, na Abyssu |
| `tquilo-primary-light.svg` | primarna horizontalna, na Saltu / Sandu |
| `tquilo-primary-mono.svg` | jednobojna, `currentColor` - gravura, vez, staklo |
| `tquilo-stacked-*.svg` | stacked (kap nad imenom) - social avatar, naslovnica |
| `tquilo-monogram-ink / light / brass / mono.svg` | monogram u kvadratu, 100 × 100 |
| `favicon.svg` | monogram 32 × 32 |

## Geometrija
- Mjere su izvedene iz same font datoteke (unitsPerEm 2048): visina verzala **0,7041 em**,
  rep slova Q **0,2798 em** ispod baseline, advance T **0,5972 em**.
- Visina kapi = **0,40 em**, vrh kapi = visina verzala; odmak **0,055 em** lijevo, **0,10 em** desno.
- Tracking **+0,10 em** između svih slova (bez trailing trackinga na kraju).
- viewBox = **stvarni okvir tiska**: visina verzala **plus overshoot okruglih slova** (Q i O sežu
  0,7119 em, 0,0078 em iznad kapitalne linije slova T) i rep slova Q ispod baseline, uz 0,004 em
  zraka sa svih strana. Baseline i vrh kapi ostaju na kapitalnoj liniji (0,7041 em) - optičko
  poravnanje se ne mijenja.
- Zaštitni prostor = visina verzala „T" sa svih strana. Minimalna veličina 20 px / 14 pt.

## Otvoreno - prije produkcije
Nema otvorenih pitanja na crtežu. Ime je **pretvoreno u krivulje** iz licencirane
`Marcellus-Regular.ttf` (SIL OFL, priložena u `_ds/.../assets/fonts/`) - datoteke ne ovise o
učitavanju fonta i identične su na svakom uređaju, u tisku, gravuri i vezu. Kap je izvorna
vektorska putanja.
