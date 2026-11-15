
import { Directory, File, Paths } from "expo-file-system";
import type { Comercio } from "../tipos";
import { obtenerBaseDatos } from "./baseDatos";

type TipoMedio = "imagen" | "video";

const carpetaMedios = new Directory(
Paths.document,
"medios-comercios",
);

function generarHash(texto: string): string {
    let hash = 2166136261;

    for (let i = 0; i < texto.length; i++){
        hash ^= texto.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return(hash >>> 0).toString(16);
}

function obtenerExtension(url: string, tipo: TipoMedio): string {
    try {
        const ruta = new URL(url).pathname;
        const coincidencia = ruta.match(/\.([a-zA-Z0-9]{2,5})$/);

        if (coincidencia) {
            return `.${coincidencia[1].toLowerCase()}`;
        }
    } catch {
    // Si no se puede obtener la extensión desde la URL, se usa la predeterminada.
    }

    return tipo === "video" ? ".mp4" : ".jpg";
}

async function guardarMedio(comercioId: string, url: string, tipo: TipoMedio):Promise<string> {
    if (!url.startsWith("http://") && ! url.startsWith("https://")) {
        return url;
    }

    try {
    const db = await obtenerBaseDatos();

    const fila = await db.getFirstAsync<{uri_local: string}>(
        `SELECT uri_local FROM medios_comercios
        WHERE comercio_id = ? AND url_original = ?`,
        comercioId,
        url,
    );

if (fila) {
    const archivoGuardado = new File(fila.uri_local);

    if (archivoGuardado.exists && archivoGuardado.size > 0) {


        return archivoGuardado.uri;
    }
}

    if (!carpetaMedios.exists) {
        carpetaMedios.create({
            idempotent: true,
            intermediates: true,
        });
    }

    const extension = obtenerExtension(url, tipo);
    const nombre = `${tipo}_${generarHash(
        `${comercioId}_${url}`,
    )}${extension}`;

    const archivo = new File(carpetaMedios, nombre);

        if (archivo.exists) {
            archivo.delete();
        }

        try {
            await File.downloadFileAsync(url,archivo, {
                idempotent: true,
        });

    } catch (error) {
        if (archivo.exists) {
            archivo.delete();
        }
        throw error;
    }

        if (!archivo.exists || archivo.size === 0) {

            if (archivo.exists) {
                archivo.delete();
            }
            throw new Error(`El archivo ${tipo} no se descargó correctamente.`);
        }



        await db.runAsync(
            `INSERT OR REPLACE INTO medios_comercios
            (comercio_id, url_original, tipo, uri_local, actualizado_en)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            comercioId,
            url,
            tipo,
            archivo.uri,
        );

        return archivo.uri;
    } catch (error) {
        console.error(
            `No se pudo guardar el ${tipo} del comercio ${comercioId}:`, error,
        );

        return url;
    }
}

export async function guardarMediosComercio(
comercio: Comercio,
): Promise<Comercio> {
const imagenes = await Promise.all(
    (comercio.imagenes ?? []).map((url) =>
        guardarMedio(comercio.id, url, "imagen"),
    ),
);

const videoUrl = comercio.videoUrl ? await guardarMedio(comercio.id, comercio.videoUrl, "video"): null;

return {
    ...comercio,
    imagenes,
    videoUrl
    };
}
