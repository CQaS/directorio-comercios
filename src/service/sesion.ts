import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { obtenerBaseDatos } from "./baseDatos";
import { UsuarioSesion } from "../tipos"

async function leerValor(clave: string): Promise<string | null> {
    if (Platform.OS !== "web") {
        return SecureStore.getItemAsync(clave);
    }

    const db = await obtenerBaseDatos();
    const fila = await db.getFirstAsync<{ valor: string }>(
        "SELECT valor FROM sesion_web WHERE clave = ?",
        clave,
    );
    return fila?.valor ?? null;
}

async function guardarValor(clave: string, valor: string): Promise<void> {
    if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(clave, valor);
        return;
    }

    const db = await obtenerBaseDatos();
    await db.runAsync(
        `INSERT INTO sesion_web (clave, valor) VALUES (?, ?)
          ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor`,
        clave,
        valor,
    );
}

async function eliminarValor(clave: string): Promise<void> {
    if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync(clave);
        return;
    }

    const db = await obtenerBaseDatos();
    await db.runAsync("DELETE FROM sesion_web WHERE clave = ?", clave);
}

export async function guardarSesion(token: string, usuario: UsuarioSesion) {
    await guardarValor("token", token);
    await guardarValor("usuario", JSON.stringify(usuario))
}

export const leerToken = () => leerValor("token")

export async function leerUsuario(): Promise<UsuarioSesion | null> {
    try {
        const crudo = await leerValor("usuario");
        return crudo ? JSON.parse(crudo) : null
    } catch {
        return null;
    }
}

export async function borrarSesion() {
    await eliminarValor("token");
    await eliminarValor("usuario")
}

export async function biometriaActivada() {
    const db = await obtenerBaseDatos();
    const preferencia = await db.getFirstAsync<{ valor: string }>(
        "SELECT valor FROM preferencias WHERE clave = 'biometria'",
    );
    return preferencia?.valor === "si";
}
export async function guardarBiometria(v: boolean): Promise<void> {
    const db = await obtenerBaseDatos();
    await db.runAsync(
        `INSERT INTO preferencias (clave, valor) VALUES ('biometria', ?)
          ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor`,
        v ? "si" : "no",
    );
}