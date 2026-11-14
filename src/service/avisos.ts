import { obtenerFavoritos } from "./favoritos";
import { peticionApi } from "./configuracionApi";
import { obtenerBaseDatos } from "./baseDatos";
import {
  obtenerPreferencias,
  programarRecordatorio,
  cancelarRecordatorio,
  enviarAviso,
} from "./notificaciones";
import { buscarPromociones } from "./promociones";
import { Promocion } from "../tipos";

export async function obtenerAvisos(): Promise<Promocion[]> {
  const favoritos = await obtenerFavoritos();
  const preferencias = await obtenerPreferencias();

  if (!preferencias.avisosActivos) {
    return [];
  }

  const promociones = await buscarPromociones();

  try {
    const datosComercios = await peticionApi<any[]>(
      `/comercios?pagina=1&porPagina=1000`,
    );

    const nombresRubros: Record<string, string> = {
      "rub-gastronomia": "Gastronomía",
      "rub-ferreteria": "Ferretería",
      "rub-indumentaria": "Indumentaria",
      "rub-servicios": "Servicios",
    };

    const hoy = new Date();

    const promocionesVigentes = promociones.filter((promo) => {
      const desde = new Date(promo.desde);
      const hasta = new Date(promo.hasta);

      return promo.activa && desde <= hoy && hasta >= hoy;
    });

    return promocionesVigentes.filter((promo) => {
      const esFavorito = favoritos.includes(promo.comercioId);

      const comercio = datosComercios.find(
        (item: any) => item.id === promo.comercioId,
      );

      const nombreRubro = nombresRubros[comercio?.rubroId];

      const rubroSeleccionado =
        nombreRubro !== undefined &&
        preferencias.rubrosSeleccionados.includes(nombreRubro);

      return esFavorito || rubroSeleccionado;
    });
  } catch (error) {
    console.error("Error al obtener avisos:", error);
    return [];
  }
}

export async function detectarPromocionesNuevas(): Promise<void> {
  const preferencias = await obtenerPreferencias();

  if (!preferencias.avisosActivos) {
    return;
  }

  const promociones = await obtenerAvisos();

  const db = await obtenerBaseDatos();
  const inicializacion = await db.getFirstAsync<{ valor: string }>(
    `SELECT valor FROM preferencias
      WHERE clave = 'promociones_notificadas_inicializadas'`,
  );
  const filasNotificadas = await db.getAllAsync<{ promocion_id: string }>(
    "SELECT promocion_id FROM promociones_notificadas",
  );
  const idNotificados = filasNotificadas.map((fila) => fila.promocion_id);

  if (!inicializacion) {
    await db.withTransactionAsync(async () => {
      for (const promo of promociones) {
        await db.runAsync(
          "INSERT OR IGNORE INTO promociones_notificadas (promocion_id) VALUES (?)",
          promo.id,
        );
      }
      await db.runAsync(
        `INSERT INTO preferencias (clave, valor)
          VALUES ('promociones_notificadas_inicializadas', 'si')`,
      );
    });
    return;
  }

  const promocionesNuevas = promociones.filter(
    (promo) => !idNotificados.includes(promo.id),
  );

  const promocionesNotificadas: string[] = [];

  for (const promo of promocionesNuevas) {
    const resultado = await enviarAviso("Nueva promoción", promo.titulo);

    if (resultado) {
      promocionesNotificadas.push(promo.id);
    }
  }

  if (promocionesNotificadas.length > 0) {
    await db.withTransactionAsync(async () => {
      for (const id of promocionesNotificadas) {
        await db.runAsync(
          "INSERT OR IGNORE INTO promociones_notificadas (promocion_id) VALUES (?)",
          id,
        );
      }
    });
  }
}

export async function obtenerPromocionesGuardadas(): Promise<Promocion[]> {
  const db = await obtenerBaseDatos();
  const filas = await db.getAllAsync<{ datos_json: string }>(
    "SELECT datos_json FROM promociones_guardadas ORDER BY vence_en",
  );
  return filas.map((fila) => JSON.parse(fila.datos_json) as Promocion);
}

export async function reprogramarRecordatoriosPendientes(): Promise<void> {
  const promociones = await obtenerPromocionesGuardadas();

  const db = await obtenerBaseDatos();
  const recordatorios = await db.getAllAsync<{
    promocion_id: string;
    notificacion_id: string;
  }>("SELECT promocion_id, notificacion_id FROM recordatorios");
  const nuevosRecordatorios: Array<[string, string]> = [];

  for (const recordatorio of recordatorios) {
    await cancelarRecordatorio(recordatorio.notificacion_id);
  }

  for (const promo of promociones) {
    const fechaVencimiento = new Date(promo.hasta);
    const fechaRecordatorio = new Date(fechaVencimiento);

    fechaRecordatorio.setDate(fechaRecordatorio.getDate() - 1);
    fechaRecordatorio.setHours(10, 0, 0, 0);

    if (fechaRecordatorio <= new Date()) {
      continue;
    }

    const idRecordatorio = await programarRecordatorio(
      "Promoción por vencer",
      `La promoción "${promo.titulo}" vence mañana.`,
      fechaRecordatorio,
    );

    if (idRecordatorio) {
      nuevosRecordatorios.push([promo.id, idRecordatorio]);
    }
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM recordatorios");
    for (const [promocionId, notificacionId] of nuevosRecordatorios) {
      await db.runAsync(
        "INSERT INTO recordatorios (promocion_id, notificacion_id) VALUES (?, ?)",
        promocionId,
        notificacionId,
      );
    }
  });
}

export async function esPromocionGuardada(id: string): Promise<boolean> {
  const db = await obtenerBaseDatos();
  const promocion = await db.getFirstAsync<{ promocion_id: string }>(
    "SELECT promocion_id FROM promociones_guardadas WHERE promocion_id = ?",
    id,
  );
  return promocion !== null;
}

export async function guardarPromocion(promocion: Promocion): Promise<void> {
  const db = await obtenerBaseDatos();
  const guardada = await db.getFirstAsync<{ promocion_id: string }>(
    "SELECT promocion_id FROM promociones_guardadas WHERE promocion_id = ?",
    promocion.id,
  );
  if (guardada) {
    return;
  }

  await db.runAsync(
    `INSERT INTO promociones_guardadas (promocion_id, vence_en, datos_json)
      VALUES (?, ?, ?)`,
    promocion.id,
    promocion.hasta,
    JSON.stringify(promocion),
  );

  const fechaVencimiento = new Date(promocion.hasta);
  const fechaRecordatorio = new Date(fechaVencimiento);

  fechaRecordatorio.setDate(fechaRecordatorio.getDate() - 1);
  fechaRecordatorio.setHours(10, 0, 0, 0);

  const idRecordatorio = await programarRecordatorio(
    "Promoción por vencer",
    `La promoción "${promocion.titulo}" vence mañana.`,
    fechaRecordatorio,
  );

  if (idRecordatorio) {
    await db.runAsync(
      `INSERT INTO recordatorios (promocion_id, notificacion_id)
        VALUES (?, ?)
        ON CONFLICT(promocion_id)
        DO UPDATE SET notificacion_id = excluded.notificacion_id`,
      promocion.id,
      idRecordatorio,
    );
  }
}

export async function quitarPromocion(id: string): Promise<void> {
  const db = await obtenerBaseDatos();
  await db.runAsync(
    "DELETE FROM promociones_guardadas WHERE promocion_id = ?",
    id,
  );

  const recordatorio = await db.getFirstAsync<{ notificacion_id: string }>(
    "SELECT notificacion_id FROM recordatorios WHERE promocion_id = ?",
    id,
  );
  if (recordatorio) {
    await cancelarRecordatorio(recordatorio.notificacion_id);
    await db.runAsync(
      "DELETE FROM recordatorios WHERE promocion_id = ?",
      id,
    );
  }
}
