import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useSession } from '@/context/AuthContext';
import { router } from 'expo-router';

export default function AppLayout() {
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/login');
    }
  }, [session, isLoading]);

  if (isLoading) {
    return null; // Or a loading indicator
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <Stack>
      <Stack.Screen name="student-dashboard" options={{ title: 'Student Dashboard' }} />
      <Stack.Screen name="teacher-dashboard" options={{ title: 'Teacher Dashboard' }} />
      <Stack.Screen name="admin-dashboard" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="user-management" options={{ title: 'User Management' }} />
    </Stack>
  );
}
