import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { tabsIndexStyles as styles } from "../../styles/tabs-Index.styles";
import { buscarComerciosConEstado } from "../../service/comercios";
import { Comercio } from "../../tipos";

const RUBROS = [
  { id: "Todos", nombre: "Todos" },
  { id: "rub-gastronomia", nombre: "Gastronomía" },
  { id: "rub-indumentaria", nombre: "Indumentaria" },
  { id: "rub-hogar", nombre: "Hogar" },
  { id: "rub-ferreteria", nombre: "Ferretería y construcción" },
  { id: "rub-salud", nombre: "Salud y farmacia" },
  { id: "rub-servicios", nombre: "Servicios" },
  { id: "rub-tecnologia", nombre: "Tecnología" },
  { id: "rub-libreria", nombre: "Librería" },
  { id: "rub-otros", nombre: "Otros" },
];

function estaAbierto(horarios: any[]) {
  if (!horarios || horarios.length === 0) {
    return false;
  }

  const ahora = new Date();
  const diaActual = ahora.getDay();
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

  return horarios.some((horario) => {
    if (horario.dia !== diaActual) {
      return false;
    }

    const [horaAbre, minutoAbre] = horario.abre.split(":").map(Number);
    const [horaCierra, minutoCierra] = horario.cierra.split(":").map(Number);

    const apertura = horaAbre * 60 + minutoAbre;
    const cierre = horaCierra * 60 + minutoCierra;

    return horaActual >= apertura && horaActual < cierre;
  });
}
export default function DirectorioScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [busqueda, setBusqueda] = useState("");
  const [rubroSeleccionado, setRubroSeleccionado] = useState("Todos");

  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [desdeCache, setDesdeCache] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  async function cargarComercios() {
    setErrorCarga(null);
    try {
      const resultado = await buscarComerciosConEstado();
      setComercios(resultado.comercios);
      setDesdeCache(resultado.desdeCache);
    } catch (error) {
      console.error("Error al cargar comercios:", error);
      setErrorCarga(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los comercios.",
      );
    }
  }

  useEffect(() => {
    cargarComercios();
  }, []);

  const esPantallaAncha = width >= 768;
  const columnas = esPantallaAncha ? 2 : 1;

  const comerciosFiltrados = useMemo(() => {
    return comercios.filter((comercio) => {
      const coincideTexto = comercio.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const coincideRubro =
        rubroSeleccionado === "Todos" || comercio.rubroId === rubroSeleccionado;
      return coincideTexto && coincideRubro;
    });
  }, [comercios, busqueda, rubroSeleccionado]);

  return (
    <SafeAreaView style={styles.contenedorPrincipal}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Directorio Comercial</Text>
        <Text style={styles.subtitulo}>Concepción del Uruguay</Text>

        {desdeCache && (
          <Text style={styles.avisoOffline}>
            Sin conexión: mostrando comercios guardados en este dispositivo.
          </Text>
        )}

        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar comercio..."
          placeholderTextColor="#94A3B8"
          style={styles.inputBuscador}
        />
      </View>

      {/* Chips horizontales condicionales */}
      <View style={styles.contenedorChips}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={RUBROS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listaChips}
          renderItem={({ item }) => {
            const activo = rubroSeleccionado === item.id;
            return (
              <Pressable
                role="button"
                onPress={() => setRubroSeleccionado(item.id)}
                style={[styles.chip, activo && styles.chipActivo]}
              >
                <Text
                  style={[styles.textoChip, activo && styles.textoChipActivo]}
                >
                  {item.nombre}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {errorCarga && (
        <View style={styles.estadoSinDatos}>
          <Text style={styles.textoSinDatos}>{errorCarga}</Text>
          <Pressable onPress={cargarComercios} accessibilityRole="button">
            <Text style={styles.reintentar}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {/* Listado con navegación a la ficha */}
      <FlatList
        key={columnas}
        numColumns={columnas}
        data={comerciosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaComercios}
        renderItem={({ item }) => (
          <Pressable
            role="button"
            style={({ pressed }) => [
              styles.tarjeta,
              esPantallaAncha && styles.tarjetaAncha,
              pressed && styles.tarjetaPresionada,
            ]}
            onPress={() => router.push(`/comercio/${item.id}`)}
          >
            <View style={styles.tarjetaCabecera}>
              <Text style={styles.nombreComercio}>{item.nombre}</Text>
              <View
                style={[
                  styles.badgeEstado,
                  estaAbierto(item.horarios)
                    ? styles.badgeAbierto
                    : styles.badgeCerrado,
                ]}
              >
                <Text
                  style={[
                    styles.textoBadge,
                    estaAbierto(item.horarios)
                      ? styles.textoAbierto
                      : styles.textoCerrado,
                  ]}
                >
                  {estaAbierto(item.horarios) ? "Abierto" : "Cerrado"}
                </Text>
              </View>
            </View>

            <Text style={styles.direccion}>{item.direccion}</Text>
            <Text style={styles.rubro}>{item.rubroId}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
