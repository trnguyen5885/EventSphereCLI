import { Linking } from 'react-native';
import { useEffect } from 'react';

export default function useDeepLinking(navigationRef) {
  useEffect(() => {
    const handleLink = (event) => {
      const url = event.url;
      console.log('Deep link received:', url);
      
      // Handle eventsphere.io.vn links
      const eventMatch = url.match(/\/event\/([a-fA-F0-9]{24}|\d+)/);
      if (eventMatch && navigationRef?.isReady()) {
        const eventId = eventMatch[1];
        console.log('Navigating to event detail with ID:', eventId);
        navigationRef.navigate('Detail', { id: eventId });
      }
    };

    // Handle app launch from deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        handleLink({ url });
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