import * as Notifications from 'expo-notifications';
import { obtenerBaseDatos } from "./baseDatos";

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
    const db = await obtenerBaseDatos();
    const fila = await db.getFirstAsync<{
        avisos_activos: number;
        rubros_seleccionados: string;
    }>(
        `SELECT avisos_activos, rubros_seleccionados
          FROM preferencias_notificaciones WHERE id = 1`,
    );

    return fila
        ? {
            avisosActivos: fila.avisos_activos === 1,
            rubrosSeleccionados: JSON.parse(fila.rubros_seleccionados),
        }
        : PREFERENCIAS_INICIALES;
} catch (error) {
    console.error('Error al obtener preferencias:', error);
    return PREFERENCIAS_INICIALES;
}
}

export async function guardarPreferencias(
preferencias: PreferenciasNotificaciones
): Promise<void> {
const db = await obtenerBaseDatos();
await db.runAsync(
    `INSERT INTO preferencias_notificaciones
      (id, avisos_activos, rubros_seleccionados) VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        avisos_activos = excluded.avisos_activos,
        rubros_seleccionados = excluded.rubros_seleccionados`,
    preferencias.avisosActivos ? 1 : 0,
    JSON.stringify(preferencias.rubrosSeleccionados),
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