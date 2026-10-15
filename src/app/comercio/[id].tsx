import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Button from "../../shared/ui/button";
import { Promocion } from "../../tipos";
import { buscarPromocionesPorComercio } from "../../service/promociones";

import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

export default function DetalleComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [comercio, setComercio] = useState<any>({imagenes:[]});
  const [listaPromociones, setListaPromociones] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    const cargarPromociones = async () => {
      setCargando(true);
      const promocionesObtenidas = await buscarPromocionesPorComercio(id);
      setListaPromociones(promocionesObtenidas);
      setCargando(false);
    };

    if (id) {
      cargarPromociones();
    }
  }, [id]);

  if (cargando) {
    return <Text>Cargando...</Text>;
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      {/* Botón Volver reutilizable */}
      <Button title="Volver" />
      <View style={styles.tarjetaFicha}>
        <Text style={styles.titulo}>Ficha del Comercio</Text>
        <Text style={styles.subtitulo}>Identificador del comercio: #{id}</Text>
        <Text style={styles.descripcion}>
          Acá se visualizan los horarios detallados, promociones vigentes y
          ubicación del comercio en Concepción del Uruguay.
        </Text>
      </View>

      <View style= {styles.tarjetaFicha}>
        <Text style={styles.titulo}>Galería de fotos</Text>

        <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style= {{height:200, marginVertical:10}}>

          {comercio.imagenes.map((url: string, index: number) =>(
            <Image
            key={index}
            source={{uri: url}}
            style={{width:280, height:200, borderRadius:8, marginRight:10}}
            resizeMode = "cover"/>
          ))}
        </ScrollView>

        <Text style={styles.titulo}>Video de presentación</Text>
        <Text style={{fontSize:14, color:'#666', marginTop:5}}>
          Video corto de presentación(30segundos)
        </Text>
      </View>

      {/* Promociones */}
      {listaPromociones.length > 0 && (
        <View style={styles.tarjetaFicha}>
          <Text style={styles.titulo}>Promociones</Text>

          {listaPromociones.map((promocion) => (
            <Text key={promocion.id} style={styles.descripcion}>
              {promocion.titulo}: {promocion.detalle} - Descuento:{" "}
              {promocion.descuento}%
            </Text>
          ))}
        </View>
      )}
      <View style={styles.resena}>
        <Text style={styles.subtitulo}> Reseña</Text>
        <Text>{resena.estrellas}</Text>
        <Text>{resena.comentario}</Text>
        <Text>Respuesta del comercio:{resena.respuesta}</Text>
      </View>
    </SafeAreaView>
  );
}

function filaFavorito ({comercio, onEliminar}: {comercio:any;onEliminar:(id:any)=>void}) {
  const translateX = useSharedValue(0);
  const swipe = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = Math.min (0, e.translationX);
  })
  .onEnd ((e) => {
    if (e.translationX < -100) {
      onEliminar(comercio.id);
    }
    translateX.value = 0;
  });
  const style = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],  
  }));
  return (
    <GestureDetector gesture={swipe}>
      <Animated.View style = {[styles.fila, style]}>
        <Text>{comercio.nombre}</Text>
      </Animated.View>
    </GestureDetector>
  );
} 

export interface Resena {
  id: string;
  comercioId: string;
  usuarioId: string;
  estrellas: 1 | 2 | 3 | 4 | 5;
  comentario: string;
  respuesta: string | null;
  reportada: boolean;
  creadaEn: string;
  sincronizada: boolean;
}

const resena: Resena = {
  id: "res-2210",
  comercioId: "con-118",
  usuarioId: "usr-512",
  estrellas: 5,
  comentario: "Tenían el tornillo raro que no conseguía en ningún lado.",
  respuesta: "¡Gracias Marta! Siempre a las órdenes.",
  reportada: false,
  creadaEn: "2026-09-10T17:05:00-03:00",
  sincronizada: true,
};

const styles = StyleSheet.create({
  fila:{
    padding:16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contenedor: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  tarjetaFicha: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  resena: {
    marginTop: 20,
    padding: 15,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0B3A5D",
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
  },
  descripcion: {
    fontSize: 14,
    color: "#334155",
    marginTop: 12,
    lineHeight: 20,
  },
});
