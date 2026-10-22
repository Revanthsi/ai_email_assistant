import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <AppRoutes />
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
