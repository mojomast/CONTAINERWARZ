import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CARGO_TYPES } from '../data/gameData';
import { calculateContainerCapacity, formatCurrency, formatNumber } from '../utils/calculations';
import { ArrowLeft } from 'lucide-react';

export default function LoadingBay() {
  const ships = useGameStore((state) => state.ships);
  const inventory = useGameStore((state) => state.inventory);
  const loadCargoToContainer = useGameStore((state) => state.loadCargoToContainer);
  const setScreen = useGameStore((state) => state.setScreen);

  const [selectedShip, setSelectedShip] = useState(ships[0]?.id || '');
  const [cargoType, setCargoType] = useState<'usffPC' | 'huyman'>('usffPC');
  const [isPremium, setIsPremium] = useState(false);
  const [quantity, setQuantity] = useState(100);

  const ship = ships.find(s => s.id === selectedShip);
  const availableShips = ships.filter(s => s.status === 'idle');

  if (availableShips.length === 0) {
    return (
      <div className="screen loading-bay">
        <header className="game-header">
          <button className="btn-back" onClick={() => setScreen('dashboard')}>
            <ArrowLeft size={20} /> Back
          </button>
          <h1>📦 Loading Bay</h1>
        </header>
        <div className="empty-state">
          <p>No ships available for loading. Wait for your ships to return!</p>
        </div>
      </div>
    );
  }

  const cargoData = CARGO_TYPES[cargoType];
  const container = ship?.containers[0];
  
  // Calculate capacity analysis
  const analysis = container ? calculateContainerCapacity(container.type, cargoData, container.efficiency) : null;
  
  // Calculate current cargo
  const currentCargo = container?.cargo.reduce((sum, c) => ({
    value: sum.value + c.totalValue,
    volume: sum.volume + c.totalVolume,
    weight: sum.weight + c.totalWeight
  }), { value: 0, volume: 0, weight: 0 }) || { value: 0, volume: 0, weight: 0 };

  // Check availability
  const available = cargoType === 'usffPC'
    ? (isPremium ? inventory.usffPCsPremium : inventory.usffPCs)
    : (isPremium ? inventory.huymansPremium : inventory.huymans);

  const maxQuantity = Math.min(quantity, available);

  const handleLoad = () => {
    if (!ship || !container) return;
    
    const price = isPremium && cargoData.premiumVariants
      ? cargoData.basePrice * cargoData.premiumVariants[0].multiplier
      : cargoData.basePrice;
    
    const cargo = {
      cargoTypeId: cargoType,
      quantity: maxQuantity,
      isPremium,
      premiumVariantName: isPremium && cargoData.premiumVariants ? cargoData.premiumVariants[0].name : undefined,
      totalValue: maxQuantity * price,
      totalWeight: maxQuantity * cargoData.weight,
      totalVolume: maxQuantity * cargoData.volume
    };
    
    loadCargoToContainer(ship.id, 0, cargo);
    setQuantity(100);
  };

  return (
    <div className="screen loading-bay">
      <header className="game-header">
        <button className="btn-back" onClick={() => setScreen('dashboard')}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1>📦 Loading Bay</h1>
      </header>

      <div className="loading-content">
        <section className="ship-select">
          <h2>Select Ship</h2>
          <div className="ship-buttons">
            {availableShips.map(s => (
              <button
                key={s.id}
                className={`ship-btn ${selectedShip === s.id ? 'active' : ''}`}
                onClick={() => setSelectedShip(s.id)}
              >
                {s.name} ({s.containers[0].type})
              </button>
            ))}
          </div>
        </section>

        {ship && container && (
          <>
            <section className="cargo-select">
              <h2>Select Cargo</h2>
              <div className="cargo-options">
                <div className="cargo-option">
                  <label>
                    <input
                      type="radio"
                      name="cargoType"
                      checked={cargoType === 'usffPC' && !isPremium}
                      onChange={() => { setCargoType('usffPC'); setIsPremium(false); }}
                    />
                    💻 USFF PC ({inventory.usffPCs} available)
                  </label>
                </div>
                <div className="cargo-option">
                  <label>
                    <input
                      type="radio"
                      name="cargoType"
                      checked={cargoType === 'usffPC' && isPremium}
                      onChange={() => { setCargoType('usffPC'); setIsPremium(true); }}
                    />
                    ✨ USFF PC Win11 ({inventory.usffPCsPremium} available)
                  </label>
                </div>
                <div className="cargo-option">
                  <label>
                    <input
                      type="radio"
                      name="cargoType"
                      checked={cargoType === 'huyman' && !isPremium}
                      onChange={() => { setCargoType('huyman'); setIsPremium(false); }}
                    />
                    🧑 Huyman ({inventory.huymans} available)
                  </label>
                </div>
                <div className="cargo-option">
                  <label>
                    <input
                      type="radio"
                      name="cargoType"
                      checked={cargoType === 'huyman' && isPremium}
                      onChange={() => { setCargoType('huyman'); setIsPremium(true); }}
                    />
                    🏀 Basketball Huyman ({inventory.huymansPremium} available)
                  </label>
                </div>
              </div>

              <div className="quantity-input">
                <label>Quantity:</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={available}
                />
                <button onClick={() => setQuantity(available)}>Max ({available})</button>
              </div>

              <button
                className="btn-primary"
                onClick={handleLoad}
                disabled={available === 0 || maxQuantity === 0}
              >
                Load {maxQuantity} units
              </button>
            </section>

            <section className="container-analysis">
              <h2>Container Analysis ({container.type})</h2>
              {analysis && (
                <div className="analysis-grid">
                  <div className="analysis-item">
                    <strong>Max Capacity (Volume):</strong> {formatNumber(analysis.capacityByVolume)} units
                  </div>
                  <div className="analysis-item">
                    <strong>Max Capacity (Weight):</strong> {formatNumber(analysis.capacityByWeight)} units
                  </div>
                  <div className="analysis-item">
                    <strong>Actual Capacity:</strong> {formatNumber(analysis.actualCapacity)} units
                  </div>
                  <div className="analysis-item">
                    <strong>Limiting Factor:</strong> {analysis.limitingFactor.toUpperCase()}
                  </div>
                  <div className="analysis-item">
                    <strong>Value/ft³:</strong> {formatCurrency(analysis.valuePerCubicFoot)}
                  </div>
                  <div className="analysis-item">
                    <strong>Value/lb:</strong> {formatCurrency(analysis.valuePerPound)}
                  </div>
                </div>
              )}
            </section>

            <section className="current-load">
              <h2>Current Load</h2>
              {container.cargo.length === 0 ? (
                <p className="empty">Container is empty</p>
              ) : (
                <div className="cargo-list">
                  {container.cargo.map((c, i) => {
                    const type = CARGO_TYPES[c.cargoTypeId];
                    return (
                      <div key={i} className="cargo-item">
                        <span>{c.isPremium ? '✨' : '📦'}</span>
                        <span>{c.quantity}x {type.name}</span>
                        <span>{formatCurrency(c.totalValue)}</span>
                      </div>
                    );
                  })}
                  <div className="cargo-total">
                    <strong>Total Value:</strong> {formatCurrency(currentCargo.value)}
                  </div>
                </div>
              )}
              
              {container.cargo.length > 0 && (
                <button 
                  className="btn-primary" 
                  onClick={() => setScreen('routes')}
                >
                  Deploy Ship →
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
