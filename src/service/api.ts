import { API_URL } from "./configuracionApi";

export { API_URL };

export class ErrorApi extends Error {
  constructor(mensaje: string, public codigo?: string, public estado?: number) {
    super(mensaje)
  }
}