
import React, { useEffect, useState } from 'react';
import {
View,
Text,
StyleSheet,
Switch,
ScrollView,
ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
obtenerPreferencias,
guardarPreferencias,
} from '../service/notificaciones';

const RUBROS = [
'Gastronomía',
'Ferretería',
'Indumentaria',
'Servicios',
];

export default function RubrosInteres() {
const [rubrosSeleccionados, setRubrosSeleccionados] = useState<string[]>([]);
const [cargando, setCargando] = useState(true);

useEffect(() => {
    const cargarRubros = async () => {
    const preferencias = await obtenerPreferencias();
    setRubrosSeleccionados(preferencias.rubrosSeleccionados);
    setCargando(false);
    };

    cargarRubros();
}, []);

async function cambiarRubro(rubro: string, seleccionado: boolean) {
    const actualizados = seleccionado
    ? [...rubrosSeleccionados, rubro]
    : rubrosSeleccionados.filter((item) => item !== rubro);

    setRubrosSeleccionados(actualizados);

    const preferencias = await obtenerPreferencias();

    await guardarPreferencias({
    ...preferencias,
    rubrosSeleccionados: actualizados,
    });
}

if (cargando) {
    return <ActivityIndicator size="large" />;
}

return (
    <SafeAreaView style={styles.contenedor}>
    <ScrollView>
        <Text style={styles.titulo}>Rubros de interés</Text>
        <Text style={styles.descripcion}>
        Elegí los rubros sobre los que querés recibir promociones.
        </Text>

        {RUBROS.map((rubro) => (
        <View key={rubro} style={styles.fila}>
            <Text style={styles.texto}>{rubro}</Text>
            <Switch
            value={rubrosSeleccionados.includes(rubro)}
            onValueChange={(valor) => cambiarRubro(rubro, valor)}
            />
        </View>
        ))}
    </ScrollView>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
contenedor: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
},
titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B3A5D',
    marginBottom: 10,
},
descripcion: {
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
},
fila: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
texto: {
    fontSize: 16,
    color: '#222',
},
});
