import { createRoot } from 'react-dom/client';
import '../styles/globals.css';
import { Settings } from './Settings';

const container = document.getElementById('root')!;
createRoot(container).render(<Settings />);
