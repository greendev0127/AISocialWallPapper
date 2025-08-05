import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import api from "../utils/api";
import { AuthContext } from "../store/AuthContext";

// Define your style and filter options
const artStyles = [
  { key: "realistic", label: "Realistic" },
  { key: "anime", label: "Anime" },
  { key: "cartoon", label: "Cartoon" },
  { key: "pixelart", label: "Pixel Art" },
];

const artisticFilters = [
  { key: "vibrant", label: "Vibrant Colors" },
  { key: "pastel", label: "Pastel Palette" },
  { key: "dark", label: "Dark & Moody" },
  { key: "cinematic", label: "Cinematic Lighting" },
  { key: "high_detail", label: "High Detail" },
  { key: "fantasy", label: "Fantasy" },
];

export default function GenerateAvatarFlowScreen({ navigation }) {
  const { updateUser } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [generatedAvatar, setGeneratedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleFilter = (filterKey) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.includes(filterKey)
        ? prevFilters.filter((key) => key !== filterKey)
        : [...prevFilters, filterKey]
    );
  };

  const handleGenerate = async () => {
    if (!prompt || !selectedStyle) {
      Alert.alert("Error", "Please provide a prompt and select a style.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/users/avatar/generate", {
        prompt,
        artStyle: selectedStyle,
        artisticFilters: selectedFilters,
      });

      const imageUrl = response.data.image_url;
      setGeneratedAvatar({ uri: imageUrl });
      setStep(3); // Move to the confirmation step
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
    setLoading(true);
    try {
      const response = await api.post("/api/users/avatar/save-generated", {
        imageUrl: generatedAvatar.uri,
      });
      const newUserData = response.data.user;
      await updateUser(newUserData);
      Alert.alert("Success", "Avatar saved successfully!");
      navigation.navigate("Home");
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>Step 1: Describe your avatar</Text>
            <Text style={styles.description}>
              Start with a simple idea, like "a cartoon wizard" or "a space
              marine."
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 'a cartoon wizard with a cat on his shoulder'"
              value={prompt}
              onChangeText={setPrompt}
            />
            <Button
              mode="contained"
              onPress={() => setStep(2)}
              style={styles.button}
              disabled={!prompt.trim()}
            >
              Continue
            </Button>
          </>
        );
      case 2:
        return (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>Step 2: Choose your style</Text>
            <Text style={styles.description}>
              Pick a main art style for your avatar.
            </Text>
            <View style={styles.styleContainer}>
              {artStyles.map((styleOption) => (
                <Button
                  key={styleOption.key}
                  mode={
                    selectedStyle === styleOption.key ? "contained" : "outlined"
                  }
                  onPress={() => setSelectedStyle(styleOption.key)}
                  style={styles.styleButton}
                >
                  {styleOption.label}
                </Button>
              ))}
            </View>
            <Text style={styles.title}>Optional: Artistic filters</Text>
            <Text style={styles.description}>
              Add extra details to enhance the look.
            </Text>
            <View style={styles.filterContainer}>
              {artisticFilters.map((filterOption) => (
                <TouchableOpacity
                  key={filterOption.key}
                  style={[
                    styles.filterButton,
                    selectedFilters.includes(filterOption.key) &&
                      styles.filterButtonSelected,
                  ]}
                  onPress={() => toggleFilter(filterOption.key)}
                >
                  <Text style={styles.filterText}>{filterOption.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              mode="contained"
              onPress={handleGenerate}
              style={styles.button}
              disabled={!selectedStyle || loading}
            >
              Generate Avatar
            </Button>
          </ScrollView>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>Your AI-Generated Avatar</Text>
            <View style={styles.avatarContainer}>
              {generatedAvatar ? (
                <Image
                  source={{ uri: generatedAvatar.uri }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text>Generating...</Text>
                </View>
              )}
            </View>
            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={handleSaveAvatar}
                style={styles.button}
                disabled={loading || !generatedAvatar}
              >
                Save Avatar
              </Button>
              <Button
                mode="outlined"
                onPress={() => setStep(1)} // Go back to start
                style={styles.button}
                disabled={loading}
              >
                Regenerate
              </Button>
            </View>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        renderStep()
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
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
  styleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  styleButton: {
    flexBasis: "48%",
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
  },
  filterButtonSelected: {
    backgroundColor: "#6200ee",
    borderColor: "#6200ee",
  },
  filterText: {
    color: "#666",
  },
  buttonGroup: {
    width: "100%",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    marginBottom: 10,
  },
  actionButton: {
    marginTop: 20,
    width: "100%",
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
  loader: {
    marginTop: 20,
  },
});
