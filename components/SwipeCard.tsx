
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Golfer } from '@/types/golfer';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeCardProps {
  golfer: Golfer;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

export default function SwipeCard({ golfer, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) {
  const router = useRouter();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleProfilePress = () => {
    if (!isTop) return;
    console.log('Opening profile for:', golfer.name);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/(tabs)/(home)/profile/${golfer.id}`);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isTop) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (!isTop) return;
      
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(direction * SCREEN_WIDTH * 1.5, {}, () => {
          if (direction > 0) {
            runOnJS(onSwipeRight)();
          } else {
            runOnJS(onSwipeLeft)();
          }
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15]
    );

    const opacity = isTop ? 1 : 0.5;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
      opacity,
    };
  });

  const likeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1]
    );
    return { opacity };
  });

  const nopeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0]
    );
    return { opacity };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Pressable onPress={handleProfilePress} style={styles.pressableContent}>
          <Image source={{ uri: golfer.photo }} style={styles.image} />
          
          <Animated.View style={[styles.likeStamp, likeStyle]}>
            <Text style={styles.likeText}>MATCH!</Text>
          </Animated.View>
          
          <Animated.View style={[styles.nopeStamp, nopeStyle]}>
            <Text style={styles.nopeText}>PASS</Text>
          </Animated.View>

          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{golfer.name}, {golfer.age}</Text>
              <View style={styles.locationRow}>
                <IconSymbol name="location.fill" size={16} color={colors.textSecondary} />
                <Text style={styles.location}>{golfer.location}</Text>
              </View>
            </View>

            <Text style={styles.bio} numberOfLines={2}>{golfer.bio}</Text>

            {golfer.playingStyle && (
              <View style={styles.playingStyleBadge}>
                <IconSymbol name="person.fill" size={16} color={colors.primary} />
                <Text style={styles.playingStyleText}>{golfer.playingStyle}</Text>
              </View>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <IconSymbol name="flag.fill" size={20} color={colors.primary} />
                <Text style={styles.statLabel}>Handicap</Text>
                <Text style={styles.statValue}>{golfer.handicap}</Text>
              </View>
              <View style={styles.statItem}>
                <IconSymbol name="clock.fill" size={20} color={colors.primary} />
                <Text style={styles.statLabel}>Experience</Text>
                <Text style={styles.statValue}>{golfer.experience}</Text>
              </View>
            </View>

            <View style={styles.courseContainer}>
              <IconSymbol name="map.fill" size={18} color={colors.accent} />
              <View style={styles.courseTextContainer}>
                <Text style={styles.courseLabel}>Typical Course:</Text>
                <Text style={styles.courseText} numberOfLines={1}>{golfer.typicalCourse}</Text>
              </View>
            </View>

            {golfer.favoriteCourse && (
              <View style={styles.courseContainer}>
                <IconSymbol name="star.fill" size={18} color="#FFD700" />
                <View style={styles.courseTextContainer}>
                  <Text style={styles.courseLabel}>Favorite Course:</Text>
                  <Text style={styles.courseText} numberOfLines={1}>{golfer.favoriteCourse}</Text>
                </View>
              </View>
            )}

            <View style={styles.tapHintContainer}>
              <IconSymbol name="hand.tap.fill" size={16} color={colors.textSecondary} />
              <Text style={styles.tapHint}>Tap to view full profile</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: '85%',
    backgroundColor: colors.card,
    borderRadius: 20,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
    elevation: 5,
    overflow: 'hidden',
  },
  pressableContent: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '45%',
    backgroundColor: colors.secondary,
  },
  infoContainer: {
    padding: 20,
    flex: 1,
  },
  nameRow: {
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bio: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  playingStyleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  playingStyleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: colors.highlight,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  courseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingVertical: 6,
  },
  courseTextContainer: {
    flex: 1,
  },
  courseLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  courseText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  tapHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
  },
  tapHint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  likeStamp: {
    position: 'absolute',
    top: 80,
    right: 30,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ rotate: '15deg' }],
    zIndex: 10,
  },
  likeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.card,
  },
  nopeStamp: {
    position: 'absolute',
    top: 80,
    left: 30,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ rotate: '-15deg' }],
    zIndex: 10,
  },
  nopeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.card,
  },
});
