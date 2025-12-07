// Corrige encoding de strings
// Aplica padrões de substituição para corrigir caracteres corrompidos (ex: "ï¿½" -> caracteres portugueses)

export function fixStringEncoding(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleaned = text;

  // Padrões de substituição: [RegExp, string de substituição]
  // Ordem importa: padrões mais específicos primeiro
  const patterns: [RegExp, string][] = [

    // Distritos - padrões específicos completos
    [/Mourï¿½o/gi, 'Mourão'],
    [/Loulï¿½/gi, 'Loulé'],
    [/Figueirï¿½/gi, 'Figueiró'],
    [/Santarï¿½m/gi, 'Santarém'],
    [/Braganï¿½a/gi, 'Bragança'],
    [/Setï¿½bal/gi, 'Setúbal'],
    [/ï¿½vora/gi, 'Évora'],
    [/Sï¿½o/gi, 'São'],
    [/ï¿½gueda/gi, 'Águeda'],
    [/ï¿½lvaro/gi, 'Álvaro'],
    [/ï¿½guas/gi, 'Águas'],
    
    // Concelhos - padrões específicos completos
    [/Gï¿½is/gi, 'Góis'],
    [/Lousï¿½/gi, 'Lousã'],
    [/Castanheira de Pï¿½ra/gi, 'Castanheira de Pêra'],
    [/Murï¿½a/gi, 'Murça'],
    [/Guimarï¿½es/gi, 'Guimarães'],
    [/Proenï¿½a-a-Nova/gi, 'Proença-a-Nova'],

    // Padrões genéricos (ordem importa - mais específicos primeiro)
    [/ï¿½i/gi, 'ói'],
    [/ï¿½a$/gm, 'ã'],
    [/ï¿½e$/gm, 'ê'],
    [/ï¿½a(?=[\s-])/gi, 'ã'],
    [/ï¿½e(?=[\s-])/gi, 'ê'],
    [/ï¿½a/gi, 'ã'],
    [/ï¿½([ou])/gi, 'ã$1'],
    [/ï¿½$/gm, 'ó'],
    [/ï¿½/gi, 'ã'],
  ];

  for (const [pattern, replacement] of patterns) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned;
}

// Corrige encoding recursivamente em objetos e arrays
export function fixObjectEncoding<T>(obj: T): T {
  if (!obj) {
    return obj;
  }

  if (typeof obj === 'string') {
    return fixStringEncoding(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => fixObjectEncoding(item)) as T;
  }

  if (typeof obj === 'object') {
    const fixed = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      (fixed as any)[key] = fixObjectEncoding(value);
    }
    return fixed;
  }

  return obj;
}