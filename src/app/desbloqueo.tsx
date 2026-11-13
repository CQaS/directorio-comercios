import { useEffect, useState } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSesion } from "../contexto/sesion";

export default function Desbloqueo() {
  const { desbloquear, salir } = useSesion();
  const [fallo, setFallo] = useState(false);

  const intentar = async () => setFallo(!(await desbloquear()));

  useEffect(() => { intentar(); }, []);

  return (
    <SafeAreaView style={styles.contenedor}>
        <Text style={styles.titulo}>Tu sesión está bloqueada</Text>
        {fallo && <Text style={styles.error}>No pudimos verificar tu identidad.</Text>}
        <Pressable style={styles.boton} onPress={intentar}>
            <Text style={styles.textoBoton}>Desbloquear</Text>
        </Pressable>
        <Pressable onPress={salir}>
            <Text style={styles.enlace}>Entrar con email y contraseña</Text>
        </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: "center", padding: 24, gap: 16, backgroundColor: "#F8FAFC" },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#0B3A5D", textAlign: "center" },
  error: { color: "#991B1B", textAlign: "center" },
  boton: { backgroundColor: "#0B3A5D", padding: 14, borderRadius: 8, alignItems: "center" },
  textoBoton: { color: "#FFFFFF", fontWeight: "bold" },
  enlace: { color: "#0B3A5D", textAlign: "center", padding: 8 },
})