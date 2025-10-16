import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ROUTES } from '../data/gameData';
import { formatCurrency, calculateShipmentProfit } from '../utils/calculations';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function Routes() {
  const player = useGameStore((state) => state.player);
  const ships = useGameStore((state) => state.ships);
  const deployShip = useGameStore((state) => state.deployShip);
  const setScreen = useGameStore((state) => state.setScreen);

  const [selectedShip, setSelectedShip] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');

  const availableShips = ships.filter(s => s.status === 'idle' && s.containers[0].cargo.length > 0);
  const availableRoutes = ROUTES.filter(r => player.unlockedRoutes.includes(r.id));

  const ship = ships.find(s => s.id === selectedShip);
  const route = ROUTES.find(r => r.id === selectedRoute);

  const cargoValue = ship ? ship.containers.reduce((sum, container) => {
    return sum + container.cargo.reduce((cargoSum, c) => cargoSum + c.totalValue, 0);
  }, 0) : 0;

  const estimatedProfit = route ? calculateShipmentProfit(cargoValue, route.priceMultiplier) : 0;

  const handleDeploy = () => {
    if (selectedShip && selectedRoute) {
      deployShip(selectedShip, selectedRoute);
      setSelectedShip('');
      setSelectedRoute('');
    }
  };

  return (
    <div className="screen routes">
      <header className="game-header">
        <button className="btn-back" onClick={() => setScreen('dashboard')}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1>🗺️ Shipping Routes</h1>
      </header>

      <div className="routes-content">
        {availableShips.length === 0 ? (
          <div className="empty-state">
            <p>No loaded ships available for deployment.</p>
            <button className="btn-primary" onClick={() => setScreen('loading')}>
              Load Cargo
            </button>
          </div>
        ) : (
          <>
            <section className="ship-select">
              <h2>Select Ship to Deploy</h2>
              <div className="ship-cards">
                {availableShips.map(s => {
                  const shipValue = s.containers.reduce((sum, c) => 
                    sum + c.cargo.reduce((cSum, cargo) => cSum + cargo.totalValue, 0), 0
                  );
                  return (
                    <button
                      key={s.id}
                      className={`ship-card-btn ${selectedShip === s.id ? 'selected' : ''}`}
                      onClick={() => setSelectedShip(s.id)}
                    >
                      <h3>{s.name}</h3>
                      <p>Container: {s.containers[0].type}</p>
                      <p>Cargo Value: {formatCurrency(shipValue)}</p>
                      <p className="cargo-count">{s.containers[0].cargo.length} cargo types loaded</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="route-select">
              <h2>Select Route</h2>
              <div className="routes-grid">
                {availableRoutes.map(r => (
                  <button
                    key={r.id}
                    className={`route-card ${selectedRoute === r.id ? 'selected' : ''} difficulty-${r.difficulty}`}
                    onClick={() => setSelectedRoute(r.id)}
                  >
                    <div className="route-header">
                      <MapPin size={20} />
                      <span className={`difficulty-badge ${r.difficulty}`}>
                        {r.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <h3>{r.name}</h3>
                    <div className="route-details">
                      <p>Distance: {r.distance}km</p>
                      <p>Duration: {r.duration}s</p>
                      <p className="multiplier">Price: ×{r.priceMultiplier}</p>
                    </div>
                  </button>
                ))}
              </div>

              {player.level < 3 && (
                <div className="unlock-hint">
                  🔒 Reach level 3 to unlock Regional Routes
                </div>
              )}
            </section>

            {selectedShip && selectedRoute && (
              <section className="deployment-summary">
                <h2>Deployment Summary</h2>
                <div className="summary-grid">
                  <div className="summary-item">
                    <strong>Ship:</strong> {ship?.name}
                  </div>
                  <div className="summary-item">
                    <strong>Route:</strong> {route?.name}
                  </div>
                  <div className="summary-item">
                    <strong>Cargo Value:</strong> {formatCurrency(cargoValue)}
                  </div>
                  <div className="summary-item">
                    <strong>Route Bonus:</strong> ×{route?.priceMultiplier}
                  </div>
                  <div className="summary-item">
                    <strong>Est. Revenue:</strong> {formatCurrency(cargoValue * (route?.priceMultiplier || 1))}
                  </div>
                  <div className="summary-item">
                    <strong>Base Cost:</strong> {formatCurrency(500)}
                  </div>
                  <div className="summary-item profit">
                    <strong>Est. Profit:</strong> {formatCurrency(estimatedProfit)}
                  </div>
                  <div className="summary-item">
                    <strong>Travel Time:</strong> {route?.duration}s
                  </div>
                </div>

                <button 
                  className="btn-primary btn-large"
                  onClick={handleDeploy}
                >
                  🚢 Deploy Ship!
                </button>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
