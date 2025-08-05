// screens/NewCharacterFlowScreen.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";

export default function NewCharacterFlowScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Avatar</Text>
      <Text style={styles.subtitle}>
        Choose an option to create your profile picture.
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("UploadAvatar")}
        style={styles.button}
      >
        Upload from Gallery
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate("GenerateAvatar")}
        style={styles.button}
      >
        Generate with AI
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "100%",
    marginBottom: 15,
  },
});
