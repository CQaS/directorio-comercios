import { Promocion } from "../tipos";

export async function buscarPromocionesPorComercio(
  comercioId: string,
): Promise<Promocion[]> {
  // Implementación de la función asíncrona cuando tengamos la api real. Por ahora, devolvemos datos simulados.

  /* const respuesta = await fetch(
    `https://api/comercio/${comercioId}/promocion`,
  );

  if (!respuesta.ok) return null;

  const dato: Promocion = await respuesta.json();
  return dato; */

  return [
    {
      id: "promo-123",
      comercioId,
      titulo: "Promo 1",
      detalle: "Detalle de la promo 1",
      descuento: 10,
      desde: "2023-08-01",
      hasta: "2023-08-31",
      imagenUrl: null,
      soloApp: false,
      usos: 10,
      activa: true,
    },
    {
      id: "promo-456",
      comercioId,
      titulo: "Promo 2",
      detalle: "Detalle de la promo 2",
      descuento: 20,
      desde: "2023-08-01",
      hasta: "2023-08-31",
      imagenUrl: null,
      soloApp: false,
      usos: 10,
      activa: true,
    },
    {
      id: "promo-789",
      comercioId,
      titulo: "Promo 3",
      detalle: "Detalle de la promo 3",
      descuento: 30,
      desde: "2023-08-01",
      hasta: "2023-08-31",
      imagenUrl: null,
      soloApp: false,
      usos: 10,
      activa: true,
    },
  ];
}
