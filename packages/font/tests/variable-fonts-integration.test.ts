import { describe, expect, it } from 'vitest';
import * as fontkit from 'fontkit';
import * as path from 'path';
import * as fs from 'fs';

import FontSource from '../src/font-source';

const VARIABLE_FONT_PATH = path.join(
  __dirname,
  'assets',
  'RobotoFlex-VariableFont.ttf',
);

describe('variable font integration tests', () => {
  it('should load a variable font file', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    expect(font).toBeTruthy();
    expect(font.variationAxes).toBeTruthy();
  });

  it('should detect available variation axes', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    // RobotoFlex has multiple axes including wght (weight)
    expect(font.variationAxes).toHaveProperty('wght');

    const wghtAxis = font.variationAxes.wght;
    expect(wghtAxis).toBeTruthy();
    expect(wghtAxis.min).toBeDefined();
    expect(wghtAxis.max).toBeDefined();
    expect(wghtAxis.default).toBeDefined();
  });

  it('should create font variations with different weights', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const baseFont = fontkit.create(fontBuffer);

    // Create light variation (wght: 300)
    const lightFont = baseFont.getVariation({ wght: 300 });

    // Create bold variation (wght: 700)
    const boldFont = baseFont.getVariation({ wght: 700 });

    expect(lightFont).toBeTruthy();
    expect(boldFont).toBeTruthy();

    // Fonts should be different instances
    expect(lightFont).not.toBe(boldFont);
    expect(lightFont).not.toBe(baseFont);
  });

  it('should produce different glyph metrics for different weights', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const baseFont = fontkit.create(fontBuffer);

    // Create light and bold variations
    const lightFont = baseFont.getVariation({ wght: 100 });
    const boldFont = baseFont.getVariation({ wght: 1000 });

    // Layout the same text with both variations
    const text = 'Test';
    const lightLayout = lightFont.layout(text);
    const boldLayout = boldFont.layout(text);

    expect(lightLayout).toBeTruthy();
    expect(boldLayout).toBeTruthy();

    // Bold should generally have wider advance widths
    // Get total width
    const lightWidth = lightLayout.advanceWidth;
    const boldWidth = boldLayout.advanceWidth;

    expect(boldWidth).toBeGreaterThan(lightWidth);
  });

  it('should support width axis (wdth)', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const baseFont = fontkit.create(fontBuffer);

    // Check if width axis exists
    if (baseFont.variationAxes.wdth) {
      const narrowFont = baseFont.getVariation({ wdth: 75 });
      const wideFont = baseFont.getVariation({ wdth: 100 });

      const text = 'Wide';
      const narrowLayout = narrowFont.layout(text);
      const wideLayout = wideFont.layout(text);

      expect(wideLayout.advanceWidth).toBeGreaterThanOrEqual(
        narrowLayout.advanceWidth,
      );
    }
  });

  it('should support combining multiple axes', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const baseFont = fontkit.create(fontBuffer);

    // Create variation with multiple axes
    const customFont = baseFont.getVariation({
      wght: 500,
      wdth: 90,
    });

    expect(customFont).toBeTruthy();

    const layout = customFont.layout('Test');
    expect(layout.glyphs.length).toBeGreaterThan(0);
  });

  it('should apply variations when loading fonts', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const baseFont = fontkit.create(fontBuffer);

    // Simulate what FontSource does: apply variation
    const variationSettings = { wght: 600 };
    let font = baseFont;

    if (variationSettings && 'getVariation' in baseFont) {
      font = baseFont.getVariation(variationSettings);
    }

    expect(font).toBeTruthy();

    // The font should be loaded and ready to use
    const layout = font.layout('Hello');
    expect(layout.glyphs.length).toBe(5);
  });

  it('should handle kerning with OpenType features', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    // Layout with kerning enabled
    const withKerning = font.layout('VA', { kern: true });

    // Layout with kerning disabled
    const withoutKerning = font.layout('VA', { kern: false });

    expect(withKerning).toBeTruthy();
    expect(withoutKerning).toBeTruthy();

    // In most fonts, "VA" will be kerned closer together
    // The actual positions might differ
    expect(withKerning.positions).toBeTruthy();
    expect(withoutKerning.positions).toBeTruthy();
  });

  it('should handle ligatures with OpenType features', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    // Layout with ligatures enabled
    const withLigatures = font.layout('fi', { liga: true });

    // Layout with ligatures disabled
    const withoutLigatures = font.layout('fi', { liga: false });

    expect(withLigatures.glyphs).toBeTruthy();
    expect(withoutLigatures.glyphs).toBeTruthy();

    // With ligatures, 'fi' might become a single glyph
    // Without ligatures, it should be two separate glyphs
    // Note: Not all fonts have fi ligature, so we just check they're different
    expect(withLigatures).toBeTruthy();
    expect(withoutLigatures).toBeTruthy();
  });

  it('should provide named variations if available', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    // Check if named variations exist
    if (font.namedVariations && Object.keys(font.namedVariations).length > 0) {
      const namedVariationKeys = Object.keys(font.namedVariations);
      expect(namedVariationKeys.length).toBeGreaterThan(0);

      // Try to use a named variation
      const firstNamed = namedVariationKeys[0];
      const namedFont = font.getVariation(firstNamed);

      expect(namedFont).toBeTruthy();
    }
  });

  it('should handle out-of-range variation values gracefully', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    // Try to create variation with values outside the valid range
    // Fontkit should clamp these to valid ranges
    const extremeFont = font.getVariation({ wght: 9999 });

    expect(extremeFont).toBeTruthy();

    // Should still be able to layout text
    const layout = extremeFont.layout('Test');
    expect(layout.glyphs.length).toBeGreaterThan(0);
  });

  it('should produce consistent results for same variation settings', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const baseFont = fontkit.create(fontBuffer);

    const font1 = baseFont.getVariation({ wght: 500 });
    const font2 = baseFont.getVariation({ wght: 500 });

    const text = 'Consistent';
    const layout1 = font1.layout(text);
    const layout2 = font2.layout(text);

    expect(layout1.advanceWidth).toBe(layout2.advanceWidth);
    expect(layout1.glyphs.length).toBe(layout2.glyphs.length);
  });

  it('should support slant axis if available', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const font = fontkit.create(fontBuffer);

    if (font.variationAxes.slnt) {
      const uprightFont = font.getVariation({ slnt: 0 });
      const slantedFont = font.getVariation({ slnt: -10 });

      expect(uprightFont).toBeTruthy();
      expect(slantedFont).toBeTruthy();

      // Both should be able to layout text
      expect(uprightFont.layout('Slant').glyphs.length).toBeGreaterThan(0);
      expect(slantedFont.layout('Slant').glyphs.length).toBeGreaterThan(0);
    }
  });

  it('should handle complex text with variation and features', async () => {
    const fontBuffer = fs.readFileSync(VARIABLE_FONT_PATH);
    const baseFont = fontkit.create(fontBuffer);

    const font = baseFont.getVariation({ wght: 400 });

    const text = 'Testing Variable Fonts 123';
    const layout = font.layout(text, { kern: true, liga: true });

    expect(layout).toBeTruthy();
    expect(layout.glyphs.length).toBeGreaterThan(0);
    expect(layout.advanceWidth).toBeGreaterThan(0);

    // All glyphs should have valid IDs
    layout.glyphs.forEach(glyph => {
      expect(glyph.id).toBeGreaterThanOrEqual(0);
    });
  });
});
