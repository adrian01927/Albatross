
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
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
          {/* Main Image with Overlay */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: golfer.photo }} style={styles.image} />
            
            {/* Gradient Overlay for better text readability */}
            <View style={styles.gradientOverlay} />
            
            {/* Handicap Badge */}
            <View style={styles.handicapBadge}>
              <IconSymbol name="trophy.fill" size={20} color={colors.primary} />
              <View style={styles.handicapTextContainer}>
                <Text style={styles.handicapLabel}>Handicap</Text>
                <Text style={styles.handicapValue}>{golfer.handicap}</Text>
              </View>
            </View>

            {/* Name and Location Overlay */}
            <View style={styles.nameOverlay}>
              <Text style={styles.nameText}>{golfer.name.toLowerCase()}</Text>
              <View style={styles.locationRow}>
                <IconSymbol name="location.fill" size={16} color="#FFFFFF" />
                <Text style={styles.locationText}>{golfer.location}</Text>
              </View>
            </View>
          </View>

          {/* Info Section Below Image */}
          <View style={styles.infoContainer}>
            <Text style={styles.bioText} numberOfLines={2}>
              {golfer.handicap} sigma
            </Text>

            {golfer.playingStyle && (
              <View style={styles.playingStyleSection}>
                <Text style={styles.sectionLabel}>Playing Style</Text>
                <View style={styles.playingStyleBadge}>
                  <IconSymbol name="star.fill" size={16} color="#FFD700" />
                  <Text style={styles.playingStyleText}>{golfer.playingStyle}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Swipe Stamps */}
          <Animated.View style={[styles.likeStamp, likeStyle]}>
            <Text style={styles.likeText}>MATCH!</Text>
          </Animated.View>
          
          <Animated.View style={[styles.nopeStamp, nopeStyle]}>
            <Text style={styles.nopeText}>PASS</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: colors.card,
    borderRadius: 24,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
    elevation: 8,
    overflow: 'hidden',
  },
  pressableContent: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: '75%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
    background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7))',
  },
  handicapBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  handicapTextContainer: {
    alignItems: 'flex-start',
  },
  handicapLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  handicapValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  nameText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    textShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
  },
  infoContainer: {
    padding: 20,
    flex: 1,
    backgroundColor: colors.card,
  },
  bioText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  playingStyleSection: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  playingStyleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  playingStyleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  likeStamp: {
    position: 'absolute',
    top: 100,
    right: 30,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    transform: [{ rotate: '15deg' }],
    zIndex: 10,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    elevation: 6,
  },
  likeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  nopeStamp: {
    position: 'absolute',
    top: 100,
    left: 30,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    transform: [{ rotate: '-15deg' }],
    zIndex: 10,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    elevation: 6,
  },
  nopeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
