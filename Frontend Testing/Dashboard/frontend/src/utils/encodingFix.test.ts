import { fixStringEncoding, fixObjectEncoding } from './encodingFix';

describe('fixStringEncoding', () => {
  it('corrige caracteres corrompidos comuns', () => {
    expect(fixStringEncoding('Santarï¿½m')).toBe('Santarém');
    expect(fixStringEncoding('Loulï¿½')).toBe('Loulé');
  });

  it('devolve valor original para entradas não string', () => {
    // @ts-expect-error - testando caminho defensivo
    expect(fixStringEncoding(null)).toBeNull();
    // @ts-expect-error - testando caminho defensivo
    expect(fixStringEncoding(undefined)).toBeUndefined();
  });
});

describe('fixObjectEncoding', () => {
  it('corrige textos aninhados em objetos e arrays', () => {
    const input = {
      nome: 'Sï¿½o Paulo',
      distritos: ['Mourï¿½o', 'ï¿½vora'],
      detalhe: { cidade: 'Loulï¿½' }
    };

    const output = fixObjectEncoding(input);

    expect(output).toEqual({
      nome: 'São Paulo',
      distritos: ['Mourão', 'Évora'],
      detalhe: { cidade: 'Loulé' }
    });
  });

  it('mantém valores não textuais', () => {
    const input = { numero: 5, valido: true };
    expect(fixObjectEncoding(input)).toEqual(input);
  });
});

