import { describe, expect, it, vi } from 'vitest';

import FontStore from '../src/index';
import FontSource from '../src/font-source';

describe('variable font support', () => {
  describe('font registration with variation settings', () => {
    it('should register font with variation settings object', () => {
      const fontStore = new FontStore();

      fontStore.register({
        family: 'VariableFont',
        src: 'https://example.com/VariableFont.woff2',
        variation: { wght: 500, wdth: 90 },
      });

      const font = fontStore.getFont({ fontFamily: 'VariableFont' });

      expect(font).toBeTruthy();
      expect(font?.src).toBe('https://example.com/VariableFont.woff2');
    });

    it('should register font with named variation', () => {
      const fontStore = new FontStore();

      fontStore.register({
        family: 'VariableFont',
        src: 'https://example.com/VariableFont.woff2',
        variation: 'Medium',
      });

      const font = fontStore.getFont({ fontFamily: 'VariableFont' });

      expect(font).toBeTruthy();
    });

    it('should register multiple variation instances of same font', () => {
      const fontStore = new FontStore();

      fontStore.register({
        family: 'VariableFont',
        fonts: [
          {
            src: 'https://example.com/VariableFont.woff2',
            fontWeight: 400,
            variation: { wght: 400 },
          },
          {
            src: 'https://example.com/VariableFont.woff2',
            fontWeight: 700,
            variation: { wght: 700 },
          },
        ],
      });

      const regular = fontStore.getFont({
        fontFamily: 'VariableFont',
        fontWeight: 400,
      });
      const bold = fontStore.getFont({
        fontFamily: 'VariableFont',
        fontWeight: 700,
      });

      expect(regular?.fontWeight).toBe(400);
      expect(bold?.fontWeight).toBe(700);
    });

    it('should accept custom variation axes', () => {
      const fontStore = new FontStore();

      fontStore.register({
        family: 'CustomVariableFont',
        src: 'https://example.com/CustomFont.woff2',
        variation: { wght: 500, GRAD: 100, XHGT: 800 },
      });

      const font = fontStore.getFont({ fontFamily: 'CustomVariableFont' });

      expect(font).toBeTruthy();
    });
  });

  describe('font registration with OpenType features', () => {
    it('should register font with OpenType features', () => {
      const fontStore = new FontStore();

      fontStore.register({
        family: 'FontWithFeatures',
        src: 'https://example.com/Font.woff2',
        features: { kern: true, liga: false },
      });

      const font = fontStore.getFont({ fontFamily: 'FontWithFeatures' });

      expect(font).toBeTruthy();
    });

    it('should accept stylistic sets', () => {
      const fontStore = new FontStore();

      fontStore.register({
        family: 'FontWithSets',
        src: 'https://example.com/Font.woff2',
        features: { ss01: true, ss02: true, ss20: true },
      });

      const font = fontStore.getFont({ fontFamily: 'FontWithSets' });

      expect(font).toBeTruthy();
    });

    it('should accept number formatting features', () => {
      const fontStore = new FontStore();

      fontStore.register({
        family: 'FontWithNumbers',
        src: 'https://example.com/Font.woff2',
        features: { onum: true, tnum: true, frac: true },
      });

      const font = fontStore.getFont({ fontFamily: 'FontWithNumbers' });

      expect(font).toBeTruthy();
    });
  });

  describe('font registration with both variations and features', () => {
    it('should register font with both variation and features', () => {
      const fontStore = new FontStore();

      fontStore.register({
        family: 'CompleteFont',
        src: 'https://example.com/Font.woff2',
        variation: { wght: 500, wdth: 95 },
        features: { kern: true, liga: true },
      });

      const font = fontStore.getFont({ fontFamily: 'CompleteFont' });

      expect(font).toBeTruthy();
    });
  });

  describe('FontSource variation application', () => {
    it('should store variation settings in options', () => {
      const fontSource = new FontSource(
        'https://example.com/Font.woff2',
        'TestFont',
        'normal',
        400,
        { variation: { wght: 500 } },
      );

      expect(fontSource.options.variation).toEqual({ wght: 500 });
    });

    it('should store named variation in options', () => {
      const fontSource = new FontSource(
        'https://example.com/Font.woff2',
        'TestFont',
        'normal',
        400,
        { variation: 'Medium' },
      );

      expect(fontSource.options.variation).toBe('Medium');
    });

    it('should store OpenType features in options', () => {
      const fontSource = new FontSource(
        'https://example.com/Font.woff2',
        'TestFont',
        'normal',
        400,
        { features: { kern: true, liga: false } },
      );

      expect(fontSource.options.features).toEqual({ kern: true, liga: false });
    });
  });
});
