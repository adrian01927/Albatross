
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
        <View style={styles.imageContainer}>
          <Image source={{ uri: golfer.photo }} style={styles.profileImage} />
          {Platform.OS === 'web' && (
            <Pressable style={styles.webBackButton} onPress={handleBack}>
              <IconSymbol name="chevron.left" size={24} color={colors.card} />
            </Pressable>
          )}
        </View>

        <View style={styles.headerSection}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{golfer.name}</Text>
            <Text style={styles.age}>{golfer.age} years old</Text>
          </View>
          
          <View style={styles.locationContainer}>
            <IconSymbol name="location.fill" size={20} color={colors.primary} />
            <Text style={styles.location}>{golfer.location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{golfer.bio}</Text>
        </View>

        {golfer.playingStyle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Playing Style</Text>
            <View style={styles.playingStyleCard}>
              <IconSymbol name="person.fill" size={24} color={colors.primary} />
              <Text style={styles.playingStyleText}>{golfer.playingStyle}</Text>
            </View>
          </View>
        )}

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
    height: 400,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary,
  },
  webBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  nameContainer: {
    marginBottom: 12,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  age: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  location: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    backgroundColor: colors.card,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  bio: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  playingStyleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.highlight,
    padding: 16,
    borderRadius: 12,
  },
  playingStyleText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.highlight,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
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
    borderRadius: 12,
    marginBottom: 12,
  },
  favoriteCard: {
    backgroundColor: '#FFF9E6',
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
