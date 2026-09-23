import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'expo-router';

import { COLORS } from '@/constants/theme';
import { API_BASE_URL } from '@/shared/api/config';
import { apiFetch } from '@/shared/api/client';
import { getAccessToken, getLoggedInUserId } from '@/shared/store/auth';
import { fetchUserById } from '@/features/users/api/homeUsers';
import type { User } from '@/features/users/data/types';
import { ChatHeader } from '@/features/messages/components/ChatHeader';
import { MessageItem } from '@/features/messages/components/MessageItem';
import { ChatInputBar } from '@/features/messages/components/ChatInputBar';
import type { Message } from '@/features/messages/types';
import {
  getCachedConversation,
  saveCachedConversation,
  appendMessageToCache,
  useConversation,
} from '@/features/messages/store/messagesCache';

type Props = {
  otherUserId: string;
};

export default function ChatTestScreen({ otherUserId }: Props) {
  const router = useRouter();
  const me = getLoggedInUserId();

  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use cache hook for real-time updates
  const cachedMessages = useConversation(me || '', otherUserId);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Update messages from cache when available
  useEffect(() => {
    if (cachedMessages) {
      setMessages(cachedMessages);
    }
  }, [cachedMessages]);

  useEffect(() => {
    if (!me) return;

    let mounted = true;

    async function loadInitial() {
      try {
        setError(null);

        // Load cached data immediately
        const cachedConvo = getCachedConversation(me as string, otherUserId);
        if (cachedConvo?.messages) {
          setMessages(cachedConvo.messages);
        }

        // Then try to refresh from network
        const [profileRes, convoRes] = await Promise.all([
          fetchUserById(otherUserId),
          apiFetch(`/messages/conversation/${encodeURIComponent(me as string)}/${encodeURIComponent(otherUserId)}`),
        ]);

        if (!mounted) return;

        setOtherUser(profileRes);

        if (convoRes.ok) {
          const convoData = (await convoRes.json()) as Message[];
          const newMessages = Array.isArray(convoData) ? convoData : [];

          if (mounted) {
            // Save fresh messages to cache with network source
            saveCachedConversation(me as string, otherUserId, newMessages, 'network');
            setMessages(newMessages);
          }
        } else if (!cachedConvo?.messages) {
          // Only show error if we don't have cache to fall back on
          throw new Error(`Failed to load conversation (${convoRes.status})`);
        }
      } catch (e) {
        console.log('Chat load failed', e);
        const msg = e instanceof Error ? e.message : 'Failed to load chat';
        if (mounted) {
          // Only set error if no cache exists
          if (!cachedMessages) {
            setError(msg);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadInitial();

    return () => {
      mounted = false;
    };
  }, [me, otherUserId, cachedMessages]);

  useEffect(() => {
    if (!me) return;

    const token = getAccessToken();
    if (!token) {
      return;
    }

    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('receive_message', (message: Message) => {
      const isForThisConversation =
        (message.sender_id === me && message.receiver_id === otherUserId) ||
        (message.sender_id === otherUserId && message.receiver_id === me);

      if (!isForThisConversation) return;

      // Append to cache with synced: true
      appendMessageToCache(me, otherUserId, {
        ...message,
        synced: true,
      });

      // UI updates from cache store listener
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [me, otherUserId]);

  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

  const onSend = async () => {
    const content = draft.trim();
    if (!content || !me || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      receiver_id: otherUserId,
      content,
    });

    setDraft('');
  };

  const title = useMemo(() => otherUser?.name ?? 'Chat', [otherUser]);

  if (!me) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>You need to log in first.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ChatHeader title={title} onBack={() => router.back()} />

        {loading ? (
          <View style={styles.center}>
            <Text>Loading chat...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text>{error}</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageItem
                item={item}
                isMine={item.sender_id === me}
                fallbackAvatarUri={otherUser?.profile_image_url}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}

        <ChatInputBar value={draft} onChangeText={setDraft} onSend={onSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 12,
    gap: 10,
  },
});
