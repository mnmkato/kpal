'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Check, X } from 'lucide-react';
import { GroceryItem, Category, Unit } from '@/types';
import { categories, units } from '@/data/initialData';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface GroceryScreenProps {
  groceries: GroceryItem[];
  onToggle: (id: string) => void;
  onAdd: (name: string, category: Category, quantity?: number, unit?: Unit) => void;
  onUpdateQuantity: (id: string, quantity: number, unit: Unit) => void;
}

const categoryColors: Record<Category, string> = {
  Vegetables: 'bg-category-vegetables',
  Fruits: 'bg-category-fruits',
  Spices: 'bg-category-spices',
  Food: 'bg-category-food',
  Other: 'bg-category-other',
};

const categoryIcons: Record<Category, string> = {
  Vegetables: '🥬',
  Fruits: '🍎',
  Spices: '🌶️',
  Food: '🍳',
  Other: '📦',
};

export const GroceryScreen = ({ groceries, onToggle, onAdd, onUpdateQuantity }: GroceryScreenProps) => {
  const [openCategories, setOpenCategories] = useState<Set<Category>>(new Set(categories));
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Other');

  const toggleCategory = (category: Category) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim(), newCategory);
      setNewName('');
      setNewCategory('Other');
      setIsAdding(false);
    }
  };

  const groupedGroceries = categories.reduce((acc, category) => {
    acc[category] = groceries.filter(g => g.category === category);
    return acc;
  }, {} as Record<Category, GroceryItem[]>);

  return (
    <div className="pb-4 animate-fade-in">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 pt-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Groceries</h1>
            <p className="text-sm text-muted-foreground">
              {groceries.filter(g => g.available).length} of {groceries.length} available
            </p>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="icon"
            variant={isAdding ? 'secondary' : 'default'}
            className="rounded-full shadow-lg"
          >
            {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </Button>
        </div>

        {isAdding && (
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border animate-slide-up">
            <div className="space-y-3">
              <Input
                placeholder="Item name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="bg-background"
                autoFocus
              />
              <div className="flex gap-2">
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as Category)}>
                  <SelectTrigger className="flex-1 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {categoryIcons[cat]} {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAdd} disabled={!newName.trim()}>
                  <Check className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {categories.map(category => {
          const items = groupedGroceries[category];
          const availableCount = items.filter(i => i.available).length;
          const isOpen = openCategories.has(category);

          return (
            <Collapsible
              key={category}
              open={isOpen}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                      categoryColors[category],
                      'bg-opacity-20'
                    )}>
                      {categoryIcons[category]}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{category}</h3>
                      <p className="text-xs text-muted-foreground">
                        {availableCount}/{items.length} available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[...Array(Math.min(3, items.length))].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-2 h-2 rounded-full border border-card',
                            items[i]?.available ? 'bg-success' : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                    <ChevronDown className={cn(
                      'w-5 h-5 text-muted-foreground transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )} />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-1 pl-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-card/50 rounded-lg animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className={cn(
                        'font-medium transition-colors',
                        item.available ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {item.name}
                      </span>
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => onToggle(item.id)}
                        className="data-[state=checked]:bg-success"
                      />
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div >
  );
};
