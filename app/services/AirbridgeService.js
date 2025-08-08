import { Airbridge } from 'airbridge-react-native-sdk';
import { StackActions } from '@react-navigation/native';
import { AIRBRIDGE_CONFIG, AIRBRIDGE_EVENTS, validateAirbridgeConfig } from '../config/airbridgeConfig';

class AirbridgeService {
  constructor() {
    this.initialized = false;
    this.navigationRef = null;
  }

  // Initialize Airbridge SDK
  initialize(appName = AIRBRIDGE_CONFIG.APP_NAME, appToken = 'ca5c168a34444c75af781b06635778d5') {
    if (this.initialized) return;

    try {
      // Initialize Airbridge with React Native SDK
      const option = {
        appName: appName,
        appToken: appToken,
        ...AIRBRIDGE_CONFIG.TRACKING_OPTIONS,
      };

      Airbridge.init(option);
      this.setupDeeplinkHandling();
      this.initialized = true;
      console.log('✅ Airbridge React Native SDK initialized successfully');
      console.log(`📱 App Name: ${appName}`);
    } catch (error) {
      console.error('❌ Airbridge initialization failed:', error);
    }
  }

  // Setup deeplink handling
  setupDeeplinkHandling() {
    Airbridge.setDeeplinkCallback((deeplink) => {
      console.log('🔗 Airbridge deeplink received:', deeplink);
      console.log('🔍 Deeplink type:', typeof deeplink);
      console.log('🔍 Deeplink keys:', deeplink ? Object.keys(deeplink) : 'null');
      console.log('🔍 Deeplink JSON:', JSON.stringify(deeplink, null, 2));
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('📱 App state: foreground');
      this.handleDeeplink(deeplink);
    });
  }

  // Set navigation reference
  setNavigationRef(navigationRef) {
    this.navigationRef = navigationRef;
    // Ensure callbacks run after navigation is ready
    if (this.navigationRef && typeof this.navigationRef.addListener === 'function') {
      this.navigationRef.addListener?.('state', () => {
        this._navReadyAt = Date.now();
      });
    }
  }

  // Handle deeplink navigation
  handleDeeplink(url) {
    if (!url) {
      console.log('❌ Deeplink failed: empty URL');
      return;
    }

    // If navigation not ready yet, retry shortly
    if (!this.navigationRef?.isReady?.()) {
      console.log('⏳ Navigation not ready, retrying deeplink in 300ms');
      setTimeout(() => this.handleDeeplink(url), 300);
      return;
    }

    const rawUrl = typeof url === 'string' ? url : (url?.deeplink || url?.deeplinkUrl || url?.url || '');

    console.log('🔗 Processing deeplink:', rawUrl);
    console.log('📱 Navigation ready:', this.navigationRef?.isReady());

    try {
      const navigateToEvent = (eventId) => {
        if (!eventId) {
          console.log('❌ No event ID provided to navigateToEvent');
          return false;
        }
        console.log('🎯 Navigating to event detail with ID:', eventId);
        console.log('🎯 Navigation params being passed:', { id: eventId });
        try {
          this.navigationRef.dispatch(StackActions.push('Detail', { id: eventId }));
          console.log('✅ Stack push successful');
        } catch (e) {
          console.log('⚠️ Stack push failed, fallback to navigate', e?.message);
          this.navigationRef.navigate('Detail', { id: eventId });
          console.log('✅ Navigate fallback successful');
        }
        return true;
      };

      const decodeAndRetryIfNested = (urlObj) => {
        const qp = urlObj?.searchParams;
        if (!qp) return false;
        const nestedKeys = ['deeplink', 'deep_link', 'airbridge_deeplink', 'af_dp', 'al_applink_data'];
        for (const key of nestedKeys) {
          const nested = qp.get(key);
          if (nested) {
            try {
              const decoded = decodeURIComponent(nested);
              console.log(`🔁 Found nested deeplink in "${key}":`, decoded);
              this.handleDeeplink(decoded);
              return true;
            } catch (_) {
              console.log(`⚠️ Failed to decode nested value for ${key}`);
            }
          }
        }
        return false;
      };

      let urlObj;
      try {
        urlObj = new URL(rawUrl);
      } catch (_) {
        // ignore
      }

      const path = urlObj?.pathname || '';
      // Accept any non-separator token as ID to be flexible with backend IDs
      const pathMatch = path.match(/\/(?:event|events)\/([^\/?#]+)/);
      if (pathMatch && navigateToEvent(pathMatch[1])) return;

      const idFromQuery = urlObj?.searchParams?.get('id') || urlObj?.searchParams?.get('eventId') || urlObj?.searchParams?.get('event_id');
      if (idFromQuery && navigateToEvent(idFromQuery)) return;

      if (urlObj?.hash) {
        const hash = urlObj.hash.replace(/^#/, '');
        const hashPathMatch = hash.match(/\b(?:event|events)\/([^\/?#]+)\b/);
        if (hashPathMatch && navigateToEvent(hashPathMatch[1])) return;
        const hashQueryMatch = hash.match(/\b(?:id|eventId)=([^&]+)\b/);
        if (hashQueryMatch && navigateToEvent(hashQueryMatch[1])) return;
      }

      if (urlObj && decodeAndRetryIfNested(urlObj)) return;

      const rawMatchPath = rawUrl.match(/\/(?:event|events)\/([^\/?#]+)/);
      if (rawMatchPath && navigateToEvent(rawMatchPath[1])) return;
      const rawMatchQuery = rawUrl.match(/(?:\?|&)(?:id|eventId|event_id)=([^&]+)/);
      if (rawMatchQuery && navigateToEvent(rawMatchQuery[1])) return;

      // Handle Airbridge custom parameters
      if (typeof url === 'object' && url !== null) {
        console.log('🔍 Checking Airbridge object for event ID...');
        const eventId = url.event_id || url.eventId || url.id;
        if (eventId && navigateToEvent(eventId)) return;
        
        // Check custom parameters
        if (url.customParameters) {
          const customEventId = url.customParameters.event_id || url.customParameters.eventId || url.customParameters.id;
          if (customEventId && navigateToEvent(customEventId)) return;
        }
      }

      if (path.includes('/profile') || /(?:\?|#)(?:route|screen)=profile/.test(rawUrl)) {
        console.log('👤 Navigating to profile');
        this.navigationRef.navigate('ProfileScreen');
        return;
      }

      console.log('ℹ️ No matching route or event id. Navigating to home');
      this.navigationRef.navigate('Drawer');
      
    } catch (error) {
      console.error('❌ Error handling deeplink:', error);
      this.navigationRef.navigate('Drawer');
    }
  }

  // Send custom events
  sendEvent(eventName, eventData = {}) {
    try {
      Airbridge.trackEvent(eventName, eventData);
      console.log('Event sent to Airbridge:', eventName, eventData);
    } catch (error) {
      console.error('Failed to send event to Airbridge:', error);
    }
  }

  // Set user properties
  setUserProperties(userId, userEmail = null, userAlias = {}) {
    try {
      Airbridge.setUser({
        ID: userId,
        email: userEmail,
        alias: userAlias
      });
      console.log('User properties set in Airbridge');
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  // Track standard events
  trackSignUp(userId, userEmail) {
    this.sendEvent('airbridge.user.signup', {
      user_id: userId,
      user_email: userEmail
    });
  }

  trackSignIn(userId) {
    this.sendEvent('airbridge.user.signin', {
      user_id: userId
    });
  }

  trackEventView(eventId, eventName) {
    this.sendEvent('event_view', {
      event_id: eventId,
      event_name: eventName
    });
  }

  trackEventBooking(eventId, eventName, ticketPrice) {
    this.sendEvent('purchase', {
      event_id: eventId,
      event_name: eventName,
      value: ticketPrice,
      currency: 'VND'
    });
  }
}

// Export singleton instance
export default new AirbridgeService();