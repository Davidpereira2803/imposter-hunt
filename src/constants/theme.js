// Shared surfaces and semantic colors. Background aliases support existing screens.
export const palette = {
  bg: "#100E12",
  background: "#100E12",
  panel: "#1C191F",
  backgroundDim: "#252129",
  line: "#39323D",
  text: "#F8F1E8",
  textDim: "#B9ACB7",
  primary: "#BE334B",
  primaryDim: "#321923",
  success: "#77CBA5",
  danger: "#F07888",
  warn: "#E8B86D",
};

export const roleColors = {
  imposter: palette.danger,
  civilian: palette.success,
  sheriff: "#8CBDF0",
  jester: "#CAA0F0",
};

export const paletteblue = {
  bg:      "#0B0D12",
  panel:   "#131722",
  line:    "#1F2430",
  text:    "#F4F7FF",
  textDim: "#AEB6C2",
  primary: "#4F8BFF",
  success: "#30D37D",
  danger:  "#FF5964",
  warn:    "#FFB020",
};

export const palettered = {
  bg:      "#0D090B",
  panel:   "#1A0F11",
  line:    "#301B1D",
  text:    "#FCF7F6",
  textDim: "#C2A8A9",
  primary: "#D32F2F",
  success: "#4CAF50",
  danger:  "#F44336",
  warn:    "#FF8A65",
};

export const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };
export const space = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 };
export const type = { h1: 28, h2: 22, h3: 18, body: 16, small: 13, giant: 56 };

export const shadow = {
  card: { 
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  raised: { 
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  }
};