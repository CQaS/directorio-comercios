import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Canje {
    id: string;
    promocionId: string;
    comercioId: string;
    codigo: string;
    fecha: string;
}

const CLAVE_CANJES = '@canjes';

export async function obtenerCanjes(): Promise<Canje[]> {
    const datos = await AsyncStorage.getItem(CLAVE_CANJES);
    
    if (datos === null) {
    return [];
}

return JSON.parse(datos) as Canje[];
}

export async function registrarCanje(
    promocionId: string,
    comercioId: string,
    codigo: string,
): Promise<boolean> {
    const canjes = await obtenerCanjes();
    
    const yaRegistrado = canjes.some(
    (canje) => canje.codigo === codigo,
);

if (yaRegistrado) {
    return false;
}

const nuevoCanje: Canje = {
    id: `${Date.now()}`,
    promocionId,
    comercioId,
    codigo,
    fecha: new Date().toISOString(),
};

canjes.push(nuevoCanje);

await AsyncStorage.setItem(
    CLAVE_CANJES,
    JSON.stringify(canjes),
);

return true;
}

export async function contarCanjesPorPromocion(promocionId: string): Promise<number> {
const canjes = await obtenerCanjes();

return canjes.filter(
    (canje) => canje.promocionId === promocionId).length;
}