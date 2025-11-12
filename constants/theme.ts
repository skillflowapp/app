/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryColor = '#1e3a8a'; // Dark Blue
const accentColor = '#38BDF8'; // Sky Blue

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: primaryColor,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryColor,
    primary: primaryColor,
    accent: accentColor,
    error: '#EF4444', // Red for errors
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
    primary: primaryColor,
    accent: accentColor,
    error: '#F87171', // Lighter red for dark mode
  },
};

export const Fonts = {
  family: {
    primary: 'Poppins',
    sans: 'Inter, Roboto, sans-serif', // Fallback fonts
  },
  sizes: {
    title: 28,
    subtitle: 20,
    body: 16,
    caption: 12,
  },
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

export const ButtonStyles = {
  primary: {
    backgroundColor: primaryColor,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: primaryColor,
  },
  text: {
    color: '#FFFFFF',
    fontSize: Fonts.sizes.body,
    fontWeight: Fonts.weights.bold,
    textAlign: 'center',
  },
  secondaryText: {
    color: primaryColor,
    fontSize: Fonts.sizes.body,
    fontWeight: Fonts.weights.bold,
    textAlign: 'center',
  }
};

export const InputStyles = {
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: Fonts.sizes.body,
    fontWeight: Fonts.weights.medium,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB', // Neutral color
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: Fonts.sizes.body,
  },
  inputFocused: {
    borderColor: primaryColor,
    borderWidth: 2,
  },
  inputError: {
    borderColor: Colors.light.error,
    borderWidth: 2,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: Fonts.sizes.caption,
    marginTop: 4,
  }
};
