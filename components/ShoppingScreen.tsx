'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { ShoppingItem, Category } from '@/types';
import { categories } from '@/data/initialData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ShoppingScreenProps {
  items: ShoppingItem[];
  onPurchase: (name: string) => void;
}

const categoryColors: Record<Category, string> = {
  Vegetables: 'border-l-category-vegetables',
  Fruits: 'border-l-category-fruits',
  Spices: 'border-l-category-spices',
  Food: 'border-l-category-food',
  Other: 'border-l-category-other',
};

export const ShoppingScreen = ({ items, onPurchase }: ShoppingScreenProps) => {
  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = items.filter(i => i.category === category);
    return acc;
  }, {} as Record<Category, ShoppingItem[]>);

  const totalItems = items.length;
  const hasItems = totalItems > 0;

  return (
    <div className="pb-4 animate-fade-in">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shopping List</h1>
          <p className="text-sm text-muted-foreground">
            {hasItems ? `${totalItems} items to buy` : 'All stocked up!'}
          </p>
        </div>
      </div>

      {!hasItems ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Nothing to buy!</h3>
          <p className="text-muted-foreground max-w-xs">
            Your pantry has everything you need for your planned meals. Nice!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(category => {
            const categoryItems = groupedItems[category];
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="animate-fade-in">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        'bg-card rounded-lg border border-border overflow-hidden animate-slide-up',
                        'border-l-4',
                        categoryColors[category]
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{item.name}</h4>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.neededFor.map(recipe => (
                              <Badge
                                key={recipe}
                                variant="secondary"
                                className="text-xs bg-secondary/50"
                              >
                                {recipe}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => onPurchase(item.name)}
                          size="sm"
                          className="ml-3 bg-success hover:bg-success/90 text-success-foreground shrink-0"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Got it
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
