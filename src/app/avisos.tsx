
import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import {
    obtenerAvisos,
    obtenerPromocionesGuardadas,
} from '../service/avisos';

import { Promocion } from '../tipos';

export default function AvisosScreen() {
    const [nuevas, setNuevas] = useState<Promocion[]>([]);
    const [porVencer, setPorVencer] = useState<Promocion[]>([]);
    const [cargando, setCargando] = useState(true);

    const cargarAvisos = async () => {
        try {
            const avisos = await obtenerAvisos();
            const guardadas = await obtenerPromocionesGuardadas();

            setNuevas(avisos);

            const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

            const limite = new Date(hoy);
                limite.setDate(limite.getDate() + 2);
                limite.setHours(23, 59, 59, 999);

            const proximas = guardadas.filter((promo) => {
            const vencimiento = new Date(promo.hasta);

            return vencimiento >= hoy && vencimiento <= limite;
        });

            setPorVencer(proximas);
        } catch (error) {
            console.error('Error al cargar avisos:', error);
        } finally {
            setCargando(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarAvisos();
        }, [])
    );

    const abrirPromocion = (id: string) => {
        router.push({
            pathname: '/comercio/detalle-promocion',
            params: { id },
        });
    };

    const renderPromocion = ({ item }: { item: Promocion }) => (
        <Pressable
            style={styles.tarjeta}
            onPress={() => abrirPromocion(item.id)}
        >
            <Text style={styles.rubro}>{item.rubro}</Text>
            <Text style={styles.nombre}>{item.titulo}</Text>
            <Text style={styles.detalle}>{item.detalle}</Text>

            {item.descuento !== null && (
                <Text style={styles.descuento}>
                    {item.descuento}% de descuento
                </Text>
            )}

            <Text style={styles.fecha}>
                Válida hasta: {item.hasta}
            </Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.contenedor}>
            <View style={styles.encabezado}>
                <Pressable onPress={() => router.back()}>
                    <Text style={styles.volver}>Volver</Text>
                </Pressable>

                <Text style={styles.titulo}>Mis avisos</Text>
            </View>

            {cargando ? (
                <Text style={styles.vacio}>Cargando avisos...</Text>
            ) : (
                <FlatList
                    data={[]}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPromocion}
                    ListHeaderComponent={
                        <View>
                            <Text style={styles.seccion}>
                                Nuevas promociones
                            </Text>

                            {nuevas.length === 0 ? (
                                <Text style={styles.vacio}>
                                    No hay nuevas promociones para mostrar.
                                </Text>
                            ) : (
                                nuevas.map((promo) => (
                                    <View key={promo.id}>
                                        {renderPromocion({ item: promo })}
                                    </View>
                                ))
                            )}

                            <Text style={styles.seccion}>
                                Promociones próximas a vencer
                            </Text>

                            {porVencer.length === 0 ? (
                                <Text style={styles.vacio}>
                                    No tenés promociones guardadas próximas a vencer.
                                </Text>
                            ) : (
                                porVencer.map((promo) => (
                                    <View key={promo.id}>
                                        {renderPromocion({ item: promo })}
                                    </View>
                                ))
                            )}
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#F4F6F8',
        padding: 16,
    },
    encabezado: {
        marginBottom: 20,
    },
    volver: {
        color: '#0B3A5D',
        fontSize: 16,
        marginBottom: 16,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0B3A5D',
    },
    seccion: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0B3A5D',
        marginTop: 18,
        marginBottom: 12,
    },
    tarjeta: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
    },
    rubro: {
        color: '#4285A8',
        fontSize: 13,
        marginBottom: 6,
    },
    nombre: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    detalle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 6,
    },
    descuento: {
        color: '#16834A',
        fontWeight: 'bold',
        marginTop: 8,
    },
    fecha: {
        color: '#64748B',
        fontSize: 13,
        marginTop: 8,
    },
    vacio: {
        color: '#64748B',
        fontSize: 14,
        marginVertical: 10,
    },
});
