import { Resena } from "../app/comercio/[id]";

let resenasGuardadas: Resena[] = [];

export function obtenerMisResenas(usuarioId: string): Resena[] {
    return resenasGuardadas.filter(
    (resena) => resena.usuarioId === usuarioId);
}

export function guardarResena(nuevaResena: Resena): void {
const indice = resenasGuardadas.findIndex(
    (resena) => resena.id === nuevaResena.id
);

if (indice >= 0) {
    resenasGuardadas[indice] = nuevaResena;
} else {
    resenasGuardadas.push(nuevaResena);
}

console.log("Reseñas guardadas:", resenasGuardadas);
}

export function eliminarResenaGuardada(resenaId: string): void {
    resenasGuardadas = resenasGuardadas.filter(
    (resena) => resena.id !== resenaId);

    console.log("Reseñas después de eliminar:", resenasGuardadas);
}
