import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/redux/store';
import LoadingModal from './app/modals/LoadingModal';
import AppWithSocket from './AppWithSocket';

const App = () => (
  <Provider store={store}>
    <PersistGate loading={<LoadingModal visible />} persistor={persistor}>
      <AppWithSocket />
    </PersistGate>
  </Provider>
);

export default App;
