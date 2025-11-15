import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  onProfilePress?: () => void;
  navigationItems?: NavigationItem[];
  brandSubtext?: string;
}

const COLORS = {
  primary: '#1e3a8a',
  secondary: '#0f172a',
  accent: '#38BDF8',
  accentLight: '#0ea5e9',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
};

export function AdminLayout({
  children,
  title = 'Admin Dashboard',
  showHeader = true,
  showFooter = true,
  showSidebar = true,
  onProfilePress,
  navigationItems: customNavigationItems,
  brandSubtext = 'Admin',
}: AdminLayoutProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const defaultNavigationItems: NavigationItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/(app)/admin-dashboard' },
    { label: 'Users', icon: 'people', route: '/(app)/user-management' },
    { label: 'Analytics', icon: 'analytics', route: '/(app)/admin-analytics' },
    { label: 'Settings', icon: 'settings', route: '/(app)/admin-dashboard' },
  ];

  const navigationItems = customNavigationItems || defaultNavigationItems;

  const handleNavigation = (route: string) => {
    setSidebarVisible(false);
    router.push(route as any);
  };

  const handleProfilePress = () => {
    setSidebarVisible(false);
    onProfilePress?.();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Header */}
      {showHeader && (
        <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
          <View style={styles.headerLeft}>
            {showSidebar && (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setSidebarVisible(!sidebarVisible)}
              >
                <Ionicons name="menu" size={28} color="#ffffff" />
              </TouchableOpacity>
            )}
            <View style={styles.brandContainer}>
              <ThemedText style={styles.brandName}>SkillFlow</ThemedText>
              <ThemedText style={styles.brandSubtext}>{brandSubtext}</ThemedText>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Ionicons name="person-circle" size={40} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content with Sidebar */}
      <View style={styles.contentWrapper}>
        {/* Sidebar */}
        {showSidebar && (
          <>
            <Modal
              visible={sidebarVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setSidebarVisible(false)}
            >
              <View style={styles.sidebarOverlay}>
                <TouchableOpacity
                  style={styles.sidebarBackdrop}
                  onPress={() => setSidebarVisible(false)}
                />
                <View style={[styles.sidebar, { backgroundColor: COLORS.secondary }]}>
                  <View style={styles.sidebarHeader}>
                    <ThemedText style={styles.sidebarTitle}>Menu</ThemedText>
                    <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                      <Ionicons name="close" size={28} color="#ffffff" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.sidebarContent}>
                    {navigationItems.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.sidebarItem}
                        onPress={() => handleNavigation(item.route)}
                      >
                        <Ionicons name={item.icon as any} size={24} color={COLORS.accent} />
                        <ThemedText style={styles.sidebarItemText}>{item.label}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.sidebarFooter}>
                    <TouchableOpacity
                      style={styles.sidebarLogout}
                      onPress={() => {
                        setSidebarVisible(false);
                        router.replace('/login');
                      }}
                    >
                      <Ionicons name="log-out" size={24} color={COLORS.danger} />
                      <ThemedText style={styles.sidebarLogoutText}>Logout</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}

        {/* Main Content */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>

      {/* Footer Navigation */}
      {showFooter && (
        <View style={[styles.footer, { backgroundColor: COLORS.primary }]}>
          {navigationItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.footerItem}
              onPress={() => handleNavigation(item.route)}
            >
              <Ionicons name={item.icon as any} size={24} color={COLORS.accent} />
              <ThemedText style={styles.footerLabel}>{item.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 8,
  },
  brandContainer: {
    gap: 0,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandSubtext: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '600',
    letterSpacing: 1,
  },
  profileButton: {
    padding: 8,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarBackdrop: {
    flex: 1,
  },
  sidebar: {
    width: 280,
    backgroundColor: COLORS.secondary,
    paddingTop: 0,
    flexDirection: 'column',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sidebarContent: {
    flex: 1,
    paddingVertical: 12,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  sidebarLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  sidebarLogoutText: {
    fontSize: 16,
    color: COLORS.danger,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  footerItem: {
    alignItems: 'center',
    gap: 4,
    padding: 8,
    flex: 1,
  },
  footerLabel: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export const AdminColors = COLORS;
