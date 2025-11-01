// Copyright (C) 2025 Akshay K Rooben Abraham
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  onNotFound?: (searchTerm: string) => void;
  placeholder?: string;
  notFoundText?: string;
};

export function Combobox({
  options,
  value,
  onChange,
  onNotFound,
  placeholder = 'Select an option...',
  notFoundText = 'No option found.',
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
        >
          {value
            ? options.find((option) => option.value === value)?.label || value
            : placeholder}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command
          filter={(value, search) => {
            const extendedValue = options.find(o => o.value === value)?.label ?? value;
            if (extendedValue.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder={placeholder}
            value={searchTerm}
            onValueChange={(search) => {
              setSearchTerm(search);
              const match = options.find(o => o.label.toLowerCase() === search.toLowerCase());
              if (!match) {
                onChange(search);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>
              {onNotFound && searchTerm ? (
                <Button variant="ghost" className="w-full" onClick={() => onNotFound(searchTerm)}>
                  Add "{searchTerm}" as a new school
                </Button>
              ) : (
                notFoundText
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? '' : currentValue;
                    const newLabel = options.find(o => o.value === newValue)?.label || newValue;
                    onChange(newLabel);
                    setSearchTerm('');
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.label ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
