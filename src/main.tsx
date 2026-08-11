import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CajaProvider } from './context/CajaContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CajaProvider>
      <App />
    </CajaProvider>
  </StrictMode>,
);

