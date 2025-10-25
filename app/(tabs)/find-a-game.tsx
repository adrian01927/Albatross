
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/IconSymbol';

interface Game {
  id: string;
  name: string;
  description: string;
  max_players: number;
  current_players: number;
  status: string;
  invite_code: string;
  host_id: string;
  scheduled_date: string | null;
  location: string | null;
  created_at: string;
}

export default function FindAGameScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameName, setGameName] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('8');
  const [location, setLocation] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadGames();
    
    // Subscribe to game changes
    const channel = supabase
      .channel('games_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
        },
        () => {
          console.log('Games changed, reloading...');
          loadGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading games:', error);
        Alert.alert('Error', 'Failed to load games');
      } else {
        setGames(data || []);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateGame = async () => {
    if (!gameName.trim()) {
      Alert.alert('Error', 'Please enter a game name');
      return;
    }

    const maxPlayersNum = parseInt(maxPlayers);
    if (isNaN(maxPlayersNum) || maxPlayersNum < 2 || maxPlayersNum > 8) {
      Alert.alert('Error', 'Max players must be between 2 and 8');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const code = generateInviteCode();

      // Create game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          name: gameName,
          description: gameDescription,
          max_players: maxPlayersNum,
          host_id: user?.id,
          invite_code: code,
          location: location || null,
        })
        .select()
        .single();

      if (gameError) {
        console.error('Error creating game:', gameError);
        Alert.alert('Error', 'Failed to create game');
        return;
      }

      // Add host as first member
      const { error: memberError } = await supabase
        .from('game_members')
        .insert({
          game_id: gameData.id,
          user_id: user?.id,
        });

      if (memberError) {
        console.error('Error adding host as member:', memberError);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCreateModal(false);
      setGameName('');
      setGameDescription('');
      setMaxPlayers('8');
      setLocation('');
      
      Alert.alert(
        'Game Created!',
        `Your game has been created. Invite code: ${code}`,
        [
          {
            text: 'Share Code',
            onPress: () => handleShareInvite(code),
          },
          {
            text: 'OK',
            onPress: () => router.push(`/game/${gameData.id}`),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('Error', 'Failed to create game');
    }
  };

  const handleJoinGame = async (gameId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('game_members')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_id', user?.id)
        .single();

      if (existingMember) {
        router.push(`/game/${gameId}`);
        return;
      }

      // Check if game is full
      const { data: game } = await supabase
        .from('games')
        .select('current_players, max_players')
        .eq('id', gameId)
        .single();

      if (game && game.current_players >= game.max_players) {
        Alert.alert('Error', 'This game is full');
        return;
      }

      // Join game
      const { error } = await supabase
        .from('game_members')
        .insert({
          game_id: gameId,
          user_id: user?.id,
        });

      if (error) {
        console.error('Error joining game:', error);
        Alert.alert('Error', 'Failed to join game');
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('Error', 'Failed to join game');
    }
  };

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { data: game, error } = await supabase
        .from('games')
        .select('id')
        .eq('invite_code', inviteCode.toUpperCase())
        .eq('status', 'open')
        .single();

      if (error || !game) {
        Alert.alert('Error', 'Invalid invite code');
        return;
      }

      setShowJoinModal(false);
      setInviteCode('');
      handleJoinGame(game.id);
    } catch (error) {
      console.error('Error joining with code:', error);
      Alert.alert('Error', 'Failed to join game');
    }
  };

  const handleShareInvite = async (code: string) => {
    try {
      await Share.share({
        message: `Join my golf game! Use invite code: ${code}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Game</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.headerButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowJoinModal(true);
            }}
          >
            <IconSymbol name="number" size={20} color={colors.primary} />
            <Text style={styles.headerButtonText}>Join with Code</Text>
          </Pressable>
          <Pressable
            style={[styles.headerButton, styles.createButton]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCreateModal(true);
            }}
          >
            <IconSymbol name="plus" size={20} color="#fff" />
            <Text style={[styles.headerButtonText, styles.createButtonText]}>
              Host Game
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <Text style={styles.emptyText}>Loading games...</Text>
        ) : games.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="flag.fill" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No games available</Text>
            <Text style={styles.emptySubtext}>Be the first to host a game!</Text>
          </View>
        ) : (
          games.map((game) => (
            <View key={game.id} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <Text style={styles.gameName}>{game.name}</Text>
                <View style={styles.playerCount}>
                  <IconSymbol name="person.fill" size={16} color={colors.primary} />
                  <Text style={styles.playerCountText}>
                    {game.current_players}/{game.max_players}
                  </Text>
                </View>
              </View>
              
              {game.description && (
                <Text style={styles.gameDescription}>{game.description}</Text>
              )}
              
              {game.location && (
                <View style={styles.gameInfo}>
                  <IconSymbol name="location.fill" size={14} color={colors.textSecondary} />
                  <Text style={styles.gameInfoText}>{game.location}</Text>
                </View>
              )}

              <View style={styles.gameFooter}>
                <Pressable
                  style={styles.codeButton}
                  onPress={() => handleCopyCode(game.invite_code)}
                >
                  <IconSymbol name="doc.on.doc" size={16} color={colors.primary} />
                  <Text style={styles.codeText}>{game.invite_code}</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.joinButton,
                    game.current_players >= game.max_players && styles.joinButtonDisabled,
                  ]}
                  onPress={() => handleJoinGame(game.id)}
                  disabled={game.current_players >= game.max_players}
                >
                  <Text style={styles.joinButtonText}>
                    {game.current_players >= game.max_players ? 'Full' : 'Join'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Game Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Host a Game</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Game Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Sunday Morning Round"
                  placeholderTextColor={colors.textSecondary}
                  value={gameName}
                  onChangeText={setGameName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Casual 18 holes, all skill levels welcome"
                  placeholderTextColor={colors.textSecondary}
                  value={gameDescription}
                  onChangeText={setGameDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Pebble Beach Golf Links"
                  placeholderTextColor={colors.textSecondary}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Max Players (2-8) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="8"
                  placeholderTextColor={colors.textSecondary}
                  value={maxPlayers}
                  onChangeText={setMaxPlayers}
                  keyboardType="number-pad"
                  maxLength={1}
                />
              </View>

              <Pressable style={styles.createGameButton} onPress={handleCreateGame}>
                <Text style={styles.createGameButtonText}>Create Game</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Join with Code Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join with Code</Text>
              <Pressable onPress={() => setShowJoinModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Invite Code</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="ABC123"
                  placeholderTextColor={colors.textSecondary}
                  value={inviteCode}
                  onChangeText={(text) => setInviteCode(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>

              <Pressable style={styles.createGameButton} onPress={handleJoinWithCode}>
                <Text style={styles.createGameButtonText}>Join Game</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  createButtonText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  gameCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  playerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  playerCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  gameDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  gameInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  gameFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  codeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  joinButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  joinButtonDisabled: {
    backgroundColor: colors.secondary,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalForm: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
  },
  createGameButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createGameButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
