
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, usePathname } from 'expo-router';
import { colors } from '@/styles/commonStyles';

interface TabBarItem {
  route: string;
  label: string;
  icon: string;
  activeIcon?: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FloatingTabBar({
  tabs,
  containerWidth = SCREEN_WIDTH - 40,
  borderRadius = 24,
  bottomMargin = 20,
}: FloatingTabBarProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const router = useRouter();

  const activeIndex = tabs.findIndex((tab) => {
    if (tab.route === '/(tabs)/(home)') {
      return pathname === '/(tabs)/(home)' || pathname === '/(tabs)/(home)/';
    }
    return pathname.startsWith(tab.route);
  });

  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex : 0);

  React.useEffect(() => {
    if (activeIndex >= 0) {
      indicatorPosition.value = withSpring(activeIndex, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = containerWidth / tabs.length;
    return {
      transform: [
        {
          translateX: interpolate(
            indicatorPosition.value,
            [0, tabs.length - 1],
            [0, tabWidth * (tabs.length - 1)]
          ),
        },
      ],
      width: tabWidth,
    };
  });

  const handleTabPress = (route: string) => {
    console.log('Navigating to:', route);
    router.push(route);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={[styles.container, { width: containerWidth, borderRadius, marginBottom: bottomMargin }]}>
        {/* Background Indicator */}
        <Animated.View
          style={[
            styles.indicator,
            indicatorStyle,
            { borderRadius: borderRadius - 4 },
          ]}
        />

        {/* Tab Buttons */}
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const iconName = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tab}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <IconSymbol
                  name={iconName as any}
                  size={24}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.label,
                    { color: isActive ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    boxShadow: '0px -2px 20px rgba(0, 0, 0, 0.1)',
    elevation: 8,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    height: '80%',
    backgroundColor: colors.highlight,
    top: '10%',
    left: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
