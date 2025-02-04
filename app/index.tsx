import { Text, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";



const Reticle = () => {
  return (
    <View
      style={{
        // height: 576, // This defines the component height
        width: "100%", // Give it a width so it's visible
        aspectRatio: 1.25,
        backgroundColor: "#0000FF",
        marginBottom: 10,
      }}
    />
  );
};


const Controls = () => {
  return (
    <View
      style={{
        flex: 1, // Take up the remaining space
        width: 720,
        backgroundColor: "#00FF00",
      }}
    />
  );
};



export default function Index() {
  return (
    <SafeAreaView>
      <PaperProvider>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
          }}
        >
          {/* <Text>Edit app/index.tsx to edit this screen.</Text> */}
          <Reticle />
          <Controls />
        </View>
      </PaperProvider>
    </SafeAreaView>
  );
}
