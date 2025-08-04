import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

import api from "../utils/api";
import { AuthContext } from "../store/AuthContext";

export default function NewCharacter({ navigation }) {
  const { updateUser } = useContext(AuthContext);

  const [avatar, setAvatar] = useState(null); // This will hold the image object
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false); // New state to track if the avatar is AI-generated

  const handleChoosePhoto = async () => {
    // Reset state for new action
    setAvatar(null);
    setIsGenerated(false);

    // Request permissions first (required for Android 13+)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant permission to access your photo library to choose an avatar."
      );
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // You can allow editing if you want
        aspect: [1, 1], // Enforce square aspect ratio
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        setAvatar({
          uri: selectedAsset.uri,
          type: selectedAsset.mimeType,
          fileName: selectedAsset.fileName,
        });
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image.");
    }
  };

  const handleGenerateAvatar = async () => {
    if (!prompt) {
      Alert.alert("Error", "Please enter a prompt for the AI.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/users/avatar/generate", { prompt });

      const imageUrl = response.data.image_url;
      setAvatar({ uri: imageUrl }); // Store the URL for preview
      setIsGenerated(true); // Mark as generated
      Alert.alert(
        "Success",
        "AI Avatar generated! Click 'Save Avatar' to confirm."
      );
    } catch (error) {
      console.error(
        "AI generation failed:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to generate AI avatar."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatar) {
      Alert.alert("Error", "No avatar to save.");
      return;
    }
    setLoading(true);
    try {
      let response;
      if (isGenerated) {
        response = await api.post("/api/users/avatar/save-generated", {
          imageUrl: avatar.uri,
        });
      } else {
        const formData = new FormData();
        formData.append("avatar", {
          uri: avatar.uri,
          name:
            avatar.fileName ||
            `avatar-${Date.now()}.${avatar.type.split("/")[1]}`,
          type: avatar.type,
        });
        response = await api.post("/api/users/avatar/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      const newUserData = response.data.user; // Update the user state globally
      await updateUser(newUserData);
      Alert.alert("Success", "Avatar saved successfully!"); // Navigate to the Home screen
    } catch (error) {
      console.error("Save failed:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to save avatar."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Avatar</Text>

      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text>No Avatar Selected</Text>
          </View>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Describe your desired avatar (e.g., 'a cartoon wizard')"
        value={prompt}
        onChangeText={setPrompt}
      />

      <View style={styles.buttonGroup}>
        <Button
          mode="contained"
          onPress={handleGenerateAvatar}
          style={styles.button}
          disabled={loading}
        >
          {isGenerated ? "Regenerate Avatar" : "Generate Avatar"}
        </Button>
        <Button
          mode="outlined"
          onPress={handleChoosePhoto}
          style={styles.button}
          disabled={loading}
        >
          Upload from Gallery
        </Button>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <Button
          mode="contained"
          onPress={handleSaveAvatar}
          style={styles.actionButton}
          disabled={!avatar}
        >
          Save Avatar
        </Button>
      )}
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
    marginBottom: 20,
  },
  avatarContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  buttonGroup: {
    width: "100%",
    marginBottom: 20,
  },
  button: {
    marginBottom: 10,
  },
  actionButton: {
    marginTop: 20,
    width: "100%",
  },
  loader: {
    marginTop: 20,
  },
});
