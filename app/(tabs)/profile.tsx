import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useSession } from '@/context/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/constants/firebase';
import { FontAwesome } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { session, isLoading } = useSession();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Profile</ThemedText>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <FontAwesome name="cog" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.profileCard}>
        <Image
          source={{ uri: session?.photoURL || 'https://www.gravatar.com/avatar/' }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <ThemedText style={styles.email}>{session?.email}</ThemedText>
          <ThemedText style={styles.name}>{session?.displayName}</ThemedText>
          <ThemedText style={styles.bio}>{session?.bio}</ThemedText>
        </View>
        <ThemedText style={styles.userId}>ID: SF-1234</ThemedText>
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
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  profileInfo: {
    alignItems: 'center',
  },
  email: {
    fontSize: 16,
    color: Colors.light.text,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  userId: {
    fontSize: 12,
    color: '#aaa',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '90%',
    alignItems: 'center',
    marginTop: 30,
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
