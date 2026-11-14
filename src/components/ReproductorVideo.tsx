import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, View } from "react-native";

interface Props {
  urlVideo: string;
}

export function ReproductorVideo({ urlVideo }: Props) {
  const player = useVideoPlayer(urlVideo, (player) => {
    player.loop = false;
  });

  return (
    <View style={styles.contenedor}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls // Controles de reproducción a la vista obligatorios
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 10,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
