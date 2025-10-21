export const palette = {
  bg:      "#0B0D12",  // near-black with a hint of blue
  panel:   "#131722",  // cards/panels
  line:    "#1F2430",  // dividers, strokes
  text:    "#F4F7FF",  // primary text (very light)
  textDim: "#AEB6C2",  // secondary text
  primary: "#4F8BFF",  // actions / links (blue)
  success: "#30D37D",  // positive
  danger:  "#FF5964",  // destructive
  warn:    "#FFB020",  // caution / pause
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