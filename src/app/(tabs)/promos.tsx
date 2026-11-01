import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { buscarPromociones, clasificarPromociones, buscarPromocionesPorRubro } from '../../service/promociones';
import type { Promocion } from '../../tipos';
import { useRouter } from 'expo-router';

export default function PantallaPromos() {
  const router = useRouter();
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string | null>(null);
  const rubros = [
  "Gastronomía",
  "Indumentaria",
  "Hogar",
  "Ferretería y construcción",
  "Salud y farmacia",
  "Servicios",
  "Tecnología",
  "Librería",
  "Otros",
];
  
useEffect(() => {
  async function cargarPromociones() {
    const resultado = rubroSeleccionado
      ? await buscarPromocionesPorRubro(rubroSeleccionado)
      : await buscarPromociones();

    setPromociones(resultado);

    
  }

  cargarPromociones();
}, [rubroSeleccionado]);


  const grupos = clasificarPromociones(promociones);


  return (
    <ScrollView contentContainerStyle = {styles.contenedor}>
      <View style={styles.contenedor}>
      <Text style={styles.titulo}>Promociones de Comercios</Text>
    </View>
    <View style={styles.rubros}>
    <Pressable onPress={() => setRubroSeleccionado(null)} 
    style={styles.botonRubro}>
      <Text>Ver todas</Text>
    </Pressable>

    {rubros.map((rubro) => ( 
      <Pressable key={rubro} onPress={() => setRubroSeleccionado(rubro)}
      style={[ styles.botonRubro, rubroSeleccionado === rubro && styles.botonRubroSeleccionado,]} >
        <Text>{rubro}</Text>
      </Pressable>
    ))}
    </View>

    <Text style = {styles.subtitulo}>Promociones vigentes</Text>
    {grupos.vigentes.map((promo) => (
      <Pressable key={promo.id} style = {styles.tarjeta} onPress={() => router.push({
        pathname: '/detalle-promocion',
        params: {id: promo.id},
      })
      }
      >
        <Text style = {styles.nombre}>{promo.titulo}</Text>
        <Text>{promo.detalle}</Text>
        <Text>Descuento: {promo.descuento}</Text>
        <Text>Válido hasta: {promo.hasta}</Text>
        <Text>Canjes registrados: {promo.usos}</Text>
        </Pressable>
      ))}

    <Text style = {styles.subtitulo}>Promociones por vencer</Text>
    {grupos.porVencer.map((promo) => (
      <Pressable key={promo.id} style = {styles.tarjeta} onPress={() => router.push({
        pathname: '/detalle-promocion',
        params: {id: promo.id},
      })
      }
      >
        <Text style = {styles.nombre}>{promo.titulo}</Text>
        <Text>Válido hasta: {promo.hasta}</Text>
        <Text>Canjes registrados: {promo.usos}</Text>
        </Pressable>
      ))}

    <Text style = {styles.subtitulo}>Próximas promociones</Text>
    {grupos.proximas.map((promo) => (
      <Pressable key={promo.id} style = {styles.tarjeta} onPress={() => router.push({
        pathname: '/detalle-promocion',
        params: {id: promo.id},
      })
      }
      >
        <Text style = {styles.nombre}>{promo.titulo}</Text>
        <Text>Descuento: {promo.descuento}</Text>
        <Text>Válido hasta: {promo.hasta}</Text>
        <Text>Canjes registrados: {promo.usos}</Text>
        </Pressable>
      ))}
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 25,
    paddingBottom: 20,
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
    padding: 5,
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
  },

  nombre: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  rubros: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginVertical: 15,
  },

  botonRubro: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#eee"
  },

  botonRubroSeleccionado: {
    backgroundColor: "#bde0fe",
    borderWidth: 1,
    borderColor: "#2196f3"
  },
});

