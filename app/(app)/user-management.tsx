import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/constants/firebase';
import { useSession } from '@/context/AuthContext';
import { Stack, router } from 'expo-router';

export default function UserManagement() {
  const { session } = useSession();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'profiles'));
        const userList: any[] = [];
        querySnapshot.forEach((doc) => {
          userList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(userList);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const promoteToAdmin = async (userId: string) => {
    console.log('Promoting user to admin:', userId);
    try {
      const userDoc = doc(db, 'profiles', userId);
      console.log('Updating doc:', userDoc.path);
      await updateDoc(userDoc, { role: 'admin' });
      console.log('Update successful');
      Alert.alert('Success', 'User promoted to admin');
      // Refresh users
      setUsers(users.map(user => user.id === userId ? { ...user, role: 'admin' } : user));
    } catch (error) {
      console.error('Error promoting user:', error);
      Alert.alert('Error', `Failed to promote user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const suspendUser = async (userId: string) => {
    console.log('Suspending user:', userId);
    try {
      const userDoc = doc(db, 'profiles', userId);
      console.log('Updating doc for suspend:', userDoc.path);
      await updateDoc(userDoc, { suspended: true });
      console.log('Suspend update successful');
      Alert.alert('Success', 'User suspended');
      setUsers(users.map(user => user.id === userId ? { ...user, suspended: true } : user));
    } catch (error) {
      console.error('Error suspending user:', error);
      Alert.alert('Error', `Failed to suspend user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const unsuspendUser = async (userId: string) => {
    console.log('Unsuspending user:', userId);
    try {
      const userDoc = doc(db, 'profiles', userId);
      console.log('Updating doc for unsuspend:', userDoc.path);
      await updateDoc(userDoc, { suspended: false });
      console.log('Unsuspend update successful');
      Alert.alert('Success', 'User unsuspended');
      setUsers(users.map(user => user.id === userId ? { ...user, suspended: false } : user));
    } catch (error) {
      console.error('Error unsuspending user:', error);
      Alert.alert('Error', `Failed to unsuspend user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteUser = async (userId: string) => {
    console.log('Deleting user:', userId);
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
              console.log('Deleting doc:', userDoc.path);
              await deleteDoc(userDoc);
              console.log('Delete successful');
              Alert.alert('Success', 'User deleted');
              setUsers(users.filter(user => user.id !== userId));
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: any }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <ThemedText style={styles.userName}>{item.displayName || 'N/A'}</ThemedText>
        <ThemedText style={styles.userEmail}>{item.email || 'N/A'}</ThemedText>
        <ThemedText style={styles.userRole}>Role: {item.role || 'student'}</ThemedText>
        {item.suspended && <ThemedText style={styles.suspendedText}>Suspended</ThemedText>}
      </View>
      <View style={styles.actions}>
        {item.role !== 'admin' && item.id !== session?.uid && (
          <TouchableOpacity style={[styles.actionButton, styles.promoteButton]} onPress={() => promoteToAdmin(item.id)}>
            <Ionicons name="arrow-up-circle" size={24} color="#fff" />
            <ThemedText style={styles.actionText}>Promote to Admin</ThemedText>
          </TouchableOpacity>
        )}
        {item.id !== session?.uid && (
          <View style={styles.secondaryActions}>
            {!item.suspended ? (
              <TouchableOpacity style={[styles.secondaryButton, styles.suspendButton]} onPress={() => suspendUser(item.id)}>
                <Ionicons name="pause-circle" size={20} color="#fff" />
                <ThemedText style={styles.secondaryText}>Suspend</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.secondaryButton, styles.unsuspendButton]} onPress={() => unsuspendUser(item.id)}>
                <Ionicons name="play-circle" size={20} color="#fff" />
                <ThemedText style={styles.secondaryText}>Unsuspend</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.secondaryButton, styles.deleteButton]} onPress={() => deleteUser(item.id)}>
              <Ionicons name="trash" size={20} color="#fff" />
              <ThemedText style={styles.secondaryText}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>User Management</ThemedText>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1', // Warm background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    flex: 1,
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  suspendedText: {
    fontSize: 12,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  actions: {
    alignItems: 'center',
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
    minWidth: 120,
  },
  suspendButton: {
    backgroundColor: '#ff8800',
  },
  unsuspendButton: {
    backgroundColor: '#00aa00',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  promoteButton: {
    backgroundColor: Colors.light.primary,
  },
  promoteText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  secondaryButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    marginHorizontal: 2,
  },
  secondaryText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 3,
  },
});