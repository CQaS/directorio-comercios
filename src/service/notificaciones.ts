import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';


const CLAVE_NOTIFICACIONES = '@directorio_comercios_notificaciones';

export interface PreferenciasNotificaciones {
avisosActivos: boolean;
rubrosSeleccionados: string[];
}

const PREFERENCIAS_INICIALES: PreferenciasNotificaciones = {
avisosActivos: true,
rubrosSeleccionados: [],
};

export async function obtenerPreferencias(): Promise<PreferenciasNotificaciones> {
try {
    const datos = await AsyncStorage.getItem(CLAVE_NOTIFICACIONES);

    return datos
    ? { ...PREFERENCIAS_INICIALES, ...JSON.parse(datos) }
    : PREFERENCIAS_INICIALES;
} catch (error) {
    console.error('Error al obtener preferencias:', error);
    return PREFERENCIAS_INICIALES;
}
}

export async function guardarPreferencias(
preferencias: PreferenciasNotificaciones
): Promise<void> {
await AsyncStorage.setItem(
    CLAVE_NOTIFICACIONES,
    JSON.stringify(preferencias)
);

if (!preferencias.avisosActivos) {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
}

Notifications.setNotificationHandler({
    handleNotification: async() => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function solicitarPermisosNotificaciones():
    Promise<boolean> {
        const { status: estadoActual } = await Notifications.getPermissionsAsync();

        let estadoFinal = estadoActual;

        if (estadoActual !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();

            estadoFinal = status;
        }

        return estadoFinal === 'granted';
}

export async function enviarAviso(
    titulo: string,
    mensaje: string
) {
    const preferencias = await obtenerPreferencias();

    if (!preferencias.avisosActivos)
        return null;

    const tienePermiso = await solicitarPermisosNotificaciones();

    if (!tienePermiso)
        return null;

    return await Notifications.scheduleNotificationAsync({
        content: {
            title: titulo,
            body: mensaje,
            sound: true,
        },
        trigger:null,
    });
}


export async function programarRecordatorio(
    titulo: string,
    mensaje: string,
    fecha: Date
) {
    const preferencias = await obtenerPreferencias();

    if (!preferencias.avisosActivos || fecha <= new Date())
        return null;

    const tienePermiso = await solicitarPermisosNotificaciones();

    if (!tienePermiso)
        return null;

    return await Notifications.scheduleNotificationAsync({
        content: {
            title: titulo,
            body: mensaje,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fecha,
        },
    });
}

export async function cancelarRecordatorio(id:string):
    Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(id);
}