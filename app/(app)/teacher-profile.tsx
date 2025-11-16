import { AdminColors, AdminLayout } from '@/components/admin/AdminLayout';
import { ThemedText } from '@/components/themed-text';
import { auth, db } from '@/constants/firebase';
import { useSession } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    updateProfile,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    BackHandler,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TeacherProfile() {
  const { session, refreshProfile } = useSession();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(session?.displayName || '');
  const [email, setEmail] = useState(session?.email || '');
  const [bio, setBio] = useState(session?.bio || '');
  const [department, setDepartment] = useState(session?.department || '');
  const [phone, setPhone] = useState(session?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const teacherNavigationItems = [
    { label: 'Class', icon: 'school', route: '/(app)/teacher-dashboard' },
    { label: 'Examination', icon: 'clipboard', route: '/(app)/teacher-dashboard' },
    { label: 'Video', icon: 'play-circle', route: '/(app)/teacher-dashboard' },
    { label: 'Upload', icon: 'cloud-upload', route: '/(app)/teacher-dashboard' },
    { label: 'Profile', icon: 'person', route: '/(app)/teacher-profile' },
  ];

  // Update state when session changes
  useEffect(() => {
    if (session) {
      setName(session.displayName || '');
      setEmail(session.email || '');
      setBio(session.bio || '');
      setDepartment(session?.department || '');
      setPhone(session?.phone || '');
    }
  }, [session]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // Update Firestore with all teacher info
        const docRef = doc(db, 'profiles', auth.currentUser.uid);
        await updateDoc(docRef, {
          displayName: name,
          bio: bio,
          department: department,
          phone: phone,
        });

        // Refresh profile to trigger real-time updates
        await refreshProfile();
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Current password is required');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'New password is required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser && session?.email) {
        // Re-authenticate user
        const credential = EmailAuthProvider.credential(session.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);

        // Update password
        await updatePassword(auth.currentUser, newPassword);

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('Success', 'Password changed successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AdminLayout
        title="Teacher Profile"
        showHeader
        showFooter
        showSidebar
        brandSubtext="Teacher"
        navigationItems={teacherNavigationItems}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatarContainer}>
              <Ionicons name="person-circle" size={80} color={AdminColors.accent} />
            </View>
            <View style={styles.profileBasicInfo}>
              <ThemedText style={styles.profileName}>{name || 'Teacher'}</ThemedText>
              <ThemedText style={styles.profileRole}>Teacher</ThemedText>
            </View>
          </View>

          {/* Profile Information Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Profile Information</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Update your personal details</ThemedText>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Full Name</ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color={AdminColors.accent} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={AdminColors.textLight}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Ionicons name="mail" size={20} color={AdminColors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.disabledText]}
                placeholder="Email"
                placeholderTextColor={AdminColors.textLight}
                value={email}
                editable={false}
              />
            </View>
            <ThemedText style={styles.helperText}>Email cannot be changed</ThemedText>
          </View>

          {/* Bio Input */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Bio</ThemedText>
            <View style={[styles.inputContainer, styles.bioContainer]}>
              <Ionicons name="document-text" size={20} color={AdminColors.accent} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Tell us about yourself"
                placeholderTextColor={AdminColors.textLight}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                editable={!loading}
              />
            </View>
          </View>

          {/* Department Input */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Department</ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="briefcase" size={20} color={AdminColors.accent} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your department"
                placeholderTextColor={AdminColors.textLight}
                value={department}
                onChangeText={setDepartment}
                editable={!loading}
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Phone Number</ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color={AdminColors.accent} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={AdminColors.textLight}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          </View>

          {/* Update Profile Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>{loading ? 'Updating...' : 'Update Profile'}</ThemedText>
          </TouchableOpacity>

          {/* Change Password Section */}
          <View style={[styles.section, { marginTop: 32 }]}>
            <ThemedText style={styles.sectionTitle}>Change Password</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Keep your account secure</ThemedText>
          </View>

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Current Password</ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={AdminColors.accent} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor={AdminColors.textLight}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showPasswords}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPasswords(!showPasswords)} style={styles.eyeIcon}>
                <Ionicons name={showPasswords ? 'eye-off' : 'eye'} size={20} color={AdminColors.accent} />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>New Password</ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={AdminColors.accent} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={AdminColors.textLight}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPasswords}
                editable={!loading}
              />
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Confirm Password</ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={AdminColors.accent} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={AdminColors.textLight}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPasswords}
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <ThemedText style={styles.requirementsTitle}>Password Requirements:</ThemedText>
            <View style={styles.requirement}>
              <Ionicons
                name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse'}
                size={16}
                color={newPassword.length >= 6 ? AdminColors.success : AdminColors.textLight}
              />
              <ThemedText style={styles.requirementText}>At least 6 characters</ThemedText>
            </View>
            <View style={styles.requirement}>
              <Ionicons
                name={newPassword === confirmPassword && confirmPassword.length > 0 ? 'checkmark-circle' : 'ellipse'}
                size={16}
                color={
                  newPassword === confirmPassword && confirmPassword.length > 0
                    ? AdminColors.success
                    : AdminColors.textLight
                }
              />
              <ThemedText style={styles.requirementText}>Passwords match</ThemedText>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Ionicons name="key" size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>{loading ? 'Updating...' : 'Change Password'}</ThemedText>
          </TouchableOpacity>

          <View style={styles.spacer} />
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: AdminColors.border,
  },
  profileAvatarContainer: {
    marginBottom: 16,
  },
  profileBasicInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: AdminColors.primary,
    letterSpacing: -0.5,
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '600',
    color: AdminColors.accent,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AdminColors.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: AdminColors.textLight,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: AdminColors.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminColors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AdminColors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bioContainer: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  disabledInput: {
    backgroundColor: AdminColors.background,
    borderColor: AdminColors.border,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: AdminColors.text,
    fontWeight: '500',
  },
  disabledText: {
    color: AdminColors.textLight,
  },
  bioInput: {
    textAlignVertical: 'top',
    paddingVertical: 8,
  },
  helperText: {
    fontSize: 11,
    color: AdminColors.textLight,
    fontWeight: '500',
    marginTop: 4,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: AdminColors.success,
  },
  secondaryButton: {
    backgroundColor: AdminColors.accent,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  requirementsContainer: {
    backgroundColor: AdminColors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: AdminColors.accent,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AdminColors.primary,
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 12,
    color: AdminColors.textLight,
    fontWeight: '500',
  },
  spacer: {
    height: 20,
  },
});
