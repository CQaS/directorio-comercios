import * as SecureStore from "expo-secure-store";
import Storage from "expo-sqlite/kv-store"
import { UsuarioSesion } from "../tipos"

export async function guardarSesion(token: string, usuario: UsuarioSesion) {
    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("usuario", JSON.stringify(usuario))
}

export const leerToken = () => SecureStore.getItemAsync("token")

export async function leerUsuario(): Promise<UsuarioSesion | null> {
    try {
        const crudo = await SecureStore.getItemAsync("usuario");
        return crudo ? JSON.parse(crudo) : null
    } catch {
        return null;
    }
}

export async function borrarSesion() {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("usuario")
}

export async function biometriaActivada() {
    return (await Storage.getItem("pref_biometria")) === "si";
}
export const guardarBiometria = (v: boolean) =>
    Storage.setItem("pref_biometria", v ? "si" : "no")