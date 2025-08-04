import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import { AuthContext } from '../store/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, userToken } = useContext(AuthContext);
  const [minSplashPassed, setMinSplashPassed] = useState(false);

  // Wait for minimum 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashPassed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Show splash screen until both conditions are met
  if (isLoading || !minSplashPassed) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <Stack.Screen name="Home" component={HomeScreen} />
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