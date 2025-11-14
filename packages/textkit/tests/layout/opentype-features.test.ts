import { describe, expect, test, vi } from 'vitest';

import generateGlyphs from '../../src/layout/generateGlyphs';

const instance = generateGlyphs();

// Mock font with layout method that tracks feature usage
const createMockFont = () => {
  const layoutMock = vi.fn((text, features) => ({
    glyphs: text.split('').map((char, i) => ({
      id: char.charCodeAt(0),
      codePoints: [char.charCodeAt(0)],
      advanceWidth: 4,
    })),
    positions: text.split('').map(() => ({
      xAdvance: 4,
      yAdvance: 0,
      xOffset: 0,
      yOffset: 0,
    })),
  }));

  return {
    layout: layoutMock,
    unitsPerEm: 1000,
  };
};

describe('generateGlyphs with OpenType features', () => {
  test('should pass features to font.layout when provided', () => {
    const mockFont = createMockFont();
    const features = { kern: true, liga: false };

    const result = instance({
      string: 'Test',
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [mockFont as any],
            fontSize: 12,
            features,
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenCalledWith(
      'Test',
      features,
      undefined,
      undefined,
      'ltr',
    );
  });

  test('should pass undefined features when not provided', () => {
    const mockFont = createMockFont();

    const result = instance({
      string: 'Test',
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [mockFont as any],
            fontSize: 12,
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenCalledWith(
      'Test',
      undefined,
      undefined,
      undefined,
      'ltr',
    );
  });

  test('should handle kerning feature', () => {
    const mockFont = createMockFont();

    instance({
      string: 'AV',
      runs: [
        {
          start: 0,
          end: 2,
          attributes: {
            font: [mockFont as any],
            features: { kern: true },
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenCalledWith(
      'AV',
      { kern: true },
      undefined,
      undefined,
      'ltr',
    );
  });

  test('should handle ligature features', () => {
    const mockFont = createMockFont();

    instance({
      string: 'fi',
      runs: [
        {
          start: 0,
          end: 2,
          attributes: {
            font: [mockFont as any],
            features: { liga: true, dlig: false },
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenCalledWith(
      'fi',
      { liga: true, dlig: false },
      undefined,
      undefined,
      'ltr',
    );
  });

  test('should handle stylistic sets', () => {
    const mockFont = createMockFont();

    instance({
      string: 'Text',
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [mockFont as any],
            features: { ss01: true, ss02: true },
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenCalledWith(
      'Text',
      { ss01: true, ss02: true },
      undefined,
      undefined,
      'ltr',
    );
  });

  test('should handle number formatting features', () => {
    const mockFont = createMockFont();

    instance({
      string: '1234',
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [mockFont as any],
            features: { onum: true, tnum: true },
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenCalledWith(
      '1234',
      { onum: true, tnum: true },
      undefined,
      undefined,
      'ltr',
    );
  });

  test('should handle multiple runs with different features', () => {
    const mockFont = createMockFont();

    instance({
      string: 'HelloWorld',
      runs: [
        {
          start: 0,
          end: 5,
          attributes: {
            font: [mockFont as any],
            features: { kern: true },
          },
        },
        {
          start: 5,
          end: 10,
          attributes: {
            font: [mockFont as any],
            features: { liga: false },
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenNthCalledWith(
      1,
      'Hello',
      { kern: true },
      undefined,
      undefined,
      'ltr',
    );

    expect(mockFont.layout).toHaveBeenNthCalledWith(
      2,
      'World',
      { liga: false },
      undefined,
      undefined,
      'ltr',
    );
  });

  test('should handle empty features object', () => {
    const mockFont = createMockFont();

    instance({
      string: 'Test',
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [mockFont as any],
            features: {},
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenCalledWith(
      'Test',
      {},
      undefined,
      undefined,
      'ltr',
    );
  });

  test('should handle contextual alternates', () => {
    const mockFont = createMockFont();

    instance({
      string: 'Text',
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [mockFont as any],
            features: { calt: true },
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenCalledWith(
      'Text',
      { calt: true },
      undefined,
      undefined,
      'ltr',
    );
  });

  test('should handle small caps features', () => {
    const mockFont = createMockFont();

    instance({
      string: 'Text',
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [mockFont as any],
            features: { smcp: true, c2sc: true },
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenCalledWith(
      'Text',
      { smcp: true, c2sc: true },
      undefined,
      undefined,
      'ltr',
    );
  });

  test('should handle custom OpenType features', () => {
    const mockFont = createMockFont();

    instance({
      string: 'Test',
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [mockFont as any],
            features: { 'cv01': true, 'cv02': false },
          },
        },
      ],
    });

    expect(mockFont.layout).toHaveBeenCalledWith(
      'Test',
      { 'cv01': true, 'cv02': false },
      undefined,
      undefined,
      'ltr',
    );
  });
});
