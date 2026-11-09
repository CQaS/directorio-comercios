import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

const esquemaLogin = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
  clave: z.string().min(8, 'Debe tener al menos 8 caracteres'),
});

type FormularioDatos = z.infer<typeof esquemaLogin>;

export default function LoginScreen() {
  const router = useRouter();
  const [modoRegistro, setModoRegistro] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioDatos>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { nombre: '', email: '', clave: '' },
  });

  const onSubmit = async (datos: FormularioDatos) => {
    try {
      const respuesta = await fetch(
        `http://192.168.1.183:3000/auth/${modoRegistro ? 'registro' : 'ingreso'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(modoRegistro ? { nombre: datos.nombre } : {}),
            email: datos.email,
            contrasena: datos.clave,
          }),
        },
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(`Error ${respuesta.status}: ${resultado.mensaje || resultado.message || JSON.stringify(resultado)}`);
        return;
      }

      await AsyncStorage.setItem('token', resultado.datos.token);
      alert(modoRegistro ? '¡Cuenta creada correctamente!' : '¡Bienvenida!');
      router.replace('/(tabs)');
    } catch (error) {
      alert('No se pudo conectar con el servidor.');
    }
  };

  const entrarInvitado = () => router.replace('/(tabs)');

  return (
    <SafeAreaView style={styles.pantallaSegura}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              {errors.nombre && <Text style={styles.textoError}>{errors.nombre.message}</Text>}
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
            {errors.email && <Text style={styles.textoError}>{errors.email.message}</Text>}
          </View>

          <View style={styles.campo}>
            <Controller
              control={control}
              name="clave"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Contraseña (mínimo 8 caracteres)"
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
            {errors.clave && <Text style={styles.textoError}>{errors.clave.message}</Text>}
          </View>

          <Pressable onPress={handleSubmit(onSubmit)} style={styles.botonPrimario}>
            <Text style={styles.textoBotonPrimario}>
              {modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
            </Text>
          </Pressable>

          <Pressable onPress={() => setModoRegistro(!modoRegistro)} style={styles.botonSecundario}>
            <Text style={styles.textoBotonSecundario}>
              {modoRegistro ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
            </Text>
          </Pressable>

          <Pressable onPress={entrarInvitado} style={styles.botonSecundario}>
            <Text style={styles.textoBotonSecundario}>Explorar sin cuenta</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantallaSegura: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  tecladoContenedor: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  tarjeta: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center'
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B3A5D',
    textAlign: 'center',
    marginBottom: 4
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28
  },
  campo: {
    marginBottom: 16
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A'
  },
  textoError: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2
  },
  botonPrimario: {
    backgroundColor: '#0B3A5D',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12
  },
  textoBotonPrimario: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  },
  botonSecundario: {
    paddingVertical: 10,
    alignItems: 'center'
  },
  textoBotonSecundario: {
    color: '#0B3A5D',
    fontSize: 14,
    fontWeight: '600'
  },
});
