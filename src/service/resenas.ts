import type { Resena } from "../app/comercio/[id]";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.183:3000";

export async function buscarResenasPorComercio(
    comercioId: string): Promise<Resena[]> {
        const respuesta = await fetch(`${API_URL}/comercios/${comercioId}/resenas`);
        
        if (!respuesta.ok) {
    throw new Error("No se pudieron cargar las reseñas.");
}

const resultado: { datos: Resena[] } = await respuesta.json();

return resultado.datos;
}

export async function publicarResenaEnLaApi(
    comercioId: string,
    estrellas: 1 | 2 | 3 | 4 | 5,
    comentario: string
): Promise<Resena> {
    const token = await AsyncStorage.getItem("token");
    
    if (!token) {
    throw new Error("No se encontró el token de sesión.");
}

const respuesta = await fetch(
    `${API_URL}/comercios/${comercioId}/resenas`,
    {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ estrellas, comentario }),
    }
);

if (!respuesta.ok) {
    throw new Error("No se pudo publicar la reseña.");
}

const resultado: { datos: Resena } = await respuesta.json();
return resultado.datos;
}

export async function editarResenaEnLaApi(
    resenaId: string,
    estrellas: 1 | 2 | 3 | 4 | 5,
    comentario: string
): Promise<Resena> {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
    throw new Error("No se encontró el token de sesión.");
}

const respuesta = await fetch(`${API_URL}/resenas/${resenaId}`, {
    method: "PATCH",
    headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    },
    body: JSON.stringify({ estrellas, comentario }),
});

if (!respuesta.ok) {
    throw new Error("No se pudo editar la reseña.");
}

const resultado: { datos: Resena } = await respuesta.json();
return resultado.datos;
}

export async function eliminarResenaEnLaApi(resenaId: string): Promise<void> {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
    throw new Error("No se encontró el token de sesión.");
}

const respuesta = await fetch(`${API_URL}/resenas/${resenaId}`, {
    method: "DELETE",
    headers: {
    Authorization: `Bearer ${token}`,
    },
});

if (!respuesta.ok) {
    throw new Error("No se pudo eliminar la reseña.");
}
}

export async function reportarResenaEnLaApi(resenaId: string): Promise<Resena> {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
    throw new Error("No se encontró el token de sesión.");
}

const respuesta = await fetch(
    `${API_URL}/resenas/${resenaId}/reportes`,
    {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
    },
    }
);

if (!respuesta.ok) {
    throw new Error("No se pudo reportar la reseña.");
}

const resultado: { datos: Resena } = await respuesta.json();
return resultado.datos;
}

export async function responderResenaEnLaApi(
    resenaId: string,
    respuestaTexto: string
): Promise<Resena> {
const token = await AsyncStorage.getItem("token");

if (!token) {
    throw new Error("No se encontró el token de sesión.");
}

const respuesta = await fetch(
    `${API_URL}/resenas/${resenaId}/respuesta`,
    {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ respuesta: respuestaTexto }),
    }
);

if (!respuesta.ok) {
    throw new Error("No se pudo responder la reseña.");
}

const resultado: { datos: Resena } = await respuesta.json();
return resultado.datos;
}

export async function obtenerMisResenasEnLaApi(): Promise<Resena[]> {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
    throw new Error("No se encontró el token de sesión.");
}

const respuesta = await fetch(`${API_URL}/yo/resenas`, {
    headers: {
    Authorization: `Bearer ${token}`,
    },
});

if (!respuesta.ok) {
    const errorTexto = await respuesta.text();
    console.log("Error de la API:", respuesta.status, errorTexto);
    throw new Error("No se pudieron cargar tus reseñas.");
}

const resultado: { datos: Resena[] } = await respuesta.json();

return resultado.datos;
}