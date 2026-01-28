/**
 * useDeepLinks — Listen for incoming deep links and navigate accordingly.
 *
 * Install at the app root (e.g. inside your NavigationContainer or App component).
 * Requires expo-linking and @react-navigation/native.
 */

import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { parseDeepLink } from '../utils/deepLinks';
import type { DeepLinkRoute } from '../utils/deepLinks';

/**
 * Optional callback for routes the hook can't navigate to automatically.
 */
export interface UseDeepLinksOptions {
  /** Called when a referral code deep link is received */
  onReferral?: (code: string) => void;
}

function handleRoute(
  route: DeepLinkRoute,
  navigation: ReturnType<typeof useNavigation>,
  options?: UseDeepLinksOptions,
) {
  switch (route.type) {
    case 'verse':
      // Navigate to the verse / Bible reader screen
      (navigation as any).navigate('Bible', {
        screen: 'BibleReader',
        params: {
          book: route.book,
          chapter: route.chapter,
          verse: route.verse,
        },
      });
      break;

    case 'referral':
      if (options?.onReferral) {
        options.onReferral(route.code);
      } else {
        // Default: navigate to referral screen with the code pre-filled
        (navigation as any).navigate('Settings', {
          screen: 'Referral',
          params: { code: route.code },
        });
      }
      break;

    case 'unknown':
      // Silently ignore unknown routes
      break;
  }
}

/**
 * Hook that listens for deep links (cold-start + background) and routes them.
 */
export function useDeepLinks(options?: UseDeepLinksOptions): void {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle link that launched the app (cold start)
    const handleInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const route = parseDeepLink(initialUrl);
        handleRoute(route, navigation, options);
      }
    };

    handleInitialUrl();

    // Handle links while app is open (background → foreground)
    const subscription = Linking.addEventListener('url', (event) => {
      const route = parseDeepLink(event.url);
      handleRoute(route, navigation, options);
    });

    return () => subscription.remove();
  }, [navigation, options]);
}

export default useDeepLinks;
