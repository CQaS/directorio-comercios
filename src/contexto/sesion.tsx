import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { UsuarioSesion } from "../tipos";
import { ingresarEnApi, registrarEnApi, obtenerPerfil } from "../service/auth";
import { ErrorApi } from "../service/api";
import {
  guardarSesion, leerToken, leerUsuario, borrarSesion, biometriaActivada,
} from "../service/sesion";
import { pedirBiometria } from "../service/biometria";

type Estado = "cargando" | "anonimo" | "invitado" | "bloqueada" | "autenticado";

interface Sesion {
    estado: Estado;
    usuario: UsuarioSesion | null;
    ingresar: (email: string, clave: string) => Promise<void>;
    registrar: (nombre: string, email: string, clave: string) => Promise<void>;
    entrarComoInvitado: () => void;
    desbloquear: () => Promise<boolean>;
    salir: () => Promise<void>
}

const SesionContext = createContext<Sesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
    const [estado, setEstado] = useState<Estado>("cargando");
    const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);


    useEffect(() => {
    (async () => {
        const token = await leerToken();
        const guardado = await leerUsuario();
        if (!token || !guardado) return setEstado("anonimo");
        setUsuario(guardado);
        setEstado((await biometriaActivada()) ? "bloqueada" : "autenticado");

        obtenerPerfil(token).catch(async (e) => {
        if (e instanceof ErrorApi && e.estado === 401) {
            await borrarSesion();
            setUsuario(null);
            setEstado("anonimo");
        }
        })
    })()
    }, [])

    const abrir = async (datos: { token: string; usuario?: UsuarioSesion }) => {
        const u = datos.usuario ?? (await obtenerPerfil(datos.token));
        await guardarSesion(datos.token, u);
        setUsuario(u);
        setEstado("autenticado");
    }

    const value: Sesion = {
        estado,
        usuario,
        ingresar: async (email, clave) => abrir(await ingresarEnApi(email, clave)),
        registrar: async (nombre, email, clave) =>
        abrir(await registrarEnApi(nombre, email, clave)),
        entrarComoInvitado: () => setEstado("invitado"),
        desbloquear: async () => {
        const ok = await pedirBiometria("Desbloqueá para entrar");
        if (ok) setEstado("autenticado");
        return ok;
        },
        salir: async () => {
        await borrarSesion();
        setUsuario(null);
        setEstado("anonimo");
        },
    };

    return <SesionContext value={value}>{children}</SesionContext>
}

export function useSesion() {
    const s = use(SesionContext);
    if (!s) throw new Error("Falta <SesionProvider>");
    return s
}