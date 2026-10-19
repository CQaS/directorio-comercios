import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Button from "../../shared/ui/button";
import { Promocion } from "../../tipos";
import { buscarPromocionesPorComercio } from "../../service/promociones";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from "expo-camera";
import { registrarCanje } from "../../service/canjes";

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

export default function DetalleComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [permisoCamara, solicitarPermisoCamara] = useCameraPermissions();
  const [escanearQR, setEscanearQR] = useState(false);
  const [resultadoQR, setResultadoQR] = useState('');
  const procesarQR = async (data: string) => {
  try {
    const datos = JSON.parse(data);

    if (
      !datos.promocionId ||
      !datos.comercioId ||
      !datos.codigo
    ) {
      setResultadoQR('QR inválido');
      return;
    }

    if (datos.comercioId !== id) {
      setResultadoQR('Esta promoción no corresponde a este comercio');
      return;
    }

    const promociones = await buscarPromocionesPorComercio(
      datos.comercioId,
    );
    const promocion = promociones.find(
      (promo) => promo.id === datos.promocionId,
    );
    
    if (!promocion) {
      setResultadoQR('La promoción no pertenece a este comercio');
      return;
    }
    
    const hoy = new Date();
    const desde = new Date(promocion.desde);
    const hasta = new Date(promocion.hasta);
    
    if (
      !promocion.activa ||
      hoy < desde ||
      hoy > hasta
    ) {
      setResultadoQR('La promoción no está vigente');
      return;
    }

    const registrado = await registrarCanje(
      datos.promocionId,
      datos.comercioId,
      datos.codigo,
    );

    setResultadoQR(
      registrado
        ? 'Canje registrado correctamente!'
        : 'Este código ya fue utilizado',
    );
  } catch {
    setResultadoQR('El QR no tiene un formato válido');
  }
};
  

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

<View style={styles.tarjetaFicha}>
  <Text style={styles.titulo}>Registrar canje</Text>

  <Pressable
    onPress={async () => {
      if (!permisoCamara?.granted) {
        const permiso = await solicitarPermisoCamara();
        if (!permiso.granted) return;
      }

      setResultadoQR('');
      setEscanearQR(true);
    }}
    style={styles.botonEscanear}
  >
    <Text style={styles.textoBoton}>
      Escanear QR del cliente
    </Text>
  </Pressable>

  {resultadoQR !== '' && (
    <Text style={styles.descripcion}>
      Código leído: {resultadoQR}
    </Text>
  )}

  {escanearQR && (
    <View style={styles.contenedorCamara}>
      <CameraView
        style={styles.camara}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={({ data }) => {
          setEscanearQR(false);
          void procesarQR(data);
        }}
      />

      <Pressable
        onPress={() => setEscanearQR(false)}
        style={styles.botonEscanear}
      >
        <Text style={styles.textoBoton}>Cancelar</Text>
      </Pressable>
    </View>
  )}
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
  botonEscanear: {
    backgroundColor: '#0B3A5D',
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  contenedorCamara: {
    marginTop: 16,
    gap: 12,
  },
  camara: {
    height: 300,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
