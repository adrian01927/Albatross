
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
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
  location: string | null;
  created_at: string;
}

interface GameMember {
  id: string;
  user_id: string;
  joined_at: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [members, setMembers] = useState<GameMember[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const channelRef = useRef<any>(null);

  const loadMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('game_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages(data || []);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [id]);

  const loadGameData = useCallback(async () => {
    try {
      // Load game details
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (gameError) {
        console.error('Error loading game:', gameError);
        Alert.alert('Error', 'Failed to load game');
        router.back();
        return;
      }

      setGame(gameData);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('game_members')
        .select('*')
        .eq('game_id', id);

      if (membersError) {
        console.error('Error loading members:', membersError);
      } else {
        setMembers(membersData || []);
        const userIsMember = membersData?.some((m) => m.user_id === user?.id);
        setIsMember(userIsMember || false);
      }

      // Load chat messages if user is a member
      if (membersData?.some((m) => m.user_id === user?.id)) {
        loadMessages();
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, router, loadMessages]);

  const setupRealtimeSubscription = useCallback(async () => {
    if (!user) return;

    // Set auth for realtime
    await supabase.realtime.setAuth(user.id);

    const channel = supabase.channel(`game:${id}:chat`, {
      config: { private: true },
    });

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'INSERT' }, (payload) => {
        console.log('New message received:', payload);
        const newMessage = payload.payload.record;
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });
  }, [id, user]);

  useEffect(() => {
    loadGameData();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [loadGameData, setupRealtimeSubscription]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isMember) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { error } = await supabase.from('chat_messages').insert({
        game_id: id,
        user_id: user?.id,
        message: messageText.trim(),
        user_name: user?.email?.split('@')[0] || 'Anonymous',
      });

      if (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message');
        return;
      }

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleLeaveGame = async () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('game_members')
                .delete()
                .eq('game_id', id)
                .eq('user_id', user?.id);

              if (error) {
                console.error('Error leaving game:', error);
                Alert.alert('Error', 'Failed to leave game');
                return;
              }

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error) {
              console.error('Error leaving game:', error);
              Alert.alert('Error', 'Failed to leave game');
            }
          },
        },
      ]
    );
  };

  const handleShareInvite = async () => {
    if (!game) return;

    try {
      await Share.share({
        message: `Join my golf game "${game.name}"! Use invite code: ${game.invite_code}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = async () => {
    if (!game) return;

    await Clipboard.setStringAsync(game.invite_code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (loading || !game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {game.name}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Game Info */}
          <View style={styles.gameInfo}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <IconSymbol name="person.fill" size={20} color={colors.primary} />
                <Text style={styles.infoText}>
                  {game.current_players}/{game.max_players} Players
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{game.status}</Text>
              </View>
            </View>

            {game.description && (
              <Text style={styles.description}>{game.description}</Text>
            )}

            {game.location && (
              <View style={styles.locationRow}>
                <IconSymbol name="location.fill" size={16} color={colors.textSecondary} />
                <Text style={styles.locationText}>{game.location}</Text>
              </View>
            )}

            <View style={styles.inviteSection}>
              <Text style={styles.inviteLabel}>Invite Code</Text>
              <View style={styles.inviteRow}>
                <Text style={styles.inviteCode}>{game.invite_code}</Text>
                <Pressable style={styles.iconButton} onPress={handleCopyCode}>
                  <IconSymbol name="doc.on.doc" size={20} color={colors.primary} />
                </Pressable>
                <Pressable style={styles.iconButton} onPress={handleShareInvite}>
                  <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Chat Messages */}
          {isMember && (
            <View style={styles.chatSection}>
              <Text style={styles.chatTitle}>Group Chat</Text>
              {messages.length === 0 ? (
                <View style={styles.emptyChat}>
                  <IconSymbol name="message.fill" size={40} color={colors.textSecondary} />
                  <Text style={styles.emptyChatText}>No messages yet</Text>
                  <Text style={styles.emptyChatSubtext}>Start the conversation!</Text>
                </View>
              ) : (
                messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageContainer,
                      msg.user_id === user?.id && styles.myMessageContainer,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        msg.user_id === user?.id && styles.myMessageBubble,
                      ]}
                    >
                      {msg.user_id !== user?.id && (
                        <Text style={styles.messageSender}>{msg.user_name}</Text>
                      )}
                      <Text
                        style={[
                          styles.messageText,
                          msg.user_id === user?.id && styles.myMessageText,
                        ]}
                      >
                        {msg.message}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {!isMember && (
            <View style={styles.notMemberContainer}>
              <IconSymbol name="lock.fill" size={40} color={colors.textSecondary} />
              <Text style={styles.notMemberText}>Join the game to see the chat</Text>
            </View>
          )}
        </ScrollView>

        {/* Message Input */}
        {isMember && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <IconSymbol name="arrow.up" size={24} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isMember && game.host_id !== user?.id && (
            <Pressable style={styles.leaveButton} onPress={handleLeaveGame}>
              <Text style={styles.leaveButtonText}>Leave Game</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  gameInfo: {
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inviteSection: {
    marginTop: 8,
  },
  inviteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteCode: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  chatSection: {
    padding: 20,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChatText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyChatSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  myMessageBubble: {
    backgroundColor: colors.primary,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
  },
  myMessageText: {
    color: '#fff',
  },
  notMemberContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  notMemberText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  actionButtons: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
