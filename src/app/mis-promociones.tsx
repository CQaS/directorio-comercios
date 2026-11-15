
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import type { Promocion } from "../tipos";

import {
  obtenerMisPromociones,
  crearPromocion,
  editarPromocion,
  eliminarPromocion,
  type DatosNuevaPromocion,
} from "../service/promociones";

export default function MisPromocionesScreen() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [promocionEditando, setPromocionEditando] =
    useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [descuento, setDescuento] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [soloApp, setSoloApp] = useState(false);

  async function cargarPromociones() {
    try {
      setError("");
      const resultado = await obtenerMisPromociones();
      setPromociones(resultado);
    } catch (e) {
      console.error("Error al cargar mis promociones:", e);
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar las promociones.",
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPromociones();
  }, []);

  function limpiarFormulario() {
    setPromocionEditando(null);
    setTitulo("");
    setDetalle("");
    setDescuento("");
    setDesde("");
    setHasta("");
    setImagenUrl("");
    setSoloApp(false);
  }

  function prepararEdicion(promocion: Promocion) {
    setPromocionEditando(promocion.id);
    setTitulo(promocion.titulo);
    setDetalle(promocion.detalle);
    setDescuento(
      promocion.descuento !== null
        ? String(promocion.descuento)
        : "",
    );
    setDesde(promocion.desde.slice(0, 10));
    setHasta(promocion.hasta.slice(0, 10));
    setImagenUrl(promocion.imagenUrl ?? "");
    setSoloApp(promocion.soloApp);
  }

  async function guardar() {
    if (!titulo.trim() || !detalle.trim() || !desde || !hasta) {
      Alert.alert(
        "Faltan datos",
        "Completá el título, el detalle y las dos fechas.",
      );
      return;
    }

    if (hasta <= desde) {
      Alert.alert(
        "Fechas incorrectas",
        "La fecha de finalización debe ser posterior a la de inicio.",
      );
      return;
    }

    let descuentoNumerico: number | null = null;

    if (descuento.trim() !== "") {
      descuentoNumerico = Number(descuento);

      if (
        !Number.isInteger(descuentoNumerico) ||
        descuentoNumerico < 1 ||
        descuentoNumerico > 100
      ) {
        Alert.alert(
          "Descuento incorrecto",
          "Ingresá un número entero entre 1 y 100, o dejalo vacío.",
        );
        return;
      }
    }

    const datos: DatosNuevaPromocion = {
      titulo: titulo.trim(),
      detalle: detalle.trim(),
      descuento: descuentoNumerico,
      desde: `${desde}T00:00:00-03:00`,
      hasta: `${hasta}T23:59:59-03:00`,
      imagenUrl: imagenUrl.trim() || null,
      soloApp,
    };

    try {
      setGuardando(true);
      setError("");

      if (promocionEditando) {
        await editarPromocion(promocionEditando, datos);
        Alert.alert("Listo", "La promoción se actualizó correctamente.");
      } else {
        await crearPromocion(datos);
        Alert.alert("Listo", "La promoción se creó correctamente.");
      }

      limpiarFormulario();
      await cargarPromociones();
    } catch (e) {
      console.error("Error al guardar la promoción:", e);
      Alert.alert(
        "No se pudo guardar",
        e instanceof Error ? e.message : "Ocurrió un error inesperado.",
      );
    } finally {
      setGuardando(false);
    }
  }

  function confirmarBaja(promocion: Promocion) {
    Alert.alert(
      "Dar de baja promoción",
      `¿Querés dar de baja "${promocion.titulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Dar de baja",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarPromocion(promocion.id);
              Alert.alert("Listo", "La promoción fue dada de baja.");
              await cargarPromociones();
            } catch (e) {
              Alert.alert(
                "Error",
                e instanceof Error
                  ? e.message
                  : "No se pudo dar de baja la promoción.",
              );
            }
          },
        },
      ],
    );
  }

  function obtenerEstado(promocion: Promocion) {
    if (!promocion.activa) return "Dada de baja";

    const hoy = new Date();
    const inicio = new Date(promocion.desde);
    const fin = new Date(promocion.hasta);

    if (fin < hoy) return "Vencida";
    if (inicio > hoy) return "Próxima";

    return "Vigente";
  }

  if (cargando) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Cargando promociones...</Text>
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

        <Text style={{ fontSize: 25, fontWeight: "bold", color: "#0B3A5D" }}>
          Mis promociones
        </Text>

        <Text style={{ color: "#64748B", marginTop: 6, marginBottom: 20 }}>
          Administrá las promociones de tu comercio.
        </Text>

        {error !== "" && (
          <Text style={{ color: "#B91C1C", marginBottom: 14 }}>
            {error}
          </Text>
        )}

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 22,
          }}
        >
          <Text style={{ fontSize: 19, fontWeight: "bold", marginBottom: 14 }}>
            {promocionEditando ? "Editar promoción" : "Crear promoción"}
          </Text>

          <Text style={estiloEtiqueta}>Título *</Text>
          <TextInput
            style={estiloInput}
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ej. 20% de descuento"
          />

          <Text style={estiloEtiqueta}>Detalle *</Text>
          <TextInput
            style={[estiloInput, { minHeight: 85, textAlignVertical: "top" }]}
            value={detalle}
            onChangeText={setDetalle}
            placeholder="Descripción de la promoción"
            multiline
          />


          <Text style={estiloEtiqueta}>Descuento (%)</Text>
          <TextInput
            style={estiloInput}
            value={descuento}
            onChangeText={setDescuento}
            placeholder="Dejar vacío si no corresponde"
            keyboardType="numeric"
          />

          <Text style={estiloEtiqueta}>Fecha de inicio * (AAAA-MM-DD)</Text>
          <TextInput
            style={estiloInput}
            value={desde}
            onChangeText={setDesde}
            placeholder="2026-11-20"
          />

          <Text style={estiloEtiqueta}>Fecha de finalización * (AAAA-MM-DD)</Text>
          <TextInput
            style={estiloInput}
            value={hasta}
            onChangeText={setHasta}
            placeholder="2026-11-30"
          />

          <Text style={estiloEtiqueta}>URL de imagen</Text>
          <TextInput
            style={estiloInput}
            value={imagenUrl}
            onChangeText={setImagenUrl}
            placeholder="https://..."
            autoCapitalize="none"
          />

          <Pressable
            onPress={() => setSoloApp(!soloApp)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 14,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderWidth: 1,
                borderColor: "#0B3A5D",
                borderRadius: 5,
                backgroundColor: soloApp ? "#0B3A5D" : "white",
                marginRight: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {soloApp && <Text style={{ color: "white" }}>✓</Text>}
            </View>
            <Text>Requiere código de la aplicación</Text>
          </Pressable>

          <Pressable
            onPress={guardar}
            disabled={guardando}
            style={{
              backgroundColor: "#0B3A5D",
              padding: 14,
              borderRadius: 8,
              alignItems: "center",
              opacity: guardando ? 0.6 : 1,
            }}
          >
            {guardando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {promocionEditando ? "Guardar cambios" : "Crear promoción"}
              </Text>
            )}
          </Pressable>

          {promocionEditando && (
            <Pressable
              onPress={limpiarFormulario}
              style={{ padding: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#64748B" }}>Cancelar edición</Text>
            </Pressable>
          )}
        </View>

        <Text style={{ fontSize: 19, fontWeight: "bold", marginBottom: 12 }}>
          Promociones de mi comercio
        </Text>

        {promociones.length === 0 ? (
          <Text style={{ color: "#64748B" }}>
            Todavía no hay promociones para mostrar.
          </Text>
        ) : (
          promociones.map((promocion) => (
            <View
              key={promocion.id}
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 15,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "bold" }}>
                {promocion.titulo}
              </Text>

              <Text style={{ color: "#64748B", marginTop: 5 }}>
                {promocion.detalle}
              </Text>

              <Text style={{ marginTop: 8, color: "#0B3A5D" }}>
                Estado: {obtenerEstado(promocion)}
              </Text>

              {promocion.descuento !== null && (
                <Text style={{ marginTop: 4 }}>
                  Descuento: {promocion.descuento}%
                </Text>
              )}

              <Text style={{ color: "#64748B", marginTop: 4 }}>
                Desde: {promocion.desde.slice(0, 10)} · Hasta:{" "}
                {promocion.hasta.slice(0, 10)}
              </Text>

              {promocion.activa && (
                <View style={{ flexDirection: "row", marginTop: 14 }}>
                  <Pressable
                    onPress={() => prepararEdicion(promocion)}
                    style={{
                      backgroundColor: "#0B3A5D",
                      padding: 10,
                      borderRadius: 7,
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: "white" }}>Editar</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => confirmarBaja(promocion)}
                    style={{
                      backgroundColor: "#FEE2E2",
                      padding: 10,
                      borderRadius: 7,
                    }}
                  >
                    <Text style={{ color: "#B91C1C" }}>Dar de baja</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estiloEtiqueta = {
  fontWeight: "600" as const,
  marginBottom: 6,
  marginTop: 12,
  color: "#334155",
};

const estiloInput = {
  borderWidth: 1,
  borderColor: "#CBD5E1",
  borderRadius: 8,
  padding: 11,
  backgroundColor: "white",
};
