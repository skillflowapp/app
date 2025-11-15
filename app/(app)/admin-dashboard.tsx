import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { Stack, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Alert, BackHandler, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/constants/firebase';

export default function AdminDashboardScreen() {
  const { session } = useSession();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.replace('/login');
    }).catch((error) => {
      Alert.alert('Logout Error', error.message);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.profileIcon}>
          <Ionicons name="person-circle" size={40} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.welcomeTitle}>Welcome back, {session?.displayName || 'Admin'}!</ThemedText>
          <ThemedText style={styles.subtitle}>Oversee the platform and manage all users.</ThemedText>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/(app)/user-management')}>
            <Ionicons name="people" size={50} color={Colors.light.primary} />
            <ThemedText style={styles.cardTitle}>User Management</ThemedText>
            <ThemedText style={styles.cardSubtitle}>Manage users and roles</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="analytics" size={50} color={Colors.light.primary} />
            <ThemedText style={styles.cardTitle}>Analytics</ThemedText>
            <ThemedText style={styles.cardSubtitle}>View platform stats</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="settings" size={50} color={Colors.light.primary} />
            <ThemedText style={styles.cardTitle}>System Settings</ThemedText>
            <ThemedText style={styles.cardSubtitle}>Configure platform</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="shield-checkmark" size={50} color={Colors.light.primary} />
            <ThemedText style={styles.cardTitle}>Security</ThemedText>
            <ThemedText style={styles.cardSubtitle}>Monitor and secure</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Profile</ThemedText>
            <ThemedText style={styles.modalText}>Name: {session?.displayName || 'N/A'}</ThemedText>
            <ThemedText style={styles.modalText}>Username: {session?.email || 'N/A'}</ThemedText>
            <ThemedText style={styles.modalText}>Role: {session?.role || 'N/A'}</ThemedText>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <ThemedText style={styles.closeText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1', // Warm background color
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Profile icon in top-left
    padding: 16,
  },
  profileIcon: {
    padding: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  welcomeSection: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginTop: 10,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeText: {
    color: '#007bff',
    fontSize: 16,
  },
});
