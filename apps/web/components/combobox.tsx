"use client";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useDictionary } from "@/components/i18n-provider";

export interface ComboboxOption {
  value: string;
  label: string;
}

/**
 * Searchable select built on cmdk — replaces native <select> everywhere
 * (see task item: input select yang ga basic dan bisa search).
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = "",
  buttonClassName,
  panelClassName,
  disabled = false,
}: {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  buttonClassName?: string;
  panelClassName?: string;
  disabled?: boolean;
}) {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={
          buttonClassName ??
          "inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm font-medium text-ink outline-none transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
        }
      >
        <span className="truncate">{selected ? selected.label : placeholder ?? dict.common.search}</span>
        <ChevronDown size={15} aria-hidden className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          id={listId}
          role="listbox"
          className={`absolute z-50 mt-2 w-full min-w-[11rem] overflow-hidden rounded-2xl border border-sand bg-white shadow-[0_18px_48px_rgba(38,50,68,0.18)] ${panelClassName ?? ""}`}
        >
          <Command
            filter={(itemValue, search) => {
              const haystack = itemValue.toLowerCase();
              const needle = search.trim().toLowerCase();
              return needle && !haystack.includes(needle) ? 0 : 1;
            }}
          >
            <div className="flex items-center gap-2 border-b border-sand/80 px-3">
              <Search size={13} className="shrink-0 text-muted" aria-hidden />
              <CommandInput
                autoFocus
                placeholder={dict.common.search}
                aria-label={dict.common.search}
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted/70"
              />
            </div>
            <CommandList className="max-h-60 overflow-y-auto p-1.5">
              <CommandEmpty className="px-3 py-3 text-center text-xs text-muted">{dict.common.comboboxEmpty}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const active = option.value === value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value}`}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      aria-selected={active}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-ink outline-none transition data-[selected=true]:bg-primary-soft data-[selected=true]:text-primary-deep"
                    >
                      <span className="truncate">{option.label}</span>
                      {active && <Check size={14} aria-hidden className="shrink-0 text-primary" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
