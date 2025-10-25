
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import FloatingTabBar from '@/components/FloatingTabBar';
import { Stack, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

interface TabBarItem {
  route: string;
  label: string;
  icon: string;
  activeIcon?: string;
}

export default function TabLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      router.replace('/auth/login');
    }
  }, [user, loading]);

  const tabs: TabBarItem[] = [
    {
      route: '/(tabs)/(home)',
      label: 'Discover',
      icon: 'flame.fill',
    },
    {
      route: '/(tabs)/matches',
      label: 'Matches',
      icon: 'heart.fill',
    },
    {
      route: '/(tabs)/profile',
      label: 'Profile',
      icon: 'person.fill',
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" />
        <Stack.Screen name="matches" />
        <Stack.Screen name="profile" />
      </Stack>
      {Platform.OS !== 'ios' && <FloatingTabBar tabs={tabs} bottomMargin={30} />}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
