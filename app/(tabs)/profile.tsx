
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useSession } from '@/context/AuthContext';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/constants/firebase';

export default function ProfileScreen() {
  const { session, isLoading } = useSession();
  const [logoutLoading, setLogoutLoading] = React.useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {session?.email?.[0].toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText style={styles.email}>{session?.email}</ThemedText>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout} disabled={logoutLoading}>
        {logoutLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.buttonText}>Logout</ThemedText>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  email: {
    fontSize: 18,
    color: '#333',
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
