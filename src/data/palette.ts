/**
 * Boje proizvoda - jedini izvor istine za web i za konfigurator.
 *
 * ⚠ ODSTUPANJE OD HANDOFFA, namjerno.
 * Handoff (`design_handoff_tquilo_web/README.md`) navodi RAL 5004 kao
 * `#1F3A5F`. To nije RAL 5004 - RAL 5004 „Schwarzblau" je gotovo crna
 * (#20232C); `#1F3A5F` je mornarsko plava, bliža RAL 5011/5013. Ovdje su
 * uzete vrijednosti iz postojećeg konfiguratora proizvođača (zen), jer one
 * odgovaraju stvarno lakiranom proizvodu. Ako dizajn inzistira na svjetlijoj
 * plavoj za liniju Midnight, mijenja se RAL kod, ne hex pod istim kodom.
 */

export type Swatch = {
  /** Naziv koji se prikazuje uz vrijednost. */
  name: string;
  nameEn: string;
  hex: string;
  /** RAL Classic kod, ako boja postoji u RAL-u. */
  ral?: string;
};

export const RAL_HULL: Swatch[] = [
  { name: 'oyster bijela', nameEn: 'oyster white', hex: '#E3D9C6', ral: '1013' },
  { name: 'crno plava', nameEn: 'black blue', hex: '#20232C', ral: '5004' },
  { name: 'antracit siva', nameEn: 'anthracite grey', hex: '#383E42', ral: '7016' },
  { name: 'svijetlo siva', nameEn: 'light grey', hex: '#C7CAC6', ral: '7035' },
];

export const AWNING: Swatch[] = [
  { name: 'crna', nameEn: 'black', hex: '#1C1C1E' },
  { name: 'tamno plava', nameEn: 'navy', hex: '#23304E' },
  { name: 'tamno siva', nameEn: 'dark grey', hex: '#42474B' },
  { name: 'svijetlo siva', nameEn: 'light grey', hex: '#B7BBBE' },
  { name: 'bijela', nameEn: 'white', hex: '#F1EFE9' },
  { name: 'bež', nameEn: 'beige', hex: '#D7C6A6' },
];

export const CUSHION: Swatch[] = [
  { name: 'bež', nameEn: 'beige', hex: '#D7C6A6' },
  { name: 'bijela', nameEn: 'white', hex: '#F1EFE9' },
  { name: 'svijetlo siva', nameEn: 'light grey', hex: '#C3C5C7' },
  { name: 'tamno plava', nameEn: 'navy', hex: '#23304E' },
];

export const FENDER: Swatch[] = [
  { name: 'crna guma', nameEn: 'black rubber', hex: '#1B1B1D' },
  { name: 'smeđi konop', nameEn: 'brown rope', hex: '#8A6A45' },
];

/** Ispuna između letvica tikovine. */
export const FILL: Swatch[] = [
  { name: 'crna', nameEn: 'black', hex: '#222222' },
  { name: 'bijela', nameEn: 'white', hex: '#EEEEEE' },
  { name: 'srebrna', nameEn: 'silver', hex: '#AAB0B3' },
];

/** 17 dekora umjetne tikovine. Naziv je isti u oba jezika (komercijalni kod). */
export const TEAK: Swatch[] = [
  { name: 'Aged', nameEn: 'Aged', hex: '#8C7F6B' },
  { name: 'Ash', nameEn: 'Ash', hex: '#BBB4A7' },
  { name: 'Black cherry', nameEn: 'Black cherry', hex: '#5B322C' },
  { name: 'Champagne', nameEn: 'Champagne', hex: '#CDBA96' },
  { name: 'Graphite', nameEn: 'Graphite', hex: '#4A4A4D' },
  { name: 'Mediterranean', nameEn: 'Mediterranean', hex: '#9C7B50' },
  { name: 'Modern Elite', nameEn: 'Modern Elite', hex: '#7D7567' },
  { name: 'Beech', nameEn: 'Beech', hex: '#C8A877' },
  { name: 'New Classic', nameEn: 'New Classic', hex: '#B5894E' },
  { name: 'Collection Multi Bright', nameEn: 'Collection Multi Bright', hex: '#C3A26C' },
  { name: 'Collection Multi Dark', nameEn: 'Collection Multi Dark', hex: '#6E5740' },
  { name: 'Collection Weathered', nameEn: 'Collection Weathered', hex: '#9A948A' },
  { name: 'Platinum', nameEn: 'Platinum', hex: '#B6B3AC' },
  { name: 'Sandstone', nameEn: 'Sandstone', hex: '#C2A98A' },
  { name: 'Traditional', nameEn: 'Traditional', hex: '#A9772F' },
  { name: 'Walnut', nameEn: 'Walnut', hex: '#5B4632' },
  { name: 'Weathered', nameEn: 'Weathered', hex: '#8F897E' },
];

export type SegmentKey =
  | 'lower'
  | 'upper'
  | 'fender'
  | 'cushion'
  | 'awning'
  | 'curtain'
  | 'teak'
  | 'fill';

export type Segment = {
  key: SegmentKey;
  hr: string;
  en: string;
  palette: Swatch[];
  /** Zadani indeks u paleti. */
  def: number;
  /** Dopušta li ručni unos RAL/HEX. */
  custom: boolean;
};

export const SEGMENTS: Segment[] = [
  { key: 'lower', hr: 'Donji dio trupa', en: 'Lower hull', palette: RAL_HULL, def: 2, custom: true },
  { key: 'upper', hr: 'Gornji dio trupa', en: 'Upper hull', palette: RAL_HULL, def: 2, custom: true },
  { key: 'fender', hr: 'Zaštita (guma / konop)', en: 'Fender', palette: FENDER, def: 0, custom: false },
  { key: 'cushion', hr: 'Jastuci', en: 'Cushions', palette: CUSHION, def: 2, custom: true },
  { key: 'awning', hr: 'Tenda', en: 'Awning', palette: AWNING, def: 3, custom: true },
  { key: 'curtain', hr: 'Zavjese', en: 'Curtains', palette: AWNING, def: 4, custom: true },
  { key: 'teak', hr: 'Tikovina (pod + stol)', en: 'Teak', palette: TEAK, def: 12, custom: false },
  { key: 'fill', hr: 'Ispuna između letvica', en: 'Slat fill', palette: FILL, def: 1, custom: false },
];

export type Config = Record<SegmentKey, string>;

const cfg = (
  lower: string,
  upper: string,
  fender: string,
  cushion: string,
  awning: string,
  curtain: string,
  teak: string,
  fill: string,
): Config => ({ lower, upper, fender, cushion, awning, curtain, teak, fill });

/** Tri kurirane linije boja iz design systema. */
export const LINES = [
  {
    name: 'Midnight',
    code: { hr: 'Linija I', en: 'Line I' },
    note: { hr: 'Gradske marine i večernji termini.', en: 'City marinas and evening slots.' },
    config: cfg('#20232C', '#20232C', '#1B1B1D', '#F1EFE9', '#B7BBBE', '#F1EFE9', '#B6B3AC', '#EEEEEE'),
  },
  {
    name: 'Riviera',
    code: { hr: 'Linija II', en: 'Line II' },
    note: { hr: 'Duga dnevna sunčanja.', en: 'Long days in the sun.' },
    config: cfg('#383E42', '#E3D9C6', '#1B1B1D', '#F1EFE9', '#D7C6A6', '#D7C6A6', '#5B4632', '#EEEEEE'),
  },
  {
    name: 'Salt',
    code: { hr: 'Linija III', en: 'Line III' },
    note: { hr: 'Wellness, spa i jezera.', en: 'Wellness, spa and lakes.' },
    config: cfg('#383E42', '#C7CAC6', '#1B1B1D', '#F1EFE9', '#B7BBBE', '#F1EFE9', '#4A4A4D', '#EEEEEE'),
  },
] as const;

/**
 * Pet partnerskih shema iz postojećeg konfiguratora.
 *
 * Nazivi hotelskih grupa se NE prikazuju - handoff to izričito traži, a i
 * pravno je čišće ne koristiti tuđe brendove kao prodajni argument bez
 * pisane suglasnosti. Boje su stvarne, redoslijed je iz zen konfiguratora.
 */
export const SCHEMES: Config[] = [
  cfg('#14375F', '#14375F', '#141419', '#D0D3D5', '#D9CFB8', '#C6C9CB', '#B5894E', '#222222'),
  cfg('#EEF2F4', '#EEF2F4', '#141419', '#14406E', '#BCD7E8', '#1C8FD0', '#B6B3AC', '#EEEEEE'),
  cfg('#37373A', '#37373A', '#141419', '#D7CDBB', '#1B1B1D', '#726C62', '#A9772F', '#222222'),
  cfg('#EEF0E9', '#EEF0E9', '#5A4632', '#D6CBB0', '#E0E1D6', '#9AA789', '#B5894E', '#222222'),
  cfg('#16233F', '#16233F', '#141419', '#F2F0EA', '#F2F0EA', '#16233F', '#B6B3AC', '#EEEEEE'),
];

export const DEFAULT_CONFIG: Config = LINES[0].config;
