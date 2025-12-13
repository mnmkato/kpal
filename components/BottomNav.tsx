'use client';

import { Carrot, ChefHat, CalendarDays, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'groceries' | 'recipes' | 'mealplan' | 'shopping' | 'analytics';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  shoppingCount: number;
}

const navItems = [
  { id: 'groceries' as Tab, label: 'Groceries', icon: Carrot },
  { id: 'recipes' as Tab, label: 'Recipes', icon: ChefHat },
  { id: 'mealplan' as Tab, label: 'Meal Plan', icon: CalendarDays },
  { id: 'shopping' as Tab, label: 'Shopping', icon: ShoppingCart },
  { id: 'analytics' as Tab, label: 'History', icon: CalendarDays }, // Using CalendarDays as placeholder, maybe BarChart is better if available
];

export const BottomNav = ({ activeTab, onTabChange, shoppingCount }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                {id === 'shopping' && shoppingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-check-bounce">
                    {shoppingCount > 9 ? '9+' : shoppingCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-xs mt-1 font-medium transition-all duration-200',
                isActive && 'font-semibold'
              )}>
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
