import React from "react";
import { StyleSheet, Pressable, Platform } from "react-native";
import { MotiView } from "moti";

interface VariantSwatchProps {
  color: string;
  hex: string;
  selected?: boolean;
  onPress?: () => void;
}

const VariantSwatch: React.FC<VariantSwatchProps> = ({ color, hex, selected = false, onPress }) => {
  return (
    <Pressable onPress={onPress} style={{ marginRight: 12, marginBottom: 12 }}>
      <MotiView
        animate={{
          scale: selected ? 1.1 : 1,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? "#1E2749" : "#ccc",
          shadowOpacity: selected ? 0.35 : 0,
        }}
        transition={{
          type: "spring",
          damping: 12,
          stiffness: 150,
        }}
        style={[
          styles.swatch,
          { backgroundColor: hex || color },
          selected && Platform.select({
            ios: {
              shadowColor: "#1E2749",
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
            },
            android: {
              elevation: 5,
            },
          }),
        ]}
      />
    </Pressable>
  );
};

export default VariantSwatch;

const styles = StyleSheet.create({
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
});
