import { useGameStore } from '../store/gameStore';

export default function Tutorial() {
  const completeTutorial = useGameStore((state) => state.completeTutorial);

  return (
    <div className="screen tutorial">
      <div className="tutorial-content">
        <h1>🚢 Welcome to MCTC Shipping Tycoon!</h1>
        
        <div className="tutorial-section">
          <h2>🎮 How to Play</h2>
          <p>Build your container shipping empire by transporting cargo across the blocky seas!</p>
        </div>

        <div className="tutorial-section">
          <h3>📦 Cargo Types</h3>
          <ul>
            <li><strong>USFF PCs</strong> - Small, light computers (1L, 1kg, 20 MC$)</li>
            <li><strong>Huymans</strong> - Villager NPCs (70L, 70kg, 300 MC$)</li>
          </ul>
          <p>✨ Look out for <strong>premium variants</strong> that sell for much more!</p>
        </div>

        <div className="tutorial-section">
          <h3>🎯 Your Mission</h3>
          <ol>
            <li><strong>Buy Cargo</strong> - Purchase PCs and Huymans from the market</li>
            <li><strong>Load Containers</strong> - Optimize your cargo within weight/volume limits</li>
            <li><strong>Choose Routes</strong> - Select profitable shipping routes</li>
            <li><strong>Profit!</strong> - Earn money and experience to expand your fleet</li>
          </ol>
        </div>

        <div className="tutorial-section">
          <h3>⚖️ Key Concepts</h3>
          <p><strong>Volume vs Weight:</strong> Containers are limited by BOTH volume and weight.</p>
          <p><strong>Value Density:</strong> Calculate MC$ per cubic foot and per pound to maximize profit.</p>
          <p><strong>Strategy:</strong> Early game: Pack PCs (volume-limited). Late game: Premium Huymans (weight-limited, high value).</p>
        </div>

        <div className="tutorial-section">
          <h3>📈 Progression</h3>
          <p>Level up to unlock 40ft containers, better routes, and premium cargo opportunities!</p>
        </div>

        <button className="btn-primary" onClick={completeTutorial}>
          Start Playing! 🎉
        </button>
      </div>
    </div>
  );
}
