import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Button from "../../shared/ui/button";
import { Promocion } from "../../tipos";
import { buscarPromocionesPorComercio } from "../../service/promociones";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from "expo-camera";
import { validarCanjeEnLaApi } from "../../service/canjes";
import { eliminarResenaEnLaApi, buscarResenasPorComercio, publicarResenaEnLaApi, editarResenaEnLaApi, reportarResenaEnLaApi, responderResenaEnLaApi } from "../../service/resenas";

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
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [estrellasSeleccionadas, setEstrellasSeleccionadas] = useState<  1 | 2 | 3 | 4 | 5 >(5);
  const resenasOrdenadas = ordenarResenas(resenas);
  const promedioResenas = calcularPromedio(resenas);
  const [comentarioNuevo, setComentarioNuevo] = useState("");
  const [respuestaNueva, setRespuestaNueva] = useState("");
  const [resenaEditando, setResenaEditando] = useState<string | null>(null);

  const procesarQR = async (data: string) => {
  try {
    const codigo = data;

    await validarCanjeEnLaApi(codigo);

    setResultadoQR('¡Canje validado correctamente!');
  } catch (error) {
    setResultadoQR(
      error instanceof Error
        ? error.message
        : 'No se pudo validar el canje.',
    );
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

    useEffect(() => {
      async function cargarResenas() {
    try {
      const resultado = await buscarResenasPorComercio(String(id));
      setResenas(resultado);
    } catch (error) {
      console.log("Error al cargar reseñas:", error);
    }
  }

  if (id) {
    cargarResenas();
  }
}, [id]);

  if (cargando) {
    return <Text>Cargando...</Text>;
  }

  
async function publicarResena() {
  if (comentarioNuevo.trim() === "") {
    return;
  }

  try {
    if (resenaEditando !== null) {
      const resenaModificada = await editarResenaEnLaApi(
        resenaEditando,
        estrellasSeleccionadas,
        comentarioNuevo.trim()
      );

      setResenas((anteriores) =>
        anteriores.map((item) =>
          item.id === resenaEditando ? resenaModificada : item
        )
      );

      setResenaEditando(null);
    } else {
      const nuevaResena = await publicarResenaEnLaApi(
        String(id),
        estrellasSeleccionadas,
        comentarioNuevo.trim()
      );

      setResenas((anteriores) => [nuevaResena, ...anteriores]);
    }

    setComentarioNuevo("");
    setEstrellasSeleccionadas(5);
  } catch (error) {
    console.log("Error al guardar reseña:", error);
  }
}


async function eliminarResena(resenaId: string) {
  try {
    await eliminarResenaEnLaApi(resenaId);

    setResenas((anteriores) =>
      anteriores.filter((item) => item.id !== resenaId)
    );
  } catch (error) {
    console.log("Error al eliminar reseña:", error);
  }
}

function editarResena(resenaId: string) {
  const resenaElegida = resenas.find(
    (item) => item.id === resenaId
  );

  if (!resenaElegida) return;

  setResenaEditando(resenaId);
  setComentarioNuevo(resenaElegida.comentario);
  setEstrellasSeleccionadas(resenaElegida.estrellas);
}

async function reportarResena(resenaId: string) {
  try {
    const resenaActualizada = await reportarResenaEnLaApi(resenaId);

    setResenas((anteriores) =>
      anteriores.map((item) =>
        item.id === resenaId ? resenaActualizada : item
      )
    );
  } catch (error) {
    console.log("Error al reportar reseña:", error);
  }
}

async function responderResena(resenaId: string) {
  if (respuestaNueva.trim() === "") {
    return;
  }

  try {
    const resenaActualizada = await responderResenaEnLaApi(
      resenaId,
      respuestaNueva.trim()
    );

    setResenas((anteriores) =>
      anteriores.map((item) =>
        item.id === resenaId ? resenaActualizada : item
      )
    );

    setRespuestaNueva("");
  } catch (error) {
    console.log("Error al responder reseña:", error);
  }
}


  return (
  <SafeAreaView style={styles.contenedor}>
    <ScrollView>
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
        <Text style={styles.subtitulo}>Reseñas del comercio</Text>
        <Text style={styles.descripcion}>Tu calificación</Text>
        <View style={styles.filaEstrellas}>
          
          {[1, 2, 3, 4, 5].map((numero) => (
            <Pressable key={numero} onPress={() => setEstrellasSeleccionadas(numero as 1 | 2 | 3 | 4 | 5)
            }
            >
              <Text style={styles.estrella}>
                {numero <= estrellasSeleccionadas ? "★" : "☆"}
                </Text>
                </Pressable>
              ))}
              </View>
              
              <Text style={styles.descripcion}>Tu comentario</Text>
              <TextInput 
              style={styles.campoComentario}
              placeholder="Escribí tu reseña..."
              value={comentarioNuevo}
              onChangeText={setComentarioNuevo}
              multiline
              />
              <Pressable
              style={styles.botonResena}
              onPress={publicarResena}>
                <Text style={styles.textoBotonResena}>
                  {resenaEditando !== null ? "Guardar cambios" : "Publicar reseña"}</Text>
                </Pressable>

              <Text style={styles.descripcion}>Promedio: {promedioResenas.toFixed(1)} / 5 ⭐</Text>
              {resenasOrdenadas.map((item) => (
                <View key={item.id} style={styles.tarjetaFicha}>
                  <Text style={styles.descripcion}>{"⭐".repeat(item.estrellas)}</Text>
                  <Text style={styles.descripcion}>{item.comentario}</Text>
                  <Pressable
                  onPress={() => eliminarResena(item.id)}
                  style={styles.botonEliminar}>
                    <Text style={styles.textoEliminar}>Eliminar reseña</Text>
                    </Pressable>
                    <Pressable
                    onPress={() => editarResena(item.id)}
                    style={styles.botonEditar}>
                      <Text style={styles.textoEditar}>Editar reseña</Text>
                      </Pressable>
                      <Pressable
                      onPress={() => reportarResena(item.id)}
                      style={styles.botonReportar}>
                        <Text style={styles.textoReportar}>
                          {item.reportada ? "Reseña reportada" : "Reportar reseña"}
                          </Text>
                          </Pressable>
                          
                          {item.respuesta ? (
                            <Text style={styles.descripcion}>Respuesta del comercio: {item.respuesta}</Text>
                          ) : (
                          <>
                          <TextInput
                          style={styles.campoComentario}
                          placeholder="Respuesta del comercio..."
                          value={respuestaNueva}
                          onChangeText={setRespuestaNueva}
                          multiline
                          />
                          <Pressable
                          style={styles.botonRespuesta}
                          onPress={() => responderResena(item.id)}>
                            <Text style={styles.textoBotonRespuesta}>Responder</Text>
                            </Pressable>
                            </>
                          )}
                          </View>
                        ))}
                        </View>
                        </ScrollView>
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


function ordenarResenas(resenas: Resena[]): Resena[] {
  return [...resenas].sort(
    (a, b) =>
      new Date(b.creadaEn).getTime() -
      new Date(a.creadaEn).getTime(),
  );
}

function calcularPromedio(resenas: Resena[]): number {
  if (resenas.length === 0) {
    return 0;
  }

  const total = resenas.reduce(
    (suma, resena) => suma + resena.estrellas,
    0,
  );

  return total / resenas.length;
}


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
  filaEstrellas: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 8,
  },
  estrella: {
    fontSize: 32,
    color: "#F5B301",
  },
  campoComentario: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 10,
    minHeight: 90,
    textAlignVertical: "top",
    marginVertical: 8,
  },
  botonResena: {
    backgroundColor: "#333333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  textoBotonResena: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  botonEliminar: {
    marginTop: 8,
    padding: 8,
    alignSelf: "flex-start",
  },
  textoEliminar: {
    color: "#C62828",
    fontWeight: "bold",
  },
  botonEditar: {
    marginTop: 4,
    padding: 8,
    alignSelf: "flex-start",
  },
  textoEditar: {
    color: "#1565C0",
    fontWeight: "bold",
  },
  botonReportar: {
    marginTop: 4,
    padding: 8,
    alignSelf: "flex-start",
  },
  textoReportar: {
    color: "#C62828",
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
  botonRespuesta: {
    backgroundColor: "#333333",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  textoBotonRespuesta: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});