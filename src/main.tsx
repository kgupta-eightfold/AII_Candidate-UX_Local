import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@eightfold.ai/octuple/lib/octuple.css';
import './ai-interview-candex/styles/global.scss';
import { InterviewProvider } from './ai-interview-candex/context/InterviewContext';
import App from './ai-interview-candex/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InterviewProvider>
      <App />
    </InterviewProvider>
  </StrictMode>,
);
