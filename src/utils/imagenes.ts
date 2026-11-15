import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export async function seleccionarImagenDeGaleria(): Promise<string | null> {
  const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permiso.granted) {
    Alert.alert(
      "Permiso denegado",
      "Necesitamos permisos para acceder a tus fotos.",
    );
    return null;
  }

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
    return resultado.assets[0].uri;
  }

  return null;
}
