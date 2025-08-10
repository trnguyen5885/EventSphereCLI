import { Linking } from 'react-native';
import { useEffect } from 'react';
import AirbridgeService from '../services/AirbridgeService';

export default function useDeepLinking(navigationRef) {
  useEffect(() => {
    // Initialize Airbridge with navigation reference
    AirbridgeService.setNavigationRef(navigationRef);
    AirbridgeService.initialize('eventsphere', 'ca5c168a34444c75af781b06635778d5');

    const handleLink = (event) => {
      const url = event.url;
      console.log('Deep link received:', url);
      // Always delegate parsing and navigation to AirbridgeService
      AirbridgeService.handleDeeplink(url);
    };

    // Handle app launch from deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        AirbridgeService.handleDeeplink(url);
      }
    });

    // Handle deep links when app is already running
    const subscription = Linking.addEventListener('url', handleLink);
    
    return () => {
      console.log('Cleaning up deep link listener');
      subscription?.remove();
    };
  }, [navigationRef]);
}