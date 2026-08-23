import { createRoot } from 'react-dom/client';
import '../styles/globals.css';
import { ExplorerApp } from './ExplorerApp';

const container = document.getElementById('root')!;
createRoot(container).render(<ExplorerApp />);
