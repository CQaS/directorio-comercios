import { View, Text, StyleSheet } from "react-native";

interface Props {
  mensaje: string;
}

export default function MensajeError({
  mensaje,
}: Props) {

  if (!mensaje) {
    return null;
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>
        ⚠️ {mensaje}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: "#FEE2E2",
    borderColor: "#DC2626",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  texto: {
    color: "#991B1B",
    fontWeight: "600",
  },
})