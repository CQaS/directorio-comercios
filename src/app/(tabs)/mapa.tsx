import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React, { Activity, useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Comercio } from '../../tipos';

export default function PantallaMapa() {
  const [ubicacionUsuario, setUbicacionUsuario] = React.useState<Location.LocationObjectCoords | null>(null);
  const [cargando, setCargando] = React.useState(true);
  const [comercios, setComercios] = React.useState<Comercio[]>([]);

  React.useEffect(() => {
    (async () => {
      let {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCargando(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUbicacionUsuario(location.coords);
      setCargando(false);
    })();
  }, []);

  if(cargando) {
  return (
    <View style={styles.contenedor}>
      <ActivityIndicator size="large" color="#7A5C3E"/>
      <Text style={styles.titulo}>Mapa Interactivo</Text>
    </View>
  );
}

return (
  <View style={styles.contenedor}>
    <MapView
    style={styles.mapa}
    showsUserLocation={true}
    initialRegion={{
      latitude:ubicacionUsuario?.latitude || -32.4835,
      longitude:ubicacionUsuario?.longitude || -58.2312,
      latitudeDelta:0.015,
      longitudeDelta:0.015,
    }}
    >
      {comercios.map ((comercio) => (
        <Marker
        key={comercio.id}
        coordinate={{
          latitude:comercio.coordenadas.latitud,
          longitude:comercio.coordenadas.longitud,
        }}
        title={comercio.nombre}
        description={comercio.direccion}
        onPress={()=> {
          console.log("comercio seleccionado:", comercio.nombre);
        }}
        />
      ))}
    </MapView>
  </View>
);
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  mapa: {
    width:'100%',
    height:'100%',
  },
});