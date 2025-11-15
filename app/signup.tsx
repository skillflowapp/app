import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { router, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth, db } from '@/constants/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useSession } from '../context/AuthContext';

export default function SignupScreen() {
  const { session, isLoading: authLoading } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && session) {
      let targetDashboard = '/(app)/student-dashboard';
      if (session.role === 'admin') {
        targetDashboard = '/(app)/admin-dashboard';
      } else if (session.role === 'teacher') {
        targetDashboard = '/(app)/teacher-dashboard';
      }
      router.replace(targetDashboard);
    }
  }, [session, authLoading]);

  const handleSignup = () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please make sure your passwords match.");
      return;
    }
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        const nameFromEmail = email.split('@')[0];
        updateProfile(user, { displayName: nameFromEmail })
          .then(() => {
            // Create a document in Firestore
            const userDocRef = doc(db, 'profiles', user.uid);
            setDoc(userDocRef, { 
              bio: 'This is a default bio.', // Default bio
              displayName: nameFromEmail,
              email: user.email,
              role: role,
            }, { merge: true })
            .then(() => {
              // Sign out the user so they can log in again with the profile
              signOut(auth).then(() => {
                router.replace('/login');
              }).catch(signOutError => {
                console.error('Error signing out:', signOutError);
                router.replace('/login');
              });
            })
            .catch(error => {
              Alert.alert('Error creating profile', error.message);
            });
          })
          .catch(error => {
            Alert.alert('Error updating profile', error.message);
          });
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert(errorCode, errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGoogleSignup = () => {
    Alert.alert("Google Signup", "This feature is not yet implemented.");
  };

  const handleAppleSignup = () => {
    Alert.alert("Apple Signup", "This feature is not yet implemented.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled
      >
        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        </View>
        <View style={styles.formContainer}>
          <ThemedText style={styles.title}>Sign Up</ThemedText>
          <ThemedText style={styles.subtitle}>Create an account to get started.</ThemedText>

          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'student' && styles.selectedRole]}
              onPress={() => setRole('student')}
            >
              <ThemedText style={[styles.roleText, role === 'student' && styles.selectedRoleText]}>Student</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'teacher' && styles.selectedRole]}
              onPress={() => setRole('teacher')}
            >
              <ThemedText style={[styles.roleText, role === 'teacher' && styles.selectedRoleText]}>Teacher</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>EMAIL</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="user@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>PASSWORD</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="******"
              placeholderTextColor="#999"
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>CONFIRM PASSWORD</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="******"
              placeholderTextColor="#999"
              secureTextEntry
              onChangeText={setConfirmPassword}
              value={confirmPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.buttonText}>Sign up</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.socialSignupContainer}>
            <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleSignup}>
              <AntDesign name="google" size={20} color="white" />
              <ThemedText style={styles.socialButtonText}>Sign up with Google</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={handleAppleSignup}>
              <FontAwesome name="apple" size={20} color="white" />
              <ThemedText style={styles.socialButtonText}>Sign up with Apple</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <ThemedText style={styles.loginText}>Already have an account? Login!</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
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
    marginBottom: 24,
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedRole: {
    backgroundColor: Colors.light.primary,
  },
  roleText: {
    color: Colors.light.primary,
  },
  selectedRoleText: {
    color: 'white',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    color: Colors.light.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  socialSignupContainer: {
    width: '100%',
    marginTop: 10,
  },
  socialButton: {
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  socialButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
