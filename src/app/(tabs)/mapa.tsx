import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, ScrollView, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Comercio } from '../../tipos';
import { MOCK_COMERCIOS } from '../../mocks/comercios';

export default function PantallaMapa() {
  const [ubicacionUsuario, setUbicacionUsuario] = useState<Location.LocationObjectCoords | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUbicacionUsuario(location.coords);
      }

      
      setComercios(MOCK_COMERCIOS);
      setCargando(false);
    })();
  }, []);

  
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c; 
  };

  
  const abrirMapaExterno = (latitud: number, longitud: number, nombreComercio: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}&query_place_id=${encodeURIComponent(nombreComercio)}`;
    Linking.openURL(url);
  };

  if (cargando) {
    return (
      <View style={styles.contenedorCargando}>
        <ActivityIndicator size="large" color="#7A5C3E" />
        <Text style={styles.titulo}>Cargando mapa y comercios...</Text>
      </View>
    );
  }

  
  const latitude = ubicacionUsuario?.latitude || -32.4835;
  const longitude = ubicacionUsuario?.longitude || -58.2312;

  
  const comerciosFiltradosOrdenados = [...comercios]
    .filter((c) => (rubroSeleccionado ? c.rubroId === rubroSeleccionado : true))
    .map((comercio) => {
      const distancia = ubicacionUsuario 
        ? calcularDistancia(ubicacionUsuario.latitude, ubicacionUsuario.longitude, comercio.coordenadas.latitud, comercio.coordenadas.longitud)
        : 0;
      return { ...comercio, distancia };
    })
    .sort((a, b) => a.distancia - b.distancia);

  return (
    <View style={styles.contenedor}>
    
      <View style={styles.barraFiltrosContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollFiltros}>
          <TouchableOpacity 
            style={[styles.botonFiltro, rubroSeleccionado === null && styles.botonFiltroActivo]}
            onPress={() => setRubroSeleccionado(null)}
          >
            <Text style={[styles.textoFiltro, rubroSeleccionado === null && styles.textoFiltroActivo]}>Todos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.botonFiltro, rubroSeleccionado === 'rub-ferreteria' && styles.botonFiltroActivo]}
            onPress={() => setRubroSeleccionado('rub-ferreteria')}
          >
            <Text style={[styles.textoFiltro, rubroSeleccionado === 'rub-ferreteria' && styles.textoFiltroActivo]}>Ferretería</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.botonFiltro, rubroSeleccionado === 'rub-gastronomia' && styles.botonFiltroActivo]}
            onPress={() => setRubroSeleccionado('rub-gastronomia')}
          >
            <Text style={[styles.textoFiltro, rubroSeleccionado === 'rub-gastronomia' && styles.textoFiltroActivo]}>Gastronomía</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      
      <View style={styles.contenedorMapa}>
        <MapView
          style={styles.mapa}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {ubicacionUsuario && (
            <Marker
              coordinate={{
                latitude: ubicacionUsuario.latitude,
                longitude: ubicacionUsuario.longitude,
              }}
              title="Tu ubicación"
              pinColor="blue"
            />
          )}

          {comerciosFiltradosOrdenados.map((comercio) => {
            if (!comercio.coordenadas) return null;
            return (
              <Marker
                key={comercio.id}
                coordinate={{
                  latitude: comercio.coordenadas.latitud,
                  longitude: comercio.coordenadas.longitud,
                }}
                title={comercio.nombre}
                description={comercio.direccion}
              >
                <Callout onPress={() => abrirMapaExterno(comercio.coordenadas.latitud, comercio.coordenadas.longitud, comercio.nombre)}>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitulo}>{comercio.nombre}</Text>
                    <Text style={styles.calloutTexto}>{comercio.direccion}</Text>
                    <Text style={styles.calloutBoton}>Cómo llegar (Abrir Mapa)</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </View>

      
      <View style={styles.contenedorListado}>
        <Text style={styles.subtituloListado}>Comercios cercanos ordenados por distancia:</Text>
        <FlatList
          data={comerciosFiltradosOrdenados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.cardComercio} 
              onPress={() => abrirMapaExterno(item.coordenadas.latitud, item.coordenadas.longitud, item.nombre)}
            >
              <View>
                <Text style={styles.nombreComercio}>{item.nombre}</Text>
                <Text style={styles.direccionComercio}>{item.direccion}</Text>
              </View>
              <View style={styles.badgeDistancia}>
                <Text style={styles.textoDistancia}>
                  {item.distancia < 1 ? `${Math.round(item.distancia * 1000)} m` : `${item.distancia.toFixed(1)} km`}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  contenedorCargando: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  titulo: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginTop: 10, 
    color: '#7A5C3E' 
  },
  contenedorMapa: {
    height: '50%',
    width: '100%',
  },
  mapa: {
    width: '100%',
    height: '100%',
  },
  contenedorListado: {
    height: '50%',
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
  },
  subtituloListado: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardComercio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  nombreComercio: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  direccionComercio: {
    fontSize: 13,
    color: '#666',
  },
  badgeDistancia: {
    backgroundColor: '#7A5C3E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  textoDistancia: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  barraFiltrosContainer: {
    position: 'absolute',
    top: 10,
    zIndex: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  scrollFiltros: {
    paddingVertical: 5,
  },
  botonFiltro: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  botonFiltroActivo: {
    backgroundColor: '#7A5C3E',
  },
  textoFiltro: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  textoFiltroActivo: {
    color: '#fff',
  },
  calloutContainer: {
    padding: 8,
    width: 200,
  },
  calloutTitulo: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  calloutTexto: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  calloutBoton: {
    color: '#0066CC',
    fontWeight: 'bold',
    fontSize: 13,
  },
});