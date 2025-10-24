
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

const PLAYING_STYLES = ['Competitive', 'Casual', 'Social', 'Beginner-Friendly', 'Serious', 'Relaxed'];

export default function ProfileScreen() {
  const [name, setName] = useState('John Doe');
  const [age, setAge] = useState('28');
  const [bio, setBio] = useState('Love playing early morning rounds!');
  const [handicap, setHandicap] = useState('12');
  const [experience, setExperience] = useState('5 years');
  const [typicalCourse, setTypicalCourse] = useState('Pebble Beach');
  const [location, setLocation] = useState('San Francisco, CA');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [playingStyle, setPlayingStyle] = useState('Casual');
  const [favoriteCourse, setFavoriteCourse] = useState('Augusta National');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSave = () => {
    console.log('Profile saved:', { 
      name, 
      age, 
      bio, 
      handicap, 
      experience, 
      typicalCourse, 
      location,
      playingStyle,
      favoriteCourse
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handlePlayingStyleSelect = (style: string) => {
    setPlayingStyle(style);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar,
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Golf Profile</Text>
          <Text style={styles.headerSubtitle}>
            Create your profile to find golf buddies
          </Text>
        </View>

        <Pressable style={styles.photoContainer} onPress={pickImage}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <IconSymbol name="camera.fill" size={40} color={colors.textSecondary} />
              <Text style={styles.photoPlaceholderText}>Add Photo</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Your age"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="City, State"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others about yourself..."
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Golf Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Handicap</Text>
            <TextInput
              style={styles.input}
              value={handicap}
              onChangeText={setHandicap}
              placeholder="Your handicap"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Experience</Text>
            <TextInput
              style={styles.input}
              value={experience}
              onChangeText={setExperience}
              placeholder="e.g., 5 years"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Playing Style</Text>
            <View style={styles.playingStyleContainer}>
              {PLAYING_STYLES.map((style) => (
                <Pressable
                  key={style}
                  style={[
                    styles.playingStyleButton,
                    playingStyle === style && styles.playingStyleButtonActive,
                  ]}
                  onPress={() => handlePlayingStyleSelect(style)}
                >
                  <Text
                    style={[
                      styles.playingStyleText,
                      playingStyle === style && styles.playingStyleTextActive,
                    ]}
                  >
                    {style}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Typical Course</Text>
            <TextInput
              style={styles.input}
              value={typicalCourse}
              onChangeText={setTypicalCourse}
              placeholder="Where you usually play"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Favorite Course</Text>
            <TextInput
              style={styles.input}
              value={favoriteCourse}
              onChangeText={setFavoriteCourse}
              placeholder="Your dream course"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.card,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  playingStyleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  playingStyleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  playingStyleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  playingStyleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  playingStyleTextActive: {
    color: colors.card,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(34, 139, 34, 0.3)',
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
  },
});
