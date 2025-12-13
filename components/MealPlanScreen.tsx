'use client';

import { useState } from 'react';
import { AlertTriangle, X, Plus, Utensils, Coffee, Moon, Wand2, Trash2, Check } from 'lucide-react';
import { MealPlan, DayOfWeek, MealType, RecipeWithStatus } from '@/types';
import { daysOfWeek, mealTypes } from '@/data/initialData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MealPlanScreenProps {
  mealPlan: MealPlan;
  recipes: RecipeWithStatus[];
  validRecipes: RecipeWithStatus[];
  onSetMeal: (day: DayOfWeek, mealType: MealType, recipeId: string | null) => void;
  onAutoGenerate: () => Promise<boolean>;
  onClearPlan: () => void;
  onMarkAsCooked: (recipeId: string) => void;
  warnings: Array<{ day: DayOfWeek; mealType: MealType; recipeName: string; missing: string[] }>;
}

const mealIcons = {
  Breakfast: Coffee,
  Lunch: Utensils,
  Dinner: Moon,
};

const mealColors = {
  Breakfast: 'bg-warning/10 text-warning',
  Lunch: 'bg-success/10 text-success',
  Dinner: 'bg-info/10 text-info',
};

export const MealPlanScreen = ({
  mealPlan,
  recipes,
  validRecipes,
  onSetMeal,
  onAutoGenerate,
  onClearPlan,
  onMarkAsCooked,
  warnings,
}: MealPlanScreenProps) => {
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; mealType: MealType } | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');

  const getRecipeName = (recipeId: string | null) => {
    if (!recipeId) return null;
    return recipes.find(r => r.id === recipeId)?.name || null;
  };

  const getWarning = (day: DayOfWeek, mealType: MealType) => {
    return warnings.find(w => w.day === day && w.mealType === mealType);
  };

  const handleSelectRecipe = () => {
    if (selectedSlot && selectedRecipeId) {
      onSetMeal(selectedSlot.day, selectedSlot.mealType, selectedRecipeId);
      setSelectedSlot(null);
      setSelectedRecipeId('');
    }
  };

  const plannedMealsCount = Object.values(mealPlan).reduce((acc, day) => {
    return acc + Object.values(day).filter(Boolean).length;
  }, 0);

  return (
    <div className="pb-4 animate-fade-in">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 pt-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meal Plan</h1>
            <p className="text-sm text-muted-foreground">
              {plannedMealsCount} meals planned • {warnings.length > 0 && (
                <span className="text-status-not-ready">{warnings.length} warnings</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onAutoGenerate}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={validRecipes.length === 0}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Plan My Week
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground" disabled={plannedMealsCount === 0}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear meal plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {plannedMealsCount} planned meals. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearPlan}>Clear All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mb-4 p-3 bg-status-not-ready/10 rounded-lg border border-status-not-ready/20 animate-slide-up">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-status-not-ready shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-status-not-ready">Missing Ingredients</p>
              <p className="text-muted-foreground mt-1">
                Some planned meals have ingredients that are no longer available.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {daysOfWeek.map((day, dayIndex) => (
          <div
            key={day}
            className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in"
            style={{ animationDelay: `${dayIndex * 50}ms` }}
          >
            <div className="px-4 py-3 bg-secondary/50 border-b border-border">
              <h3 className="font-semibold text-foreground">{day}</h3>
            </div>
            <div className="p-3 space-y-2">
              {mealTypes.map(mealType => {
                const recipeId = mealPlan[day][mealType];
                const recipeName = getRecipeName(recipeId);
                const warning = getWarning(day, mealType);
                const MealIcon = mealIcons[mealType];

                return (
                  <div
                    key={mealType}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg transition-colors',
                      recipeName ? 'bg-secondary/30' : 'bg-muted/30',
                      warning && 'ring-2 ring-status-not-ready/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        mealColors[mealType]
                      )}>
                        <MealIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">{mealType}</p>
                        {recipeName ? (
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{recipeName}</p>
                            {warning && (
                              <Badge variant="destructive" className="text-xs h-5">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {warning.missing.length} missing
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No meal planned</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {recipeName && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onSetMeal(day, mealType, null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      {recipeName ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                          onClick={() => recipeId && onMarkAsCooked(recipeId)}
                          title="Mark as cooked"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSelectedSlot({ day, mealType })}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card">
                            <DialogHeader>
                              <DialogTitle>{day} - {mealType}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Choose a recipe..." />
                                </SelectTrigger>
                                <SelectContent className="bg-popover max-h-60">
                                  {validRecipes.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground text-sm">
                                      No recipes available. Check your groceries!
                                    </div>
                                  ) : (
                                    validRecipes.map(recipe => (
                                      <SelectItem key={recipe.id} value={recipe.id}>
                                        <div className="flex items-center gap-2">
                                          <span>{recipe.name}</span>
                                          <Badge
                                            variant="secondary"
                                            className={cn(
                                              'text-xs',
                                              recipe.status === 'READY'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-warning/10 text-warning'
                                            )}
                                          >
                                            {recipe.status === 'READY' ? '✓' : `−${recipe.missingIngredients.length}`}
                                          </Badge>
                                        </div>
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={handleSelectRecipe}
                                disabled={!selectedRecipeId}
                                className="w-full"
                              >
                                Set Meal
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div >
  );
};
