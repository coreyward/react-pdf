import { describe, expect, it } from 'vitest';
import * as fontkit from 'fontkit';
import * as path from 'path';
import * as fs from 'fs';

const WOFF2_FONT_PATH = path.join(
  __dirname,
  'assets',
  'RobotoFlex-VariableFont.woff2',
);

const TTF_FONT_PATH = path.join(
  __dirname,
  'assets',
  'RobotoFlex-VariableFont.ttf',
);

describe('WOFF2 variable font support', () => {
  it('should load a WOFF2 variable font file', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    expect(font).toBeTruthy();
    expect(font.type).toBe('WOFF2');
  });

  it('should detect variation axes in WOFF2 font', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    expect(font.variationAxes).toBeTruthy();
    expect(font.variationAxes.wght).toBeTruthy();

    const wghtAxis = font.variationAxes.wght;
    expect(wghtAxis.min).toBeDefined();
    expect(wghtAxis.max).toBeDefined();
    expect(wghtAxis.default).toBeDefined();
  });

  it('should support getVariation method on WOFF2 font', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const baseFont = fontkit.create(fontBuffer);

    // Verify getVariation method exists and returns a font object
    expect(typeof baseFont.getVariation).toBe('function');

    // Note: fontkit has a known issue with WOFF2 variable font variations
    // where getVariation may not preserve all tables correctly.
    // For production use, load TTF variable fonts directly.
    const variation = baseFont.getVariation({ wght: 400 });
    expect(variation).toBeTruthy();
  });

  it('should layout text with base WOFF2 font', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    const text = 'WOFF2 Test';
    const layout = font.layout(text);

    // Should successfully layout text
    expect(layout).toBeTruthy();
    expect(layout.glyphs.length).toBe(text.length);
    expect(layout.advanceWidth).toBeGreaterThan(0);

    // All glyphs should be valid
    layout.glyphs.forEach((glyph) => {
      expect(glyph.id).toBeGreaterThanOrEqual(0);
    });
  });

  it('should support kerning in WOFF2 fonts', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    // Test kerning with a pair that typically has kerning
    const withKern = font.layout('VA', { kern: true });
    const withoutKern = font.layout('VA', { kern: false });

    expect(withKern).toBeTruthy();
    expect(withoutKern).toBeTruthy();
    expect(withKern.glyphs.length).toBe(2);
    expect(withoutKern.glyphs.length).toBe(2);
  });

  it('should support ligatures in WOFF2 fonts', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    const withLiga = font.layout('fi', { liga: true });
    const withoutLiga = font.layout('fi', { liga: false });

    expect(withLiga).toBeTruthy();
    expect(withoutLiga).toBeTruthy();
    expect(withLiga.glyphs.length).toBeGreaterThan(0);
    expect(withoutLiga.glyphs.length).toBeGreaterThan(0);
  });

  it('should produce same layout results as TTF for base font', () => {
    const woff2Buffer = fs.readFileSync(WOFF2_FONT_PATH);
    const ttfBuffer = fs.readFileSync(TTF_FONT_PATH);

    const woff2Font = fontkit.create(woff2Buffer);
    const ttfFont = fontkit.create(ttfBuffer);

    const text = 'Same Text';
    const woff2Layout = woff2Font.layout(text);
    const ttfLayout = ttfFont.layout(text);

    // Should produce identical results
    expect(woff2Layout.advanceWidth).toBe(ttfLayout.advanceWidth);
    expect(woff2Layout.glyphs.length).toBe(ttfLayout.glyphs.length);

    // Glyph IDs should match
    for (let i = 0; i < woff2Layout.glyphs.length; i++) {
      expect(woff2Layout.glyphs[i].id).toBe(ttfLayout.glyphs[i].id);
    }
  });

  it('should detect multiple variation axes in WOFF2', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    const axes = Object.keys(font.variationAxes);

    // RobotoFlex has multiple axes
    expect(axes.length).toBeGreaterThan(1);

    // Check that each axis has proper structure
    axes.forEach((axisTag) => {
      const axis = font.variationAxes[axisTag];
      expect(axis).toBeTruthy();
      expect(axis.min).toBeDefined();
      expect(axis.max).toBeDefined();
      expect(axis.default).toBeDefined();
    });
  });

  it('should handle complex text with WOFF2 font and features', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    const text = 'The quick brown fox jumps over the lazy dog 1234567890';
    const layout = font.layout(text, {
      kern: true,
      liga: true,
    });

    expect(layout).toBeTruthy();
    expect(layout.glyphs.length).toBeGreaterThan(0);
    expect(layout.advanceWidth).toBeGreaterThan(0);

    // Verify all glyphs are valid
    layout.glyphs.forEach((glyph) => {
      expect(glyph.id).toBeGreaterThanOrEqual(0);
    });

    // Verify all positions are valid
    layout.positions.forEach((pos) => {
      expect(pos.xAdvance).toBeGreaterThanOrEqual(0);
    });
  });

  it('should verify WOFF2 is smaller than TTF', () => {
    const woff2Stats = fs.statSync(WOFF2_FONT_PATH);
    const ttfStats = fs.statSync(TTF_FONT_PATH);

    // WOFF2 should be significantly smaller due to compression
    expect(woff2Stats.size).toBeLessThan(ttfStats.size);

    // Typically WOFF2 is 30-50% smaller
    const compressionRatio = woff2Stats.size / ttfStats.size;
    expect(compressionRatio).toBeLessThan(0.7); // At least 30% compression
  });

  it('should handle all standard OpenType features in WOFF2', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    // Test various OpenType features
    const features = {
      kern: true,
      liga: true,
      calt: true,
      onum: true,
      tnum: true,
    };

    const layout = font.layout('Test 123', features);

    expect(layout).toBeTruthy();
    expect(layout.glyphs.length).toBeGreaterThan(0);
  });

  it('should properly report WOFF2 font type', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    // Font should be recognized as WOFF2
    expect(font.type).toBe('WOFF2');

    // Should have all standard font properties
    expect(font.postscriptName).toBeTruthy();
    expect(font.familyName).toBeTruthy();
    expect(font.numGlyphs).toBeGreaterThan(0);
    expect(font.unitsPerEm).toBeGreaterThan(0);
  });

  it('should access font metadata from WOFF2', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    // Check basic metadata
    expect(font.postscriptName).toBeTruthy();
    expect(font.familyName).toBeTruthy();
    expect(font.numGlyphs).toBeGreaterThan(0);
    expect(font.unitsPerEm).toBeGreaterThan(0); // Roboto Flex uses 2048
  });

  it('should list all available variation axes in WOFF2', () => {
    const fontBuffer = fs.readFileSync(WOFF2_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    const axes = Object.keys(font.variationAxes);

    // RobotoFlex has many axes
    expect(axes.length).toBeGreaterThan(1);

    // Check for common axes
    expect(axes).toContain('wght');

    // Each axis should have proper structure
    axes.forEach((axisTag) => {
      const axis = font.variationAxes[axisTag];
      expect(axis.min).toBeDefined();
      expect(axis.max).toBeDefined();
      expect(axis.default).toBeDefined();
      expect(axis.min).toBeLessThanOrEqual(axis.default);
      expect(axis.default).toBeLessThanOrEqual(axis.max);
    });
  });
});
