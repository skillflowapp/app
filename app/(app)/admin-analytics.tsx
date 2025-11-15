import { AdminColors, AdminLayout } from '@/components/admin/AdminLayout';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function AdminAnalytics() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AdminLayout
        title="Analytics"
        showHeader
        showFooter
        showSidebar
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Analytics</ThemedText>
            <ThemedText style={styles.subtitle}>Track platform performance and metrics</ThemedText>
          </View>

          {/* Placeholder */}
          <View style={styles.placeholderContainer}>
            <Ionicons name="analytics" size={64} color={AdminColors.accent} style={{ opacity: 0.3 }} />
            <ThemedText style={styles.placeholderText}>Analytics content coming soon</ThemedText>
          </View>
        </ScrollView>
      </AdminLayout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: AdminColors.primary,
    marginBottom: 4,
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
});

