import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ContactsScreen from '../screens/ContactsScreen';
import LoginScreen from '../screens/LoginScreen';
import SOSScreen from '../screens/SOSScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { theme } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * App navigation: Welcome → Login | SOS → Contacts (SOS is home after sign-in / guest).
 */
export function RootNavigator() {
  const { session } = useAuth();
  const scheme = useColorScheme();
  const navTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const initialRouteName: keyof RootStackParamList = session ? 'SOS' : 'Welcome';

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SOS" component={SOSScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
