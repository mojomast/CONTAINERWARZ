import { useGameStore } from '../store/gameStore';
import { formatCurrency, getExperienceForNextLevel } from '../utils/calculations';
import { Package, Ship } from 'lucide-react';

export default function Dashboard() {
  const player = useGameStore((state) => state.player);
  const inventory = useGameStore((state) => state.inventory);
  const ships = useGameStore((state) => state.ships);
  const setScreen = useGameStore((state) => state.setScreen);

  const xpForNext = getExperienceForNextLevel(player.level);
  const xpProgress = ((player.experience - ((player.level - 1) * (player.level - 1) * 100)) / ((player.level * player.level * 100) - ((player.level - 1) * (player.level - 1) * 100))) * 100;

  return (
    <div className="screen dashboard">
      <header className="game-header">
        <h1>⛴️ MCTC Shipping Tycoon</h1>
        <div className="player-stats">
          <div className="stat">
            <strong>Balance:</strong> {formatCurrency(player.balance)}
          </div>
          <div className="stat">
            <strong>Level:</strong> {player.level}
          </div>
          <div className="stat">
            <strong>XP:</strong> {player.experience} / {xpForNext}
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </div>
      </header>

      <nav className="main-nav">
        <button className="nav-btn" onClick={() => setScreen('dashboard')}>
          📊 Dashboard
        </button>
        <button className="nav-btn" onClick={() => setScreen('market')}>
          🏪 Market
        </button>
        <button className="nav-btn" onClick={() => setScreen('loading')}>
          📦 Loading Bay
        </button>
        <button className="nav-btn" onClick={() => setScreen('routes')}>
          🗺️ Routes
        </button>
        <button className="nav-btn" onClick={() => setScreen('security')}>
          🛡️ Security
        </button>
      </nav>

      <div className="dashboard-content">
        <section className="inventory-section">
          <h2>📦 Inventory</h2>
          <div className="inventory-grid">
            <div className="inventory-item">
              <Package size={32} />
              <div>
                <strong>USFF PCs</strong>
                <p>{inventory.usffPCs} standard</p>
                <p className="premium">✨ {inventory.usffPCsPremium} Win11</p>
              </div>
            </div>
            <div className="inventory-item">
              <span style={{ fontSize: '32px' }}>🧑</span>
              <div>
                <strong>Huymans</strong>
                <p>{inventory.huymans} standard</p>
                <p className="premium">🏀 {inventory.huymansPremium} skilled</p>
              </div>
            </div>
          </div>
        </section>

        <section className="fleet-section">
          <h2>🚢 Your Fleet</h2>
          <div className="ships-list">
            {ships.map((ship) => (
              <div key={ship.id} className={`ship-card status-${ship.status}`}>
                <div className="ship-header">
                  <h3><Ship size={20} /> {ship.name}</h3>
                  <span className="ship-status">{ship.status.toUpperCase()}</span>
                </div>
                
                {ship.status === 'sailing' && ship.route && (
                  <div className="ship-progress">
                    <p>{ship.route.name}</p>
                    <p className="small">⚔️ W:{ship.weaponScore||0} 🛡️ D:{ship.defenseScore||0}</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${ship.position * 100}%` }} />
                    </div>
                    <p className="progress-text">{Math.floor(ship.position * 100)}% complete</p>
                  </div>
                )}

                {ship.status === 'idle' && (
                  <div className="ship-idle">
                    <p>Ready for action!</p>
                    <div style={{display:'flex',gap:8}}>
                      <button className="btn-small" onClick={() => setScreen('loading')}>
                        Load Cargo
                      </button>
                      <button className="btn-small" onClick={() => setScreen('security')}>
                        Security
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {ships.some(s => s.lastEvent) && (
          <section>
            <h2>📰 Latest Events</h2>
            <div className="tips">
              {ships.filter(s => s.lastEvent).map(s => (
                <div key={s.id} className="tip">{s.name}: {s.lastEvent}</div>
              ))}
            </div>
          </section>
        )}

        <section className="tips-section">
          <h2>💡 Quick Tips</h2>
          <div className="tips">
            {player.level < 3 && (
              <div className="tip">🎯 Complete routes to level up and unlock regional shipping!</div>
            )}
            {player.level < 5 && player.level >= 3 && (
              <div className="tip">📏 Reach level 5 to unlock 40ft containers!</div>
            )}
            {inventory.usffPCs + inventory.usffPCsPremium < 50 && (
              <div className="tip">🛒 Stock up on cargo at the market!</div>
            )}
            {ships.every(s => s.status === 'idle') && (
              <div className="tip">⏰ Get your ships sailing to earn profits!</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
