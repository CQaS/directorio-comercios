// src/mocks/comercios.ts
import { Comercio, Rubro } from '../tipos';

export const MOCK_RUBROS: Rubro[] = [
  { id: 'todos', nombre: 'Todos', icono: 'grid-outline', color: '#0B5394', orden: 0 },
  { id: 'rub-ferreteria', nombre: 'Ferretería', icono: 'hammer-outline', color: '#7A5C3E', orden: 1 },
  { id: 'rub-gastronomia', nombre: 'Gastronomía', icono: 'restaurant-outline', color: '#E76F51', orden: 2 },
  { id: 'rub-indumentaria', nombre: 'Ropa', icono: 'shirt-outline', color: '#2A9D8F', orden: 3 },
];

export const MOCK_COMERCIOS: Comercio[] = [
  {
    id: 'com-118',
    nombre: 'Ferretería El Tornillo',
    rubroId: 'rub-ferreteria',
    descripcion: 'Ferretería de barrio con más de 40 años sobre 9 de Julio.',
    direccion: '9 de Julio 855',
    coordenadas: { latitud: -32.4835, longitud: -58.2312 },
    telefono: '3442-425566',
    whatsapp: '5493442425566',
    instagram: '@eltornillocdelu',
    imagenes: ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600'],
    videoUrl: null,
    horarios: [
      { dia: 1, abre: '08:00', cierra: '12:00' },
      { dia: 1, abre: '16:30', cierra: '20:30' },
    ],
    mediosDePago: ['efectivo', 'debito', 'transferencia'],
    puntaje: 4.6,
    cantidadResenas: 38,
    codigoQr: 'CCU:com-118',
    activo: true,
  },
];