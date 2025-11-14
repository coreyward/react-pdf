import * as fontkit from 'fontkit';

export type Font = Omit<fontkit.Font, 'type'> & {
  type: 'TTF' | 'WOFF' | 'WOFF2' | 'STANDARD';
  encode?: (string: string) => number[];
  variationAxes?: VariationAxes; // available variation axes for variable fonts
  namedVariations?: { [name: string]: VariationSettings }; // named variation instances
};

export type FontStyle = 'normal' | 'italic' | 'oblique';

export type FontWeight =
  | number
  | 'thin'
  | 'ultralight'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'ultrabold'
  | 'heavy';

export type VariationAxis = {
  name: string;
  min: number;
  default: number;
  max: number;
};

export type VariationAxes = {
  [tag: string]: VariationAxis;
};

export type VariationSettings = {
  wght?: number; // weight
  wdth?: number; // width
  slnt?: number; // slant
  ital?: number; // italic
  opsz?: number; // optical size
  [tag: string]: number | undefined; // custom axes (4-letter tags)
};

export type OpenTypeFeatures = {
  kern?: boolean; // kerning
  liga?: boolean; // standard ligatures
  dlig?: boolean; // discretionary ligatures
  clig?: boolean; // contextual ligatures
  hlig?: boolean; // historical ligatures
  calt?: boolean; // contextual alternates
  swsh?: boolean; // swash
  smcp?: boolean; // small capitals
  c2sc?: boolean; // capitals to small capitals
  onum?: boolean; // old-style figures
  pnum?: boolean; // proportional figures
  tnum?: boolean; // tabular figures
  frac?: boolean; // fractions
  ordn?: boolean; // ordinals
  zero?: boolean; // slashed zero
  ss01?: boolean; // stylistic set 1
  ss02?: boolean; // stylistic set 2
  ss03?: boolean; // stylistic set 3
  ss04?: boolean; // stylistic set 4
  ss05?: boolean; // stylistic set 5
  ss06?: boolean; // stylistic set 6
  ss07?: boolean; // stylistic set 7
  ss08?: boolean; // stylistic set 8
  ss09?: boolean; // stylistic set 9
  ss10?: boolean; // stylistic set 10
  ss11?: boolean; // stylistic set 11
  ss12?: boolean; // stylistic set 12
  ss13?: boolean; // stylistic set 13
  ss14?: boolean; // stylistic set 14
  ss15?: boolean; // stylistic set 15
  ss16?: boolean; // stylistic set 16
  ss17?: boolean; // stylistic set 17
  ss18?: boolean; // stylistic set 18
  ss19?: boolean; // stylistic set 19
  ss20?: boolean; // stylistic set 20
  [tag: string]: boolean | undefined; // other OpenType features (4-letter tags)
};

export type FontDescriptor = {
  fontFamily: string;
  fontStyle?: FontStyle;
  fontWeight?: FontWeight;
};

export type RemoteOptions = {
  method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
};

export type FontSourceOptions = {
  postscriptName?: string;
  variation?: VariationSettings | string; // variation settings object or named variation
  features?: OpenTypeFeatures; // OpenType feature settings
} & RemoteOptions;

export type FontSource = {
  src: string;
  fontStyle?: FontStyle;
  fontWeight?: FontWeight;
} & FontSourceOptions;

export type SingleLoad = {
  family: string;
} & FontSource;

export type BulkLoad = {
  family: string;
  fonts: FontSource[];
};

interface EmojiSourceUrl {
  url: string;
  format?: string;
  withVariationSelectors?: boolean;
}

interface EmojiSourceBuilder {
  builder: (code: string) => string;
  withVariationSelectors?: boolean;
}

export type EmojiSource = EmojiSourceUrl | EmojiSourceBuilder;

export type HyphenationCallback = (word: string) => string[];
