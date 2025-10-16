import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { WEAPONS, DEFENSES, MERCENARIES } from '../data/gameData';
import { ArrowLeft, Shield, Sword } from 'lucide-react';

export default function Security() {
  const ships = useGameStore((s) => s.ships);
  const player = useGameStore((s) => s.player);
  const setScreen = useGameStore((s) => s.setScreen);
  const renameShip = useGameStore((s) => s.renameShip);
  const buyWeapon = useGameStore((s) => s.buyWeapon);
  const buyDefense = useGameStore((s) => s.buyDefense);
  const hireMercenary = useGameStore((s) => s.hireMercenary);

  const [selectedShipId, setSelectedShipId] = useState(ships[0]?.id ?? '');
  const ship = ships.find((s) => s.id === selectedShipId);
  const [newName, setNewName] = useState(ship?.name ?? '');
  const legendaries = useGameStore((s) => s.legendaries);
  const applyLegendaryToShip = useGameStore((s) => s.applyLegendaryToShip);
  const sellLegendary = useGameStore((s) => s.sellLegendary);

  if (!ship) {
    return (
      <div className="screen">
        <header className="game-header">
          <button className="btn-back" onClick={() => setScreen('dashboard')}><ArrowLeft/> Back</button>
          <h1>🛡️ Ship Security</h1>
        </header>
        <p className="empty">No ship selected.</p>
      </div>
    );
  }

  const canAfford = (cost: number) => player.balance >= cost;

  return (
    <div className="screen">
      <header className="game-header">
        <button className="btn-back" onClick={() => setScreen('dashboard')}><ArrowLeft/> Back</button>
        <h1>🛡️ Ship Security</h1>
        <div className="balance">MC$ {player.balance.toLocaleString()}</div>
      </header>

      <section className="ship-select">
        <h2>Select Ship</h2>
        <div className="ship-buttons">
          {ships.map((s) => (
            <button key={s.id} className={`ship-btn ${selectedShipId===s.id?'active':''}`} onClick={() => {setSelectedShipId(s.id); setNewName(s.name);}}>
              {s.name} · W:{s.weaponScore||0} D:{s.defenseScore||0}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Rename Ship</h2>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder="Enter ship name" />
          <button className="btn-primary" onClick={()=> renameShip(ship.id, newName.trim()||ship.name)}>Save</button>
        </div>
      </section>

      <section>
        <h2><Sword/> Weapons</h2>
        <div className="routes-grid">
          {WEAPONS.map(w => (
            <button key={w.id} className="route-card" onClick={()=> canAfford(w.cost) && buyWeapon(ship.id, w.id)} disabled={!canAfford(w.cost)}>
              <h3>{w.name}</h3>
              <p>Cost: MC$ {w.cost}</p>
              <p>Weapon +{w.weaponBonus||0} {w.defenseBonus?`· Defense +${w.defenseBonus}`:''}</p>
              <p className="small">{w.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2><Shield/> Defenses</h2>
        <div className="routes-grid">
          {DEFENSES.map(d => (
            <button key={d.id} className="route-card" onClick={()=> canAfford(d.cost) && buyDefense(ship.id, d.id)} disabled={!canAfford(d.cost)}>
              <h3>{d.name}</h3>
              <p>Cost: MC$ {d.cost}</p>
              <p>Defense +{d.defenseBonus||0} {d.weaponBonus?`· Weapon +${d.weaponBonus}`:''}</p>
              <p className="small">{d.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>🧑‍✈️ Mercenaries</h2>
        <div className="routes-grid">
          {MERCENARIES.map(m => (
            <button key={m.id} className="route-card" onClick={()=> canAfford(m.cost) && hireMercenary(ship.id, m.id)} disabled={!canAfford(m.cost)}>
              <h3>{m.name}</h3>
              <p>Cost: MC$ {m.cost}</p>
              <p>Weapon +{m.weaponBonus||0} · Defense +{m.defenseBonus||0}</p>
              <p className="small">{m.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>🌟 Legendary Items</h2>
        {legendaries.length === 0 ? (
          <p className="empty">No legendary items yet. Purchase cargo for a small chance to find one.</p>
        ) : (
          <div className="routes-grid">
            {legendaries.map((l) => (
              <div key={l.id} className="route-card">
                <h3>{l.name}</h3>
                <p className="small">{l.description}</p>
                <p>Bonuses: {['W+'+(l.weaponBonus||0),'D+'+(l.defenseBonus||0), l.profitBonus?('Profit+'+(Math.round(l.profitBonus*100))+'%'):'', l.speedBonus?('Speed+'+(Math.round(l.speedBonus*100))+'%'):''].filter(Boolean).join(' · ')}</p>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn-small" onClick={()=> applyLegendaryToShip(l.id, ship.id)}>Apply to {ship.name}</button>
                  <button className="btn-small" onClick={()=> sellLegendary(l.id)}>Sell (MC$ {l.sellValue})</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {ship.lastEvent && (
        <section>
          <h2>Recent Event</h2>
          <p>{ship.lastEvent}</p>
        </section>
      )}
    </div>
  );
}
