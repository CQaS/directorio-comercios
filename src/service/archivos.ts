import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { fetch } from "expo/fetch";
import { API_URL } from "./configuracionApi";
import { leerToken } from "./sesion";

export async function subirArchivo(
  archivo: ImagePicker.ImagePickerAsset | string,
): Promise<string> {
  const token = await leerToken();

  if (!token) {
    throw new Error("Tenés que iniciar sesión para subir archivos.");
  }

  const uri = typeof archivo === "string" ? archivo : archivo.uri;

  const archivoLocal = new File(uri);
  const formulario = new FormData();

  formulario.append("archivo", archivoLocal);

  const respuesta = await fetch(`${API_URL}/archivos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formulario,
  });

  const json = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(json.error?.mensaje ?? "No se pudo subir el archivo.");
  }

  const url = json.datos?.url ?? json.url;

  if (!url) {
    throw new Error("La API no devolvió la URL del archivo.");
  }

  return url.startsWith("http") ? url : `${API_URL}${url}`;
}
