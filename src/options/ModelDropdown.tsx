import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import {
  findModelById,
  findProviderByModelId,
  MODEL_PROVIDERS,
  type ModelInfo,
  type ModelProvider,
} from '../ai/models';

interface ModelDropdownProps {
  value: string;
  onChange: (modelId: string) => void;
}

interface FilteredGroup extends ModelProvider {
  models: ModelInfo[];
}

export function ModelDropdown({ value, onChange }: ModelDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedModel = findModelById(value) ?? { id: value, name: value || 'Select AI model' };
  const selectedProvider = findProviderByModelId(value);

  const filteredGroups: FilteredGroup[] = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return MODEL_PROVIDERS.map((group) => {
      const providerMatch = group.provider.toLowerCase().includes(normalizedQuery);
      const matchingModels = group.models.filter(
        (model) =>
          providerMatch ||
          model.name.toLowerCase().includes(normalizedQuery) ||
          model.id.toLowerCase().includes(normalizedQuery),
      );
      return { ...group, models: matchingModels };
    }).filter((group) => group.models.length > 0);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (modelId: string) => {
    onChange(modelId);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border-[3px] border-luna-text text-luna-text text-sm font-semibold shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#111111] transition-all"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedModel.name}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {selectedProvider && (
        <p className="mt-1.5 text-xs font-mono font-bold uppercase tracking-wider text-luna-muted">
          Active provider: {selectedProvider.provider}
        </p>
      )}

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-luna-bg border-[3px] border-luna-text shadow-brutal-lg max-h-80 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b-[3px] border-luna-text bg-white sticky top-0 z-10">
            <Search size={14} className="shrink-0 text-luna-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-luna-muted"
            />
          </div>

          <div className="overflow-y-auto luna-scroll flex-1">
            {filteredGroups.length === 0 ? (
              <div className="px-3 py-4 text-sm text-luna-muted text-center">No models found</div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.provider}>
                  <div className="px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-luna-muted bg-luna-bg border-b border-luna-text/10">
                    {group.provider}
                  </div>
                  <ul role="listbox">
                    {group.models.map((model) => {
                      const isSelected = model.id === value;
                      return (
                        <li key={model.id} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            onClick={() => handleSelect(model.id)}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors ${
                              isSelected
                                ? 'bg-luna-accent text-luna-text font-semibold'
                                : 'bg-white text-luna-text hover:bg-luna-bg'
                            }`}
                          >
                            <span className="truncate">{model.name}</span>
                            {isSelected && <Check size={14} className="shrink-0" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
