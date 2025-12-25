import { useState, useEffect, useRef } from 'preact/hooks';
import RAW_LAYOUT from "./kl.json";
import './App.css';
import { CustomColorPicker } from './components/CustomColorPicker';
import { CustomDropdown } from './components/CustomDropdown';

import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

interface EffectOption { id: number; name: string; }
interface KleKey { label: string; x: number; y: number; w: number; h: number; index: number; }

const EFFECTS: EffectOption[] = [
  { id: 0, name: "Static" },
  { id: 1, name: "Breathe" },
  { id: 2, name: "Fade" },
  { id: 3, name: "GettingOff" },
  { id: 4, name: "LittleStars" },
  { id: 5, name: "Laser" },
  { id: 6, name: "Wave" },
  { id: 7, name: "Neon" },
  { id: 8, name: "RainDrop" },
  { id: 9, name: "Ripple" },
  { id: 10, name: "Wave2" },
  { id: 11, name: "Swirl" },
  // { id: 12, name: "USERDEFINE1" },
  // { id: 13, name: "USERDEFINE2" },
  // { id: 14, name: "USERDEFINE3" },
  // { id: 15, name: "USERDEFINE4" },
  // { id: 16, name: "USERDEFINE5" },
];



function parseKleLayout(layout: any[]): KleKey[] {
  const keys: KleKey[] = [];
  let globalY = 0; 
  let keyIndex = 0;

  layout.forEach((row) => {
    if (Array.isArray(row)) {
      let currentX = 0;
      row.forEach((item, itemIndex) => {
        if (typeof item === 'object') {
          if (item.x) currentX += item.x;
          if (item.y) globalY += item.y;
        } else {
          let w = 1;
          let h = 1;
          const prev = row[itemIndex - 1];
          if (typeof prev === 'object') {
            if (prev.w) w = prev.w;
            if (prev.h) h = prev.h;
          }
          keys.push({
            label: item,
            x: currentX,
            y: globalY,
            w: w,
            h: h,
            index: keyIndex++
          });
          currentX += w;
        }
      });
      globalY++;
    }
  });
  return keys;
}

const PARSED_KEYS = parseKleLayout(RAW_LAYOUT);

export type CbColor = 
    "Color1"|
    "Color2"|
    "Color3"|
    "Color4"|
    "Color5"|
    "Color6"|
    "Color7"|
    "ColorLoop";

export default function App() {
  const [connected, setConnected] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>('#00f3ff');
  const [currentColorIdx, setCurrentColorIdx] = useState<CbColor>('Color2');
  const [brightness, setBrightness] = useState<number>(7);
  const [speed, setSpeed] = useState<number>(5);
  const [activeEffect, setActiveEffect] = useState<number>(0x00);
  const [unitSize, setUnitSize] = useState<number>(48);
  const [keyColors, setKeyColors] = useState<string[]>(Array(PARSED_KEYS.length).fill('#000000'));

  // --- NEW: Drag State ---
  const isDragging = useRef(false);

  // --- NEW: Auto-Detect Listener ---
  useEffect(() => {
    // 1. Listen for backend events
    const unlisten = listen('device-status', (event: any) => {
      const isConnected = event.payload.connected;
      setConnected(isConnected);
    });

    invoke("get_connection_status")
      .then((status) => {
        console.log("Initial status check:", status);
        setConnected(status as boolean);
      })
      .catch(console.error);

    // Cleanup listener on unmount
    return () => {
      unlisten.then(f => f());
    };
  }, []);

  // --- NEW: Global Mouse Up Listener ---
  useEffect(() => {
    const handleGlobalUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, []);

  const handleConnect = async () => {
    try {
      setConnected(true);
      console.log("Device Connected");
    } catch (e) {
      console.error(e);
      alert("Failed to connect");
    }
  };

  // Helper to paint a key
  const paintKey = (index: number) => {
    setKeyColors((prev) => {
      const newColors = [...prev];
      // Only update if color is different to avoid unnecessary renders
      if (newColors[index] !== currentColor) {
        newColors[index] = currentColor;
        return newColors;
      }
      return prev;
    });
  };

  // --- Event Handlers for Dragging ---
  
  const onKeyPointerDown = (index: number, e: PointerEvent) => {
    // Prevent text selection while dragging
    e.preventDefault();
    isDragging.current = true;
    paintKey(index);
  };

  const onKeyPointerEnter = (index: number) => {
    if (isDragging.current) {
      paintKey(index);
    }
  };

  const applyGlobalEffect = async () => {
    console.log("Applying Global Effect:", activeEffect);
    console.log("Applying Global Color:", currentColorIdx);
    invoke("set_led_type", {effectIndex: activeEffect, brightness: brightness, speed: speed, color: currentColorIdx})
  };

  const clearMatrix = () => {
    setKeyColors(Array(PARSED_KEYS.length).fill('#000000'));
  };

  return (
    <div class="app-container">
      
      {/* --- LEFT COLUMN: Header + Keyboard --- */}
      <div class="left-panel">
        
        {/* Header moved inside here */}
        <header class="header">
          <div class="logo">
            <h1>COSMIC<span style={{ color: 'var(--neon-cyan)' }}>CONTROLLER</span></h1>
          </div>
          <div class="status-indicator">
            <div class={`dot ${connected ? 'connected' : ''}`}></div>
            <span>{connected ? "ONLINE" : "OFFLINE"}</span>
            <button class="connect-btn" onClick={handleConnect}>
              {connected ? "RECONNECT" : "CONNECT"}
            </button>
          </div>
        </header>

        {/* Keyboard Area */}
        <div class="keyboard-area">
          <div 
            class="keyboard-board" 
            style={{ '--u': `${unitSize}px` } as any}
          >
            {PARSED_KEYS.map((k) => (
              <div
                key={k.index}
                class="key-unit"
                onPointerDown={(e) => onKeyPointerDown(k.index, e)}
                onPointerEnter={() => onKeyPointerEnter(k.index)}
                style={{
                  '--k-x': k.x,
                  '--k-y': k.y,
                  '--k-w': k.w,
                  '--k-h': k.h,
                  '--key-color': keyColors[k.index]
                } as any}
                title={`Index: ${k.index}`}
              >
                <span class="key-label">{k.label.split('\n')[0]}</span>
              </div>
            ))}
          </div>
        </div>

      </div> 
      {/* End of Left Panel */}

      {/* --- RIGHT COLUMN: Controls (Takes Full Height) --- */}
      <div class="controls-panel">
        {/* ... (Your existing controls code remains exactly the same) ... */}
        
        <div class="control-group">
          <CustomColorPicker 
            label="Active Color" 
            color={currentColor} 
            onChange={setCurrentColor} 
            onSwatchChange={setCurrentColorIdx}
          />
        </div>

        {/* ... include all other sliders/buttons ... */}
        {/* (I am abbreviating here, keep your full content!) */}
        
        <div class="control-group">
            <CustomDropdown 
              label="Lighting Effect"
              options={EFFECTS}
              value={activeEffect}
              onChange={(val) => setActiveEffect(val)}
            />
          </div>

          <div class="control-group">
            <label>Brightness: {brightness}</label>
            <input type="range" min="0" max="7" value={brightness} onInput={(e) => setBrightness(parseInt(e.currentTarget.value))} />
          </div>

          <div class="control-group">
            <label>Speed: {speed}</label>
            <input type="range" min="1" max="7" value={speed} onInput={(e) => setSpeed(parseInt(e.currentTarget.value))} />
          </div>
          
          <div class="control-group">
            <label>Zoom: {Math.round((unitSize / 48) * 100)}%</label>
            <input 
              type="range" min="20" max="80" 
              value={unitSize} 
              onInput={(e) => setUnitSize(parseInt(e.currentTarget.value))} 
            />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button class="btn-primary" onClick={applyGlobalEffect}>Apply Effect</button>
            <button class="btn-primary" style={{ background: '#333', color: '#fff' }} onClick={clearMatrix}>Clear Matrix</button>
          </div>

      </div>

    </div>
  );
}