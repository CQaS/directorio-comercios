export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ErrorApi extends Error {
  constructor(mensaje: string, public codigo?: string, public estado?: number) {
    super(mensaje)
  }
}