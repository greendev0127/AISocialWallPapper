// AppNavigator.js
import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import { AuthContext } from "../store/AuthContext";

import NewCharacterFlowScreen from "../screens/NewCharacterFlowScreen"
import UploadAvatarScreen from  "../screens/UploadAvatarScreen"
import GenerateAvatarFlowScreen from "../screens/GenerateAvatarFlowScreen"

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, user, userToken } = useContext(AuthContext);
  const [minSplashPassed, setMinSplashPassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashPassed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !minSplashPassed) {
    return <SplashScreen />;
  }

  console.log(user)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          user?.avatar_url ? (
            <Stack.Screen name="Home" component={HomeScreen} />
          ) : (
            // If user has no avatar, start the new character creation flow
            <>
              <Stack.Screen
                name="NewCharacterFlow"
                component={NewCharacterFlowScreen}
              />
              <Stack.Screen
                name="UploadAvatar"
                component={UploadAvatarScreen}
              />
              <Stack.Screen
                name="GenerateAvatar"
                component={GenerateAvatarFlowScreen}
              />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
