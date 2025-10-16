import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CARGO_TYPES } from '../data/gameData';
import { formatCurrency } from '../utils/calculations';
import { ArrowLeft } from 'lucide-react';

export default function Market() {
  const player = useGameStore((state) => state.player);
  const inventory = useGameStore((state) => state.inventory);
  const buyUsffPC = useGameStore((state) => state.buyUsffPC);
  const buyHuyman = useGameStore((state) => state.buyHuyman);
  const setScreen = useGameStore((state) => state.setScreen);

  const [pcQuantity, setPcQuantity] = useState(10);
  const [huymanQuantity, setHuymanQuantity] = useState(1);

  const pcCost = pcQuantity * CARGO_TYPES.usffPC.basePrice * 0.5;
  const huymanCost = huymanQuantity * CARGO_TYPES.huyman.basePrice * 0.5;

  return (
    <div className="screen market">
      <header className="game-header">
        <button className="btn-back" onClick={() => setScreen('dashboard')}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1>🏪 Cargo Market</h1>
        <div className="balance">{formatCurrency(player.balance)}</div>
      </header>

      <div className="market-content">
        <p className="market-info">Buy cargo at 50% of sell price. Premium variants discovered automatically!</p>

        <div className="market-items">
          <div className="market-item">
            <div className="item-header">
              <span className="item-icon">💻</span>
              <div>
                <h2>USFF Personal Computers</h2>
                <p className="item-specs">Volume: 1L | Weight: 1kg</p>
                <p className="item-price">Sell Price: 20 MC$ (✨ Win11: 50 MC$)</p>
              </div>
            </div>

            <div className="item-purchase">
              <div className="quantity-control">
                <button onClick={() => setPcQuantity(Math.max(1, pcQuantity - 10))}>-10</button>
                <button onClick={() => setPcQuantity(Math.max(1, pcQuantity - 1))}>-1</button>
                <input 
                  type="number" 
                  value={pcQuantity} 
                  onChange={(e) => setPcQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button onClick={() => setPcQuantity(pcQuantity + 1)}>+1</button>
                <button onClick={() => setPcQuantity(pcQuantity + 10)}>+10</button>
              </div>
              
              <div className="purchase-summary">
                <p>Total Cost: {formatCurrency(pcCost)}</p>
                <p className="small">~{Math.floor(pcQuantity * 0.65)} standard + ~{Math.floor(pcQuantity * 0.35)} premium</p>
              </div>

              <button 
                className="btn-primary"
                onClick={() => buyUsffPC(pcQuantity)}
                disabled={player.balance < pcCost}
              >
                Buy {pcQuantity} USFF PCs
              </button>
            </div>
          </div>

          <div className="market-item">
            <div className="item-header">
              <span className="item-icon">🧑</span>
              <div>
                <h2>Huymans (Villager NPCs)</h2>
                <p className="item-specs">Volume: 70L | Weight: 70kg</p>
                <p className="item-price">Sell Price: 300 MC$ (🏀 Skilled: 1,200 MC$)</p>
              </div>
            </div>

            <div className="item-purchase">
              <div className="quantity-control">
                <button onClick={() => setHuymanQuantity(Math.max(1, huymanQuantity - 5))}>-5</button>
                <button onClick={() => setHuymanQuantity(Math.max(1, huymanQuantity - 1))}>-1</button>
                <input 
                  type="number" 
                  value={huymanQuantity} 
                  onChange={(e) => setHuymanQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button onClick={() => setHuymanQuantity(huymanQuantity + 1)}>+1</button>
                <button onClick={() => setHuymanQuantity(huymanQuantity + 5)}>+5</button>
              </div>
              
              <div className="purchase-summary">
                <p>Total Cost: {formatCurrency(huymanCost)}</p>
                <p className="small">~{Math.floor(huymanQuantity * 0.85)} standard + ~{Math.floor(huymanQuantity * 0.15)} skilled</p>
              </div>

              <button 
                className="btn-primary"
                onClick={() => buyHuyman(huymanQuantity)}
                disabled={player.balance < huymanCost}
              >
                Buy {huymanQuantity} Huymans
              </button>
            </div>
          </div>
        </div>

        <section className="inventory-summary">
          <h3>Current Inventory</h3>
          <div className="inventory-row">
            <div>💻 USFF PCs: {inventory.usffPCs} standard, ✨ {inventory.usffPCsPremium} Win11</div>
            <div>🧑 Huymans: {inventory.huymans} standard, 🏀 {inventory.huymansPremium} skilled</div>
          </div>
        </section>
      </div>
    </div>
  );
}
