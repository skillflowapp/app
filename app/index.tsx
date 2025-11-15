import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, ButtonStyles, Colors } from '../constants/theme';
import { router } from 'expo-router';
import { useSession } from '../context/AuthContext';

const WelcomeScreen = () => {
  const { session, isLoading } = useSession();
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('Index useEffect: isLoading:', isLoading, 'session:', session ? { uid: session.uid, role: session.role } : null, 'hasRedirected:', hasRedirected.current);
    if (isLoading || hasRedirected.current) return;
    if (session) {
      let targetDashboard = '/(app)/student-dashboard';
      console.log('Session role:', session.role);
      if (session.role === 'admin') {
        targetDashboard = '/(app)/admin-dashboard';
      } else if (session.role === 'teacher') {
        targetDashboard = '/(app)/teacher-dashboard';
      }
      console.log('Redirecting to:', targetDashboard);
      router.replace(targetDashboard);
      hasRedirected.current = true;
    }
  }, [session?.uid, session?.role, isLoading]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#38BDF8']} // Violet to Blue gradient
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.gifContainer}>
            <Image source={require('../assets/images/welcome.gif')} style={styles.gif} />
          </View>
          <Text style={styles.logo}>SkillFlow</Text>
          <Text style={styles.tagline}>Learn · Share · Earn</Text>

          <TouchableOpacity
            style={[ButtonStyles.primary, styles.button]} onPress={() => router.push('/signup')}>
            <Text style={ButtonStyles.text}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[ButtonStyles.secondary, styles.button]} onPress={() => router.push('/login')}>
            <Text style={ButtonStyles.secondaryText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Empowering Students and Creators Globally</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    alignItems: 'center',
  },
  gifContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 125,
    marginBottom: 20,
  },
  gif: {
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  logo: {
    fontFamily: Fonts.family.primary,
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tagline: {
    fontFamily: Fonts.family.sans,
    fontSize: Fonts.sizes.subtitle,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 48,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    bottom: -150,
    fontFamily: Fonts.family.sans,
    fontSize: Fonts.sizes.caption,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
