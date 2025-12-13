'use client';

import { useState } from 'react';
import { Check, AlertTriangle, XCircle, ChevronRight, Plus, X, Heart, Sparkles, Clock, Trash2 } from 'lucide-react';
import { RecipeWithStatus, DayOfWeek, MealType, GroceryItem, CookingHistory } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { daysOfWeek, mealTypes } from '@/data/initialData';

interface RecipeScreenProps {
  recipes: RecipeWithStatus[];
  smartSuggestions: RecipeWithStatus[];
  favoriteRecipes: RecipeWithStatus[];
  recentlyCooked: CookingHistory[];
  groceries: GroceryItem[];
  onAddToMealPlan: (recipeId: string, day: DayOfWeek, mealType: MealType) => void;
  onAddRecipe: (name: string, ingredients: string[]) => void;
  onToggleFavorite: (recipeId: string) => void;
  onMarkAsCooked: (recipeId: string) => void;
  onDeleteRecipe: (recipeId: string) => void;
}

const statusConfig = {
  READY: {
    icon: Check,
    label: 'Ready',
    className: 'bg-success/10 text-success border-success/20',
    iconClass: 'text-success',
  },
  ALMOST: {
    icon: AlertTriangle,
    label: 'Almost',
    className: 'bg-warning/10 text-warning border-warning/20',
    iconClass: 'text-warning',
  },
  NOT_READY: {
    icon: XCircle,
    label: 'Not Ready',
    className: 'bg-status-not-ready/10 text-status-not-ready border-status-not-ready/20',
    iconClass: 'text-status-not-ready',
  },
};

export const RecipeScreen = ({
  recipes,
  smartSuggestions,
  favoriteRecipes,
  recentlyCooked,
  groceries,
  onAddToMealPlan,
  onAddRecipe,
  onToggleFavorite,
  onMarkAsCooked,
  onDeleteRecipe,
}: RecipeScreenProps) => {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithStatus | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Dinner');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('suggestions');

  const handleAddToMealPlan = () => {
    if (selectedRecipe) {
      onAddToMealPlan(selectedRecipe.id, selectedDay, selectedMeal);
      setSelectedRecipe(null);
    }
  };

  const handleAddRecipe = () => {
    if (newName.trim() && selectedIngredients.length > 0) {
      onAddRecipe(newName.trim(), selectedIngredients);
      setNewName('');
      setSelectedIngredients([]);
      setIsAdding(false);
    }
  };

  const toggleIngredient = (name: string) => {
    setSelectedIngredients(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const readyCount = recipes.filter(r => r.status === 'READY').length;
  const almostCount = recipes.filter(r => r.status === 'ALMOST').length;

  const RecipeCard = ({ recipe, showSuggestion = false }: { recipe: RecipeWithStatus; showSuggestion?: boolean }) => {
    const config = statusConfig[recipe.status];
    const StatusIcon = config.icon;
    const canAddToMealPlan = recipe.status === 'READY' || recipe.status === 'ALMOST';

    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-foreground">{recipe.name}</h3>
              <button
                onClick={() => onToggleFavorite(recipe.id)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <Heart
                  className={cn(
                    'w-4 h-4 transition-colors',
                    recipe.favorite ? 'fill-accent text-accent' : 'text-muted-foreground'
                  )}
                />
              </button>
            </div>
            <Badge variant="outline" className={cn('flex items-center gap-1', config.className)}>
              <StatusIcon className={cn('w-3 h-3', config.iconClass)} />
              {config.label}
            </Badge>
          </div>

          {showSuggestion && recipe.status === 'ALMOST' && (
            <div className="mb-2 p-2 bg-warning/10 rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-warning" />
              <span className="text-sm text-warning">
                Buy {recipe.missingCount} item{recipe.missingCount > 1 ? 's' : ''} to unlock!
              </span>
            </div>
          )}

          {recipe.cookCount != null && (
            <p className="text-xs text-muted-foreground mb-2">
              Cooked {recipe.cookCount} time{recipe.cookCount !== 1 ? 's' : ''}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.ingredients.map(ing => {
              const isMissing = recipe.missingIngredients.includes(ing);
              return (
                <Badge
                  key={ing}
                  variant="secondary"
                  className={cn(
                    'text-xs',
                    isMissing && 'bg-status-not-ready/10 text-status-not-ready border-status-not-ready/20'
                  )}
                >
                  {isMissing && '⚠️ '}{ing}
                </Badge>
              );
            })}
          </div>

          <div className="flex gap-2">
            {canAddToMealPlan && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    Add to Plan <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle>Add "{recipe.name}" to Meal Plan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Day</label>
                      <Select value={selectedDay} onValueChange={(v) => setSelectedDay(v as DayOfWeek)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {daysOfWeek.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Meal</label>
                      <Select value={selectedMeal} onValueChange={(v) => setSelectedMeal(v as MealType)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {mealTypes.map(meal => (
                            <SelectItem key={meal} value={meal}>{meal}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddToMealPlan} className="w-full">
                      <Check className="w-4 h-4 mr-1" /> Confirm
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{recipe.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this recipe and remove it from any meal plans.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteRecipe(recipe.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-4 animate-fade-in">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 pt-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
            <p className="text-sm text-muted-foreground">
              {readyCount} ready • {almostCount} almost ready
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
                placeholder="Recipe name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="bg-background"
                autoFocus
              />
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">
                  Select ingredients ({selectedIngredients.length} selected)
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {groceries.map(g => (
                    <Badge
                      key={g.id}
                      variant={selectedIngredients.includes(g.name) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all',
                        selectedIngredients.includes(g.name)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      )}
                      onClick={() => toggleIngredient(g.name)}
                    >
                      {g.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleAddRecipe}
                disabled={!newName.trim() || selectedIngredients.length === 0}
                className="w-full"
              >
                <Check className="w-4 h-4 mr-1" /> Create Recipe
              </Button>
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="suggestions" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" /> Suggestions
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-xs">
            <Heart className="w-3 h-3 mr-1" /> Favorites
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xs">
            <Clock className="w-3 h-3 mr-1" /> Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-3">
          {smartSuggestions.map((recipe, index) => (
            <div key={recipe.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
              <RecipeCard recipe={recipe} showSuggestion />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-3">
          {favoriteRecipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No favorite recipes yet</p>
              <p className="text-sm">Tap the heart icon to add favorites</p>
            </div>
          ) : (
            favoriteRecipes.map((recipe, index) => (
              <div key={recipe.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                <RecipeCard recipe={recipe} />
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-3">
          {recentlyCooked.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No cooking history yet</p>
              <p className="text-sm">Mark recipes as cooked to track history</p>
            </div>
          ) : (
            recentlyCooked.map((entry, index) => {
              const recipe = recipes.find(r => r.id === entry.recipeId);
              if (!recipe) return null;
              return (
                <div key={`${entry.recipeId}-${index}`} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                  <RecipeCard recipe={recipe} />
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
