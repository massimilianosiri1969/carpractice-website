// Controlli formali italiani: non verificano l'esistenza dell'impresa.
export function validVat(value) {
  const v = String(value || '').replace(/\s/g, '').toUpperCase().replace(/^IT/, '');
  if (!/^\d{11}$/.test(v)) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let digit = Number(v[i]);
    if (i % 2 === 1) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
  }
  return (10 - sum % 10) % 10 === Number(v[10]);
}
export function validTaxCode(value) {
  const v = String(value || '').trim().toUpperCase();
  if (/^\d{11}$/.test(v)) return validVat(v);
  if (!/^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-EHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/.test(v)) return false;
  const decode = c => 'LMNPQRSTUV'.includes(c) ? 'LMNPQRSTUV'.indexOf(c) : Number(c);
  const day = decode(v[9]) * 10 + decode(v[10]);
  if (!((day >= 1 && day <= 31) || (day >= 41 && day <= 71))) return false;
  const odd = 'BAKPLCQDREVOSFTGUHMINJWZYX';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const oddDigits = [1,0,5,7,9,13,15,17,19,21];
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const c = v[i];
    if (i % 2 === 0) sum += /\d/.test(c) ? oddDigits[Number(c)] : odd.indexOf(c);
    else sum += /\d/.test(c) ? Number(c) : alphabet.indexOf(c);
  }
  return alphabet[sum % 26] === v[15];
}
export function fiscalError(vat, tax) {
  const p = String(vat || '').trim(), c = String(tax || '').trim();
  if (!p && !c) return 'Inserisci almeno uno tra Partita IVA e Codice fiscale.';
  if (p && !validVat(p)) return 'La Partita IVA non è valida. Controlla le 11 cifre.';
  if (c && !validTaxCode(c)) return 'Il Codice fiscale non è valido. Controlla caratteri e cifra di controllo.';
  return '';
}
