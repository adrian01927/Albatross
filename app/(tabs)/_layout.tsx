
import React from 'react';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      route: '/(tabs)/(home)',
      label: 'Discover',
      icon: 'flame.fill',
      color: colors.text,
    },
    {
      route: '/(tabs)/matches',
      label: 'Matches',
      icon: 'heart.fill',
      color: colors.text,
    },
    {
      route: '/(tabs)/profile',
      label: 'Profile',
      icon: 'person.fill',
      color: colors.text,
    },
  ];

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        <NativeTabs.Screen
          name="(home)"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color }) => <Icon name="flame.fill" color={color} />,
            tabBarLabel: ({ color }) => <Label color={color}>Discover</Label>,
          }}
        />
        <NativeTabs.Screen
          name="matches"
          options={{
            title: 'Matches',
            tabBarIcon: ({ color }) => <Icon name="heart.fill" color={color} />,
            tabBarLabel: ({ color }) => <Label color={color}>Matches</Label>,
          }}
        />
        <NativeTabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Icon name="person.fill" color={color} />,
            tabBarLabel: ({ color }) => <Label color={color}>Profile</Label>,
          }}
        />
      </NativeTabs>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" />
        <Stack.Screen name="matches" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
