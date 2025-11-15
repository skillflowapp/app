import { ThemedText } from '@/components/themed-text';
import { router, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Alert, BackHandler, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/constants/firebase';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeacherDashboard() {
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
          <ThemedText style={styles.welcomeTitle}>Welcome back, {session?.displayName || 'Teacher'}!</ThemedText>
          <ThemedText style={styles.subtitle}>Manage your classes and engage with students.</ThemedText>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="school" size={50} color={Colors.light.primary} />
            <ThemedText style={styles.cardTitle}>My Classes</ThemedText>
            <ThemedText style={styles.cardSubtitle}>View and manage courses</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="people" size={50} color={Colors.light.primary} />
            <ThemedText style={styles.cardTitle}>Students</ThemedText>
            <ThemedText style={styles.cardSubtitle}>Monitor student progress</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="document-text" size={50} color={Colors.light.primary} />
            <ThemedText style={styles.cardTitle}>Assignments</ThemedText>
            <ThemedText style={styles.cardSubtitle}>Create and grade tasks</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="chatbubbles" size={50} color={Colors.light.primary} />
            <ThemedText style={styles.cardTitle}>Communications</ThemedText>
            <ThemedText style={styles.cardSubtitle}>Connect with students</ThemedText>
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
    paddingTop: 10,
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
