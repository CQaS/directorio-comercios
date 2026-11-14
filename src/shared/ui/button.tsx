import React from "react";
import { Pressable, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { btnStyles as styles } from "../../styles/btn.styles";

interface ButtonProps {
  title?: string;
  onPress?: () => void;
}

const Button = ({ title = "Volver", onPress }: ButtonProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      role="button"
      accessibilityRole="button"
      accessibilityLabel={`Botón ${title}`}
      accessibilityHint="Regresa a la pantalla anterior"
      // hitSlop amplía 10 píxeles el área táctil hacia los 4 lados
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={handlePress}
      style={({ pressed }) => [styles.boton, pressed && styles.botonPresionado]}
    >
      <Text style={styles.flecha}>←</Text>
      <View>
        <Text style={styles.texto}>{title}</Text>
      </View>
    </Pressable>
  );
};

export default Button;
