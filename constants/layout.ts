export const layout = {
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 14,
    xl: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  shadow: {
    sm: {
      shadowColor: '#2A2118',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
  },
  accentBar: {
    width: 3,
  },
  tabBar: {
    height: 60,
  },
  sidebar: {
    width: 240,
  },
} as const;
