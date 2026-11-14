import * as Haptics from "expo-haptics";

export async function exito() {
  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success
  )
}

export async function error() {
  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Error
  )
}

export async function aviso() {
  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Warning
  )
}