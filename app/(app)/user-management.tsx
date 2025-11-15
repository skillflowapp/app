import { AdminColors, AdminLayout } from '@/components/admin/AdminLayout';
import { ThemedText } from '@/components/themed-text';
import { db } from '@/constants/firebase';
import { useSession } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function UserManagement() {
  const { session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'profiles'));
      const userList: any[] = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const userDoc = doc(db, 'profiles', userId);
      await updateDoc(userDoc, { role: 'admin' });
      Alert.alert('Success', 'User promoted to admin');
      setUsers(users.map(user => user.id === userId ? { ...user, role: 'admin' } : user));
    } catch (error) {
      Alert.alert('Error', `Failed to promote user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      const userDoc = doc(db, 'profiles', userId);
      await updateDoc(userDoc, { suspended: true });
      Alert.alert('Success', 'User suspended');
      setUsers(users.map(user => user.id === userId ? { ...user, suspended: true } : user));
    } catch (error) {
      Alert.alert('Error', `Failed to suspend user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const unsuspendUser = async (userId: string) => {
    try {
      const userDoc = doc(db, 'profiles', userId);
      await updateDoc(userDoc, { suspended: false });
      Alert.alert('Success', 'User unsuspended');
      setUsers(users.map(user => user.id === userId ? { ...user, suspended: false } : user));
    } catch (error) {
      Alert.alert('Error', `Failed to unsuspend user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteUser = async (userId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const userDoc = doc(db, 'profiles', userId);
              await deleteDoc(userDoc);
              Alert.alert('Success', 'User deleted');
              setUsers(users.filter(user => user.id !== userId));
            } catch (error) {
              Alert.alert('Error', `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={[styles.userAvatar, { backgroundColor: `${AdminColors.accent}20` }]}>
          <Ionicons name="person" size={24} color={AdminColors.accent} />
        </View>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>{item.displayName || 'Unknown'}</ThemedText>
          <ThemedText style={styles.userEmail}>{item.email || 'N/A'}</ThemedText>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <ThemedText style={styles.roleBadgeText}>{item.role || 'student'}</ThemedText>
        </View>
      </View>

      {item.suspended && (
        <View style={styles.suspendedBanner}>
          <Ionicons name="alert-circle" size={16} color={AdminColors.danger} />
          <ThemedText style={styles.suspendedText}>Suspended</ThemedText>
        </View>
      )}

      <View style={styles.userActions}>
        {item.role !== 'admin' && item.id !== session?.uid && (
          <TouchableOpacity
            style={[styles.actionButton, styles.promoteBtn]}
            onPress={() => promoteToAdmin(item.id)}
          >
            <Ionicons name="arrow-up-circle" size={18} color="#ffffff" />
            <ThemedText style={styles.actionText}>Promote</ThemedText>
          </TouchableOpacity>
        )}
        {item.id !== session?.uid && (
          <>
            {!item.suspended ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.suspendBtn]}
                onPress={() => suspendUser(item.id)}
              >
                <Ionicons name="pause-circle" size={18} color="#ffffff" />
                <ThemedText style={styles.actionText}>Suspend</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.unsuspendBtn]}
                onPress={() => unsuspendUser(item.id)}
              >
                <Ionicons name="play-circle" size={18} color="#ffffff" />
                <ThemedText style={styles.actionText}>Unsuspend</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteBtn]}
              onPress={() => deleteUser(item.id)}
            >
              <Ionicons name="trash" size={18} color="#ffffff" />
              <ThemedText style={styles.actionText}>Delete</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AdminLayout
        title="User Management"
        showHeader
        showFooter
        showSidebar
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>User Management</ThemedText>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{users.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Total Users</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{users.filter(u => u.role === 'admin').length}</ThemedText>
                <ThemedText style={styles.statLabel}>Admins</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{users.filter(u => u.suspended).length}</ThemedText>
                <ThemedText style={styles.statLabel}>Suspended</ThemedText>
              </View>
            </View>
          </View>

          {loading ? (
            <ThemedText style={styles.loadingText}>Loading users...</ThemedText>
          ) : users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={64} color={AdminColors.accent} style={{ opacity: 0.3 }} />
              <ThemedText style={styles.emptyText}>No users found</ThemedText>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderUser}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </AdminLayout>
    </>
  );
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return AdminColors.danger;
    case 'teacher':
      return AdminColors.accentLight;
    case 'student':
    default:
      return AdminColors.accent;
  }
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: AdminColors.primary,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: AdminColors.card,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: AdminColors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: AdminColors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: AdminColors.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  userCard: {
    backgroundColor: AdminColors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.primary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 11,
    color: AdminColors.textLight,
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  suspendedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${AdminColors.danger}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  suspendedText: {
    fontSize: 12,
    color: AdminColors.danger,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
  },
  promoteBtn: {
    backgroundColor: AdminColors.primary,
  },
  suspendBtn: {
    backgroundColor: AdminColors.warning,
  },
  unsuspendBtn: {
    backgroundColor: AdminColors.success,
  },
  deleteBtn: {
    backgroundColor: AdminColors.danger,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: AdminColors.border,
    marginVertical: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: AdminColors.textLight,
    fontSize: 14,
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: AdminColors.textLight,
    fontWeight: '600',
    marginTop: 12,
  },
});