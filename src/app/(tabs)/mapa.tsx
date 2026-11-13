import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  ScrollView,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { mapaStyles as styles } from "../../styles/mapa.styles";
import { Comercio } from "../../tipos";
import { buscarComercios } from "../../service/comercios";
import { PantallaCarga } from "../../components/PantallaCarga";

export default function PantallaMapa() {
  const [ubicacionUsuario, setUbicacionUsuario] =
    useState<Location.LocationObjectCoords | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUbicacionUsuario(location.coords);
        }

        const listaComercios = await buscarComercios();
        setComercios(listaComercios);
      } catch (error) {
        console.error("Error al cargar los comercios en el mapa:", error);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const calcularDistancia = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c;
  };

  const abrirMapaExterno = (
    latitud: number,
    longitud: number,
    modo: "walking" | "driving",
  ) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}&travelmode=${modo}`;
    Linking.openURL(url);
  };

  if (cargando) {
    return <PantallaCarga />;
  }

  const latitude = -32.4827;
  const longitude = -58.237;

  const comerciosFiltradosOrdenados = (
    Array.isArray(comercios) ? comercios : []
  )
    .filter(
      (c) => c && (rubroSeleccionado ? c.rubroId === rubroSeleccionado : true),
    )
    .map((comercio) => {
      const distancia = comercio.coordenadas
        ? calcularDistancia(
            latitude,
            longitude,
            comercio.coordenadas.latitud,
            comercio.coordenadas.longitud,
          )
        : 0;
      return { ...comercio, distancia };
    })
    .sort((a, b) => a.distancia - b.distancia);

  const datosMapa = JSON.stringify({
    latitude,
    longitude,
    usuario: {
      latitude: -32.4827,
      longitude: -58.237,
    },

    comercios: comerciosFiltradosOrdenados
      .filter((c) => c.coordenadas)
      .map((c) => ({
        id: c.id,
        nombre: c.nombre,
        direccion: c.direccion,
        latitud: c.coordenadas!.latitud,
        longitud: c.coordenadas!.longitud,
      })),
  }).replace(/</g, "\\u003c");

  const htmlMapa = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const datos = ${datosMapa};

    const map = L.map('map').setView(
      [datos.latitude, datos.longitude], 15
    );

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    if (datos.usuario) {
      L.marker([
        datos.usuario.latitude,
        datos.usuario.longitude
      ]).addTo(map).bindPopup('Tu ubicación');
    }

    datos.comercios.forEach((comercio) => {
      L.marker([
        comercio.latitud,
        comercio.longitud
      ]).addTo(map).bindPopup(
        '<b>' + comercio.nombre + '</b><br>' + comercio.direccion
      );
    });
  </script>
</body>
</html>
`;

  return (
    <View style={styles.contenedor}>
      <View style={styles.barraFiltrosContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollFiltros}
        >
          <TouchableOpacity
            style={[
              styles.botonFiltro,
              rubroSeleccionado === null && styles.botonFiltroActivo,
            ]}
            onPress={() => setRubroSeleccionado(null)}
          >
            <Text
              style={[
                styles.textoFiltro,
                rubroSeleccionado === null && styles.textoFiltroActivo,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.botonFiltro,
              rubroSeleccionado === "rub-ferreteria" &&
                styles.botonFiltroActivo,
            ]}
            onPress={() => setRubroSeleccionado("rub-ferreteria")}
          >
            <Text
              style={[
                styles.textoFiltro,
                rubroSeleccionado === "rub-ferreteria" &&
                  styles.textoFiltroActivo,
              ]}
            >
              Ferretería
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.botonFiltro,
              rubroSeleccionado === "rub-gastronomia" &&
                styles.botonFiltroActivo,
            ]}
            onPress={() => setRubroSeleccionado("rub-gastronomia")}
          >
            <Text
              style={[
                styles.textoFiltro,
                rubroSeleccionado === "rub-gastronomia" &&
                  styles.textoFiltroActivo,
              ]}
            >
              Gastronomía
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.contenedorMapa}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: htmlMapa }}
          style={styles.mapa}
        />
      </View>

      <View style={styles.contenedorListado}>
        <Text style={styles.subtituloListado}>
          Comercios cercanos ordenados por distancia:
        </Text>
        <FlatList
          data={comerciosFiltradosOrdenados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardComercio}>
              <View style={styles.infoComercio}>
                <Text style={styles.nombreComercio}>{item.nombre}</Text>
                <Text style={styles.direccionComercio}>{item.direccion}</Text>
              </View>

              <View style={styles.badgeDistancia}>
                <Text style={styles.textoDistancia}>
                  {item.distancia < 1
                    ? `${Math.round(item.distancia * 1000)} m`
                    : `${item.distancia.toFixed(1)} km`}
                </Text>
              </View>

              <View style={styles.botonesNavegacion}>
                <TouchableOpacity
                  style={styles.botonNavegacion}
                  onPress={() =>
                    item.coordenadas &&
                    abrirMapaExterno(
                      item.coordenadas.latitud,
                      item.coordenadas.longitud,
                      "walking",
                    )
                  }
                >
                  <Text style={styles.textoBotonNavegacion}>Caminar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botonNavegacion}
                  onPress={() =>
                    item.coordenadas &&
                    abrirMapaExterno(
                      item.coordenadas.latitud,
                      item.coordenadas.longitud,
                      "driving",
                    )
                  }
                >
                  <Text style={styles.textoBotonNavegacion}>Auto</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}
