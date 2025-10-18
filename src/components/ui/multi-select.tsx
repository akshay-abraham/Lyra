
"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Command, CommandGroup, CommandItem, CommandList } from "./command";
import { Command as CommandPrimitive } from "cmdk";

export type Option = {
  value: string;
  label: string;
  disable?: boolean;
  /** Fixed options are not removable. */
  fixed?: boolean;
};

type MultiSelectProps = {
  options: Option[];
  defaultValue?: string[];
  placeholder?: string;
  onValueChange: (value: string[]) => void;
};

export function MultiSelect({ options, defaultValue = [], placeholder = "Select...", onValueChange }: MultiSelectProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option[]>(
    defaultValue.map(value => options.find(option => option.value === value)).filter(Boolean) as Option[]
  );
  const [inputValue, setInputValue] = useState("");

  const handleUnselect = (option: Option) => {
    const newSelected = selected.filter(s => s.value !== option.value);
    setSelected(newSelected);
    onValueChange(newSelected.map(s => s.value));
  };

  useEffect(() => {
    if (defaultValue.length > 0) {
      setSelected(defaultValue.map(value => options.find(option => option.value === value)).filter(Boolean) as Option[]);
    }
  }, [defaultValue, options]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && selected.length > 0) {
          const lastSelected = selected[selected.length - 1];
          if (!lastSelected.fixed) {
            handleUnselect(lastSelected);
          }
        }
      }
      if (e.key === "Escape") {
        input.blur();
      }
    }
  };

  const selectables = options.filter(option => !selected.some(s => s.value === option.value));

  return (
    <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map(option => (
            <Badge key={option.value} variant="secondary">
              {option.label}
              <button
                className={cn(
                  "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  option.fixed ? "hidden" : ""
                )}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleUnselect(option);
                  }
                }}
                onMouseDown={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleUnselect(option)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && selectables.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto">
                {selectables.map(option => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      setInputValue("");
                      const newSelected = [...selected, option];
                      setSelected(newSelected);
                      onValueChange(newSelected.map(s => s.value));
                    }}
                    className={"cursor-pointer"}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  );
}

