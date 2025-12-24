import { useState } from 'preact/hooks';
import { JSX } from 'preact';
import '../App.css';

interface CustomColorPickerProps {
  label?: string;
  color: string; // Expecting Hex (e.g., "#00f3ff")
  onChange: (hex: string) => void;
}

// --- Helpers ---

// Convert Hex string to RGB object
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Convert discrete RGB values back to Hex string
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// HSL to Hex (for the rainbow slider logic you already had)
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Cyberpunk Presets
const PRESETS = [
  '#ff0000', // Red
  '#ffae00', // Orange
  '#ffff00', // Yellow
  '#00ff00', // Green
  '#00f3ff', // Cyan (Theme)
  '#0000ff', // Blue
  '#bc13fe', // Purple (Theme)
  '#ff00ff', // Magenta
  '#ffffff', // White
  '#000000', // Off
];

export function CustomColorPicker({ label, color, onChange }: CustomColorPickerProps) {
  const [hue, setHue] = useState(180);
  
  // Parse current color prop into RGB numbers for the inputs
  const { r, g, b } = hexToRgb(color);

  const handleHueChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.currentTarget.value, 10);
    setHue(newHue);
    const newHex = hslToHex(newHue, 100, 50);
    onChange(newHex);
  };

  // Generic handler for R, G, or B inputs
  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    let val = parseInt(value, 10);
    if (isNaN(val)) val = 0;
    
    // Construct new hex based on which channel changed
    const newR = channel === 'r' ? val : r;
    const newG = channel === 'g' ? val : g;
    const newB = channel === 'b' ? val : b;

    onChange(rgbToHex(newR, newG, newB));
  };

  return (
    <div class="custom-color-picker">
      {label && <span class="input-label">{label}</span>}
      
      {/* Top Row: Preview and RGB Inputs */}
      <div class="color-top-row">
        <div class="color-preview" style={{ backgroundColor: color }}></div>
        
        {/* REPLACED: Hex Input with RGB Inputs */}
        <div class="rgb-inputs-container">
          
          {/* Red Input */}
          <div class="rgb-input-wrapper red">
            <label>R</label>
            <input 
              type="number" min="0" max="255" 
              value={r} 
              onInput={(e) => handleRgbChange('r', e.currentTarget.value)}
            />
          </div>

          {/* Green Input */}
          <div class="rgb-input-wrapper green">
            <label>G</label>
            <input 
              type="number" min="0" max="255" 
              value={g} 
              onInput={(e) => handleRgbChange('g', e.currentTarget.value)}
            />
          </div>

          {/* Blue Input */}
          <div class="rgb-input-wrapper blue">
            <label>B</label>
            <input 
              type="number" min="0" max="255" 
              value={b} 
              onInput={(e) => handleRgbChange('b', e.currentTarget.value)}
            />
          </div>

        </div>
      </div>

      {/* Hue Slider */}
      <div class="hue-slider-container">
        <input 
          type="range" 
          min="0" 
          max="360" 
          value={hue} 
          class="hue-range"
          onInput={handleHueChange}
        />
      </div>

      {/* Quick Swatches */}
      <div class="swatch-grid">
        {PRESETS.map((preset) => (
          <div 
            key={preset}
            class={`swatch ${color === preset ? 'active' : ''}`}
            style={{ backgroundColor: preset }}
            onClick={() => onChange(preset)}
          />
        ))}
      </div>
    </div>
  );
}