import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { obtenerPromocionesPorId } from '../service/promociones';
import { Promocion } from '../tipos';
import QRCode  from 'react-native-qrcode-svg'
import { contarCanjesPorPromocion } from '../service/canjes';

export default function
DetallePromocion() {
    const { id } = useLocalSearchParams <{ id: string} >();
    const [codigoCliente] = useState( () => `CLI-$(Date.now()}-$ {Math.floor(Math.random() * 10000)}`);
    const [promocion, setPromocion] = useState <Promocion | null>(null);
    const [cargando, setCargando] = useState(true);
    const [totalCanjes, setTotalCanjes] = useState(0);

    useEffect(() => {
        async function cargarPromocion() {
            try {
                const resultado = await
                obtenerPromocionesPorId(id);
                setPromocion(resultado ?? null);
                if (resultado) {
                    const total = await contarCanjesPorPromocion(resultado.id);
                    setTotalCanjes(total);
                } else {
                    setTotalCanjes(0);
                }
            } catch(error) {
                console.error('Error al cargar la promoción:', error);
            } finally {
                setCargando(false);
            }
        }

        cargarPromocion();
    }, [id]);

    if (cargando) {
        return <ActivityIndicator size={"large"} style= {styles.cargando} />;
    }

    if (!promocion) {
        return (
            <View style = {styles.contenedor} >
                <Text>No se encontró la promoción.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.contenedor}>
            <Stack.Screen options={{title: "Detalle de promoción", headerShown: true}}/>

            <Text style ={styles.titulo}>{promocion.titulo}</Text>
            <Text style={styles.descuento}>Descuento: {promocion.descuento}%</Text>

            <Text style={styles.subtitulo}>Descripción</Text>
            <Text style={styles.texto}>{promocion.detalle}</Text>
            <Text style={styles.subtitulo}>Condiciones</Text>
            <Text style={styles.texto}>{promocion.condiciones}</Text>

            <Text style={styles.subtitulo}>Vigencia</Text>
            <Text style={styles.texto}>Desde: {promocion.desde}</Text>
            <Text style={styles.texto}>Hasta: {promocion.hasta}</Text>
            <Text style={styles.texto}>Estado: {promocion.activa ? 'Activa' : 'Inactiva'}</Text>
            <Text style={styles.texto}>Canjes registrados: {totalCanjes}</Text>
            {!promocion.soloApp && (
                <Text style={styles.etiqueta}>Disponible para todos</Text>
            )}

            {promocion.soloApp && (
                <Text style= {styles.etiqueta}>Promoción exclusiva de la app</Text>
            )}

            {promocion.soloApp && (
                    <View style={styles.contenedorQR}>
                    <Text style={styles.subtitulo}>Código QR de la promoción</Text>

                    <QRCode
                    value={JSON.stringify({
                        promocionId: promocion.id,
                        comercioId: promocion.comercioId,
                        codigo: codigoCliente,
                    })}
                    size={200}
                    />

                    <Text style={styles.texto}>Mostrá este código en el comercio.</Text>
                    </View>
                )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        padding: 20,
        gap: 12,
    },

    cargando: {
        flex: 1,
    },

    titulo: {
        fontSize: 25,
        fontWeight: 'bold',
    },

    descuento: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    subtitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },

    texto: {
        fontSize: 15,
    },

    etiqueta: {
        marginTop: 12,
        fontWeight: 'bold',
    },

    contenedorQR: {
        alignItems: "center",
        gap: 12,
        marginTop: 20,
        padding: 16,
    },
});