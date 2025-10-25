
import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { mockGolfers } from '@/data/mockGolfers';
import { Golfer } from '@/types/golfer';
import SwipeCard from '@/components/SwipeCard';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Golfer[]>([]);

  const handleSwipeLeft = () => {
    console.log('Swiped left on:', mockGolfers[currentIndex].name);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipeRight = () => {
    console.log('Swiped right on:', mockGolfers[currentIndex].name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMatches((prev) => [...prev, mockGolfers[currentIndex]]);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleLikePress = () => {
    if (currentIndex < mockGolfers.length) {
      handleSwipeRight();
    }
  };

  const handlePassPress = () => {
    if (currentIndex < mockGolfers.length) {
      handleSwipeLeft();
    }
  };

  const renderCards = () => {
    if (currentIndex >= mockGolfers.length) {
      return (
        <View style={styles.emptyContainer}>
          <IconSymbol name="flag.checkered" size={80} color={colors.primary} />
          <Text style={styles.emptyTitle}>No More Golfers!</Text>
          <Text style={styles.emptyText}>
            You&apos;ve seen everyone in your area. Check back later for new golfers!
          </Text>
          <Text style={styles.matchCount}>
            You made {matches.length} match{matches.length !== 1 ? 'es' : ''}!
          </Text>
        </View>
      );
    }

    return (
      <>
        {currentIndex + 1 < mockGolfers.length && (
          <SwipeCard
            golfer={mockGolfers[currentIndex + 1]}
            onSwipeLeft={() => console.log('Next card')}
            onSwipeRight={() => console.log('Next card')}
            isTop={false}
          />
        )}
        <SwipeCard
          golfer={mockGolfers[currentIndex]}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          isTop={true}
        />
      </>
    );
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Golf Buddies',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.primary,
          }}
        />
      )}
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          {renderCards()}
        </View>

        {currentIndex < mockGolfers.length && (
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.actionButton, styles.passButton]}
              onPress={handlePassPress}
            >
              <IconSymbol name="xmark" size={28} color={colors.card} />
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.likeButton]}
              onPress={handleLikePress}
            >
              <IconSymbol name="heart.fill" size={28} color={colors.card} />
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingBottom: Platform.OS === 'ios' ? 60 : 140,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#FF3B30',
  },
  likeButton: {
    backgroundColor: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  matchCount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
});
