import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { promosStyles as styles } from "../../styles/promos.styles";
import {
  buscarPromociones,
  clasificarPromociones,
  buscarPromocionesPorRubro,
} from "../../service/promociones";
import type { Promocion, Comercio } from "../../tipos";
import { useRouter } from "expo-router";
import { buscarComercios } from "../../service/comercios";

export default function PantallaPromos() {
  const router = useRouter();
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState<string | null>(
    null,
  );
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const rubros = [
    "Gastronomía",
    "Indumentaria",
    "Hogar",
    "Ferretería y construcción",
    "Salud y farmacia",
    "Servicios",
    "Tecnología",
    "Librería",
    "Otros",
  ];

  useEffect(() => {
  async function cargarPromociones() {
    const resultado = rubroSeleccionado
      ? await buscarPromocionesPorRubro(rubroSeleccionado)
      : await buscarPromociones();

    setPromociones(resultado);

    const resultadoComercios = await buscarComercios();
    setComercios(resultadoComercios);
  }

  cargarPromociones();
}, [rubroSeleccionado]);

  const obtenerNombreComercio = (comercioId: string) => {
    const comercio = comercios.find((item) => item.id === comercioId);
    return comercio?.nombre ?? "Comercio no identificado";
  };

  const grupos = clasificarPromociones(promociones);

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>Promociones de Comercios</Text>
      </View>
      <View style={styles.rubros}>
        <Pressable
          onPress={() => setRubroSeleccionado(null)}
          style={styles.botonRubro}
        >
          <Text>Ver todas</Text>
        </Pressable>

        {rubros.map((rubro) => (
          <Pressable
            key={rubro}
            onPress={() => setRubroSeleccionado(rubro)}
            style={[
              styles.botonRubro,
              rubroSeleccionado === rubro && styles.botonRubroSeleccionado,
            ]}
          >
            <Text
            style={{
              color: rubroSeleccionado === rubro ? "#ffffff" : "#183153",
              fontWeight: "600",
              }}
              >
                {rubro}
                </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.subtitulo}>Promociones vigentes</Text>
      {grupos.vigentes.map((promo) => (
        <Pressable
        key={promo.id}
        style={styles.tarjeta}
        onPress={() =>
        router.push({
        pathname: "/detalle-promocion",
        params: { id: promo.id },
      })
    }
  >
    <View style={styles.tarjetaContenido}>
      <Text style={styles.comercio}>
        {obtenerNombreComercio(promo.comercioId)}
      </Text>

      <Text style={styles.nombre}>{promo.titulo}</Text>

      {promo.descuento != null && (
        <Text style={styles.descuento}>
          {promo.descuento}% OFF
        </Text>
      )}

      <Text style={styles.detalle}>{promo.detalle}</Text>

      <Text style={styles.informacion}>
        Válido hasta: {promo.hasta}
      </Text>

      <Text style={styles.informacion}>
        Canjes registrados: {promo.usos}
      </Text>
    </View>
  </Pressable>
))}

      <Text style={styles.subtitulo}>Promociones por vencer</Text>
      {grupos.porVencer.map((promo) => (
  <Pressable
    key={promo.id}
    style={styles.tarjeta}
    onPress={() =>
      router.push({
        pathname: "/detalle-promocion",
        params: { id: promo.id },
      })
    }
  >
    <View style={styles.tarjetaContenido}>
      <Text style={styles.comercio}>
        {obtenerNombreComercio(promo.comercioId)}
      </Text>

      <Text style={styles.nombre}>{promo.titulo}</Text>

      {promo.descuento != null && (
        <Text style={styles.descuento}>
          {promo.descuento}% OFF
        </Text>
      )}

      <Text style={styles.detalle}>{promo.detalle}</Text>

      <Text style={styles.informacion}>
        Válido hasta: {promo.hasta}
      </Text>

      <Text style={styles.informacion}>
        Canjes registrados: {promo.usos}
      </Text>
    </View>
  </Pressable>
))}

      <Text style={styles.subtitulo}>Próximas promociones</Text>
      {grupos.proximas.map((promo) => (
  <Pressable
    key={promo.id}
    style={styles.tarjeta}
    onPress={() =>
      router.push({
        pathname: "/detalle-promocion",
        params: { id: promo.id },
      })
    }
  >
    <View style={styles.tarjetaContenido}>
      <Text style={styles.comercio}>
        {obtenerNombreComercio(promo.comercioId)}
      </Text>

      <Text style={styles.nombre}>{promo.titulo}</Text>

      {promo.descuento != null && (
        <Text style={styles.descuento}>
          {promo.descuento}% OFF
        </Text>
      )}

      <Text style={styles.detalle}>{promo.detalle}</Text>

      <Text style={styles.informacion}>
        Válido hasta: {promo.hasta}
      </Text>

      <Text style={styles.informacion}>
        Canjes registrados: {promo.usos}
      </Text>
    </View>
  </Pressable>
))}
    </ScrollView>
  );
}
