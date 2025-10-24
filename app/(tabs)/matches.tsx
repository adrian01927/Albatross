
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { Golfer } from '@/types/golfer';

export default function MatchesScreen() {
  const router = useRouter();
  const [matches] = useState<Golfer[]>([]);

  const renderMatch = ({ item }: { item: Golfer }) => (
    <Pressable
      style={styles.matchCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('Opening chat with:', item.name);
      }}
    >
      <Image source={{ uri: item.photo }} style={styles.matchPhoto} />
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.name}</Text>
        <Text style={styles.matchDetails}>
          Handicap: {item.handicap} • {item.location}
        </Text>
        <Text style={styles.matchBio} numberOfLines={2}>
          {item.bio}
        </Text>
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="heart" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Matches Yet</Text>
      <Text style={styles.emptyText}>
        Start swiping to find your perfect golf buddy!
      </Text>
      <Pressable
        style={styles.startSwipingButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/(tabs)/(home)');
        }}
      >
        <Text style={styles.startSwipingText}>Start Swiping</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Matches</Text>
          <Text style={styles.headerSubtitle}>
            {matches.length} golf {matches.length === 1 ? 'buddy' : 'buddies'}
          </Text>
        </View>

        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            Platform.OS !== 'ios' && styles.listContainerWithTabBar,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContainerWithTabBar: {
    paddingBottom: 100,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  matchPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.secondary,
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  matchDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  matchBio: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
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
    marginBottom: 32,
  },
  startSwipingButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    boxShadow: '0px 4px 12px rgba(34, 139, 34, 0.3)',
    elevation: 5,
  },
  startSwipingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.card,
  },
});
