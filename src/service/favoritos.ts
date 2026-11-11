import AsyncStorage from "@react-native-async-storage/async-storage";
import { peticionApi } from "./configuracionApi";
const urlBase = process.env.EXPO_PUBLIC_API_URL;

const CLAVE_FAVORITOS = "@directorio_comercios_favoritos";

export async function obtenerFavoritos(): Promise<string[]> {
  try {
    const datos = await AsyncStorage.getItem(CLAVE_FAVORITOS);
    const favoritos = datos ? JSON.parse(datos) : [];

    return favoritos;
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
}

export async function agregarFavorito(id: string): Promise<void> {
  const favoritos = await obtenerFavoritos();

  if (!favoritos.includes(id)) {
    favoritos.push(id);
    await AsyncStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
  }
}

export async function quitarFavorito(id: string): Promise<void> {
  const favoritos = await obtenerFavoritos();
  const actualizados = favoritos.filter((favoritoId) => favoritoId !== id);

  await AsyncStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(actualizados));
}

export async function esFavorito(id: string): Promise<boolean> {
  const favoritos = await obtenerFavoritos();
  return favoritos.includes(id);
}

export async function limpiarFavoritosInvalidos(): Promise<void> {
  try {
    const favoritos = await obtenerFavoritos();

    const comercios = await peticionApi<any[]>(
      `/comercios?pagina=1&porPagina=1000`,
    );

    const idsComercios = comercios.map((comercio: any) => comercio.id);

    const favoritosValidos = favoritos.filter((id) =>
      idsComercios.includes(id),
    );

    if (favoritosValidos.length !== favoritos.length) {
      await AsyncStorage.setItem(
        CLAVE_FAVORITOS,
        JSON.stringify(favoritosValidos),
      );
    }
  } catch (error) {
    console.error("Error al limpiar favoritos:", error);
  }
}
