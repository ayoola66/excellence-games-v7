// Excellence Games Design System
// A comprehensive design system for the Excellence Games brand

export const excellenceColors = {
  // Core Brand Colors
  gold: {
    50: "#FFF9E5", // Lightest gold - backgrounds
    100: "#FFF0CC", // Light gold - hover states
    200: "#FFE299", // Soft gold - borders
    300: "#FFD466", // Medium gold - icons
    400: "#FFC633", // Primary gold - buttons
    500: "#FFB800", // Brand gold - main accent
    600: "#CC9300", // Dark gold - text
    700: "#996E00", // Deeper gold - hover states
    800: "#664900", // Very dark gold - contrast
    900: "#332500", // Darkest gold - shadows
  },

  black: {
    50: "#F2F2F2", // Lightest grey - backgrounds
    100: "#E6E6E6", // Light grey - borders
    200: "#CCCCCC", // Soft grey - disabled states
    300: "#B3B3B3", // Medium grey - placeholders
    400: "#999999", // Primary grey - secondary text
    500: "#808080", // True grey - borders
    600: "#666666", // Dark grey - body text
    700: "#4D4D4D", // Deeper grey - headings
    800: "#333333", // Very dark grey - primary text
    900: "#1A1A1A", // Almost black - contrast
  },

  white: "#FFFFFF",

  // Accent Colors
  accent: {
    blue: {
      light: "#E6F0FF", // Light blue - backgrounds
      base: "#004AAD", // Base blue - accents
      dark: "#003377", // Dark blue - hover
    },
    red: {
      light: "#FFE6E6", // Light red - backgrounds
      base: "#D64545", // Base red - error states
      dark: "#A62F2F", // Dark red - hover
    },
  },

  // Semantic Colors
  success: {
    light: "#E6F6E6",
    base: "#2D862D",
    dark: "#1F5C1F",
  },
  warning: {
    light: "#FFF5E6",
    base: "#CC8800",
    dark: "#995C00",
  },
  error: {
    light: "#FFE6E6",
    base: "#D64545",
    dark: "#A62F2F",
  },
  info: {
    light: "#E6F0FF",
    base: "#004AAD",
    dark: "#003377",
  },

  // Gradients
  gradients: {
    goldPrimary: "linear-gradient(135deg, #FFB800 0%, #FFC633 100%)",
    goldSecondary: "linear-gradient(135deg, #FFD466 0%, #FFE299 100%)",
    goldDark: "linear-gradient(135deg, #CC9300 0%, #996E00 100%)",
    blackGold: "linear-gradient(135deg, #1A1A1A 0%, #FFB800 100%)",
    darkOverlay:
      "linear-gradient(180deg, rgba(26, 26, 26, 0) 0%, rgba(26, 26, 26, 0.8) 100%)",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px rgba(26, 26, 26, 0.05)",
    md: "0 4px 6px rgba(26, 26, 26, 0.1)",
    lg: "0 10px 15px rgba(26, 26, 26, 0.1)",
    xl: "0 20px 25px rgba(26, 26, 26, 0.15)",
    gold: "0 10px 20px rgba(255, 184, 0, 0.15)",
  },
};

export const excellenceTypography = {
  // Font Families
  fonts: {
    primary: "Copperplate Gothic Light, serif",
    secondary: "Montserrat, sans-serif",
    accent: "Poppins, sans-serif",
    body: "Inter, sans-serif",
  },

  // Font Sizes
  sizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
    "7xl": "4.5rem", // 72px
  },

  // Font Weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line Heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};

export const excellenceSpacing = {
  // Base spacing scale
  0: "0",
  px: "1px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
};

export const excellenceBorderRadius = {
  none: "0",
  sm: "0.125rem", // 2px
  base: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
};

export const excellenceTransitions = {
  duration: {
    75: "75ms",
    100: "100ms",
    150: "150ms",
    200: "200ms",
    300: "300ms",
    500: "500ms",
    700: "700ms",
    1000: "1000ms",
  },
  timing: {
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  properties: {
    all: "all",
    colors: "background-color, border-color, color, fill, stroke",
    opacity: "opacity",
    shadow: "box-shadow",
    transform: "transform",
  },
};

// Component-specific styles
export const excellenceComponents = {
  // Button Styles
  buttons: {
    primary: {
      base: {
        backgroundColor: excellenceColors.gold[500],
        color: excellenceColors.black[900],
        border: "none",
        borderRadius: excellenceBorderRadius.lg,
        padding: `${excellenceSpacing[4]} ${excellenceSpacing[6]}`,
        fontFamily: excellenceTypography.fonts.secondary,
        fontWeight: excellenceTypography.weights.semibold,
        transition: `all ${excellenceTransitions.duration[200]} ${excellenceTransitions.timing.inOut}`,
        boxShadow: excellenceColors.shadows.sm,
      },
      hover: {
        backgroundColor: excellenceColors.gold[600],
        transform: "translateY(-1px)",
        boxShadow: excellenceColors.shadows.md,
      },
      active: {
        backgroundColor: excellenceColors.gold[700],
        transform: "translateY(0)",
        boxShadow: excellenceColors.shadows.sm,
      },
      disabled: {
        backgroundColor: excellenceColors.black[200],
        color: excellenceColors.black[400],
        cursor: "not-allowed",
      },
    },
    secondary: {
      base: {
        backgroundColor: "transparent",
        color: excellenceColors.gold[500],
        border: `2px solid ${excellenceColors.gold[500]}`,
        borderRadius: excellenceBorderRadius.lg,
        padding: `${excellenceSpacing[3]} ${excellenceSpacing[5]}`,
        fontFamily: excellenceTypography.fonts.secondary,
        fontWeight: excellenceTypography.weights.semibold,
        transition: `all ${excellenceTransitions.duration[200]} ${excellenceTransitions.timing.inOut}`,
      },
      hover: {
        backgroundColor: excellenceColors.gold[500],
        color: excellenceColors.white,
        transform: "translateY(-1px)",
      },
      active: {
        backgroundColor: excellenceColors.gold[600],
        borderColor: excellenceColors.gold[600],
        transform: "translateY(0)",
      },
      disabled: {
        borderColor: excellenceColors.black[200],
        color: excellenceColors.black[400],
        cursor: "not-allowed",
      },
    },
  },

  // Card Styles
  cards: {
    primary: {
      base: {
        backgroundColor: excellenceColors.white,
        borderRadius: excellenceBorderRadius.xl,
        boxShadow: excellenceColors.shadows.md,
        border: `1px solid ${excellenceColors.black[100]}`,
        padding: excellenceSpacing[6],
        transition: `all ${excellenceTransitions.duration[200]} ${excellenceTransitions.timing.inOut}`,
      },
      hover: {
        transform: "translateY(-4px)",
        boxShadow: excellenceColors.shadows.lg,
      },
    },
    featured: {
      base: {
        backgroundColor: excellenceColors.white,
        borderRadius: excellenceBorderRadius["2xl"],
        boxShadow: excellenceColors.shadows.xl,
        border: `1px solid ${excellenceColors.gold[200]}`,
        padding: excellenceSpacing[8],
        position: "relative",
        overflow: "hidden",
      },
      hover: {
        transform: "translateY(-4px) scale(1.01)",
        boxShadow: excellenceColors.shadows.gold,
      },
      accent: {
        content: "''",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "4px",
        background: excellenceColors.gradients.goldPrimary,
      },
    },
  },

  // Input Styles
  inputs: {
    base: {
      backgroundColor: excellenceColors.white,
      border: `1px solid ${excellenceColors.black[200]}`,
      borderRadius: excellenceBorderRadius.lg,
      padding: `${excellenceSpacing[3]} ${excellenceSpacing[4]}`,
      fontFamily: excellenceTypography.fonts.body,
      fontSize: excellenceTypography.sizes.base,
      transition: `all ${excellenceTransitions.duration[200]} ${excellenceTransitions.timing.inOut}`,
      width: "100%",
    },
    focus: {
      outline: "none",
      borderColor: excellenceColors.gold[500],
      boxShadow: `0 0 0 3px ${excellenceColors.gold[100]}`,
    },
    error: {
      borderColor: excellenceColors.error.base,
      boxShadow: `0 0 0 3px ${excellenceColors.error.light}`,
    },
    disabled: {
      backgroundColor: excellenceColors.black[50],
      borderColor: excellenceColors.black[200],
      color: excellenceColors.black[400],
      cursor: "not-allowed",
    },
  },
};

// Theme configuration for different game editions
export const gameThemes = {
  ukEdition: {
    primary: excellenceColors.black[900],
    secondary: excellenceColors.gold[500],
    accent: excellenceColors.gold[300],
    background: excellenceColors.white,
    text: excellenceColors.black[800],
    font: excellenceTypography.fonts.primary,
  },
  targeted: {
    primary: excellenceColors.accent.blue.base,
    secondary: excellenceColors.gold[500],
    accent: excellenceColors.accent.blue.light,
    background: excellenceColors.white,
    text: excellenceColors.black[800],
    font: excellenceTypography.fonts.accent,
  },
};

// Utility functions
export const getGameTheme = (gameType: "uk-edition" | "targeted") => {
  return gameType === "uk-edition" ? gameThemes.ukEdition : gameThemes.targeted;
};

export const createGradient = (
  colors: string[],
  direction: string = "135deg"
) => {
  return `linear-gradient(${direction}, ${colors.join(", ")})`;
};

export const addPremiumEffect = (element: HTMLElement) => {
  element.style.background = excellenceColors.gradients.goldPrimary;
  element.style.boxShadow = excellenceColors.shadows.gold;
  element.style.transform = "translateY(-2px)";
};
