
import { Directory, File, Paths } from "expo-file-system";
import type { Comercio } from "../tipos";

const carpetaMedios = new Directory(
Paths.document,
"medios-comercios",
);

function obtenerNombreArchivo(url: string): string | null {
try {
    const ruta = new URL(url).pathname;

    if (!ruta.startsWith("/archivos/")) {
    return null;
    }

    return ruta
    .slice("/archivos/".length)
    .replaceAll("/", "_");
    } catch {
    return null;
    }
}

async function guardarImagen(url: string): Promise<string> {
const nombre = obtenerNombreArchivo(url);

if (!nombre) {
    return url;
}

if (!carpetaMedios.exists) {
    carpetaMedios.create({
    idempotent: true,
    intermediates: true,
    });
}

const archivo = new File(carpetaMedios, nombre);

if (archivo.exists) {
    return archivo.uri;
}

try {
    const descargado = await File.downloadFileAsync(url, archivo);
    return descargado.uri;
    } catch (error) {
    if (archivo.exists) {
        archivo.delete();
    }

    console.error("No se pudo guardar la imagen offline:", error);
    return url;
}
}

export async function guardarMediosComercio(
comercio: Comercio,
): Promise<Comercio> {
const imagenes = await Promise.all(
    comercio.imagenes.map((url) => guardarImagen(url)),
    );

return {
    ...comercio,
    imagenes,
    };
}
