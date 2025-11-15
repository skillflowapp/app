import { AdminColors, AdminLayout } from '@/components/admin/AdminLayout';
import { ThemedText } from '@/components/themed-text';
import { auth } from '@/constants/firebase';
import { useSession } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function StudentDashboard() {
  const { session } = useSession();
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const studentNavigationItems = [
    { label: 'Home', icon: 'home', route: '/(app)/student-dashboard' },
    { label: 'Videos', icon: 'play-circle', route: '/(app)/student-dashboard' },
    { label: 'Documents', icon: 'document-text', route: '/(app)/student-dashboard' },
    { label: 'Community', icon: 'people', route: '/(app)/student-dashboard' },
    { label: 'Exams', icon: 'clipboard', route: '/(app)/student-dashboard' },
    { label: 'Games', icon: 'game-controller', route: '/(app)/student-dashboard' },
    { label: 'Settings', icon: 'settings', route: '/(app)/student-dashboard' },
  ];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.replace('/login');
      })
      .catch((error) => {
        Alert.alert('Logout Error', error.message);
      });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AdminLayout
        title="Student Dashboard"
        showHeader
        showFooter
        showSidebar
        brandSubtext="Student"
        navigationItems={studentNavigationItems}
        onProfilePress={() => setProfileModalVisible(true)}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeSection}>
            <ThemedText style={styles.welcomeTitle}>
              Welcome back, {session?.displayName || 'Student'}!
            </ThemedText>
            <ThemedText style={styles.subtitle}>Ready to continue your learning journey?</ThemedText>
          </View>

          <View style={styles.placeholderContainer}>
            <Ionicons name="book" size={64} color={AdminColors.accent} style={{ opacity: 0.3 }} />
            <ThemedText style={styles.placeholderText}>Student dashboard content coming soon</ThemedText>
          </View>
        </ScrollView>
      </AdminLayout>

      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Student Profile</ThemedText>
            <View style={styles.profileInfoContainer}>
              <ThemedText style={styles.infoLabel}>Name:</ThemedText>
              <ThemedText style={styles.infoValue}>{session?.displayName || 'N/A'}</ThemedText>

              <ThemedText style={styles.infoLabel}>Email:</ThemedText>
              <ThemedText style={styles.infoValue}>{session?.email || 'N/A'}</ThemedText>

              <ThemedText style={styles.infoLabel}>Role:</ThemedText>
              <ThemedText style={styles.infoValue}>{session?.role || 'N/A'}</ThemedText>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={18} color="#fff" />
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setProfileModalVisible(false)}
            >
              <ThemedText style={styles.closeText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: AdminColors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: AdminColors.textLight,
    fontWeight: '500',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  placeholderText: {
    fontSize: 14,
    color: AdminColors.textLight,
    fontWeight: '600',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: AdminColors.card,
    padding: 24,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AdminColors.primary,
    marginBottom: 20,
  },
  profileInfoContainer: {
    width: '100%',
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 12,
    color: AdminColors.textLight,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: AdminColors.text,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: AdminColors.background,
    borderRadius: 6,
  },
  logoutButton: {
    backgroundColor: AdminColors.danger,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeText: {
    color: AdminColors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
