import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, TextInput, Linking  } from "react-native";
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { porIdstyles as styles } from "../../styles/porId.styles";
import { ReproductorVideo } from "../../components/ReproductorVideo";
import Button from "../../shared/ui/button";
import { Promocion } from "../../tipos";
import { buscarPromocionesPorComercio } from "../../service/promociones";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import { registrarCanje, validarCanjeEnLaApi } from "../../service/canjes";
import {
  guardarResena,
  eliminarResenaGuardada,
  publicarResenaEnLaApi,
  editarResenaEnLaApi,
  eliminarResenaDeLaApi,
  reportarResenaEnLaApi,
  obtenerResenasDeComercio,
  responderResenaEnLaApi,

} from "../../service/resenas";
import {
  agregarFavorito,
  quitarFavorito,
  esFavorito as consultarFavorito,
} from "../../service/favoritos";
import { exito } from "../../service/haptics";
import type { Comercio } from "../../tipos";
import { guardarMediosComercio } from "../../service/archivosOffline";
import { buscarComercioPorId } from "../../service/comercios";
import { useSesion } from "../../contexto/sesion";


export default function DetalleComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useSesion();
  const [permisoCamara, solicitarPermisoCamara] = useCameraPermissions();
  const [escanearQR, setEscanearQR] = useState(false);
  const [resultadoQR, setResultadoQR] = useState("");
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [estrellasSeleccionadas, setEstrellasSeleccionadas] = useState<
    1 | 2 | 3 | 4 | 5
  >(5);
  const resenasOrdenadas = ordenarResenas(resenas);
  const promedioResenas = calcularPromedio(resenas);
  const [comentarioNuevo, setComentarioNuevo] = useState("");
  const [respuestaNueva, setRespuestaNueva] = useState("");
  const [resenaEditando, setResenaEditando] = useState<string | null>(null);


const procesarQR = async (data: string) => {

  let datos: {
    promocionId?: string;
    comercioId?: string;
    codigo?: string;
  };

  try {
    datos = JSON.parse(data);
  } catch {
    setResultadoQR("El QR no tiene un formato válido");
    return;
  }

  if (!datos.promocionId || !datos.comercioId || !datos.codigo) {
    setResultadoQR("QR inválido");
    return;
  }

  if (datos.comercioId !== id) {
    setResultadoQR("Esta promoción no corresponde a este comercio");
    return;
  }

  
  const promociones = await buscarPromocionesPorComercio(datos.comercioId);

  const promocion = promociones.find(
    (promo) => promo.id === datos.promocionId,
  );

  if (!promocion) {
    setResultadoQR("La promoción no pertenece a este comercio");
    return;
  }

  const hoy = new Date();
  const desde = new Date(promocion.desde);
  const hasta = new Date(promocion.hasta);

  if (!promocion.activa || hoy < desde || hoy > hasta) {
    setResultadoQR("La promoción no está vigente");
    return;
  }


  try {
    await validarCanjeEnLaApi(datos.codigo);

  
    try {
      await registrarCanje(
        datos.promocionId,
        datos.comercioId,
        datos.codigo,
      );
    } catch (error) {
      console.error("No se pudo guardar el registro local:", error);
    }

    setResultadoQR("¡Canje registrado correctamente!");
    await exito();

  } catch (error) {
   
    console.error("Error al validar el canje en la API:", error);

    setResultadoQR(
      error instanceof Error
        ? error.message
        : "No se pudo validar el canje. Intentá nuevamente.",
    );
  }
};

  const [comercio, setComercio] = useState<Comercio | null>(null);



  const [favorito, setFavorito] = useState(false);
  const [actualizandoFavorito, setActualizandoFavorito] = useState(false);

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
    if (!id) return;

    let activo = true;

    async function cargarDatosPantalla() {
      try {
        const [comercioObtenido, resenasObtenidas] = await Promise.all([
          buscarComercioPorId(String(id)),
          obtenerResenasDeComercio(String(id)),
        ]);

        const comercioConMedios = await guardarMediosComercio(comercioObtenido);


        if (activo) {
          setComercio(comercioConMedios);
          setResenas(resenasObtenidas);

          const miResena = usuario
                  ? resenasObtenidas.find((r) => r.usuarioId === usuario.id)
                  : undefined;
              if (miResena) {
                  setResenaEditando(miResena.id);
                  setComentarioNuevo(miResena.comentario);
                  setEstrellasSeleccionadas(miResena.estrellas);
            }
        }
      } catch (error) {
        console.error(
          "Error al cargar los datos del comercio o las reseñas:",
          error,
        );
      }
    }

    cargarDatosPantalla();

    return () => {
      activo = false;
    };
  }, [id, usuario]);


  useEffect(() => {
    let activo = true;

    const verificarFavorito = async () => {
      if (!id) return;

      const guardado = await consultarFavorito(String(id));

      if (activo) {
        setFavorito(guardado);
      }
    };

    verificarFavorito();

    return () => {
      activo = false;
    };
  }, [id]);

  async function publicarResena() {
    if (comentarioNuevo.trim() === "") return;
    if (!usuario) {
        alert("Necesitás ingresar con tu cuenta para dejar una reseña.");
        return;
    }

    try {
      if (resenaEditando !== null) {
        const resenaModificada = await editarResenaEnLaApi(
          resenaEditando,
          estrellasSeleccionadas,
          comentarioNuevo.trim(),
        );

        guardarResena(resenaModificada);
        await exito();

        setResenas((anteriores) =>
          anteriores.map((item) =>
            item.id === resenaEditando ? resenaModificada : item,
          ),
        );

        setResenaEditando(null);
      } else {
        const nuevaResena = await publicarResenaEnLaApi(
          String(id),
          estrellasSeleccionadas,
          comentarioNuevo.trim(),
        );

        guardarResena(nuevaResena);
        await exito();
        setResenas((anteriores) => [nuevaResena, ...anteriores]);
      }

      setComentarioNuevo("");
      setEstrellasSeleccionadas(5);
    } catch (error) {
      console.error("Error al guardar la reseña:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la reseña.",
      );
    }
  }

  async function eliminarResena(resenaId: string) {
    try {
      await eliminarResenaDeLaApi(resenaId);

      eliminarResenaGuardada(resenaId);
      await exito();

      setResenas((anteriores) =>
        anteriores.filter((item) => item.id !== resenaId),
      );
    } catch (error) {
      console.error("Error al eliminar la reseña:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la reseña.",
      );
    }
  }

  function editarResena(resenaId: string) {
    const resenaElegida = resenas.find((item) => item.id === resenaId);

    if (!resenaElegida) return;

    setResenaEditando(resenaId);
    setComentarioNuevo(resenaElegida.comentario);
    setEstrellasSeleccionadas(resenaElegida.estrellas);
  }

  async function reportarResena(resenaId: string) {
    try {
      await reportarResenaEnLaApi(resenaId);
      await exito();

      setResenas((anteriores) =>
        anteriores.map((item) =>
          item.id === resenaId ? { ...item, reportada: true } : item,
        ),
      );
    } catch (error) {
      console.error("Error al reportar la reseña:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo reportar la reseña.",
      );
    }
  }
  async function responderResena(resenaId: string, respuestaTexto: string) {
    try {
      const resenaActualizada = await responderResenaEnLaApi(
        resenaId,
        respuestaTexto,
      );

      setResenas((anteriores) =>
        anteriores.map((item) =>
          item.id === resenaId ? resenaActualizada : item,
        ),
      );

      setRespuestaNueva("");
      await exito();
    } catch (error) {
      console.error("Error al responder la reseña:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo responder la reseña.",
      );
    }
  }
  async function cambiarFavorito() {
    if (!id || actualizandoFavorito) return;

    setActualizandoFavorito(true);

    try {
      if (favorito) {
        await quitarFavorito(String(id));
        await exito();
        setFavorito(false);
      } else {
        await agregarFavorito(String(id));
        await exito();
        setFavorito(true);
      }
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
    } finally {
      setActualizandoFavorito(false);
    }
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView>
        <Button title="Volver" />
        <View style={styles.tarjetaFicha}>

          <View style={styles.encabezadoComercio}>
            <Text style={styles.tituloComercio} numberOfLines={2}>
              {comercio?.nombre ?? "Ficha del Comercio"}
            </Text>
            <View style={styles.badgeId}>
              <Text style={styles.textoBadgeId}>#{id}</Text>
            </View>
          </View>

          {comercio ? (
            <>
              <Text style={styles.descripcionComercio}>
                {comercio.descripcion}
              </Text>

              <Text style={styles.descripcion}>
                Dirección: {comercio.direccion}
              </Text>

          {comercio.telefono && (
            <Pressable onPress={() => Linking.openURL(`tel:${comercio.telefono}`)}>
              <Text style={styles.descripcion}>
                📞 Teléfono: {comercio.telefono}
              </Text>
            </Pressable>
          )}

          {comercio.whatsapp && (
            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://wa.me/${comercio.whatsapp?.replace(/\D/g, "")}`,
                )
              }
            >
              <Text style={styles.descripcion}>
                💬 WhatsApp: {comercio.whatsapp}
              </Text>
            </Pressable>
          )}

          {comercio.instagram && (
            <Pressable
              onPress={() =>
                Linking.openURL(
                  comercio.instagram!.startsWith("http")
                    ? comercio.instagram!
                    : `https://instagram.com/${comercio.instagram!.replace("@", "")}`,
                )
              }
            >
              <Text style={styles.descripcion}>
                📷 Instagram: {comercio.instagram}
              </Text>
            </Pressable>
          )}

          {comercio.horarios?.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.titulo}>Horarios de atención</Text>

              {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(
                (dia, indice) => {
                  const horariosDia = comercio.horarios.filter(
                    (horario) => horario.dia === indice,
                  );

                  if (horariosDia.length === 0) return null;

                  return (
                    <Text key={dia} style={styles.descripcion}>
                      {dia}: {horariosDia.map((h) => `${h.abre} a ${h.cierra}`).join(" / ")}
                    </Text>
                  );
                },
              )}
            </View>
          )}

          {comercio.mediosDePago?.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.titulo}>Medios de pago</Text>
              <Text style={styles.descripcion}>
                {comercio.mediosDePago.join(" · ")}
              </Text>
            </View>
          )}

              {comercio.imagenes?.map((imagen, indice) => (
                <Image
                  key={`${imagen}-${indice}`}
                  source={{ uri: imagen }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 10,
                    marginVertical: 8,
                  }}
                  resizeMode="cover"
                />
              ))}
            </>
          ) : (
            <Text style={styles.descripcion}>
              Cargando información del comercio...
            </Text>
          )}

          <View style={styles.divisor} />

          {comercio?.videoUrl ? (
            <View style={styles.contenedorVideo}>
              <ReproductorVideo urlVideo={comercio.videoUrl} />
            </View>
          ) : (
            <View style={styles.contenedorSinVideo}>
              <Text style={styles.textoSinVideo}>
                📹 Sin video de presentación
              </Text>
            </View>
          )}

          <Pressable
            style={styles.botonEscanear}
            onPress={() => void cambiarFavorito()}
            disabled={actualizandoFavorito}
          >
            <Text style={styles.textoBoton}>
              {actualizandoFavorito
                ? "Actualizando..."
                : favorito
                  ? "Quitar de favoritos"
                  : "Agregar a favoritos"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.tarjetaFicha}>
          <Text style={styles.titulo}>Registrar canje</Text>

          <Pressable
            onPress={async () => {
              if (!permisoCamara?.granted) {
                const permiso = await solicitarPermisoCamara();
                if (!permiso.granted) return;
              }

              setResultadoQR("");
              setEscanearQR(true);
            }}
            style={styles.botonEscanear}
          >
            <Text style={styles.textoBoton}>Escanear QR del cliente</Text>
          </Pressable>

          {resultadoQR !== "" && (
            <Text style={styles.descripcion}>Código leído: {resultadoQR}</Text>
          )}

          {escanearQR && (
            <View style={styles.contenedorCamara}>
              <CameraView
                style={styles.camara}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
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
                {promocion.titulo}: {promocion.detalle}
                {promocion.descuento !== null ? ` - Descuento: ${promocion.descuento}%` : ""}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.resena}>
          <Text style={styles.subtitulo}>Reseñas del comercio</Text>
          <Text style={styles.descripcion}>Tu calificación</Text>
          <View style={styles.filaEstrellas}>
            {[1, 2, 3, 4, 5].map((numero) => (
              <Pressable
                key={numero}
                onPress={() =>
                  setEstrellasSeleccionadas(numero as 1 | 2 | 3 | 4 | 5)
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
          <Pressable style={styles.botonResena} onPress={publicarResena}>
            <Text style={styles.textoBotonResena}>
              {resenaEditando !== null ? "Guardar cambios" : "Publicar reseña"}
            </Text>
          </Pressable>

          <Text style={styles.descripcion}>
            Promedio: {promedioResenas.toFixed(1)} / 5 ⭐
          </Text>
          {resenasOrdenadas.map((item) => {
  const esMia = usuario?.id === item.usuarioId;
  const esDuenioDelComercio =
      usuario?.rol === "comercio" && usuario.comercioId === String(id);

  return (
    <View key={item.id} style={styles.tarjetaFicha}>
        <Text style={styles.descripcion}>
            {"  ⭐".repeat(item.estrellas)}
        </Text>
        <Text style={styles.descripcion}>{item.comentario}</Text>

        {esMia && (
            <>
                <Pressable
                    onPress={() => eliminarResena(item.id)}
                    style={styles.botonEliminar}
                >
                    <Text style={styles.textoEliminar}>Eliminar reseña</Text>
                </Pressable>
                <Pressable
                    onPress={() => editarResena(item.id)}
                    style={styles.botonEditar}
                >
                    <Text style={styles.textoEditar}>Editar reseña</Text>
                </Pressable>
            </>
        )}

        {usuario && !esMia && (
            <Pressable
                onPress={() => reportarResena(item.id)}
                style={styles.botonReportar}
            >
                <Text style={styles.textoReportar}>
                    {item.reportada ? "Reseña reportada" : "Reportar reseña"}
                </Text>
            </Pressable>
        )}

        {item.respuesta ? (
            <Text style={styles.descripcion}>
                Respuesta del comercio: {item.respuesta}
            </Text>
        ) : (
            esDuenioDelComercio && (
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
                        onPress={() => responderResena(item.id, respuestaNueva)}
                    >
                        <Text style={styles.textoBotonRespuesta}>Responder</Text>
                    </Pressable>
                </>
            )
        )}
    </View>
  );
})}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilaFavorito({
  comercio,
  onEliminar,
}: {
  comercio: any;
  onEliminar: (id: any) => void;
}) {
  const translateX = useSharedValue(0);
  const swipe = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX < -100) {
        onEliminar(comercio.id);
      }
      translateX.value = 0;
    });
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  return (
    <GestureDetector gesture={swipe}>
      <Animated.View style={[styles.fila, style]}>
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

function ordenarResenas(resenas: Resena[]): Resena[] {
  return [...resenas].sort(
    (a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime(),
  );
}

function calcularPromedio(resenas: Resena[]): number {
  if (resenas.length === 0) {
    return 0;
  }

  const total = resenas.reduce((suma, resena) => suma + resena.estrellas, 0);

  return total / resenas.length;
}
