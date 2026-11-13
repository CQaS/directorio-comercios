import { API_URL, ErrorApi } from "./api"
import { UsuarioSesion } from "../tipos"

type DatosSesion = { token: string; usuario?: UsuarioSesion };

async function llamar<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
    const control = new AbortController();
    const timer = setTimeout(() => control.abort(), 10_000);
    let respuesta: Response;
    try {
        respuesta = await fetch(`${API_URL}${ruta}`, { ...opciones, signal: control.signal });
    } catch {
        throw new ErrorApi("No pudimos conectarnos. Revisá tu conexión.");
    } finally {
        clearTimeout(timer);
    }

  const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
        throw new ErrorApi(
        resultado?.error?.mensaje ?? `El servidor respondió ${respuesta.status}`,
        resultado?.error?.codigo,
        respuesta.status,
        );
    }
    return resultado.datos as T;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export const registrarEnApi = (nombre: string, email: string, contrasena: string) =>
    llamar<DatosSesion>("/auth/registro", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ nombre, email, contrasena }),
    });

export const ingresarEnApi = (email: string, contrasena: string) =>
    llamar<DatosSesion>("/auth/ingreso", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, contrasena }),
    });

export async function obtenerPerfil(token: string): Promise<UsuarioSesion> {
    const u = await llamar<UsuarioSesion>("/yo", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, comercioId: u.comercioId };
}