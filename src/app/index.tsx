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

const esquemaLogin = z.object({
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .min(1, 'El email es obligatorio')
    .email('Formato de email inválido'),
  clave: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(8, 'Debe tener al menos 8 caracteres'),
});

type FormularioDatos = z.infer<typeof esquemaLogin>;

export default function LoginScreen() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioDatos>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: {
      email: '',
      clave: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = (datos: FormularioDatos) => {
    console.log('Login exitoso:', datos);
    router.replace('/(tabs)');
  };

  const entrarInvitado = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.pantallaSegura}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.tecladoContenedor}
      >
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>Directorio Comercial</Text>
          <Text style={styles.subtitulo}>Concepción del Uruguay</Text>

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
                  style={[
                    styles.input,
                    errors.email && styles.inputError,
                  ]}
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
                  placeholder="Contraseña"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={[
                    styles.input,
                    errors.clave && styles.inputError,
                  ]}
                />
              )}
            />
            {errors.clave && (
              <Text style={styles.textoError}>{errors.clave.message}</Text>
            )}
          </View>

          <Pressable
            role="button"
            accessibilityLabel="Iniciar sesión"
            onPress={handleSubmit(onSubmit)}
            style={({ pressed }) => [
              styles.botonPrimario,
              pressed && styles.botonPrimarioPresionado,
            ]}
          >
            <Text style={styles.textoBotonPrimario}>Iniciar Sesión</Text>
          </Pressable>

          <Pressable
            role="button"
            accessibilityLabel="Explorar comercios sin iniciar sesión"
            onPress={entrarInvitado}
            style={({ pressed }) => [
              styles.botonSecundario,
              pressed && styles.botonSecundarioPresionado,
            ]}
          >
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
    backgroundColor: '#FFFFFF',
  },
  tecladoContenedor: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B3A5D',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
  },
  campo: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
  textoError: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  botonPrimario: {
    backgroundColor: '#0B3A5D',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  botonPrimarioPresionado: {
    backgroundColor: '#085394',
  },
  textoBotonPrimario: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  botonSecundario: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonSecundarioPresionado: {
    opacity: 0.6,
  },
  textoBotonSecundario: {
    color: '#0B3A5D',
    fontSize: 14,
    fontWeight: '600',
  },
});