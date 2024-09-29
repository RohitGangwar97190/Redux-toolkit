import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store'; // Assuming your store is in redux/store
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}> {/* Wrap the app with Redux Provider */}
    <BrowserRouter> {/* Wrap the app with BrowserRouter */}
      <App />
    </BrowserRouter>
  </Provider>
);
