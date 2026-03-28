import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type State = { hasError: boolean; error?: Error };

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("ErrorBoundary caught", { error, info });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID="error-boundary">
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error?.message ?? "Unexpected error"}</Text>
          <TouchableOpacity onPress={this.handleReset} style={styles.button} testID="error-reset">
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

const fontWeightBold = "700" as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: fontWeightBold,
    marginBottom: 8,
  },
  message: {
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: fontWeightBold,
  },
});