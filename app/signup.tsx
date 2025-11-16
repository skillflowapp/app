import { ThemedText } from '@/components/themed-text';
import { COUNTRY_CODES, CountryCode } from '@/constants/countryCodes';
import { auth, db } from '@/constants/firebase';
import { Colors } from '@/constants/theme';
import { AntDesign } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../context/AuthContext';

export default function SignupScreen() {
  const { session, isLoading: authLoading } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);

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
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please make sure your passwords match.");
      return;
    }
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        updateProfile(user, { displayName: name })
          .then(() => {
            // Create a document in Firestore
            const userDocRef = doc(db, 'profiles', user.uid);
            setDoc(userDocRef, { 
              bio: 'This is a default bio.',
              displayName: name,
              email: user.email,
              phone: `${selectedCountry.dialCode}${phone}`,
              role: role,
            }, { merge: true })
            .then(() => {
              // Show success notification and redirect to appropriate dashboard
              Alert.alert('Success! ✓', 'Account created successfully. Welcome to SkillFlow!', [
                {
                  text: 'Continue',
                  onPress: () => {
                    const targetDashboard = role === 'teacher' ? '/(app)/teacher-dashboard' : '/(app)/student-dashboard';
                    router.replace(targetDashboard);
                  }
                }
              ]);
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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
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
            <ThemedText style={styles.label}>FULL NAME</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#999"
              autoCapitalize="words"
              onChangeText={setName}
              value={name}
            />
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
            <ThemedText style={styles.label}>PHONE NUMBER</ThemedText>
            <View style={styles.phoneInputWrapper}>
              <TouchableOpacity
                style={styles.countrySelector}
                onPress={() => setShowCountryModal(true)}
              >
                <ThemedText style={styles.countryFlag}>{selectedCountry.flag}</ThemedText>
                <ThemedText style={styles.countryCode}>{selectedCountry.dialCode}</ThemedText>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="7xxxxxxxx"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                onChangeText={setPhone}
                value={phone}
              />
            </View>
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

          <TouchableOpacity onPress={() => router.push('/login')}>
            <ThemedText style={styles.loginText}>Already have an account? Login!</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Country Code Modal */}
        <Modal
          visible={showCountryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCountryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Select Country</ThemedText>
                <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                  <AntDesign name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={COUNTRY_CODES}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => {
                      setSelectedCountry(item);
                      setShowCountryModal(false);
                    }}
                  >
                    <ThemedText style={styles.countryItemFlag}>{item.flag}</ThemedText>
                    <View style={styles.countryItemInfo}>
                      <ThemedText style={styles.countryItemName}>{item.name}</ThemedText>
                      <ThemedText style={styles.countryItemCode}>{item.dialCode}</ThemedText>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
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
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 4,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  countryItemFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  countryItemInfo: {
    flex: 1,
  },
  countryItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  countryItemCode: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
