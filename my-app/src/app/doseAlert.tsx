import { useEffect } from 'react';
import { View, Text, Button, Vibration } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function DoseAlert() {
  const { medId } = useLocalSearchParams<{ medId: string }>();

  useEffect(() => {
    Vibration.vibrate([0, 500, 300, 500], true); // repete até sair
    return () => Vibration.cancel();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 28, marginBottom: 24 }}>Hora do remédio</Text>
      <Button title="Tomei" onPress={() => router.back()} />
      <Button title="Adiar 10 min" onPress={() => router.back()} />
    </View>
  );
}