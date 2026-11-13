import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { obtenerFavoritos, quitarFavorito } from "../../service/favoritos";
import {
  obtenerPreferencias,
  guardarPreferencias,
} from "../../service/notificaciones";
import { reprogramarRecordatoriosPendientes } from "../../service/avisos";
import { useSesion } from "../../contexto/sesion";
import { hayBiometria, pedirBiometria } from "../../service/biometria";
import { biometriaActivada, guardarBiometria } from "../../service/sesion";


const urlBase = process.env.EXPO_PUBLIC_API_URL;

export default function YoScreen() {
  const [avisosActivos, setAvisosActivos] = useState(true);
  
  const { estado, usuario, salir } = useSesion();
  const [hayLector, setHayLector] = useState(false);
  const [usaHuella, setUsaHuella] = useState(false);

  const [cantidadFavoritos, setCantidadFavoritos] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarCantidad = async () => {
        try {
          const favoritos = await obtenerFavoritos();

          const respuesta = await fetch(
            `${urlBase}/comercios?pagina=1&porPagina=1000`,
          );

          if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los comercios");
          }

          const resultado = await respuesta.json();

          const favoritosValidos = favoritos.filter((id) =>
            resultado.datos.some((comercio: any) => comercio.id === id),
          );

          for (const id of favoritos) {
            if (!favoritosValidos.includes(id)) {
              await quitarFavorito(id);
            }
          }

          if (activo) {
            setCantidadFavoritos(favoritosValidos.length);
          }
        } catch (error) {
          console.error("Error al contar favoritos:", error);
        }
      };

      cargarCantidad();

      return () => {
        activo = false;
      };
    }, []),
  );

  useEffect(() => {
    const cargarPreferencias = async () => {
      const preferencias = await obtenerPreferencias();

      setAvisosActivos(preferencias.avisosActivos);
    };

    cargarPreferencias();
  }, []);

  useEffect(() => {
    const cargarHuella = async () => {
      setHayLector(await hayBiometria());
      setUsaHuella(await biometriaActivada());
    };

    cargarHuella();
  }, [])


  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cabecera de perfil */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{usuario?.nombre ?? "Invitado"}</Text>
            <Text style={styles.subtitle}>{usuario?.email ?? "Sin cuenta"}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Rol: {usuario?.rol === "comercio" ? "Comercio" : "Vecino"}
              </Text>
            </View>
          </View>
        </View>

        {/* Sección: Favoritos y Actividad */}
        <Text style={styles.sectionTitle}>Mi Actividad</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.rowItem}
            role="button"
            accessibilityLabel="Ver comercios favoritos"
            hitSlop={10}
            onPress={() => router.push("/favoritos" as any)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="heart-outline" size={22} color="#D9534F" />
              <Text style={styles.rowText}>
                Comercios Favoritos ({cantidadFavoritos})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={styles.rowItem}
            role="button"
            accessibilityLabel="Ver mis reseñas"
            hitSlop={10}
            onPress={() => router.push("/mis-resenas" as any)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="star-outline" size={22} color="#F0AD4E" />
              <Text style={styles.rowText}>Mis Reseñas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={styles.rowItem}
            role="button"
            accessibilityLabel="Ver promociones guardadas"
            onPress={() => router.push("/promociones-guardadas" as any)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="bookmark-outline" size={22} color="#0B3A5D" />
              <Text style={styles.rowText}>Promociones guardadas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </Pressable>
        </View>

        {/* Sección: Avisos y Notificaciones */}
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.card}>
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#0B3A5D"
              />
              <View>
                <Text style={styles.rowText}>Avisos y promociones</Text>
                <Text style={styles.rowSubtext}>
                  Promo nueva o por vencer de favoritos
                </Text>
              </View>
            </View>
            <Switch
              value={avisosActivos}
              onValueChange={async (nuevoValor) => {
                setAvisosActivos(nuevoValor);
                const preferencias = await obtenerPreferencias();
                await guardarPreferencias({
                  ...preferencias,
                  avisosActivos: nuevoValor,
                });

                if (nuevoValor) {
                  await reprogramarRecordatoriosPendientes();
                }
              }}
              trackColor={{ false: "#D8E0E8", true: "#0B3A5D" }}
            />
          </View>

          <Pressable
            style={styles.rowItem}
            onPress={() => router.push("/avisos" as any)}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="notifications" size={22} color="#0B3A5D" />
              <Text style={styles.rowText}>Ver avisos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </Pressable>

          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="pricetags-outline" size={22} color="#0B3A5D" />
              <View>
                <Text style={styles.rowText}>Rubros de interés</Text>
                <Text style={styles.rowSubtext}>
                  Elegí qué promociones querés recibir
                </Text>
              </View>
            </View>

            <Pressable onPress={() => router.push("/rubros-interes" as any)}>
              <Text style={styles.rowText}>Configurar</Text>
            </Pressable>
          </View>
        </View>


        {estado === "autenticado" && hayLector && (
          <>
            <Text style={styles.sectionTitle}>Seguridad</Text>
            <View style={styles.card}>
              <View style={styles.rowItem}>
                <View style={styles.rowLeft}>
                  <Ionicons
                    name="finger-print-outline"
                    size={22}
                    color="#0B3A5D"
                  />
                  <View>
                    <Text style={styles.rowText}>Pedir huella al abrir</Text>
                    <Text style={styles.rowSubtext}>
                      Protege tu cuenta si te prestan el teléfono
                    </Text>
                  </View>
                </View>
                <Switch
                  value={usaHuella}
                  onValueChange={async (nuevoValor) => {
                    if (
                      nuevoValor &&
                      !(await pedirBiometria("Confirmá para activarlo"))
                    ) {
                      return;
                    }
                    await guardarBiometria(nuevoValor);
                    setUsaHuella(nuevoValor);
                  }}
                  trackColor={{ false: "#D8E0E8", true: "#0B3A5D" }}
                />
              </View>
            </View>
          </>
        )}



        {/* Simulador de cambio de rol para probar vista de comercio */}
        {/*<Text style={styles.sectionTitle}>Modo de Prueba (Cátedra)</Text>
        <Pressable
          style={styles.buttonSwitch}
          role="button"
          accessibilityLabel="Cambiar entre modo vecino y comercio"
          onPress={() => setRol(rol === "vecino" ? "comercio" : "vecino")}
        >
          <Text style={styles.buttonSwitchText}>
            Cambiar a vista {rol === "vecino" ? "Comercio" : "Vecino"}
          </Text>
        </Pressable>*/}

        
        <Pressable
          style={styles.buttonSalir}
          role="button"
          accessibilityLabel={
            estado === "invitado" ? "Iniciar sesión" : "Cerrar sesión"
          }
          onPress={salir}
        >
          <Text style={styles.buttonSalirText}>
            {estado === "invitado" ? "Iniciar sesión" : "Cerrar sesión"}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0B3A5D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0B3A5D",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 6,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 4,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  rowSubtext: {
    fontSize: 12,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 50,
  },
  buttonSalir: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#991B1B",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonSalirText: {
    color: "#991B1B",
    fontWeight: "bold",
    fontSize: 15,
  },
});
