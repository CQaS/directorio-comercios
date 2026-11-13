import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";

const MIGRACION_INICIAL = "datos-locales-v1";

let promesaBaseDatos: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrarDatosAnteriores(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  const migracion = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM migraciones WHERE id = ?",
    MIGRACION_INICIAL,
  );

  if (migracion) {
    return;
  }

  const [
    favoritosGuardados,
    preferenciasGuardadas,
    canjesGuardados,
    promocionesNotificadas,
    promocionesGuardadas,
    recordatoriosGuardados,
    biometriaGuardada,
  ] = await Promise.all([
    AsyncStorage.getItem("@directorio_comercios_favoritos"),
    AsyncStorage.getItem("@directorio_comercios_notificaciones"),
    AsyncStorage.getItem("@canjes"),
    AsyncStorage.getItem("@directorio_promociones_notificadas"),
    AsyncStorage.getItem("@directorio_promociones_guardadas"),
    AsyncStorage.getItem("@directorio_recordatorios"),
    Storage.getItem("pref_biometria"),
  ]);

  await db.withTransactionAsync(async () => {
    const favoritos: string[] = favoritosGuardados
      ? JSON.parse(favoritosGuardados)
      : [];
    for (const id of favoritos) {
      await db.runAsync(
        "INSERT OR IGNORE INTO favoritos (comercio_id) VALUES (?)",
        id,
      );
    }

    if (preferenciasGuardadas) {
      const preferencias = JSON.parse(preferenciasGuardadas) as {
        avisosActivos?: boolean;
        rubrosSeleccionados?: string[];
      };
      await db.runAsync(
        `INSERT OR IGNORE INTO preferencias_notificaciones
          (id, avisos_activos, rubros_seleccionados)
          VALUES (1, ?, ?)`,
        preferencias.avisosActivos === false ? 0 : 1,
        JSON.stringify(preferencias.rubrosSeleccionados ?? []),
      );
    }

    if (promocionesNotificadas !== null) {
      await db.runAsync(
        `INSERT OR IGNORE INTO preferencias (clave, valor)
          VALUES ('promociones_notificadas_inicializadas', 'si')`,
      );
    }

    const canjes: Array<{
      id: string;
      promocionId: string;
      comercioId: string;
      codigo: string;
      fecha: string;
    }> = canjesGuardados ? JSON.parse(canjesGuardados) : [];
    for (const canje of canjes) {
      await db.runAsync(
        `INSERT OR IGNORE INTO canjes
          (id, promocion_id, comercio_id, codigo, fecha)
          VALUES (?, ?, ?, ?, ?)`,
        canje.id,
        canje.promocionId,
        canje.comercioId,
        canje.codigo,
        canje.fecha,
      );
    }

    const idsNotificados: string[] = promocionesNotificadas
      ? JSON.parse(promocionesNotificadas)
      : [];
    for (const id of idsNotificados) {
      await db.runAsync(
        "INSERT OR IGNORE INTO promociones_notificadas (promocion_id) VALUES (?)",
        id,
      );
    }

    const promociones: Array<{ id: string; hasta: string }> =
      promocionesGuardadas ? JSON.parse(promocionesGuardadas) : [];
    for (const promocion of promociones) {
      await db.runAsync(
        `INSERT OR IGNORE INTO promociones_guardadas
          (promocion_id, vence_en, datos_json)
          VALUES (?, ?, ?)`,
        promocion.id,
        promocion.hasta,
        JSON.stringify(promocion),
      );
    }

    const recordatorios: Record<string, string> = recordatoriosGuardados
      ? JSON.parse(recordatoriosGuardados)
      : {};
    for (const [promocionId, notificacionId] of Object.entries(recordatorios)) {
      await db.runAsync(
        `INSERT OR IGNORE INTO recordatorios
          (promocion_id, notificacion_id) VALUES (?, ?)`,
        promocionId,
        notificacionId,
      );
    }

    if (biometriaGuardada !== null) {
      await db.runAsync(
        `INSERT OR IGNORE INTO preferencias (clave, valor)
          VALUES ('biometria', ?)`,
        biometriaGuardada,
      );
    }

    await db.runAsync(
      "INSERT INTO migraciones (id) VALUES (?)",
      MIGRACION_INICIAL,
    );
  });
}

async function abrirBaseDatos(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("directorio-comercios.db");

  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS migraciones (
      id TEXT PRIMARY KEY NOT NULL,
      aplicada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS favoritos (
      comercio_id TEXT PRIMARY KEY NOT NULL,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS comercios_cache (
      comercio_id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      rubro_id TEXT NOT NULL,
      direccion TEXT NOT NULL,
      datos_json TEXT NOT NULL,
      actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_comercios_cache_nombre
      ON comercios_cache(nombre);
    CREATE INDEX IF NOT EXISTS idx_comercios_cache_rubro
      ON comercios_cache(rubro_id);
    CREATE TABLE IF NOT EXISTS preferencias (
      clave TEXT PRIMARY KEY NOT NULL,
      valor TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS preferencias_notificaciones (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      avisos_activos INTEGER NOT NULL,
      rubros_seleccionados TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS canjes (
      id TEXT PRIMARY KEY NOT NULL,
      promocion_id TEXT NOT NULL,
      comercio_id TEXT NOT NULL,
      codigo TEXT NOT NULL UNIQUE,
      fecha TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS promociones_guardadas (
      promocion_id TEXT PRIMARY KEY NOT NULL,
      vence_en TEXT NOT NULL,
      datos_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS promociones_notificadas (
      promocion_id TEXT PRIMARY KEY NOT NULL
    );
    CREATE TABLE IF NOT EXISTS recordatorios (
      promocion_id TEXT PRIMARY KEY NOT NULL,
      notificacion_id TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sesion_web (
      clave TEXT PRIMARY KEY NOT NULL,
      valor TEXT NOT NULL
    );
  `);

  await migrarDatosAnteriores(db);
  return db;
}

export function obtenerBaseDatos(): Promise<SQLite.SQLiteDatabase> {
  if (!promesaBaseDatos) {
    promesaBaseDatos = abrirBaseDatos().catch((error: unknown) => {
      promesaBaseDatos = null;
      throw error;
    });
  }

  return promesaBaseDatos;
}
