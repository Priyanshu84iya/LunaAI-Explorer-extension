import { createRoot } from 'react-dom/client';
import '../styles/globals.css';
import { PopupApp } from './PopupApp';

const container = document.getElementById('root')!;
createRoot(container).render(<PopupApp />);
