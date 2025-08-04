import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native"; // Install: npm install lottie-react-native

const SplashScreen = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const lottieRef = useRef(null);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();

    // Play Lottie animation
    lottieRef.current?.play();
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated Background Gradient */}
      <Animated.View style={[styles.background, { opacity: fadeAnim }]} />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >

        {/* App Name */}
        <Image
          source={require("../assets/app-name1.png")}
          style={styles.appName}
          resizeMode="contain"
        />
        
        {/* Lottie Animation */}
        <View style={styles.lottieContainer}>
          <LottieView
            ref={lottieRef}
            source={require("../assets/ai-wave.json")} // Replace with your Lottie file
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: fadeAnim }]}>
        © {new Date().getFullYear()} HIPO
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A1A", // Deep space blue
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 26, 46, 0.7)", // Semi-transparent overlay
  },
  content: {
    alignItems: "center",
    padding: 20,
  },
  lottieContainer: {
    width: 300,
    height: 300,
    marginBottom: 40,
  },
  lottie: {
    flex: 1,
  },
  appName: {
    width: 300,
    height: 240,
    marginBottom: 40,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
  },
});

export default SplashScreen;
