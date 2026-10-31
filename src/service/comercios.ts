import { Comercio } from "../tipos";

const API_URL = "http://192.168.1.183:3000";

interface RespuestaComercios {
    datos: Comercio[];
    meta: {
    total: number;
    pagina: number;
    porPagina: number;
};
}

export async function buscarComercios(): Promise<Comercio[]> {
const parametros = new URLSearchParams({
    pagina: "1",
    porPagina: "1000",
    orden: "nombre",
});

const respuesta = await fetch(
    `${API_URL}/comercios?${parametros.toString()}`
);

if (!respuesta.ok) {
    throw new Error("No se pudieron cargar los comercios.");
}

const resultado: RespuestaComercios = await respuesta.json();

return resultado.datos;
}
