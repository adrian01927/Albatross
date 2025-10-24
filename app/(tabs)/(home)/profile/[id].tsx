
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { mockGolfers } from '@/data/mockGolfers';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GolferProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const golfer = mockGolfers.find((g) => g.id === id);

  if (!golfer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={60} color={colors.textSecondary} />
          <Text style={styles.errorText}>Golfer not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: golfer.name,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: golfer.photo }} style={styles.profileImage} />
          
          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />
          
          {/* Back Button for Web */}
          {Platform.OS === 'web' && (
            <Pressable style={styles.webBackButton} onPress={handleBack}>
              <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
            </Pressable>
          )}

          {/* Handicap Badge */}
          <View style={styles.handicapBadge}>
            <IconSymbol name="trophy.fill" size={24} color={colors.primary} />
            <View style={styles.handicapTextContainer}>
              <Text style={styles.handicapLabel}>Handicap</Text>
              <Text style={styles.handicapValue}>{golfer.handicap}</Text>
            </View>
          </View>

          {/* Name and Location Overlay */}
          <View style={styles.nameOverlay}>
            <Text style={styles.nameText}>{golfer.name.toLowerCase()}</Text>
            <View style={styles.locationRow}>
              <IconSymbol name="location.fill" size={18} color="#FFFFFF" />
              <Text style={styles.locationText}>{golfer.location}</Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.bioText}>{golfer.handicap} sigma</Text>
        </View>

        {/* Playing Style Section */}
        {golfer.playingStyle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Playing Style</Text>
            <View style={styles.playingStyleBadge}>
              <IconSymbol name="star.fill" size={20} color="#FFD700" />
              <Text style={styles.playingStyleText}>{golfer.playingStyle}</Text>
            </View>
          </View>
        )}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{golfer.bio}</Text>
        </View>

        {/* Golf Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Golf Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <IconSymbol name="flag.fill" size={32} color={colors.primary} />
              <Text style={styles.statLabel}>Handicap</Text>
              <Text style={styles.statValue}>{golfer.handicap}</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="clock.fill" size={32} color={colors.accent} />
              <Text style={styles.statLabel}>Experience</Text>
              <Text style={styles.statValue}>{golfer.experience}</Text>
            </View>
          </View>
        </View>

        {/* Where They Play Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where They Play</Text>
          
          <View style={styles.courseCard}>
            <View style={styles.courseIconContainer}>
              <IconSymbol name="map.fill" size={24} color={colors.accent} />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseLabel}>Typical Course</Text>
              <Text style={styles.courseName}>{golfer.typicalCourse}</Text>
            </View>
          </View>

          {golfer.favoriteCourse && (
            <View style={[styles.courseCard, styles.favoriteCard]}>
              <View style={styles.courseIconContainer}>
                <IconSymbol name="star.fill" size={24} color="#FFD700" />
              </View>
              <View style={styles.courseInfo}>
                <Text style={styles.courseLabel}>Favorite Course</Text>
                <Text style={styles.courseName}>{golfer.favoriteCourse}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {golfer.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 500,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'transparent',
    background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7))',
  },
  webBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
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
    bottom: 30,
    left: 24,
    right: 24,
  },
  nameText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    textShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
  },
  section: {
    padding: 20,
    backgroundColor: colors.card,
    marginTop: 12,
  },
  bioText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  playingStyleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  playingStyleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  aboutText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.highlight,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.highlight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  favoriteCard: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  courseIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
  },
  courseLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestTag: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  interestText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});
