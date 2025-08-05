import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AuthContext } from '../store/AuthContext';

export default function HomeScreen() {
  const { logout, user } = useContext(AuthContext);

  const signOut = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome, {user?.first_name}!</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Nickname: {user?.nickname}</Text>
      {/* Add more fields as needed */}
      <Button mode="outlined" onPress={signOut} style={{ marginTop: 32 }}>Logout</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }
});