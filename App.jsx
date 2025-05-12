import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/redux/store';
import LoadingModal from './app/modals/LoadingModal';
import AppWithSocket from './AppWithSocket';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';

enableScreens();

const App = () => (
  <GestureHandlerRootView style={{ flex: 1}}>
    <Provider store={store}>
      <PersistGate loading={<LoadingModal visible />} persistor={persistor}>
        <AppWithSocket />
      </PersistGate>
    </Provider>
  </GestureHandlerRootView>
);

export default App;
