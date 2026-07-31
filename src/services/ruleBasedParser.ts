import type { ItemCategory, ParsedResult } from '../models/types';

// ─── Rule-Based Urdu / Roman Urdu / English Parser ────────────────────────────
// Ported from Dart — parses grocery item text with quantity, unit, and category

const LEADING_INTENTS = [
  /^(please|plz|mujhe|hameen|humko|kindly|can you|bring me|get me|buy me|need|i want|want|mujhe\s*bhi|mujhy)\s*/i,
  /^(مجھے|ہمیں|ہمارے لیے|برائے مہربانی|چاہیے)\s*/u,
];

const TRAILING_FILLERS = [
  /\b(chahiye|chahie|chaheay|chahey|chahye|zaroorat\s*hai|zaroori\s*hai)\b/gi,
  /\b(lekar\s*aao|lekar\s*aana|lekar\s*aane|le\s*kar\s*aao|le\s*aao|le\s*aana)\b/gi,
  /\b(laana\s*hai|lana\s*hai|lani\s*hai|laao|lana|lani)\b/gi,
  /\b(mangwa\s*do|mangwa\s*dein|bhej\s*do|khareed\s*laao)\b/gi,
  /\b(bhi|bhee|please|plz|phir|de\s*do|doh)\b/gi,
  /(چاہیے|چاہئیے|ضرورت ہے|لانا ہے|لاؤ|لے آؤ|منگوا دو|خرید لو|بھی)/gu,
];

interface NumberResult {
  hasNumber: boolean;
  quantity: number;
  unit?: string;
  remaining: string;
}

function stripLeadingIntents(text: string): string {
  let t = text;
  for (const pat of LEADING_INTENTS) {
    t = t.replace(pat, '');
  }
  return t.trim();
}

function stripTrailingFillers(text: string): string {
  let t = text;
  for (const pat of TRAILING_FILLERS) {
    t = t.replace(pat, ' ');
  }
  return t.replace(/\s+/g, ' ').trim();
}

function extractNumberWord(text: string): NumberResult {
  const t = text.trim();

  // Urdu script numbers
  const urduMap: [RegExp, number][] = [
    [/^(ایک|1)\s*/u, 1],
    [/^(دو|2)\s*/u, 2],
    [/^(تین|3)\s*/u, 3],
    [/^(چار|4)\s*/u, 4],
    [/^(پانچ|5)\s*/u, 5],
    [/^(چھ|6)\s*/u, 6],
    [/^(سات|7)\s*/u, 7],
    [/^(آٹھ|8)\s*/u, 8],
    [/^(نو|9)\s*/u, 9],
    [/^(دس|10)\s*/u, 10],
  ];
  for (const [pat, qty] of urduMap) {
    if (pat.test(t)) {
      return { hasNumber: true, quantity: qty, remaining: t.replace(pat, '') };
    }
  }

  // Roman Urdu / English words
  if (/^\b(aadha|adha|half)\b/i.test(t))
    return { hasNumber: true, quantity: 0.5, remaining: t.replace(/^\b(aadha|adha|half)\b\s*/i, '') };
  if (/^\b(pao|paao)\b/i.test(t))
    return { hasNumber: true, quantity: 0.25, unit: 'kg', remaining: t.replace(/^\b(pao|paao)\b\s*/i, '') };
  if (/^\b(ek|aik|one|1)\b/i.test(t))
    return { hasNumber: true, quantity: 1, remaining: t.replace(/^\b(ek|aik|one|1)\b\s*/i, '') };
  if (/^\b(do|two|2)\b/i.test(t))
    return { hasNumber: true, quantity: 2, remaining: t.replace(/^\b(do|two|2)\b\s*/i, '') };
  if (/^\b(teen|tin|three|3)\b/i.test(t))
    return { hasNumber: true, quantity: 3, remaining: t.replace(/^\b(teen|tin|three|3)\b\s*/i, '') };
  if (/^\b(chaar|char|four|4)\b/i.test(t))
    return { hasNumber: true, quantity: 4, remaining: t.replace(/^\b(chaar|char|four|4)\b\s*/i, '') };
  if (/^\b(paanch|panch|five|5)\b/i.test(t))
    return { hasNumber: true, quantity: 5, remaining: t.replace(/^\b(paanch|panch|five|5)\b\s*/i, '') };

  return { hasNumber: false, quantity: 1, remaining: t };
}

function normalizeUnit(u: string): string {
  const l = u.toLowerCase();
  if (['kg', 'kilo', 'kilogram', 'kilos'].includes(l)) return 'kg';
  if (['g', 'gram', 'grams', 'gm'].includes(l)) return 'gram';
  if (['l', 'liter', 'litre', 'liters', 'ltr'].includes(l)) return 'liter';
  if (['pkt', 'packet', 'packets'].includes(l)) return 'packet';
  if (['doz', 'dozen', 'dazan'].includes(l)) return 'dozen';
  if (['bot', 'bottle', 'bottles'].includes(l)) return 'bottle';
  if (['box', 'boxes'].includes(l)) return 'box';
  return l;
}

function categorize(name: string): ItemCategory {
  const l = name.toLowerCase();
  if (/\b(aloo|pyaz|tamatar|khera|palak|dhaniya|pudina|ginger|adrak|garlic|lahsan|sabzi|onion|potato|tomato|cucumber|spinach|lemon|nimbu|gobi|cabbage|matar|peas|bhindi|ladyfinger)\b/.test(l))
    return 'vegetables';
  if (/\b(doodh|milk|dahi|yogurt|butter|makhan|cheese|cream|malai|egg|eggs|anda|ande)\b/.test(l))
    return 'dairy';
  if (/\b(soap|sabun|dettol|shampoo|toothpaste|paste|surf|detergent|tissue|harpic|handwash|towel|cleaner|brush|sanitizer)\b/.test(l))
    return 'toiletries';
  if (/\b(panadol|disprin|bandage|medicine|syrup|tablet|tablets|ointment|pharmacy|paracetamol|calpol|pills|capsule)\b/.test(l))
    return 'medical';
  if (/\b(atta|flour|rice|chawal|ghee|oil|daal|dal|sugar|chini|salt|namak|spice|tea|chai|patti|bread|biscuit|badam|pasta|noodle|pizza|burger)\b/.test(l))
    return 'grocery';
  return 'other';
}

function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
}

function parseQuantity(q: string): number {
  if (q.includes('/')) {
    const parts = q.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]) || 1;
      const den = parseFloat(parts[1]) || 1;
      return den !== 0 ? num / den : 1;
    }
  }
  return parseFloat(q) || 1;
}

export function parse(rawText: string): ParsedResult {
  if (!rawText.trim()) {
    return { itemName: '', quantity: 1, unit: 'pcs', category: 'other' };
  }

  let text = rawText.trim().toLowerCase();

  // Step 1: Strip leading intent words
  text = stripLeadingIntents(text);

  // Step 2: Strip trailing fillers
  text = stripTrailingFillers(text);

  let quantity = 1;
  let unit = 'pcs';
  let itemName = text;

  // Step 3: Urdu/Roman number words
  const numResult = extractNumberWord(text);
  if (numResult.hasNumber) {
    quantity = numResult.quantity;
    if (numResult.unit) unit = numResult.unit;
    text = numResult.remaining;
    itemName = text;
  }

  // Step 4: Digit + unit + name pattern (e.g. "2 kg aloo")
  const numUnitName = /^([\d./]+)\s*([a-zA-Z]*)\s+(.+)$/.exec(text);
  if (numUnitName) {
    quantity = parseQuantity(numUnitName[1]);
    const rawUnit = numUnitName[2] ?? '';
    if (rawUnit) unit = normalizeUnit(rawUnit);
    itemName = numUnitName[3] ?? text;
  }

  // Step 5: Strip trailing fillers again
  itemName = stripTrailingFillers(itemName);

  // Step 6: Extract unit from name
  if (unit === 'pcs') {
    const unitMatch = /\b(kilo|kg|kilogram|liter|litre|ltr|dozen|dazan|gram|gm|packet|pkt)\b/i.exec(itemName);
    if (unitMatch) {
      unit = normalizeUnit(unitMatch[1]);
      itemName = itemName.replace(unitMatch[0], '').trim();
    }
  }

  // Step 7: Clean connector words
  itemName = itemName.replace(/\b(ke|k|wala|wali|walay)\b/gi, ' ').replace(/\s+/g, ' ').trim();

  // Step 8: Format
  itemName = capitalizeWords(itemName.trim()) || capitalizeWords(rawText);

  return {
    itemName,
    quantity,
    unit,
    category: categorize(itemName),
  };
}
