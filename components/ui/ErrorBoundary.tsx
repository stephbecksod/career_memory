import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleTryAgain = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  handleGoHome = () => {
    this.setState({ hasError: false });
    // Navigate by resetting window location on web, or rely on the router reset
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred. You can try again or go back to the home screen.
          </Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.primaryBtn} onPress={this.handleTryAgain}>
              <Text style={styles.primaryBtnText}>Try again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={this.handleGoHome}>
              <Text style={styles.secondaryBtnText}>Go home</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 32,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: colors.walnut,
    marginBottom: 12,
  },
  message: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.umber,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  buttons: {
    gap: 12,
    width: '100%',
    maxWidth: 260,
  },
  primaryBtn: {
    backgroundColor: colors.moss,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.white,
  },
  secondaryBtn: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.walnut,
  },
});
