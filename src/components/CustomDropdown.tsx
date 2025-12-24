import { useState, useEffect, useRef } from 'preact/hooks';
import '../App.css'; // Re-use your main variables

interface DropdownOption {
  id: number | string;
  name: string;
}

interface CustomDropdownProps {
  label?: string;
  options: DropdownOption[];
  value: number | string;
  onChange: (value: any) => void;
}

export function CustomDropdown({ label, options, value, onChange }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the name of the currently selected item
  const selectedName = options.find((opt) => opt.id === value)?.name || "Select...";

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSelect = (id: number | string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div class="custom-dropdown-container" ref={dropdownRef}>
      {label && <span class="dropdown-label">{label}</span>}
      
      <div 
        class={`dropdown-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedName}</span>
        <span class="arrow">▼</span>
      </div>

      {isOpen && (
        <div class="dropdown-menu">
          {options.map((option) => (
            <div 
              key={option.id} 
              class={`dropdown-item ${option.id === value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.id)}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}