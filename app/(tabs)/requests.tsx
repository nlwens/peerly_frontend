import { router } from 'expo-router';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import RequestsScreen from '@/features/requests/screens/RequestsScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import PeerlyButton from '@/shared/components/ui/PeerlyButton';
import { COLORS } from '@/constants/theme';
import { loadRequests, removeRequestById, upsertRequestFromSocket } from '@/features/requests/store/requestsStore';
import { useAuth, getAccessToken } from '@/shared/store/auth';
import { API_BASE_URL } from '@/shared/api/config';

export default function RequestsRoute() {
  const { loggedInUserId, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated || !loggedInUserId) return;
    void loadRequests();
  }, [hydrated, loggedInUserId]);

  useEffect(() => {
    if (!hydrated || !loggedInUserId) return;

    const token = getAccessToken();
    if (!token) return;

    const socket: Socket = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: { token },
    });

    socket.on('request_created', (request) => {
      void upsertRequestFromSocket(request);
    });

    socket.on('request_updated', (request) => {
      void upsertRequestFromSocket(request);
    });

    socket.on('request_deleted', (payload: { id?: string }) => {
      if (!payload?.id) return;
      void removeRequestById(payload.id);
    });

    return () => {
      socket.disconnect();
    };
  }, [hydrated, loggedInUserId]);

  if (!hydrated) return null;

  if (!loggedInUserId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.title}>Please log in</Text>
          <Text style={styles.subtitle}>You need an account to manage requests and offers.</Text>

          <PeerlyButton
            title="Go to Login"
            backgroundColor={COLORS.buttonGreen}
            textColor={COLORS.textOnDark}
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: 20, width: 200 }}
            accessibilityLabel="Go to sign in"
          />
        </View>
      </SafeAreaView>
    );
  }

  return <RequestsScreen />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
