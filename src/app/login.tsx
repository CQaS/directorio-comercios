import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loginStyles as styles } from "../styles/login.style";
import { useSesion } from "../contexto/sesion";

const esquemaIngreso = z.object({
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  clave: z.string().min(1, "La contraseña es obligatoria"),
});

const esquemaRegistro = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  clave: z
    .string()
    .min(8, "Debe tener al menos 8 caracteres")
    .max(100, "Máximo 100 caracteres"),
});

type FormularioDatos = z.infer<typeof esquemaRegistro>;

export default function LoginScreen() {
  const { ingresar, registrar, entrarComoInvitado } = useSesion();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormularioDatos>({
    resolver: zodResolver(
      modoRegistro ? esquemaRegistro : esquemaIngreso,
    ) as unknown as Resolver<FormularioDatos>,
    defaultValues: { nombre: "", email: "", clave: "" },
  });

  const cambiarModo = () => {
    setModoRegistro((anterior) => !anterior);
    setErrorServidor(null);
    reset();
  };

  const onSubmit = async (datos: FormularioDatos) => {
    setErrorServidor(null);

    try {
      if (modoRegistro) {
        await registrar(datos.nombre.trim(), datos.email.trim(), datos.clave);
      } else {
        await ingresar(datos.email.trim(), datos.clave);
      }
    } catch (error) {
      setErrorServidor(
        error instanceof Error
          ? error.message
          : "Algo salió mal. Probá de nuevo.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.pantallaSegura}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.tecladoContenedor}
      >
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>Directorio Comercial</Text>
          <Text style={styles.subtitulo}>Concepción del Uruguay</Text>

          {modoRegistro && (
            <View style={styles.campo}>
              <Controller
                control={control}
                name="nombre"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Tu nombre"
                    placeholderTextColor="#94A3B8"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={styles.input}
                  />
                )}
              />
              {errors.nombre && (
                <Text style={styles.textoError}>{errors.nombre.message}</Text>
              )}
            </View>
          )}

          <View style={styles.campo}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="tu@email.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={styles.input}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.textoError}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.campo}>
            <Controller
              control={control}
              name="clave"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={
                    modoRegistro
                      ? "Contraseña (mínimo 8 caracteres)"
                      : "Contraseña"
                  }
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={styles.input}
                />
              )}
            />
            {errors.clave && (
              <Text style={styles.textoError}>{errors.clave.message}</Text>
            )}
          </View>

          {errorServidor && (
            <Text style={styles.textoError} role="alert">
              {errorServidor}
            </Text>
          )}

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={[styles.botonPrimario, isSubmitting && { opacity: 0.6 }]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBotonPrimario}>
                {modoRegistro ? "Crear cuenta" : "Iniciar sesión"}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={cambiarModo} style={styles.botonSecundario}>
            <Text style={styles.textoBotonSecundario}>
              {modoRegistro ? "Ya tengo una cuenta" : "Crear una cuenta nueva"}
            </Text>
          </Pressable>

          <Pressable
            onPress={entrarComoInvitado}
            style={styles.botonSecundario}
          >
            <Text style={styles.textoBotonSecundario}>Explorar sin cuenta</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
