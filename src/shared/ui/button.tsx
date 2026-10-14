import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface ButtonProps {
  title?: string;
  onPress?: () => void;
}

const Button = ({ title = 'Volver', onPress }: ButtonProps) => {
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
      style={({ pressed }) => [
        styles.boton,
        pressed && styles.botonPresionado,
      ]}
    >
      <Text style={styles.flecha}>←</Text>
      <View>
        <Text style={styles.texto}>{title}</Text>
      </View>
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  botonPresionado: {
    backgroundColor: '#E2E8F0',
    opacity: 0.8,
  },
  flecha: {
    fontSize: 16,
    color: '#0B3A5D',
    fontWeight: 'bold',
  },
  texto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B3A5D',
  },
});
