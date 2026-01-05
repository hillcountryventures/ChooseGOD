import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import JourneyScreen from './src/screens/JourneyScreen';
import ChatScreen from './src/screens/ChatScreen';
import PrayersScreen from './src/screens/PrayersScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ReflectionModal from './src/screens/ReflectionModal';

// Types
import { BottomTabParamList, RootStackParamList } from './src/types';

const colors = {
  background: '#0F0F0F',
  card: '#1A1A1A',
  text: '#ffffff',
  border: '#333333',
  primary: '#6366F1',
  accent: '#F59E0B',
  textMuted: '#737373',
};

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Journey: { active: 'trending-up', inactive: 'trending-up-outline' },
  Ask: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  Prayers: { active: 'heart', inactive: 'heart-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.active : icons.inactive;

          // Special styling for center Ask tab
          if (route.name === 'Ask') {
            return (
              <View style={styles.centerTab}>
                <Ionicons name={iconName} size={28} color="#fff" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Journey" component={JourneyScreen} />
      <Tab.Screen
        name="Ask"
        component={ChatScreen}
        options={{
          tabBarLabel: '',
        }}
      />
      <Tab.Screen name="Prayers" component={PrayersScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DarkTheme}>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="ReflectionModal"
            component={ReflectionModal}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centerTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
