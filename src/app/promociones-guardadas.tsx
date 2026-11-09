import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { 
    obtenerPromocionesGuardadas,
    quitarPromocion,
} from '../service/avisos';
import { Promocion } from "../tipos";

export default function PromocionesGuardadasScreen() {
    const [promociones, setPromociones] = useState<Promocion[]>([]);
    const [cargando, setCargando] = useState(true);
    const cargarPromociones = async() => {
        try {
            const guardadas = await obtenerPromocionesGuardadas();
            setPromociones(guardadas);
        } catch (error) {
            console.error('Error al cargar promociones guardadas:', error);
        } finally {
            setCargando(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarPromociones();
        }, [])
    );

    const eliminarPromocion = (id:string) => {
        Alert.alert(
            'Quitar promoción',
            '¿Querés quitar esta promoción de tus guardadas?',
            [
                { text: 'Cancelar',
                    style: 'cancel'},
                    { text: 'Quitar',
                        style: 'destructive',
                        onPress: async() => {
                            await quitarPromocion(id);
                            await cargarPromociones();
                        },
                    },
            ]
        );
    };

    return(
        <SafeAreaView
        style={styles.container}
        edges={['bottom']}>
            <View
            style={styles.encabezado}>
                <Pressable
                onPress={() => router.back()}>
                    <Ionicons
                    name="arrow-back"
                    size={24}
                    color="#0B3A5D"/>
                </Pressable>

                <Text
                style={styles.titulo}>Promociones guardadas</Text>
            </View>

            <ScrollView
            contentContainerStyle={styles.contenido}>
                {cargando ? (
                    <Text style={styles.mensaje}>Cargando</Text>
                ) : promociones.length === 0 ? (
                    <View
                    style={styles.vacio}>
                        <Ionicons
                        name="bookmark-outline"
                        size={48}
                        color="#8E8E93" />
                        <Text
                        style={styles.mensaje}>Todavía no guardaste ninguna promoción.</Text>
                    </View>
                ) : (
                    promociones.map((promo) => (
                        <View
                        key={promo.id} style={styles.tarjeta}>
                        <Text
                        style={styles.rubro}>{promo.rubro}</Text>
                        <Text
                        style={styles.tituloPromo}>{promo.titulo}</Text>
                        <Text
                        style={styles.detalle}>{promo.detalle}</Text>

                        {promo.descuento !== null && (
                            <Text
                        style={styles.descuento}>{promo.descuento}% de descuento</Text>
                    )}
                    <Text
                    style={styles.fecha}>Válida hasta: {promo.hasta}</Text>
                    <View
                    style={styles.botones}>
                        <Pressable
                        style={styles.botonVer}
                        onPress={() => router.push({
                            pathname: '/detalle-promocion',
                            params: { id: promo.id },
                        })
                    }
                    >
                        <Text style={styles.textoBotonVer}>Ver promoción</Text>
                    </Pressable>

                    <Pressable
                    style={styles.botonEliminar}
                    onPress={() => eliminarPromocion(promo.id)}>
                        <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#C0392B" />
                    </Pressable>
                    </View>
                    </View>
                ))
            )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    encabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 15,
        backgroundColor: '#FFFFFF',
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0B3A5D',
    },
    contenido: {
        padding: 16,
    },
    tarjeta: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        elevation: 2,
    },
    rubro: {
        color: '#4285A8',
        fontSize: 13,
        marginBottom: 6,
    },
    tituloPromo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0B3A5D',
        marginBottom: 8,
    },
    detalle: {
        fontSize: 14,
        color: '#555555',
        marginBottom: 10,
    },
    descuento: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#16834A',
        marginBottom: 8,
    },
    fecha: {
        fontSize: 13,
        color: '#777777',
    },
    botones: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
    },
    botonVer: {
        backgroundColor: '#0B3A5D',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    textoBotonVer: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    botonEliminar: {
        padding: 10,
    },
    vacio: {
        alignItems: 'center',
        marginTop: 70,
        gap: 14,
    },
    mensaje: {
        textAlign: 'center',
        color: '#777777',
        fontSize: 15,
        marginTop: 15,
    },
});