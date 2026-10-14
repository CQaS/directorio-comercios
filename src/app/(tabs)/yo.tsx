import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function YoScreen() {
  
  const [avisosActivos, setAvisosActivos] = useState(true);
  const [rol, setRol] = useState<'vecino' | 'comercio'>('vecino');

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Cabecera de perfil */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Marta Giménez</Text>
            <Text style={styles.subtitle}>marta@mail.com</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Rol: {rol === 'vecino' ? 'Vecino' : 'Comercio'}</Text>
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
            onPress={() => console.log('Ir a favoritos')}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="heart-outline" size={22} color="#D9534F" />
              <Text style={styles.rowText}>Comercios Favoritos (1)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </Pressable>

          <View style={styles.divider} />

          <Pressable 
            style={styles.rowItem}
            role="button"
            accessibilityLabel="Ver mis reseñas"
            hitSlop={10}
            onPress={() => console.log('Ir a mis reseñas')}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="star-outline" size={22} color="#F0AD4E" />
              <Text style={styles.rowText}>Mis Reseñas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </Pressable>
        </View>

        {/* Sección: Avisos y Notificaciones */}
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.card}>
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={22} color="#0B3A5D" />
              <View>
                <Text style={styles.rowText}>Avisos y promociones</Text>
                <Text style={styles.rowSubtext}>Promo nueva o por vencer de favoritos</Text>
              </View>
            </View>
            <Switch
              value={avisosActivos}
              onValueChange={setAvisosActivos}
              trackColor={{ false: '#D8E0E8', true: '#0B3A5D' }}
            />
          </View>
        </View>

        {/* Simulador de cambio de rol para probar vista de comercio */}
        <Text style={styles.sectionTitle}>Modo de Prueba (Cátedra)</Text>
        <Pressable
          style={styles.buttonSwitch}
          role="button"
          accessibilityLabel="Cambiar entre modo vecino y comercio"
          onPress={() => setRol(rol === 'vecino' ? 'comercio' : 'vecino')}
        >
          <Text style={styles.buttonSwitchText}>
            Cambiar a vista {rol === 'vecino' ? 'Comercio' : 'Vecino'}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0B3A5D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B3A5D',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 4,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  rowSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 50,
  },
  buttonSwitch: {
    backgroundColor: '#0B3A5D',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonSwitchText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});