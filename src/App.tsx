import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import Tutorial from './components/Tutorial';
import Dashboard from './components/Dashboard';
import LoadingBay from './components/LoadingBay';
import Market from './components/Market';
import Routes from './components/Routes';
import Security from './components/Security';
import './App.css';

function App() {
  const currentScreen = useGameStore((state) => state.currentScreen);
  const tick = useGameStore((state) => state.tick);

  // Game loop - tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="app">
      {currentScreen === 'tutorial' && <Tutorial />}
      {currentScreen === 'dashboard' && <Dashboard />}
      {currentScreen === 'loading' && <LoadingBay />}
      {currentScreen === 'market' && <Market />}
      {currentScreen === 'routes' && <Routes />}
      {currentScreen === 'security' && <Security />}
    </div>
  );
}

export default App;
