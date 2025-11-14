import { describe, expect, test } from 'vitest';
import * as fontkit from 'fontkit';
import * as path from 'path';
import * as fs from 'fs';

import generateGlyphs from '../../src/layout/generateGlyphs';

const instance = generateGlyphs();

// Use the font from the font package tests
const VARIABLE_FONT_PATH = path.join(
  __dirname,
  '../../../font/tests/assets/RobotoFlex-VariableFont.ttf',
);

describe('generateGlyphs integration tests with real fonts', () => {
  let baseFont: any;
  let lightFont: any;
  let boldFont: any;

  // Load fonts before tests
  const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
  baseFont = fontkit.create(fontBuffer);
  lightFont = baseFont.getVariation({ wght: 100 });
  boldFont = baseFont.getVariation({ wght: 1000 });

  test('should produce different results for different font variations', () => {
    const text = 'Test';

    const lightResult = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: 4,
          attributes: { font: [lightFont], fontSize: 12 },
        },
      ],
    });

    const boldResult = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: 4,
          attributes: { font: [boldFont], fontSize: 12 },
        },
      ],
    });

    // Both should have glyphs
    expect(lightResult.runs[0].glyphs!.length).toBe(4);
    expect(boldResult.runs[0].glyphs!.length).toBe(4);

    // Calculate total advance width
    const lightWidth = lightResult.runs[0].positions!.reduce(
      (sum, pos) => sum + pos.xAdvance,
      0,
    );
    const boldWidth = boldResult.runs[0].positions!.reduce(
      (sum, pos) => sum + pos.xAdvance,
      0,
    );

    // Bold should be wider than light
    expect(boldWidth).toBeGreaterThan(lightWidth);
  });

  test('should handle kerning feature in real font', () => {
    const text = 'WAVE';

    const withKerning = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [baseFont],
            fontSize: 12,
            features: { kern: true },
          },
        },
      ],
    });

    const withoutKerning = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [baseFont],
            fontSize: 12,
            features: { kern: false },
          },
        },
      ],
    });

    // Both should produce glyphs
    expect(withKerning.runs[0].glyphs!.length).toBeGreaterThan(0);
    expect(withoutKerning.runs[0].glyphs!.length).toBeGreaterThan(0);

    // Calculate positions
    expect(withKerning.runs[0].positions).toBeTruthy();
    expect(withoutKerning.runs[0].positions).toBeTruthy();
  });

  test('should handle ligatures correctly', () => {
    const text = 'fficeffifflfflffiffl';

    const withLigatures = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: text.length,
          attributes: {
            font: [baseFont],
            fontSize: 12,
            features: { liga: true },
          },
        },
      ],
    });

    const withoutLigatures = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: text.length,
          attributes: {
            font: [baseFont],
            fontSize: 12,
            features: { liga: false },
          },
        },
      ],
    });

    // With ligatures might have fewer glyphs due to ligature substitution
    expect(withLigatures.runs[0].glyphs).toBeTruthy();
    expect(withoutLigatures.runs[0].glyphs).toBeTruthy();

    // Both should successfully layout
    expect(withLigatures.runs[0].glyphs!.length).toBeGreaterThan(0);
    expect(withoutLigatures.runs[0].glyphs!.length).toBeGreaterThan(0);
  });

  test('should handle multiple runs with different variations', () => {
    const text = 'LightBold';

    const result = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: 5,
          attributes: { font: [lightFont], fontSize: 12 },
        },
        {
          start: 5,
          end: 9,
          attributes: { font: [boldFont], fontSize: 12 },
        },
      ],
    });

    expect(result.runs[0].glyphs!.length).toBe(5);
    expect(result.runs[1].glyphs!.length).toBe(4);

    // Calculate widths
    const lightWidth = result.runs[0].positions!.reduce(
      (sum, pos) => sum + pos.xAdvance,
      0,
    );
    const boldWidth = result.runs[1].positions!.reduce(
      (sum, pos) => sum + pos.xAdvance,
      0,
    );

    // Bold section should have different metrics
    expect(boldWidth).toBeGreaterThan(0);
    expect(lightWidth).toBeGreaterThan(0);
  });

  test('should handle complex text with features', () => {
    const text = 'The quick brown fox jumps over the lazy dog 1234567890';

    const result = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: text.length,
          attributes: {
            font: [baseFont],
            fontSize: 12,
            features: {
              kern: true,
              liga: true,
            },
          },
        },
      ],
    });

    expect(result.runs[0].glyphs).toBeTruthy();
    expect(result.runs[0].positions).toBeTruthy();
    expect(result.runs[0].glyphs!.length).toBeGreaterThan(0);

    // All glyphs should have valid positions
    result.runs[0].positions!.forEach(pos => {
      expect(pos.xAdvance).toBeGreaterThanOrEqual(0);
    });
  });

  test('should produce consistent results for same configuration', () => {
    const text = 'Consistent';

    const result1 = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: text.length,
          attributes: {
            font: [baseFont.getVariation({ wght: 400 })],
            fontSize: 12,
            features: { kern: true },
          },
        },
      ],
    });

    const result2 = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: text.length,
          attributes: {
            font: [baseFont.getVariation({ wght: 400 })],
            fontSize: 12,
            features: { kern: true },
          },
        },
      ],
    });

    const width1 = result1.runs[0].positions!.reduce(
      (sum, pos) => sum + pos.xAdvance,
      0,
    );
    const width2 = result2.runs[0].positions!.reduce(
      (sum, pos) => sum + pos.xAdvance,
      0,
    );

    expect(width1).toBe(width2);
    expect(result1.runs[0].glyphs!.length).toBe(result2.runs[0].glyphs!.length);
  });

  test('should handle empty features object', () => {
    const text = 'Test';

    const result = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: 4,
          attributes: {
            font: [baseFont],
            fontSize: 12,
            features: {},
          },
        },
      ],
    });

    expect(result.runs[0].glyphs!.length).toBe(4);
    expect(result.runs[0].positions).toBeTruthy();
  });

  test('should scale positions correctly with fontSize', () => {
    const text = 'Size';

    const small = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: 4,
          attributes: { font: [baseFont], fontSize: 6 },
        },
      ],
    });

    const large = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: 4,
          attributes: { font: [baseFont], fontSize: 24 },
        },
      ],
    });

    const smallWidth = small.runs[0].positions!.reduce(
      (sum, pos) => sum + pos.xAdvance,
      0,
    );
    const largeWidth = large.runs[0].positions!.reduce(
      (sum, pos) => sum + pos.xAdvance,
      0,
    );

    // Large font size should produce larger advance widths
    expect(largeWidth).toBeGreaterThan(smallWidth);
    // Roughly 4x larger (24/6)
    expect(largeWidth / smallWidth).toBeCloseTo(4, 0);
  });

  test('should handle variation and features together', () => {
    const text = 'Combined';
    const customFont = baseFont.getVariation({ wght: 500 });

    const result = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: text.length,
          attributes: {
            font: [customFont],
            fontSize: 12,
            features: { kern: true, liga: true },
          },
        },
      ],
    });

    expect(result.runs[0].glyphs!.length).toBeGreaterThan(0);
    expect(result.runs[0].positions!.length).toBeGreaterThan(0);

    // All positions should be valid
    result.runs[0].positions!.forEach(pos => {
      expect(pos.xAdvance).toBeGreaterThanOrEqual(0);
      expect(pos.xOffset).toBeDefined();
      expect(pos.yOffset).toBeDefined();
    });
  });

  test('should generate valid glyph indices', () => {
    const text = 'Indices';

    const result = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: text.length,
          attributes: { font: [baseFont], fontSize: 12 },
        },
      ],
    });

    expect(result.runs[0].glyphIndices).toBeTruthy();
    expect(result.runs[0].glyphIndices!.length).toBeGreaterThan(0);

    // All indices should be non-negative
    result.runs[0].glyphIndices!.forEach(index => {
      expect(index).toBeGreaterThanOrEqual(0);
    });
  });

  test('should handle numbers with different feature settings', () => {
    const text = '1234567890';

    // Old-style figures
    const oldStyle = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: text.length,
          attributes: {
            font: [baseFont],
            fontSize: 12,
            features: { onum: true },
          },
        },
      ],
    });

    // Tabular figures
    const tabular = instance({
      string: text,
      runs: [
        {
          start: 0,
          end: text.length,
          attributes: {
            font: [baseFont],
            fontSize: 12,
            features: { tnum: true },
          },
        },
      ],
    });

    // Both should produce valid layouts
    expect(oldStyle.runs[0].glyphs!.length).toBe(10);
    expect(tabular.runs[0].glyphs!.length).toBe(10);
  });
});
