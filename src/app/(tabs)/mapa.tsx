import { View, Text, StyleSheet } from 'react-native';

export default function PantallaMapa() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mapa Interactivo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 18, fontWeight: 'bold' },
});