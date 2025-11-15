import { AdminColors, AdminLayout } from '@/components/admin/AdminLayout';
import { ThemedText } from '@/components/themed-text';
import { auth } from '@/constants/firebase';
import { useSession } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function AdminDashboardScreen() {
  const { session } = useSession();
  const [profileModalVisible, setProfileModalVisible] = useState(false);

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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AdminLayout
        title="Admin Dashboard"
        showHeader
        showFooter
        showSidebar
        onProfilePress={() => setProfileModalVisible(true)}
      >
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <ThemedText style={styles.welcomeTitle}>
              Welcome back, {session?.displayName || 'Admin'}!
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Oversee the platform and manage all resources.
            </ThemedText>
          </View>

          {/* Placeholder for dashboard content */}
          <View style={styles.placeholderContainer}>
            <Ionicons name="construct" size={64} color={AdminColors.accent} style={{ opacity: 0.3 }} />
            <ThemedText style={styles.placeholderText}>Dashboard content coming soon</ThemedText>
          </View>
        </View>
      </AdminLayout>

      {/* Profile Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Admin Profile</ThemedText>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Ionicons name="close" size={28} color={AdminColors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={80} color={AdminColors.accent} />
              </View>
              <ThemedText style={styles.profileName}>{session?.displayName || 'Admin User'}</ThemedText>
              <ThemedText style={styles.profileEmail}>{session?.email || 'admin@skillflow.com'}</ThemedText>
              <View style={styles.profileBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
                <ThemedText style={styles.badgeText}>Administrator</ThemedText>
              </View>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Role</ThemedText>
                <ThemedText style={styles.detailValue}>{session?.role || 'N/A'}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Bio</ThemedText>
                <ThemedText style={styles.detailValue}>{session?.bio || 'No bio set'}</ThemedText>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.editButton]}
                onPress={() => {
                  setProfileModalVisible(false);
                  router.push('/settings' as any);
                }}
              >
                <Ionicons name="pencil" size={20} color="#ffffff" />
                <ThemedText style={styles.buttonText}>Edit Profile</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutButton]}
                onPress={() => {
                  setProfileModalVisible(false);
                  handleLogout();
                }}
              >
                <Ionicons name="log-out" size={20} color="#ffffff" />
                <ThemedText style={styles.buttonText}>Logout</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: AdminColors.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: AdminColors.textLight,
    fontWeight: '500',
  },
  placeholderContainer: {
    flex: 1,
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: AdminColors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: AdminColors.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: AdminColors.textLight,
    marginBottom: 12,
    fontWeight: '500',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AdminColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileDetails: {
    backgroundColor: AdminColors.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: AdminColors.textLight,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: AdminColors.primary,
    fontWeight: '600',
  },
  modalActions: {
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  editButton: {
    backgroundColor: AdminColors.accent,
  },
  logoutButton: {
    backgroundColor: AdminColors.danger,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
