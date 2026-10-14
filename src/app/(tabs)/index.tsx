import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';


const COMERCIOS_PRUEBA = [
  { id: '1', nombre: 'Panadería La Espiga', direccion: 'San Martín 450', rubroId: 'Gastronomía', abierto: true },
  { id: '2', nombre: 'Ferretería Central', direccion: '9 de Julio 120', rubroId: 'Ferretería', abierto: false },
  { id: '3', nombre: 'Boutique Urbana', direccion: 'Galarza 830', rubroId: 'Indumentaria', abierto: true },
  { id: '4', nombre: 'Taller Mecánico Suárez', direccion: 'Bv. Los Constituyentes 210', rubroId: 'Servicios', abierto: true },
];

const RUBROS = ['Todos', 'Gastronomía', 'Indumentaria', 'Ferretería', 'Servicios'];

export default function DirectorioScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [busqueda, setBusqueda] = useState('');
  const [rubroSeleccionado, setRubroSeleccionado] = useState('Todos');

  const esPantallaAncha = width >= 768;
  const columnas = esPantallaAncha ? 2 : 1;

  const comerciosFiltrados = useMemo(() => {
    return COMERCIOS_PRUEBA.filter((comercio) => {
      const coincideTexto = comercio.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const coincideRubro =
        rubroSeleccionado === 'Todos' || comercio.rubroId === rubroSeleccionado;
      return coincideTexto && coincideRubro;
    });
  }, [busqueda, rubroSeleccionado]);

  return (
    <SafeAreaView style={styles.contenedorPrincipal}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Directorio Comercial</Text>
        <Text style={styles.subtitulo}>Concepción del Uruguay</Text>

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
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listaChips}
          renderItem={({ item }) => {
            const activo = rubroSeleccionado === item;
            return (
              <Pressable
                role="button"
                onPress={() => setRubroSeleccionado(item)}
                style={[styles.chip, activo && styles.chipActivo]}
              >
                <Text style={[styles.textoChip, activo && styles.textoChipActivo]}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

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
                  item.abierto ? styles.badgeAbierto : styles.badgeCerrado,
                ]}
              >
                <Text
                  style={[
                    styles.textoBadge,
                    item.abierto ? styles.textoAbierto : styles.textoCerrado,
                  ]}
                >
                  {item.abierto ? 'Abierto' : 'Cerrado'}
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

const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  encabezado: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B3A5D',
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 10,
  },
  inputBuscador: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#0F172A',
  },
  contenedorChips: {
    marginVertical: 6,
  },
  listaChips: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  chipActivo: {
    backgroundColor: '#0B3A5D',
    borderColor: '#0B3A5D',
  },
  textoChip: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  textoChipActivo: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listaComercios: {
    padding: 16,
    gap: 12,
  },
  tarjeta: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  tarjetaAncha: {
    marginHorizontal: 6,
  },
  tarjetaPresionada: {
    opacity: 0.85,
  },
  tarjetaCabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nombreComercio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
  },
  direccion: {
    fontSize: 13,
    color: '#64748B',
  },
  rubro: {
    fontSize: 12,
    color: '#0B3A5D',
    fontWeight: '600',
    marginTop: 6,
  },
  badgeEstado: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAbierto: {
    backgroundColor: '#DCFCE7',
  },
  badgeCerrado: {
    backgroundColor: '#FEE2E2',
  },
  textoBadge: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  textoAbierto: {
    color: '#166534',
  },
  textoCerrado: {
    color: '#991B1B',
  },
});