// screens/UploadAvatarScreen.js
import React, { useState, useContext } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import api from "../utils/api";
import { AuthContext } from "../store/AuthContext";

export default function UploadAvatarScreen({ navigation }) {
  const { updateUser } = useContext(AuthContext);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant permission to access your photo library."
      );
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
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

  const handleSaveAvatar = async () => {
    if (!avatar) {
      Alert.alert("Error", "Please select an avatar first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", {
        uri: avatar.uri,
        name:
          avatar.fileName ||
          `avatar-${Date.now()}.${avatar.type.split("/")[1]}`,
        type: avatar.type,
      });

      const response = await api.post("/api/users/avatar/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newUserData = response.data.user;
      await updateUser(newUserData);
      Alert.alert("Success", "Avatar saved successfully!");
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
      <Text style={styles.title}>Upload from Gallery</Text>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text>No Avatar Selected</Text>
          </View>
        )}
      </View>
      <Button
        mode="outlined"
        onPress={handleChoosePhoto}
        style={styles.button}
        disabled={loading}
      >
        {avatar ? "Change Image" : "Choose from Gallery"}
      </Button>
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
  // Use same styles as before, or copy them here
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
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
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  button: { width: "100%", marginBottom: 10 },
  actionButton: { marginTop: 20, width: "100%" },
  loader: { marginTop: 20 },
});
