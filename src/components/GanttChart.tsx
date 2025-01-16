import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '@/App';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Link as LinkIcon,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies: string[];
  assignees: string[];
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  linkedDocuments: {
    type: 'goal' | 'workflow' | 'timeline' | 'process';
    id: string;
    title: string;
  }[];
}

const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Recipe Development Phase',
    start: new Date(2024, 0, 1),
    end: new Date(2024, 1, 15),
    progress: 100,
    dependencies: [],
    assignees: ['John D.', 'Sarah M.'],
    status: 'completed',
    linkedDocuments: [
      { type: 'goal', id: 'content-1-1', title: 'Recipe Development' },
      { type: 'workflow', id: 'recipe-dev-1', title: 'Recipe Testing Process' }
    ]
  },
  {
    id: 'task-2',
    title: 'Content Creation',
    start: new Date(2024, 1, 1),
    end: new Date(2024, 2, 15),
    progress: 70,
    dependencies: ['task-1'],
    assignees: ['Emily R.'],
    status: 'in-progress',
    linkedDocuments: [
      { type: 'timeline', id: 'content-timeline-1', title: 'Content Calendar Q1' }
    ]
  },
  {
    id: 'task-3',
    title: 'Photography & Styling',
    start: new Date(2024, 1, 15),
    end: new Date(2024, 2, 30),
    progress: 40,
    dependencies: ['task-2'],
    assignees: ['Michael P.'],
    status: 'delayed',
    linkedDocuments: [
      { type: 'process', id: 'photo-process-1', title: 'Food Photography Guidelines' }
    ]
  },
  {
    id: 'task-4',
    title: 'eBook Compilation',
    start: new Date(2024, 3, 1),
    end: new Date(2024, 3, 30),
    progress: 0,
    dependencies: ['task-2', 'task-3'],
    assignees: ['John D.', 'Emily R.'],
    status: 'not-started',
    linkedDocuments: [
      { type: 'goal', id: 'product-1-1-1', title: 'Recipe eBook' }
    ]
  }
];

const statusColors = {
  'not-started': 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-600',
  'completed': 'bg-green-100 text-green-600',
  'delayed': 'bg-red-100 text-red-600'
};

const statusIcons = {
  'not-started': Clock,
  'in-progress': Calendar,
  'completed': CheckCircle2,
  'delayed': AlertTriangle
};

const GanttChart = () => {
  const navigate = useNavigate();
  const { importedData } = useContext(DataContext);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentDate] = useState(new Date());
  const [viewStart, setViewStart] = useState(new Date(2024, 0, 1));
  const [viewEnd, setViewEnd] = useState(new Date(2024, 3, 30));

  useEffect(() => {
    if (importedData?.gantt?.timeline) {
      const importedTasks = importedData.gantt.timeline.map(item => ({
        id: item.id,
        title: item.title,
        start: new Date(item.start),
        end: new Date(item.end),
        progress: item.progress || 0,
        dependencies: item.dependencies || [],
        assignees: [],
        status: item.progress === 100 ? 'completed' : 
                item.progress > 0 ? 'in-progress' : 
                'not-started',
        linkedDocuments: []
      }));
      setTasks(importedTasks);
    }
  }, [importedData]);

  const daysInView = Math.ceil((viewEnd.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));
  const dayWidth = 40;
  const chartWidth = daysInView * dayWidth;

  const getTaskPosition = (task: Task) => {
    const startDiff = Math.ceil((task.start.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));
    return {
      left: startDiff * dayWidth,
      width: duration * dayWidth
    };
  };

  const getDependencyPath = (fromTask: Task, toTask: Task) => {
    const fromPos = getTaskPosition(fromTask);
    const toPos = getTaskPosition(toTask);
    const fromX = fromPos.left + fromPos.width;
    const fromY = tasks.indexOf(fromTask) * 60 + 30;
    const toX = toPos.left;
    const toY = tasks.indexOf(toTask) * 60 + 30;

    return `M ${fromX} ${fromY} C ${(fromX + toX) / 2} ${fromY}, ${(fromX + toX) / 2} ${toY}, ${toX} ${toY}`;
  };

  const navigateToLinkedDocument = (doc: Task['linkedDocuments'][0]) => {
    switch (doc.type) {
      case 'goal':
        navigate('/goals');
        break;
      case 'workflow':
        navigate('/workflows');
        break;
      case 'timeline':
        navigate('/timeline');
        break;
      case 'process':
        navigate('/process');
        break;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Button>
        <h1 className="text-2xl font-bold">Project Timeline</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(statusColors).map(([status, color]) => {
          const StatusIcon = statusIcons[status as keyof typeof statusIcons];
          const count = tasks.filter(t => t.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${color.split(' ')[1]}`}>
                    <StatusIcon className="w-5 h-5" />
                    <span className="capitalize font-medium">
                      {status.split('-').join(' ')}
                    </span>
                  </div>
                  <span className="text-2xl font-bold">{count}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Timeline View
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newStart = new Date(viewStart);
                  const newEnd = new Date(viewEnd);
                  newStart.setMonth(newStart.getMonth() - 1);
                  newEnd.setMonth(newEnd.getMonth() - 1);
                  setViewStart(newStart);
                  setViewEnd(newEnd);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newStart = new Date(viewStart);
                  const newEnd = new Date(viewEnd);
                  newStart.setMonth(newStart.getMonth() + 1);
                  newEnd.setMonth(newEnd.getMonth() + 1);
                  setViewStart(newStart);
                  setViewEnd(newEnd);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div style={{ width: `${chartWidth + 300}px` }} className="relative">
              {/* Time scale */}
              <div className="flex border-b">
                <div className="w-[300px] flex-shrink-0 p-4 font-medium">Task</div>
                <div className="flex-1">
                  {Array.from({ length: daysInView }).map((_, index) => {
                    const date = new Date(viewStart);
                    date.setDate(date.getDate() + index);
                    return (
                      <div
                        key={index}
                        className="inline-block text-center"
                        style={{ width: dayWidth }}
                      >
                        <div className="text-xs text-gray-500">
                          {date.toLocaleDateString(undefined, { day: 'numeric' })}
                        </div>
                        {date.getDate() === 1 && (
                          <div className="text-xs font-medium">
                            {date.toLocaleDateString(undefined, { month: 'short' })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tasks */}
              <div className="relative">
                {/* Dependency lines */}
                <svg
                  className="absolute top-0 left-[300px] w-full h-full pointer-events-none"
                  style={{ width: chartWidth }}
                >
                  {tasks.map(task =>
                    task.dependencies.map(depId => {
                      const dependencyTask = tasks.find(t => t.id === depId);
                      if (!dependencyTask) return null;
                      return (
                        <path
                          key={`${task.id}-${depId}`}
                          d={getDependencyPath(dependencyTask, task)}
                          stroke="#94a3b8"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="4"
                        />
                      );
                    })
                  )}
                </svg>

                {tasks.map((task, index) => {
                  const { left, width } = getTaskPosition(task);
                  const isSelected = selectedTask?.id === task.id;

                  return (
                    <div
                      key={task.id}
                      className="flex items-start border-b"
                      style={{ height: '60px' }}
                    >
                      {/* Task info */}
                      <div className="w-[300px] flex-shrink-0 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Users className="w-4 h-4" />
                              <span>{task.assignees.join(', ')}</span>
                            </div>
                          </div>
                          {task.linkedDocuments.length > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2"
                              onClick={() => setSelectedTask(isSelected ? null : task)}
                            >
                              <LinkIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Gantt bar */}
                      <div className="flex-1 relative">
                        <div
                          className={`absolute top-3 h-8 rounded-full cursor-pointer transition-all
                            ${statusColors[task.status]} border-2 ${
                              isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                            }`}
                          style={{
                            left: left,
                            width: width,
                          }}
                        >
                          <div
                            className="h-full bg-current opacity-20 rounded-l-full"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Current date line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-500"
                  style={{
                    left: `${
                      300 +
                      Math.ceil(
                        (currentDate.getTime() - viewStart.getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) *
                        dayWidth
                    }px`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Documents Panel */}
      {selectedTask && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Linked Documents for {selectedTask.title}
            </CardTitle>
            <CardDescription>
              Click on a document to navigate to its details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTask.linkedDocuments.map((doc, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigateToLinkedDocument(doc)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {doc.type}
                        </p>
                        <h4 className="font-medium">{doc.title}</h4>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GanttChart;