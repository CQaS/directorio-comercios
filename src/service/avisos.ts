import AsyncStorage from "@react-native-async-storage/async-storage";
import { obtenerFavoritos } from "./favoritos";
import {
  obtenerPreferencias,
  programarRecordatorio,
  cancelarRecordatorio,
  enviarAviso,
} from "./notificaciones";
import { buscarPromociones } from "./promociones";
import { Promocion } from "../tipos";
const urlBase = process.env.EXPO_PUBLIC_API_URL;

const CLAVE_PROMOCIONES_NOTIFICADAS = "@directorio_promociones_notificadas";
const CLAVE_PROMOCIONES_GUARDADAS = "@directorio_promociones_guardadas";
const CLAVE_RECORDATORIOS = "@directorio_recordatorios";

export async function obtenerAvisos(): Promise<Promocion[]> {
  const favoritos = await obtenerFavoritos();
  const preferencias = await obtenerPreferencias();

  if (!preferencias.avisosActivos) {
    return [];
  }

  const promociones = await buscarPromociones();

  try {
    const respuesta = await fetch(
      `${urlBase}/comercios?pagina=1&porPagina=1000`,
    );

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los comercios");
    }

    const resultado = await respuesta.json();

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

      const comercio = resultado.datos.find(
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

  const datosGuardados = await AsyncStorage.getItem(
    CLAVE_PROMOCIONES_NOTIFICADAS,
  );

  const idNotificados: string[] = datosGuardados
    ? JSON.parse(datosGuardados)
    : [];

  if (datosGuardados === null) {
    await AsyncStorage.setItem(
      CLAVE_PROMOCIONES_NOTIFICADAS,
      JSON.stringify(promociones.map((promo) => promo.id)),
    );
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
    const idActualizados = [...idNotificados, ...promocionesNotificadas];

    await AsyncStorage.setItem(
      CLAVE_PROMOCIONES_NOTIFICADAS,
      JSON.stringify(idActualizados),
    );
  }
}

export async function obtenerPromocionesGuardadas(): Promise<Promocion[]> {
  const datos = await AsyncStorage.getItem(CLAVE_PROMOCIONES_GUARDADAS);
  return datos ? JSON.parse(datos) : [];
}

export async function reprogramarRecordatoriosPendientes(): Promise<void> {
  const promociones = await obtenerPromocionesGuardadas();

  const datos = await AsyncStorage.getItem(CLAVE_RECORDATORIOS);

  const recordatorios = datos ? JSON.parse(datos) : {};

  const nuevosRecordatorios: Record<string, string> = {};

  for (const promo of promociones) {
    const fechaVencimiento = new Date(promo.hasta);
    const fechaRecordatorio = new Date(fechaVencimiento);

    fechaRecordatorio.setDate(fechaRecordatorio.getDate() - 1);
    fechaRecordatorio.setHours(10, 0, 0, 0);

    if (recordatorios[promo.id]) {
      await cancelarRecordatorio(recordatorios[promo.id]);
    }

    if (fechaRecordatorio <= new Date()) {
      continue;
    }

    const idRecordatorio = await programarRecordatorio(
      "Promoción por vencer",
      `La promoción "${promo.titulo}" vence mañana.`,
      fechaRecordatorio,
    );

    if (idRecordatorio) {
      nuevosRecordatorios[promo.id] = idRecordatorio;
    }
  }

  await AsyncStorage.setItem(
    CLAVE_RECORDATORIOS,
    JSON.stringify(nuevosRecordatorios),
  );
}

export async function esPromocionGuardada(id: string): Promise<boolean> {
  const promociones = await obtenerPromocionesGuardadas();
  return promociones.some((promo) => promo.id === id);
}

export async function guardarPromocion(promocion: Promocion): Promise<void> {
  const promociones = await obtenerPromocionesGuardadas();

  if (promociones.some((promo) => promo.id === promocion.id)) {
    return;
  }

  promociones.push(promocion);

  await AsyncStorage.setItem(
    CLAVE_PROMOCIONES_GUARDADAS,
    JSON.stringify(promociones),
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
    const datos = await AsyncStorage.getItem(CLAVE_RECORDATORIOS);
    const recordatorios = datos ? JSON.parse(datos) : {};

    recordatorios[promocion.id] = idRecordatorio;

    await AsyncStorage.setItem(
      CLAVE_RECORDATORIOS,
      JSON.stringify(recordatorios),
    );
  }
}

export async function quitarPromocion(id: string): Promise<void> {
  const promociones = await obtenerPromocionesGuardadas();

  const actualizados = promociones.filter((promo) => promo.id !== id);

  await AsyncStorage.setItem(
    CLAVE_PROMOCIONES_GUARDADAS,
    JSON.stringify(actualizados),
  );

  const datos = await AsyncStorage.getItem(CLAVE_RECORDATORIOS);
  const recordatorios = datos ? JSON.parse(datos) : {};

  if (recordatorios[id]) {
    await cancelarRecordatorio(recordatorios[id]);

    delete recordatorios[id];

    await AsyncStorage.setItem(
      CLAVE_RECORDATORIOS,
      JSON.stringify(recordatorios),
    );
  }
}
