// GENERIRANO - scripts/prepare-web-assets.mjs. Ne uređivati ručno.
//
// Brand ikone (13), outline, 24 px grid, stroke `currentColor`.
// Inlineane jer su sitne: 3 kB ukupno protiv 13 HTTP zahtjeva.
export const ICONS = {
  'arrow-right': `<path d="M3 12 H19" stroke-width="2"></path><path d="M14 7 L19 12 L14 17" stroke-width="2"></path>`,
  'awning': `<path d="M3 9 Q12 3 21 9" stroke-width="2"></path><path d="M3 9 H21" stroke-width="1"></path><path d="M6 9 V20" stroke-width="1"></path><path d="M18 9 V20" stroke-width="1"></path><g transform="translate(10.3113 11.3344) scale(0.033113)"><path d="M51 5 C51 5 32 61 25 97 C18 131 31 156 51 156 C70 156 82 132 76 100 C70 67 51 5 51 5 Z" fill="currentColor" stroke="none"></path></g>`,
  'cushions': `<path d="M4 6 H20 V12 H4 Z" stroke-width="1"></path><path d="M2 13 H22 V19 H2 Z" stroke-width="2"></path>`,
  'download': `<path d="M12 3 V15" stroke-width="2"></path><path d="M7 10 L12 15 L17 10" stroke-width="2"></path><path d="M4 20 H20" stroke-width="1"></path>`,
  'fjaka': `<path d="M3 12 A9 9 0 1 1 21 12 A9 9 0 1 1 3 12 Z" stroke-width="1"></path><path d="M6 12 H18" stroke-width="2"></path>`,
  'fridge': `<path d="M5 3 H19 V21 H5 Z" stroke-width="1"></path><path d="M5 9 H19" stroke-width="2"></path><g transform="translate(9.9735 11.8013) scale(0.039735)"><path d="M51 5 C51 5 32 61 25 97 C18 131 31 156 51 156 C70 156 82 132 76 100 C70 67 51 5 51 5 Z" fill="currentColor" stroke="none"></path></g>`,
  'lights': `<path d="M6 9 H18" stroke-width="2"></path><path d="M9 9 Q12 4 15 9" stroke-width="2"></path><path d="M9 13 V16" stroke-width="1"></path><path d="M12 14 V18" stroke-width="1"></path><path d="M15 13 V16" stroke-width="1"></path>`,
  'module-curtain': `<path d="M4 5 H20" stroke-width="2"></path><path d="M7 5 V20" stroke-width="1"></path><path d="M12 5 V20" stroke-width="1"></path><path d="M17 5 V20" stroke-width="1"></path>`,
  'motor': `<path d="M9 3 H16 V8 H9 Z" stroke-width="1"></path><path d="M9 5.5 H4" stroke-width="1"></path><path d="M12 8 V15" stroke-width="2"></path><path d="M12 15 L7 19" stroke-width="1"></path><path d="M12 15 L17 19" stroke-width="1"></path>`,
  'no-licence': `<path d="M3 4 H21 V18 H3 Z" stroke-width="1"></path><path d="M7 9 H17" stroke-width="1"></path><path d="M7 13 H13" stroke-width="1"></path><path d="M13 15 L16 18 L21 12" stroke-width="2"></path>`,
  'shower': `<path d="M12 2 V6" stroke-width="2"></path><path d="M4 6 H20" stroke-width="2"></path><g transform="translate(6.1424 9.3179) scale(0.036424)"><path d="M51 5 C51 5 32 61 25 97 C18 131 31 156 51 156 C70 156 82 132 76 100 C70 67 51 5 51 5 Z" fill="currentColor" stroke="none"></path></g><g transform="translate(10.1424 11.3179) scale(0.036424)"><path d="M51 5 C51 5 32 61 25 97 C18 131 31 156 51 156 C70 156 82 132 76 100 C70 67 51 5 51 5 Z" fill="currentColor" stroke="none"></path></g><g transform="translate(14.1424 9.3179) scale(0.036424)"><path d="M51 5 C51 5 32 61 25 97 C18 131 31 156 51 156 C70 156 82 132 76 100 C70 67 51 5 51 5 Z" fill="currentColor" stroke="none"></path></g>`,
  'sound': `<path d="M13 7 A7 7 0 0 1 13 17" stroke-width="1"></path><path d="M17 4 A10.5 10.5 0 0 1 17 20" stroke-width="1"></path><g transform="translate(3.9603 5.702) scale(0.059603)"><path d="M51 5 C51 5 32 61 25 97 C18 131 31 156 51 156 C70 156 82 132 76 100 C70 67 51 5 51 5 Z" fill="currentColor" stroke="none"></path></g>`,
  'steps': `<path d="M8 3 V17" stroke-width="2"></path><path d="M16 3 V17" stroke-width="2"></path><path d="M8 8 H16" stroke-width="1"></path><path d="M8 13 H16" stroke-width="1"></path><path d="M2 20 Q7 18 12 20 T22 20" stroke-width="1"></path>`,
} as const;

export type IconName = keyof typeof ICONS;
