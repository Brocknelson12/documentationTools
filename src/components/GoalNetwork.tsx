import React, { useState, useContext, useEffect, useRef } from 'react';
import { DataContext } from '@/App';
import { ChevronUp, ChevronDown, X, Plus, ArrowLeft, ZoomIn, ZoomOut, Edit, Check, Upload, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Goal {
  id: string;
  title: string;
  color: string;
  isComplete: boolean;
  children?: Goal[];
}

interface GoalNodeProps {
  goal: Goal;
  onAddChild: (id: string) => void;
  onAddSibling: (id: string) => void;
  onUpdateGoal: (id: string, title: string, isComplete?: boolean) => void;
  onDeleteGoal: (id: string) => void;
  onChangeCategory: (id: string, color: string) => void;
  onSelect: (id: string) => void;
  selectedGoalId: string | null;
  categories: typeof categories;
  scale: number;
  showAllTitles: boolean;
  isRoot?: boolean;
  parentRef?: React.RefObject<HTMLDivElement> | null;
}

const categories = [
  { name: 'Content Creation', color: '#BFDBFE', description: 'Recipe development, photos, videos' }, // blue
  { name: 'Community Growth', color: '#BBF7D0', description: 'Social media, engagement, followers' }, // green
  { name: 'Product Development', color: '#FBCFE8', description: 'Food products, merchandise' }, // pink
  { name: 'Revenue Streams', color: '#FDE68A', description: 'Monetization, sales, sponsorships' }  // yellow
];

const templateGoals = {
  'Content Creation': [
    'Develop 10 signature recipes',
    'Create weekly content calendar',
    'Establish photo/video style guide',
    'Build recipe template system'
  ],
  'Community Growth': [
    'Reach 10k Instagram followers',
    'Launch weekly newsletter',
    'Start Facebook community group',
    'Engage with 50 accounts daily'
  ],
  'Product Development': [
    'Launch first cookbook',
    'Create meal plan subscription',
    'Design merchandise line',
    'Develop spice blend products'
  ],
  'Revenue Streams': [
    'Set up affiliate partnerships',
    'Launch Patreon membership',
    'Secure brand sponsorships',
    'Start online cooking classes'
  ]
};

const ColorLegend = ({ categories, onTemplateSelect }) => (
  <Card className="p-4 mb-8">
    <h3 className="font-bold mb-4">Goal Categories</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((category, idx) => (
        <div 
          key={idx} 
          className="space-y-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
          onClick={() => onTemplateSelect(category.name)}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: category.color }}
            />
            <span className="font-medium">{category.name}</span>
          </div>
          <p className="text-sm text-gray-600">{category.description}</p>
          <div className="text-xs text-blue-600">Click to see templates →</div>
        </div>
      ))}
    </div>
  </Card>
);

const TemplateSelector = ({ category, templates, onSelect, onClose }) => (
  <Card className="absolute top-4 left-4 w-80 p-4 z-50 bg-white shadow-xl">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold">{category} Templates</h3>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
    <div className="space-y-2">
      {templates.map((template, idx) => (
        <div
          key={idx}
          className="p-2 hover:bg-gray-50 rounded cursor-pointer"
          onClick={() => onSelect(template)}
        >
          <div className="flex items-center space-x-2">
            <Plus className="h-4 w-4 text-gray-400" />
            <span>{template}</span>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const GoalNode = ({ 
  goal, 
  onAddChild,
  onAddSibling,
  onUpdateGoal, 
  onDeleteGoal,
  onChangeCategory,
  onSelect,
  selectedGoalId,
  categories,
  scale,
  showAllTitles,
  isRoot = false,
  parentRef = null
}: GoalNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [text, setText] = useState(goal.title);
  const nodeRef = React.useRef(null);
  const isSelected = selectedGoalId === goal.id;

  const calculateProgress = (goal: Goal): number => {
    if (!goal.children || goal.children.length === 0) {
      return goal.isComplete ? 100 : 0;
    }
    
    const completedGoals = goal.children.reduce((sum, child) => {
      return sum + calculateProgress(child);
    }, 0);
    
    return Math.round(completedGoals / goal.children.length);
  };

  const progress = calculateProgress(goal);

  const handleDoubleClick = () => {
    if (!goal.children || goal.children.length === 0) {
      toggleComplete();
    } else {
      setIsEditing(true);
    }
  };

  const toggleComplete = () => {
    onUpdateGoal(goal.id, goal.title, !goal.isComplete);
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = categories.findIndex(c => c.color === goal.color);
    const nextIndex = (currentIndex + 1) % categories.length;
    onChangeCategory(goal.id, categories[nextIndex].color);
  };

  const handleGoalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(goal.id);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleCategoryClick(e);
  };

  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateGoal(goal.id, text);
  };

  return (
    <div className="flex flex-col items-center relative" style={{ transform: `scale(${scale})` }}>
      <div className="relative" ref={nodeRef}>
        {!isRoot && parentRef?.current && nodeRef.current && (
          <svg
            className="absolute pointer-events-none w-full h-full"
            style={{
              top: -64,
              left: 16,  // Adjust for closer spacing
              width: '100px',  // Adjust line width for closer nodes
              height: '96px',  // Make lines longer vertically too
            }}
          >
            <line
              x1="50px"  // Adjust line start position
              y1="0"
              x2="50px"  // Keep end point aligned with start
              y2="96px"  // Make line longer vertically
              stroke="#94a3b8"
              strokeWidth="3"
              strokeDasharray="4"
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                transformOrigin: '50px 96px',  // Update transform origin to match new endpoints
                transform: parentRef.current ? `rotate(${
                  Math.atan2(
                    parentRef.current.getBoundingClientRect().top - nodeRef.current.getBoundingClientRect().top,
                    parentRef.current.getBoundingClientRect().left - nodeRef.current.getBoundingClientRect().left
                  ) * (180 / Math.PI) + 90
                }deg)` : 'none'
              }}
            />
          </svg>
        )}

        <div className="relative">
          <div 
            className={`relative w-32 h-32 rounded-full transition-all duration-200 hover:shadow-lg overflow-hidden
              ${goal.children?.length === 0 ? 'hover:scale-110' : 'hover:scale-105'}
              ${isSelected ? 'ring-2 ring-offset-2 ring-blue-400 z-10' : ''}
              ${isHighlighted ? 'ring-2 ring-offset-2 ring-green-300' : ''}
              ${goal.isComplete ? 'ring-green-500' : 'ring-gray-200'}`}
            style={{ backgroundColor: goal.color }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              handleGoalClick(e);
            }}
            onContextMenu={handleRightClick}
            onDoubleClick={handleDoubleClick}
          >

            {/* Progress fill */}
            <div
              className="absolute bottom-0 left-0 w-full bg-black/10 transition-all duration-300"
              style={{ height: `${progress}%` }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              {progress > 0 ? (
                <div className="text-sm font-bold text-gray-800/90">
                  {progress}%
                </div>
              ) : null}
            </div>
          </div>

          {/* Title positioned outside the circle container */}
          {(showAllTitles || isSelected) && (
            <div
              className="absolute bg-gray-800/90 text-white text-xs py-1 px-2 rounded shadow-lg
                whitespace-nowrap backdrop-blur-sm transition-all duration-200"
              style={{
                left: '50%',
                top: -24,
                transform: 'translateX(-50%)',
                zIndex: 1000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {goal.title}
            </div>
          )}

          {/* Tooltip and Info Panel Container */}
          {isSelected && (
            <>
              {/* Goal Info Panel */}
              <div 
                className="absolute -top-64 left-1/2 transform -translate-x-1/2
                  bg-white rounded-lg shadow-lg p-4 w-64 z-[60] border border-gray-200
                  before:content-[''] before:absolute before:bottom-[-12px] before:left-1/2 
                  before:transform before:-translate-x-1/2
                  before:border-[12px] before:border-transparent before:border-t-white
                  before:filter before:drop-shadow(-3px 0 2px rgba(0, 0, 0, 0.1))
                  animate-in slide-in-from-top-2 duration-200 hover:shadow-xl
                  transition-shadow"
              >
                  <div className="flex items-center justify-between mb-3">
                    {isEditing ? (
                      <div className="flex-1">
                        <input
                          type="text"
                          value={goal.title}
                          onChange={(e) => onUpdateGoal(goal.id, e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          autoFocus
                          onBlur={() => setIsEditing(false)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setIsEditing(false);
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-base">{goal.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsEditing(true)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full cursor-pointer hover:ring-2 ring-offset-2"
                        style={{ backgroundColor: goal.color }}
                        onClick={handleCategoryClick}
                        title="Click to change category"
                      />
                      <span>{categories.find(c => c.color === goal.color)?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sub-goals</span>
                      <span className="font-medium">{goal.children?.length || 0}</span>
                    </div>
                    {!goal.children?.length && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => onUpdateGoal(goal.id, goal.title, !goal.isComplete)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {goal.isComplete ? 'Mark Incomplete' : 'Mark Complete'}
                      </Button>
                    )}
                  </div>
              </div>
              </>
          )}
          
          {/* Action buttons positioned around the circle */}
          {isSelected && (
            <>
              {/* Add subgoal button (bottom) */}
              <div
                className="absolute -bottom-16 left-1/2 transform -translate-x-1/2
                  w-12 h-12 group z-20 cursor-pointer"
              >
                <button
                  className="w-full h-full rounded-full bg-white shadow-lg hover:shadow-xl
                    transition-all duration-200 hover:scale-110 flex items-center justify-center
                    cursor-pointer z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(goal.id);
                  }}
                >
                  <ChevronDown className="h-6 w-6 text-blue-600" />
                </button>
                <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2
                  bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0
                  group-hover:opacity-100 whitespace-nowrap">
                  Add sub-goal
                </span>
              </div>

              {!isRoot && (
                <>
                  {/* Add sibling button (right) */}
                  <div
                    className="absolute top-1/2 -right-16 transform -translate-y-1/2
                      w-12 h-12 group z-20 cursor-pointer"
                  >
                    <button
                      className="w-full h-full rounded-full bg-white shadow-lg hover:shadow-xl
                        transition-all duration-200 hover:scale-110 flex items-center justify-center
                        cursor-pointer z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSibling(goal.id);
                      }}
                    >
                      <Plus className="h-6 w-6 text-green-600" />
                    </button>
                    <span className="absolute right-full mr-1 top-1/2 transform -translate-y-1/2
                      bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0
                      group-hover:opacity-100 whitespace-nowrap">
                      Add sibling
                    </span>
                  </div>

                  {/* Delete button (left) */}
                  <div
                    className="absolute top-1/2 -left-16 transform -translate-y-1/2
                      w-12 h-12 group z-20 cursor-pointer"
                  >
                    <button
                      className="w-full h-full rounded-full bg-white shadow-lg hover:shadow-xl
                        transition-all duration-200 hover:scale-110 flex items-center justify-center
                        cursor-pointer z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGoal(goal.id);
                      }}
                    >
                      <X className="h-6 w-6 text-red-600" />
                    </button>
                    <span className="absolute left-full ml-1 top-1/2 transform -translate-y-1/2
                      bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0
                      group-hover:opacity-100 whitespace-nowrap">
                      Delete goal
                    </span>
                  </div>
                  
                  {/* Add up button (top) */}
                  <div
                    className="absolute -top-16 left-1/2 transform -translate-x-1/2
                      w-12 h-12 group z-20 cursor-pointer"
                  >
                    <button
                      className="w-full h-full rounded-full bg-white shadow-lg hover:shadow-xl
                        transition-all duration-200 hover:scale-110 flex items-center justify-center
                        cursor-pointer z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSibling(goal.id);
                      }}
                    >
                      <ChevronUp className="h-6 w-6 text-green-600" />
                    </button>
                    <span className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2
                      bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0
                      group-hover:opacity-100 whitespace-nowrap">
                      Add sibling above
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {goal.children && goal.children.length > 0 && (
        <div className="mt-8">
          <div className="flex gap-16 relative">  {/* Reduce gap between child nodes */}
            {goal.children.map((childGoal) => (
              <GoalNode
                key={childGoal.id}
                goal={childGoal}
                onAddChild={onAddChild}
                onAddSibling={onAddSibling}
                onUpdateGoal={onUpdateGoal}
                onDeleteGoal={onDeleteGoal}
                onChangeCategory={onChangeCategory}
                onSelect={onSelect}
                selectedGoalId={selectedGoalId}
                categories={categories}
                parentRef={nodeRef}
                scale={scale}
                showAllTitles={showAllTitles}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const GoalNetwork = () => {
  const navigate = useNavigate();
  const { importedData } = useContext(DataContext);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [scale, setScale] = useState(1);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('root');
  const [isEditing, setIsEditing] = useState(false);
  const [showAllTitles, setShowAllTitles] = useState(false);
  const [viewportOffset, setViewportOffset] = useState({ x: 300, y: 200 }); // Start with offset to center content
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPanPoint = useRef<{ x: number; y: number } | null>(null);
  const defaultGoal = {
    id: 'root',
    title: 'Recipe Business Goals',
    color: categories[0].color,
    isComplete: false,
    children: []
  };
  const [rootGoal, setRootGoal] = useState<Goal>(defaultGoal);

  useEffect(() => {
    if (importedData?.['food-business']?.goals) {
      setRootGoal(importedData['food-business'].goals);
      // Reset viewport to center when new data is loaded
      setViewportOffset({ x: 300, y: 200 });
    }
  }, [importedData]);

  const addChildGoal = (parentId) => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: 'New Goal',
      color: categories[0].color,
      isComplete: false,
      children: []
    };

    const addChild = (goal) => {
      if (goal.id === parentId) {
        return {
          ...goal,
          children: [...(goal.children || []), newGoal]
        };
      }
      if (!goal.children) return goal;
      return {
        ...goal,
        children: goal.children.map(child => addChild(child))
      };
    };

    setRootGoal(addChild(rootGoal));
  };

  const addSiblingGoal = (siblingId) => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: 'New Goal',
      color: categories[0].color,
      isComplete: false,
      children: []
    };

    const addSibling = (goal) => {
      if (!goal.children) return goal;
      if (goal.children.some(child => child.id === siblingId)) {
        return {
          ...goal,
          children: [...goal.children, newGoal]
        };
      }
      return {
        ...goal,
        children: goal.children.map(child => addSibling(child))
      };
    };

    setRootGoal(addSibling(rootGoal));
  };

  const updateGoal = (id, newTitle, isComplete = null) => {
    const update = (goal) => {
      if (goal.id === id) {
        return { 
          ...goal, 
          title: newTitle,
          ...(isComplete !== null && { isComplete })
        };
      }
      if (!goal.children) return goal;
      return {
        ...goal,
        children: goal.children.map(child => update(child))
      };
    };
    setRootGoal(update(rootGoal));
  };

  const changeCategory = (id, newColor) => {
    const updateColor = (goal) => {
      if (goal.id === id) {
        return { ...goal, color: newColor };
      }
      if (!goal.children) return goal;
      return {
        ...goal,
        children: goal.children.map(child => updateColor(child))
      };
    };
    setRootGoal(updateColor(rootGoal));
  };

  const deleteGoal = (id) => {
    const removeGoal = (goal) => {
      if (!goal.children) return goal;
      return {
        ...goal,
        children: goal.children
          .filter(child => child.id !== id)
          .map(child => removeGoal(child))
      };
    };
    setRootGoal(removeGoal(rootGoal));
  };

  const handleTemplateSelect = (category) => {
    setSelectedTemplate(category);
  };

  const addTemplateGoal = (title) => {
    addChildGoal('root');
    const lastChild = rootGoal.children?.length || 0;
    updateGoal(`goal-${Date.now()}`, title);
    setSelectedTemplate(null);
  };

  const handleGoalSelect = (id: string) => {
    setSelectedGoalId(id);
  };

  const findGoal = (id: string, goal: Goal): Goal | null => {
    if (goal.id === id) return goal;
    if (!goal.children) return null;
    for (const child of goal.children) {
      const found = findGoal(id, child);
      if (found) return found;
    }
    return null;
  };

  const calculateProgress = (goal: Goal): number => {
    if (!goal.children || goal.children.length === 0) {
      return goal.isComplete ? 100 : 0;
    }
    
    const completedGoals = goal.children.reduce((sum, child) => {
      return sum + calculateProgress(child);
    }, 0);
    
    return Math.round(completedGoals / goal.children.length);
  };

  const selectedGoal = selectedGoalId ? findGoal(selectedGoalId, rootGoal) : null;

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prev => {
      const newScale = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.min(Math.max(0.5, newScale), 2); // Limit scale between 0.5 and 2
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setRootGoal(json);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          // You might want to add a toast notification here
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 0) { // Allow panning with left click
      e.preventDefault();
      isDragging.current = true;
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (isDragging.current && lastPanPoint.current) {
      const deltaX = e.clientX - lastPanPoint.current.x;
      const deltaY = e.clientY - lastPanPoint.current.y;
      
      setViewportOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePanEnd = () => {
    isDragging.current = false;
    lastPanPoint.current = null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-8" onClick={() => setSelectedGoalId(null)}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Documentation Tools</h1>
        <p className="text-xl text-gray-600 mb-2">
          You'll never reach the top without a strong and sturdy base, try to balance out your work
        </p>
        <p className="text-lg text-gray-500">
          Build your goals strategically, starting with a solid foundation
        </p>
      </div>

      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tools
      </Button>
      
      <div className="flex justify-between items-start mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold">Recipe Business Goals</h1>
          <p className="text-sm text-gray-600">Click goals to view details • Right-click to change category</p>
        </div>
      </div>
      
      <ColorLegend 
        categories={categories}
        onTemplateSelect={handleTemplateSelect}
      />

      {selectedTemplate && (
        <TemplateSelector
          category={selectedTemplate}
          templates={templateGoals[selectedTemplate]}
          onSelect={addTemplateGoal}
          onClose={() => setSelectedTemplate(null)}
        />
      )}

      <div className="overflow-x-auto">
        <div className="flex justify-center gap-2 mb-4 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom('out')}
            className="flex items-center gap-2"
          >
            <ZoomOut className="h-4 w-4" />
            <span>Zoom Out</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom('in')}
            className="flex items-center gap-2"
          >
            <ZoomIn className="h-4 w-4" />
            <span>Zoom In</span>
          </Button>
          <div className="mx-4 h-6 w-px bg-gray-200" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllTitles(!showAllTitles)}
            className={`flex items-center gap-2 ${showAllTitles ? 'bg-blue-50' : ''}`}
          >
            <Eye className="h-4 w-4" />
            <span>{showAllTitles ? 'Hide Titles' : 'Show All Titles'}</span>
          </Button>
          <div className="mx-4 h-6 w-px bg-gray-200" />
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="json-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('json-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import JSON</span>
            </Button>
          </div>
        </div>
        <div 
          ref={containerRef}
          className="relative w-full h-[800px] overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
        >
          <div 
            className="absolute w-[2000px] h-[2000px]"
            style={{
              transform: `translate(${viewportOffset.x}px, ${viewportOffset.y}px) scale(${scale})`,



              transformOrigin: '0 0',
            }}
          >
            <GoalNode
              goal={rootGoal}
              onAddChild={addChildGoal}
              onAddSibling={addSiblingGoal}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
              onChangeCategory={changeCategory}
              onSelect={handleGoalSelect}
              selectedGoalId={selectedGoalId}
              categories={categories}
              scale={scale}
              showAllTitles={showAllTitles}
              isRoot={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalNetwork;