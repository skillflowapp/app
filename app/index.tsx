import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, ButtonStyles, Colors } from '../constants/theme';
import { router } from 'expo-router';

const WelcomeScreen = () => {
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
    fontWeight: Fonts.weights.bold,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tagline: {
    fontFamily: Fonts.family.sans,
    fontSize: Fonts.sizes.subtitle,
    fontWeight: Fonts.weights.medium,
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
