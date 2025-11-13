import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/constants/firebase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        // Signed up 
        const user = userCredential.user;
        router.replace('/(tabs)');
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
});
