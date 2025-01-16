import React, { useState, useContext, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Plus,
  Link as LinkIcon,
  Code,
  FileText,
  Search,
  BookOpen,
  Settings,
  ArrowUpRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '@/App';

interface Task {
  id: string;
  title: string;
  type: 'tech' | 'policy' | 'research' | 'content' | 'design';
  status: 'completed' | 'in-progress' | 'blocked' | 'not-started';
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  goalId?: string;
  goalTitle?: string;
  assignee?: string;
  dueDate?: Date;
}

const taskTypes = {
  tech: { icon: Code, label: 'Technical', color: 'text-blue-600 bg-blue-50' },
  policy: { icon: FileText, label: 'Policy', color: 'text-purple-600 bg-purple-50' },
  research: { icon: Search, label: 'Research', color: 'text-yellow-600 bg-yellow-50' },
  content: { icon: BookOpen, label: 'Content', color: 'text-green-600 bg-green-50' },
  design: { icon: Settings, label: 'Design', color: 'text-pink-600 bg-pink-50' },
};

const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Set up development environment',
    type: 'tech',
    status: 'completed',
    priority: 'high',
    dependencies: [],
    goalId: 'tech-setup',
    goalTitle: 'Technical Infrastructure',
  },
  {
    id: 'task-2',
    title: 'Create content guidelines',
    type: 'policy',
    status: 'completed',
    priority: 'high',
    dependencies: [],
    goalId: 'content-1',
    goalTitle: 'Content Strategy',
  },
  {
    id: 'task-3',
    title: 'Research competitor features',
    type: 'research',
    status: 'in-progress',
    priority: 'medium',
    dependencies: ['task-2'],
    goalId: 'market-research',
    goalTitle: 'Market Analysis',
  },
  {
    id: 'task-4',
    title: 'Implement authentication',
    type: 'tech',
    status: 'blocked',
    priority: 'high',
    dependencies: ['task-1'],
    goalId: 'tech-setup',
    goalTitle: 'Technical Infrastructure',
  },
  {
    id: 'task-5',
    title: 'Design system documentation',
    type: 'design',
    status: 'not-started',
    priority: 'medium',
    dependencies: ['task-2'],
    goalId: 'design-system',
    goalTitle: 'Design Guidelines',
  },
];

const TaskManager = () => {
  const navigate = useNavigate();
  const { importedData } = useContext(DataContext);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTitles, setShowTitles] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>(['uncategorized']);
  const dragGroup = useRef<string | null>(null);
  const dragOverGroup = useRef<string | null>(null);

  useEffect(() => {
    setTasks(sampleTasks); // Set default tasks first
    if (importedData?.tasks?.groups) {
      const importedTasks = importedData.tasks.groups.flatMap(group => 
        group.tasks.map(task => ({
          ...task,
          type: task.type || 'tech',
          status: task.status || 'not-started',
          priority: task.priority || 'medium',
          dependencies: task.dependencies || [],
          description: task.description || ''
        }))
      );
      if (importedTasks.length > 0) setTasks(importedTasks);
      setGroups(importedData.tasks.groups.map(g => g.id));
    }
  }, [importedData]);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'blocked':
        return 'bg-red-500';
      case 'not-started':
        return 'bg-gray-300';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const goalId = task.goalId || 'uncategorized';
    if (!acc[goalId]) {
      acc[goalId] = {
        title: task.goalTitle || 'Uncategorized',
        tasks: [],
      };
    }
    acc[goalId].tasks.push(task);
    return acc;
  }, {} as Record<string, { title: string; tasks: Task[] }>);

  // Initialize groups if empty
  React.useEffect(() => {
    if (groups.length === 0 || (groups.length === 1 && groups[0] === 'uncategorized')) {
      setGroups(Object.keys(groupedTasks));
    }
  }, []);

  const handleDragStart = (goalId: string) => {
    dragGroup.current = goalId;
  };

  const handleDragOver = (e: React.DragEvent, goalId: string) => {
    e.preventDefault();
    dragOverGroup.current = goalId;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragGroup.current && dragOverGroup.current) {
      const newGroups = [...groups];
      const dragIndex = newGroups.indexOf(dragGroup.current);
      const dropIndex = newGroups.indexOf(dragOverGroup.current);
      
      newGroups.splice(dragIndex, 1);
      newGroups.splice(dropIndex, 0, dragGroup.current);
      
      setGroups(newGroups);
    }
    dragGroup.current = null;
    dragOverGroup.current = null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Task Manager</h1>
          {/* Compact Legend */}
          <div className="flex gap-3 items-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-green-500" />
              <span>Done</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-blue-500" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-red-500" />
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-gray-300" />
              <span>Todo</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTitles(!showTitles)}
            className="flex items-center gap-2"
          >
            {showTitles ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide Details</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Show Details</span>
              </>
            )}
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>
      </div>

      {/* Task Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 p-3 mt-14">
        {groups.map(goalId => {
          const group = groupedTasks[goalId];
          if (!group) return null;
          const { title, tasks } = group;
          return (
          <Card 
            key={goalId}
            draggable
            onDragStart={() => handleDragStart(goalId)}
            onDragOver={(e) => handleDragOver(e, goalId)}
            onDrop={handleDrop}
            className="cursor-move hover:shadow-lg transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{title}</h3>
                <span className="text-sm text-gray-500">{tasks.length} tasks</span>
              </div>
              
              {/* Task Bars */}
              <div className="space-y-2">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="relative cursor-move group"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id);
                      e.currentTarget.classList.add('opacity-50');
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.classList.remove('opacity-50');
                    }}
                    onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                  >
                    {/* Task Bar */}
                    <div
                      className={`h-4 rounded transition-all duration-200 ${getStatusColor(task.status)} 
                        ${selectedTask === task.id ? 'ring-2 ring-blue-400' : ''}`}
                    >
                      {/* Task Type Indicator */}
                      <div className={`absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${taskTypes[task.type].color}`}>
                        {React.createElement(taskTypes[task.type].icon, { className: "w-2 h-2 m-0.5" })}
                      </div>

                      {/* Task Title */}
                      {(showTitles || selectedTask === task.id) && (
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-xs font-medium truncate max-w-[80%]">
                          {task.title}
                        </span>
                      )}

                      {/* Priority Indicator */}
                      <div className={`absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full
                        ${task.priority === 'high' ? 'bg-red-300' :
                          task.priority === 'medium' ? 'bg-yellow-300' : 'bg-green-300'}`}
                      />
                    </div>

                    {/* Dependencies */}
                    {task.dependencies.map(depId => {
                      const dep = tasks.find(t => t.id === depId);
                      if (!dep) return null;
                      return (
                        <div
                          key={depId}
                          className="absolute -top-2 left-1/2 w-px h-2 bg-gray-300"
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )})}
      </div>
    </div>
  );
};

export default TaskManager;