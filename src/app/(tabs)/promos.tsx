import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { buscarPromociones, clasificarPromociones, buscarPromocionesPorRubro } from '../../service/promociones';
import type { Promocion } from '../../tipos';
import { usePathname, useRouter } from 'expo-router';
import { id } from 'zod/v4/locales';
import { contarCanjesPorPromocion } from '../../service/canjes';

export default function PantallaPromos() {
  const router = useRouter();
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string | null>(null);
  const [canjesPorPromocion, setCanjesPorPromocion] = useState<Record<string, number>>({});
  const rubros = [
    "Ferretería",
    "Gastronomía",
    "Indumentaria",
    "Servicios",
  ]
  
useEffect(() => {
  async function cargarPromociones() {
    const resultado = rubroSeleccionado
      ? await buscarPromocionesPorRubro(rubroSeleccionado)
      : await buscarPromociones();

    setPromociones(resultado);

    const contadores = await Promise.all(
      resultado.map(async (promo) => ({
        id: promo.id,
        cantidad: await contarCanjesPorPromocion(promo.id),
      }))
    );

    const nuevoEstado: Record<string, number> = {};

    contadores.forEach((contador) => {
      nuevoEstado[contador.id] = contador.cantidad;
    });

    setCanjesPorPromocion(nuevoEstado);
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
        <Text>Canjes registrados: {canjesPorPromocion[promo.id] ?? 0}</Text>
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
        <Text>Canjes registrados: {canjesPorPromocion[promo.id] ?? 0}</Text>
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
        <Text>Canjes registrados: {canjesPorPromocion[promo.id] ?? 0}</Text>
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

