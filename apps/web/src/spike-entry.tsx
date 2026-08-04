import { createRoot } from 'react-dom/client';
import { SpikeBoard } from './spike/SpikeBoard';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(<SpikeBoard />);
