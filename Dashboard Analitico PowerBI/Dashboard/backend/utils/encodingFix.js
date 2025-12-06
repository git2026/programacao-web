/**Utilitários para Correção de Encoding
 * Corrige problemas de encoding em strings (UTF-8 mal interpretado como latin1).
 * Utiliza detecção automática de encoding, substituições diretas e dicionário de distritos.
 */

import chardet from 'chardet';
import iconv from 'iconv-lite';

/**
 * Lista de distritos portugueses com encoding correto.
 * Usamos como referência para reconstruir nomes que perderam acentos/letras.
 */
const DISTRICT_NAMES = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Ilha da Madeira',
  'Ilha de Porto Santo',
  'Ilha de Santa Maria',
  'Ilha de São Miguel',
  'Ilha Terceira',
  'Ilha da Graciosa',
  'Ilha de São Jorge',
  'Ilha do Pico',
  'Ilha do Faial',
  'Ilha das Flores',
  'Ilha do Corvo'
];

/**
 * Mapa com substituições directas (UTF-8 mal interpretado como latin1)
 */
const SEQUENCE_MAP = {
  'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
  'Ã¢': 'â', 'Ãª': 'ê', 'Ã´': 'ô',
  'Ã£': 'ã', 'Ãµ': 'õ',
  'Ã§': 'ç',
  'Ã ': 'à',
  'Ã€': 'À', 'Ã‰': 'É', 'Ã': 'Í', 'Ã"': 'Ó', 'Ãš': 'Ú',
  'Ã‚': 'Â', 'ÃŠ': 'Ê', 'Ã"': 'Ô',
  'Ãƒ': 'Ã', 'Ã•': 'Õ',
  'Ã‡': 'Ç',
  'Ãœ': 'Ü', 'Ã¼': 'ü',
  'Â°': '°',
  'â€“': '–', 'â€”': '—',
  'â€œ': '"', 'â€\x9d': '"', 'â€˜': '\'', 'â€™': '\'',
  'Â«': '«', 'Â»': '»',
  'Â': ''
};

/**
 * Padrões genéricos envolvendo o caracter de substituição ("ï¿½" / U+FFFD)
 */
const GENERIC_PATTERNS = [
  [/ï¿½i/gi, 'ói'],
  [/ï¿½a$/gim, 'ã'],
  [/ï¿½e$/gim, 'ê'],
  [/ï¿½a(?=[\s,.-])/gi, 'ã'],
  [/ï¿½e(?=[\s,.-])/gi, 'ê'],
  [/ï¿½es/gi, 'ães'],
  [/ï¿½a/gi, 'ã'],
  [/ï¿½o/gi, 'ão'],
  [/ï¿½([ou])/gi, 'ã$1'],
  [/ï¿½$/gim, 'ó'],
  [/ï¿½/gi, 'ã']
];

const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g;
const REPLACEMENT_REGEX = /\uFFFD/g;
const NEEDS_DECODE_REGEX = /Ã|Â|ï¿½|\uFFFD/;
const DISTRICT_DICTIONARY = buildDictionary(DISTRICT_NAMES);

function buildDictionary(values) {
  const map = new Map();
  values.forEach((value) => {
    map.set(normalizeKey(value), value);
  });
  return map;
}

function normalizeKey(value) {
  return removeDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function removeDiacritics(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function needsDecoding(value) {
  return NEEDS_DECODE_REGEX.test(value);
}

function decodeToUtf8(value) {
  if (!value || typeof value !== 'string') {
    return value;
  }

  if (!needsDecoding(value)) {
    return value;
  }

  try {
    const buffer = Buffer.from(value, 'binary');
    const detected = chardet.detect(buffer) || 'UTF-8';
    if (!detected || detected.toLowerCase() === 'utf-8') {
      return value;
    }
    if (!iconv.encodingExists(detected)) {
      return value;
    }
    return iconv.decode(buffer, detected);
  } catch (error) {
    return value;
  }
}

function applySequenceMap(value) {
  let result = value;
  for (const [wrong, correct] of Object.entries(SEQUENCE_MAP)) {
    if (result.includes(wrong)) {
      result = result.split(wrong).join(correct);
    }
  }
  return result;
}

function applyGenericPatterns(value) {
  let result = value;
  for (const [pattern, replacement] of GENERIC_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function cleanControlCharacters(value) {
  return value.replace(CONTROL_CHARS_REGEX, '').replace(REPLACEMENT_REGEX, '');
}

function normalizeUnicode(value) {
  try {
    return value.normalize('NFC');
  } catch {
    return value;
  }
}

/**
 * Calcula distância de Levenshtein entre duas strings (algoritmo de edição)
 */
function levenshtein(a, b) {
  if (a === b) return 0;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function restoreFromDictionary(value, dictionary) {
  if (!value || !dictionary?.size) {
    return value;
  }

  const normalized = normalizeKey(value);
  if (dictionary.has(normalized)) {
    return dictionary.get(normalized);
  }

  let bestMatch = value;
  let bestDistance = Infinity;

  for (const [key, original] of dictionary.entries()) {
    const distance = levenshtein(normalized, key);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = original;
    }
  }

  return bestDistance <= 2 ? bestMatch : value;
}

/**
 * Corrige encoding de uma string
 * @param {string} text - Texto a corrigir
 * @param {Object} options - Opções: { dictionary: 'districts' } para usar dicionário de distritos
 * @returns {string} Texto corrigido
 */
export function fixStringEncoding(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  const { dictionary } = options;
  let cleaned = text;

  cleaned = decodeToUtf8(cleaned);
  cleaned = applySequenceMap(cleaned);
  cleaned = applyGenericPatterns(cleaned);
  cleaned = cleanControlCharacters(cleaned);
  cleaned = normalizeUnicode(cleaned);

  if (dictionary === 'districts') {
    cleaned = restoreFromDictionary(cleaned, DISTRICT_DICTIONARY);
  }

  return cleaned;
}

/**
 * Corrige encoding recursivamente em objetos e arrays
 * @param {*} obj - Objeto, array ou string a corrigir
 * @param {Object} options - Opções de correção
 * @returns {*} Objeto com encoding corrigido
 */
export function fixObjectEncoding(obj, options) {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    return fixStringEncoding(obj, options);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => fixObjectEncoding(item, options));
  }

  if (typeof obj === 'object') {
    const fixed = {};
    for (const [key, value] of Object.entries(obj)) {
      fixed[key] = fixObjectEncoding(value, options);
    }
    return fixed;
  }

  return obj;
}

/**
 * Normaliza encoding de blocos de texto (CSV, etc.)
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
export function normalizeEncodingBlock(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = decodeToUtf8(text);
  cleaned = cleanControlCharacters(cleaned);
  return normalizeUnicode(cleaned);
}