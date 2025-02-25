const diffColors = {
  strongPositive: "#008F4B",
  lightPositive: "#124b30",
  strongNegative: "#8A1515",
  lightNegative: "#491a1b",
};

export const theme = {
  colors: {
    background: "#1E1E1E",
    background2: "#2C2C2C",
    text: "#F0F0F0",
    text2: "#FFFFFF",
    ...diffColors,
    diffSelect(diffType: "added" | "removed") {
      return diffType === "added"
        ? { strong: diffColors.strongPositive, light: diffColors.lightPositive }
        : {
            strong: diffColors.strongNegative,
            light: diffColors.lightNegative,
          };
    },
  },
  spacing: (multiplicator: number) => `${multiplicator * 4}px`,
  text: {
    fontSize: {
      small: "10px",
      medium: "16px",
    },
  },
};

export type ThemeType = typeof theme;
