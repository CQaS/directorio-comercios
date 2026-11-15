import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import type { Comercio, Horario } from "../tipos";
import {
  obtenerMiComercio,
  actualizarMiComercio,
} from "../service/comercios";

import * as ImagePicker from "expo-image-picker";
import { subirArchivo } from "../service/archivos";


type TramoHorario = {
  dias: Horario["dia"][];
  abre: string;
  cierra: string;
};


function agruparHorarios(horariosApi: Horario[]): TramoHorario[] {
  const grupos = new Map<string, TramoHorario>();

  horariosApi.forEach((horario) => {
    const clave = `${horario.abre}-${horario.cierra}`;

    const grupo = grupos.get(clave);

    if (grupo) {
      if (!grupo.dias.includes(horario.dia)) {
        grupo.dias.push(horario.dia);
      }
    } else {
      grupos.set(clave, {
        dias: [horario.dia],
        abre: horario.abre,
        cierra: horario.cierra,
      });
    }
  });

  return Array.from(grupos.values()).map((grupo) => ({
    ...grupo,
    dias: grupo.dias.sort((a, b) => a - b),
  }));
}


export default function EditarComercioScreen() {
  const [comercio, setComercio] = useState<Comercio | null>(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [mediosDePago, setMediosDePago] = useState("");
  const [horarios, setHorarios] = useState<TramoHorario[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  async function cargarComercio() {
    try {
      setError("");
      const datos = await obtenerMiComercio();

      setComercio(datos);
      setNombre(datos.nombre);
      setDescripcion(datos.descripcion);
      setDireccion(datos.direccion);
      setTelefono(datos.telefono ?? "");
      setWhatsapp(datos.whatsapp ?? "");
      setInstagram(datos.instagram ?? "");
      setMediosDePago((datos.mediosDePago ?? []).join(", "));
      setImagenes(datos.imagenes ?? []);
      setVideoUrl(datos.videoUrl ?? null);
      setHorarios(agruparHorarios(datos.horarios ?? []));
    } catch (e) {
      console.error("Error al cargar mi comercio:", e);
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar los datos del comercio.",
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarComercio();
  }, []);

  async function guardarCambios() {
    if (!nombre.trim() || !descripcion.trim() || !direccion.trim()) {
      Alert.alert(
        "Faltan datos",
        "Completá el nombre, la descripción y la dirección.",
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const actualizado = await actualizarMiComercio({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim() || null,
        whatsapp: whatsapp.trim() || null,
        instagram: instagram.trim() || null,
        mediosDePago: mediosDePago.split(",").map((medio) => medio.trim()).filter(Boolean),
      });

      setComercio(actualizado);

      Alert.alert(
        "Cambios guardados",
        "Los datos de tu comercio se actualizaron correctamente.",
      );
    } catch (e) {
      console.error("Error al actualizar mi comercio:", e);
      Alert.alert(
        "No se pudieron guardar los cambios",
        e instanceof Error
          ? e.message
          : "Ocurrió un error inesperado.",
      );
    } finally {
      setGuardando(false);
    }
  }

const diasSemana = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// MODIFICADO: cambiar la hora de un tramo.
function modificarHorario(
  indice: number,
  cambios: Partial<TramoHorario>,
) {
  setHorarios((actuales) =>
    actuales.map((horario, i) =>
      i === indice ? { ...horario, ...cambios } : horario,
    ),
  );
}

// NUEVO: seleccionar o deseleccionar días de un tramo.
function alternarDia(indice: number, dia: Horario["dia"]) {
  setHorarios((actuales) =>
    actuales.map((horario, i) => {
      if (i !== indice) return horario;

      const seleccionado = horario.dias.includes(dia);

      return {
        ...horario,
        dias: seleccionado
          ? horario.dias.filter((d) => d !== dia)
          : [...horario.dias, dia].sort((a, b) => a - b),
      };
    }),
  );
}

// MODIFICADO: crear un tramo que empieza asignado al lunes.
function agregarHorario() {
  setHorarios((actuales) => [
    ...actuales,
    {
      dias: [1],
      abre: "09:00",
      cierra: "18:00",
    },
  ]);
}

// MODIFICADO: eliminar un tramo completo.
function eliminarHorario(indice: number) {
  setHorarios((actuales) =>
    actuales.filter((_, i) => i !== indice),
  );
}

// MODIFICADO: validar todos los días seleccionados.
function validarHorarios(): string | null {
  for (const horario of horarios) {
    const formato = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (horario.dias.length === 0) {
      return "Seleccioná al menos un día para cada horario.";
    }

    if (!formato.test(horario.abre) || !formato.test(horario.cierra)) {
      return "Ingresá los horarios en formato HH:MM.";
    }

    if (horario.abre >= horario.cierra) {
      return "La hora de cierre debe ser posterior a la de apertura.";
    }
  }

  // NUEVO: comprobar superposiciones entre tramos del mismo día.
  const horariosPorDia: Horario[] = horarios.flatMap((horario) =>
    horario.dias.map((dia) => ({
      dia,
      abre: horario.abre,
      cierra: horario.cierra,
    })),
  );

  for (let i = 0; i < horariosPorDia.length; i++) {
    for (let j = i + 1; j < horariosPorDia.length; j++) {
      const a = horariosPorDia[i];
      const b = horariosPorDia[j];

      if (a.dia !== b.dia) continue;

      if (a.abre < b.cierra && b.abre < a.cierra) {
        return `Hay dos horarios superpuestos el ${diasSemana[a.dia]}.`;
      }
    }
  }

  return null;
}

// MODIFICADO: convertir los tramos agrupados al formato que espera la API.
async function guardarHorarios() {
  const errorValidacion = validarHorarios();

  if (errorValidacion) {
    Alert.alert("Revisá los horarios", errorValidacion);
    return;
  }

  try {
    setGuardando(true);

    const horariosParaApi: Horario[] = horarios
      .flatMap((horario) =>
        horario.dias.map((dia) => ({
          dia,
          abre: horario.abre,
          cierra: horario.cierra,
        })),
      )
      .sort((a, b) => a.dia - b.dia || a.abre.localeCompare(b.abre));

    const actualizado = await actualizarMiComercio({
      horarios: horariosParaApi,
    });

    setComercio(actualizado);
    setHorarios(agruparHorarios(actualizado.horarios ?? horariosParaApi));

    Alert.alert(
      "Horarios guardados",
      "Los horarios de atención se actualizaron correctamente.",
    );
  } catch (e) {
    console.error("Error al actualizar los horarios:", e);

    Alert.alert(
      "No se pudieron guardar los horarios",
      e instanceof Error ? e.message : "Ocurrió un error inesperado.",
    );
  } finally {
    setGuardando(false);
  }
}


async function seleccionarImagenes() {
  if (imagenes.length >= 8) {
    Alert.alert("Límite alcanzado", "Podés agregar hasta 8 fotografías.");
    return;
  }

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: 8 - imagenes.length,
    quality: 0.8,
  });

  if (resultado.canceled) return;

  try {
    setSubiendoArchivo(true);

    const nuevasUrls: string[] = [];

    for (const archivo of resultado.assets) {
      nuevasUrls.push(await subirArchivo(archivo));
    }

    setImagenes((actuales) => [...actuales, ...nuevasUrls]);
    Alert.alert("Fotos cargadas", "Ahora guardá los cambios.");
  } catch (e) {
    Alert.alert(
      "Error al subir las fotos",
      e instanceof Error ? e.message : "No se pudieron subir.",
    );
  } finally {
    setSubiendoArchivo(false);
  }
}

function eliminarImagen(indice: number) {
  setImagenes((actuales) => actuales.filter((_, i) => i !== indice));
}

// NUEVO: seleccionar y subir un video.
async function seleccionarVideo() {
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["videos"],
    quality: 1,
  });

  if (resultado.canceled) return;

  try {
    setSubiendoArchivo(true);
    const url = await subirArchivo(resultado.assets[0]);
    setVideoUrl(url);

    Alert.alert("Video cargado", "Ahora guardá los cambios.");
  } catch (e) {
    Alert.alert(
      "Error al subir el video",
      e instanceof Error ? e.message : "No se pudo subir.",
    );
  } finally {
    setSubiendoArchivo(false);
  }
}

async function guardarMultimedia() {
  try {
    setGuardando(true);

    const actualizado = await actualizarMiComercio({
      imagenes,
      videoUrl,
    });

    setComercio(actualizado);
    setImagenes(actualizado.imagenes ?? []);
    setVideoUrl(actualizado.videoUrl ?? null);

    Alert.alert("Cambios guardados", "La multimedia se actualizó correctamente.");
  } catch (e) {
    console.error("Error al guardar multimedia:", e);
    Alert.alert(
      "No se pudo guardar",
      e instanceof Error ? e.message : "Ocurrió un error inesperado.",
    );
  } finally {
    setGuardando(false);
  }
}



  if (cargando) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Cargando datos del comercio...</Text>
      </SafeAreaView>
    );
  }

  if (!comercio) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: "#B91C1C", marginBottom: 16 }}>
          {error || "No se pudieron cargar los datos del comercio."}
        </Text>

        <Pressable onPress={cargarComercio} style={estiloBoton}>
          <Text style={estiloTextoBoton}>Volver a intentar</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "#0B3A5D", marginBottom: 16 }}>
            ← Volver
          </Text>
        </Pressable>

        <Text style={estiloTitulo}>Editar mi comercio</Text>

        <Text style={{ color: "#64748B", marginBottom: 20 }}>
          Modificá la información que ven los usuarios en la ficha de tu
          comercio.
        </Text>

        {error !== "" && (
          <Text style={{ color: "#B91C1C", marginBottom: 14 }}>
            {error}
          </Text>
        )}

        <View style={estiloTarjeta}>
          <Text style={estiloEtiqueta}>Nombre del comercio *</Text>
          <TextInput
            style={estiloInput}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre del comercio"
          />

          <Text style={estiloEtiqueta}>Descripción *</Text>
          <TextInput
            style={[estiloInput, { minHeight: 110, textAlignVertical: "top" }]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Contá qué ofrece tu comercio"
            multiline
          />

          <Text style={estiloEtiqueta}>Dirección *</Text>
          <TextInput
            style={estiloInput}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Dirección del comercio"
          />

          <Text style={estiloEtiqueta}>Teléfono</Text>
          <TextInput
            style={estiloInput}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Número de teléfono"
            keyboardType="phone-pad"
          />

          <Text style={estiloEtiqueta}>WhatsApp</Text>
          <TextInput
            style={estiloInput}
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="Número de WhatsApp"
            keyboardType="phone-pad"
          />

          <Text style={estiloEtiqueta}>Instagram</Text>
          <TextInput
            style={estiloInput}
            value={instagram}
            onChangeText={setInstagram}
            placeholder="@usuario o enlace del perfil"
            autoCapitalize="none"
          />

          <Text style={estiloEtiqueta}>Medios de pago</Text>
          <TextInput
            style={estiloInput}
            value={mediosDePago}
            onChangeText={setMediosDePago}
            placeholder="Efectivo, Débito, Crédito, Transferencia"
            autoCapitalize="sentences"
          />
          <Text style={{ color: "#64748B", fontSize: 12, marginTop: 5 }}>
            Separá cada medio de pago con una coma.
          </Text>

          <Text style={{ color: "#64748B", fontSize: 12, marginTop: 12 }}>
            * Campos obligatorios.
          </Text>
        </View>


{/* NUEVO: sección para administrar los horarios de atención. */}
<View style={estiloTarjeta}>
  <Text style={estiloSeccion}>Horarios de atención</Text>

  <Text style={{ color: "#64748B", marginBottom: 12 }}>
    Cada tramo representa un horario de apertura y cierre.
    Podés agregar más de uno por día.
  </Text>

  {horarios.map((horario, indice) => (
    <View
      key={indice}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        paddingVertical: 14,
      }}
    >
      <Text style={estiloEtiqueta}>Día</Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {diasSemana.map((dia, numero) => {
            const seleccionado = horario.dias.includes(
            numero as Horario["dia"],
            );

            return (
            <Pressable
                key={numero}
                onPress={() =>
                alternarDia(indice, numero as Horario["dia"])
                }
                style={{
                paddingVertical: 9,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: seleccionado ? "#0B3A5D" : "#E2E8F0",
                }}
            >
                <Text
                style={{
                    color: seleccionado ? "white" : "#334155",
                    fontSize: 13,
                    fontWeight: seleccionado ? "bold" : "normal",
                }}
                >
                {dia.slice(0, 3)}
                </Text>
            </Pressable>
            );
        })}
        </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={estiloEtiqueta}>Abre</Text>
          <TextInput
            style={estiloInput}
            value={horario.abre}
            onChangeText={(valor) =>
              modificarHorario(indice, { abre: valor })
            }
            placeholder="08:00"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={estiloEtiqueta}>Cierra</Text>
          <TextInput
            style={estiloInput}
            value={horario.cierra}
            onChangeText={(valor) =>
              modificarHorario(indice, { cierra: valor })
            }
            placeholder="12:00"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
      </View>

      <Pressable
        onPress={() => eliminarHorario(indice)}
        style={{ marginTop: 12 }}
      >
        <Text style={{ color: "#DC2626", fontWeight: "600" }}>
          Eliminar este horario
        </Text>
      </Pressable>
    </View>
  ))}

        <Pressable
            onPress={agregarHorario}
            style={{
            padding: 12,
            alignItems: "center",
            marginTop: 10,
            borderWidth: 1,
            borderColor: "#0B3A5D",
            borderRadius: 8,
            }}
        >
            <Text style={{ color: "#0B3A5D", fontWeight: "bold" }}>
            + Agregar horario
            </Text>
        </Pressable>

        <Pressable
            onPress={guardarHorarios}
            disabled={guardando}
            style={[
            estiloBoton,
            { marginTop: 14, opacity: guardando ? 0.6 : 1 },
            ]}
        >
            {guardando ? (
            <ActivityIndicator color="white" />
            ) : (
            <Text style={estiloTextoBoton}>Guardar horarios</Text>
            )}
        </Pressable>
        </View>


{/* NUEVO: sección para administrar fotos y video. */}
<View style={estiloTarjeta}>
  <Text style={estiloSeccion}>Fotografías del comercio</Text>

  <Text style={{ color: "#64748B", marginBottom: 12 }}>
    Podés agregar hasta 8 fotografías.
  </Text>

  {imagenes.map((url, indice) => (
    <View
      key={`${url}-${indice}`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
      }}
    >
      <Image
        source={{ uri: url }}
        style={{
          width: 85,
          height: 85,
          borderRadius: 8,
          backgroundColor: "#E2E8F0",
        }}
      />

      <Pressable onPress={() => eliminarImagen(indice)}>
        <Text style={{ color: "#DC2626", fontWeight: "600" }}>
          Eliminar foto
        </Text>
      </Pressable>
    </View>
  ))}

        <Pressable
            onPress={seleccionarImagenes}
            disabled={subiendoArchivo || imagenes.length >= 8}
            style={[
            estiloBoton,
            { opacity: subiendoArchivo || imagenes.length >= 8 ? 0.5 : 1 },
            ]}
        >
            <Text style={estiloTextoBoton}>
            + Agregar fotografías ({imagenes.length}/8)
            </Text>
        </Pressable>

        <Text style={[estiloSeccion, { marginTop: 25 }]}>
            Video de presentación
        </Text>

        <Text style={{ color: "#64748B", marginBottom: 12 }}>
            Seleccioná un video de tu galería.
        </Text>

        <Text style={{ marginBottom: 12, color: videoUrl ? "#15803D" : "#64748B" }}>
            {videoUrl ? "✓ Hay un video cargado." : "Todavía no hay un video."}
        </Text>

        <Pressable
            onPress={seleccionarVideo}
            disabled={subiendoArchivo}
            style={[estiloBoton, { opacity: subiendoArchivo ? 0.5 : 1 }]}
        >
            <Text style={estiloTextoBoton}>
            {videoUrl ? "Reemplazar video" : "Seleccionar video"}
            </Text>
        </Pressable>

        {videoUrl && (
            <Pressable onPress={() => setVideoUrl(null)} style={{ marginTop: 12 }}>
            <Text style={{ color: "#DC2626", fontWeight: "600" }}>
                Eliminar video
            </Text>
            </Pressable>
        )}

        {subiendoArchivo && (
            <View style={{ marginTop: 15 }}>
            <ActivityIndicator />
            <Text style={{ textAlign: "center", marginTop: 6 }}>
                Subiendo archivo...
            </Text>
            </View>
        )}

        <Pressable
            onPress={guardarMultimedia}
            disabled={guardando || subiendoArchivo}
            style={[
            estiloBoton,
            { marginTop: 20, opacity: guardando || subiendoArchivo ? 0.5 : 1 },
            ]}
        >
            {guardando ? (
            <ActivityIndicator color="white" />
            ) : (
            <Text style={estiloTextoBoton}>Guardar fotos y video</Text>
            )}
        </Pressable>
        </View>



        <Pressable
          onPress={guardarCambios}
          disabled={guardando}
          style={[estiloBoton, { opacity: guardando ? 0.6 : 1 }]}
        >
          {guardando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={estiloTextoBoton}>Guardar cambios</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// NUEVO: estilos básicos de la pantalla.
const estiloTitulo = {
  fontSize: 25,
  fontWeight: "bold" as const,
  color: "#0B3A5D",
  marginBottom: 8,
};

const estiloTarjeta = {
  backgroundColor: "white",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
};

const estiloEtiqueta = {
  fontWeight: "600" as const,
  marginBottom: 6,
  marginTop: 14,
  color: "#334155",
};

const estiloInput = {
  borderWidth: 1,
  borderColor: "#CBD5E1",
  borderRadius: 8,
  padding: 11,
  backgroundColor: "white",
};

const estiloBoton = {
  backgroundColor: "#0B3A5D",
  padding: 14,
  borderRadius: 8,
  alignItems: "center" as const,
};

const estiloTextoBoton = {
  color: "white",
  fontWeight: "bold" as const,
};
const estiloSeccion = {
  fontSize: 19,
  fontWeight: "bold" as const,
  color: "#0B3A5D",
  marginBottom: 8,
};