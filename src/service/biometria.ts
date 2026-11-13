import * as LocalAuthentication from "expo-local-authentication"

export async function hayBiometria() {
    return (
        (await LocalAuthentication.hasHardwareAsync()) &&
        (await LocalAuthentication.isEnrolledAsync())
    )
}

export async function pedirBiometria(mensaje: string) {
    const r = await LocalAuthentication.authenticateAsync({
        promptMessage: mensaje,
        cancelLabel: "Cancelar",
    })
    return r.success
}