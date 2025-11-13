import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { router, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import { useSession, UserProfile } from '@/context/AuthContext';
import { auth, db } from '@/constants/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SettingsScreen() {
  const { session, setSession } = useSession();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setDisplayName(session.displayName || '');
      setBio(session.bio || '');
    }
  }, [session]);

  const handleSave = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You are not logged in.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });

      const docRef = doc(db, 'profiles', auth.currentUser.uid);
      await setDoc(docRef, { bio: bio }, { merge: true });

      if (session) {
        const updatedSession: UserProfile = { ...session, displayName, bio };
        setSession(updatedSession);
      }

      Alert.alert(
        'Profile Updated',
        'Your name and bio have been updated.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Settings</ThemedText>
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.label}>Name</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <ThemedText style={styles.label}>Bio</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Tell us about yourself"
          value={bio}
          onChangeText={setBio}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.buttonText}>Save Changes</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  backButton: {
    zIndex: 1,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: -24, // Adjust for the back button
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
