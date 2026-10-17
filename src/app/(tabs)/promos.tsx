import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { buscarPromociones, clasificarPromociones } from '../../service/promociones';
import type { Promocion } from '../../tipos';

export default function PantallaPromos() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  useEffect(() => {
    async function cargarPromociones() {
      const resultado = await
      buscarPromociones();
      setPromociones(resultado);
    }

    cargarPromociones();
  }, []);

  const grupos = clasificarPromociones(promociones);


  return (
    <ScrollView contentContainerStyle = {styles.contenedor}>
      <View style={styles.contenedor}>
      <Text style={styles.titulo}>Promociones de Comercios</Text>
    </View>

    <Text style = {styles.subtitulo}>Promociones vigentes</Text>
    {grupos.vigentes.map((promo) => (
      <View key={promo.id} style = {styles.tarjeta}>
        <Text style = {styles.nombre}>{promo.titulo}</Text>
        <Text>{promo.detalle}</Text>
        <Text>Descuento: {promo.descuento}</Text>
        <Text>Válido hasta: {promo.hasta}</Text>
      </View>
    ))}

    <Text style = {styles.subtitulo}>Promociones por vencer</Text>
    {grupos.porVencer.map((promo) => (
      <View key={promo.id} style = {styles.tarjeta}>
        <Text style = {styles.nombre}>{promo.titulo}</Text>
        <Text>Válido hasta: {promo.hasta}</Text>
      </View>
    ))}
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },

  tarjeta: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    margin: 8,
  },

  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

