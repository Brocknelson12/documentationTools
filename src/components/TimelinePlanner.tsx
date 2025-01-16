import React, { useState, useContext, useEffect, useRef } from 'react';
import { DataContext } from '@/App';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Plus, Star, X, ChevronRight, ChevronLeft, 
  ArrowRightFromLine, Check, AlertTriangle, Clock, Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: 'content' | 'social' | 'product' | 'revenue';
  status: 'success' | 'failure' | 'in-progress' | 'planned';
  impact: 1 | 2 | 3; // 1 = low, 2 = medium, 3 = high
  parentId?: string;
  goalId?: string;
  learnings?: string[];
}

const categoryColors = {
  content: 'bg-blue-100 border-blue-300 text-blue-700',
  social: 'bg-green-100 border-green-300 text-green-700',
  product: 'bg-pink-100 border-pink-300 text-pink-700',
  revenue: 'bg-yellow-100 border-yellow-300 text-yellow-700'
};

const statusColors = {
  success: 'bg-green-100 border-green-500 text-green-700',
  failure: 'bg-red-100 border-red-300 text-red-700',
  'in-progress': 'bg-blue-100 border-blue-300 text-blue-700',
  planned: 'bg-gray-100 border-gray-300 text-gray-700'
};

const sampleEvents: TimelineEvent[] = [
  {
    id: 'start',
    title: 'Started Recipe Blog',
    description: 'Launched food blog with basic recipes',
    date: new Date(2023, 0, 1),
    category: 'content',
    status: 'success',
    impact: 2,
    learnings: ['Focus on quality over quantity', 'Good photos are essential']
  },
  {
    id: 'instagram-1',
    title: 'Instagram Daily Posts',
    description: 'Started posting daily recipe photos',
    date: new Date(2023, 1, 1),
    category: 'social',
    status: 'failure',
    impact: 1,
    parentId: 'start',
    learnings: ['Daily posting was unsustainable', 'Need better content planning']
  },
  {
    id: 'instagram-2',
    title: 'Instagram Strategy 2.0',
    description: '3x weekly high-quality posts with stories',
    date: new Date(2023, 2, 1),
    category: 'social',
    status: 'success',
    impact: 3,
    parentId: 'instagram-1',
    learnings: ['Quality over quantity works', 'Stories drive more engagement']
  },
  {
    id: 'ebook-1',
    title: 'First Recipe eBook',
    description: 'Created digital cookbook with 20 recipes',
    date: new Date(2023, 3, 1),
    category: 'product',
    status: 'failure',
    impact: 2,
    parentId: 'start',
    learnings: ['Price point was too high', 'Need better marketing strategy']
  },
  {
    id: 'ebook-2',
    title: 'Recipe eBook Bundle',
    description: 'Smaller, themed recipe collections',
    date: new Date(2023, 4, 1),
    category: 'product',
    status: 'success',
    impact: 3,
    parentId: 'ebook-1',
    learnings: ['Smaller, focused products sell better', 'Bundle pricing works well']
  },
  {
    id: 'youtube-1',
    title: 'YouTube Channel Launch',
    description: 'Started weekly recipe videos',
    date: new Date(2023, 5, 1),
    category: 'content',
    status: 'in-progress',
    impact: 2,
    parentId: 'instagram-2'
  },
  {
    id: 'course-1',
    title: 'Online Cooking Course',
    description: 'Beginner-friendly cooking basics',
    date: new Date(2023, 7, 1),
    category: 'product',
    status: 'planned',
    impact: 3,
    parentId: 'youtube-1'
  }
];

const TimelinePlanner = () => {
  const navigate = useNavigate();
  const { importedData } = useContext(DataContext);
  const [events, setEvents] = useState<TimelineEvent[]>(sampleEvents);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    if (importedData?.timeline) {
      const importedEvents = importedData.timeline.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        date: new Date(item.start),
        category: item.category,
        status: item.status || 'planned', 
        impact: item.impact || 2,
        learnings: item.learnings || []
      }));
      if (importedEvents.length > 0) {
        setEvents(importedEvents);
      }
    }
  }, [importedData]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const getTimelineScale = () => {
    const startDate = events[0].date;
    const endDate = events[events.length - 1].date;
    const months = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    }

    return months;
  };

  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'failure':
        return <X className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'planned':
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const renderTimelineConnections = () => {
    return events.map(event => {
      if (!event.parentId) return null;
      const parent = events.find(e => e.id === event.parentId);
      if (!parent) return null;

      const startX = getEventX(parent);
      const endX = getEventX(event);
      const startY = getEventY(parent);
      const endY = getEventY(event);

      const isFailure = event.status === 'failure';
      const strokeColor = isFailure ? '#ef4444' : '#94a3b8';
      const strokeWidth = event.impact;

      return (
        <path
          key={`${parent.id}-${event.id}`}
          d={`M ${startX} ${startY} C ${(startX + endX) / 2} ${startY}, ${(startX + endX) / 2} ${endY}, ${endX} ${endY}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={isFailure ? "4" : "0"}
          className="transition-all duration-300"
        />
      );
    });
  };

  const getEventX = (event: TimelineEvent) => {
    const baseX = 150;
    const monthsDiff = (event.date.getTime() - events[0].date.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return baseX + (monthsDiff * 100);
  };

  const getEventY = (event: TimelineEvent) => {
    const baseY = 300;
    const parentChain = getParentChain(event);
    return baseY + (parentChain.length * 80);
  };

  const getParentChain = (event: TimelineEvent): string[] => {
    const chain: string[] = [];
    let current = event;
    while (current.parentId) {
      chain.push(current.parentId);
      current = events.find(e => e.id === current.parentId)!;
    }
    return chain;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Button>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowLabels(!showLabels)}>
            {showLabels ? 'Hide Labels' : 'Show Labels'}
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {Object.entries(statusColors).map(([status, color]) => (
          <Card key={status} className="p-4">
            <div className={`flex items-center gap-2 ${color} rounded-lg px-3 py-2`}>
              {getStatusIcon(status as TimelineEvent['status'])}
              <span className="capitalize font-medium">
                {status === 'in-progress' ? 'In Progress' : status}
              </span>
              <span className="ml-auto font-bold">
                {events.filter(e => e.status === status).length}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mb-8 overflow-hidden">
        <div className="p-4 border-b flex justify-end">
          <div className="flex gap-2">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${color.split(' ')[0]}`} />
                <span className="text-sm capitalize">{category}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative overflow-x-auto cursor-grab"
          style={{ height: '600px' }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="relative" style={{ width: '2000px', height: '100%' }}>
            <svg className="absolute top-0 left-0 w-full h-full">
              {renderTimelineConnections()}
            </svg>

            {events.map(event => (
              <div
                key={event.id}
                className={`absolute transition-all duration-300 ${
                  event.status === 'failure' ? 'opacity-75' : ''
                }`}
                style={{
                  left: getEventX(event) - 20,
                  top: getEventY(event) - 20
                }}
              >
                <div
                  className={`w-10 h-10 rounded-full cursor-pointer transition-all flex items-center justify-center
                    ${statusColors[event.status]} ${
                      selectedEvent?.id === event.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  {getStatusIcon(event.status)}
                  
                  {/* Hover/Toggle Label */}
                  {(showLabels || selectedEvent?.id === event.id) && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-white px-2 py-1 rounded shadow-md
                      text-xs whitespace-nowrap border border-gray-200 z-10">
                      {event.title}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Scale */}
        <div className="border-t relative overflow-x-auto">
          <div style={{ width: '2000px' }}>
            <div className="flex">
              {getTimelineScale().map((date, index) => (
                <div
                  key={date.getTime()}
                  className="flex-none"
                  style={{ width: '100px' }}
                >
                  <div className="relative h-12 border-l border-gray-200">
                    <div className="absolute -left-1 top-0 w-2 h-2 bg-gray-300 rounded-full" />
                    <div className="absolute top-3 left-2 text-xs text-gray-500">
                      {date.toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {selectedEvent && (
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                <div className={`px-2 py-1 rounded-full text-xs ${categoryColors[selectedEvent.category]}`}>
                  {selectedEvent.category}
                </div>
              </div>
              <p className="text-gray-600">{selectedEvent.description}</p>
            </div>
            <Button variant="ghost" onClick={() => setSelectedEvent(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4">
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                ${statusColors[selectedEvent.status]}`}>
                {getStatusIcon(selectedEvent.status)}
                <span className="capitalize">
                  {selectedEvent.status === 'in-progress' ? 'In Progress' : selectedEvent.status}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Impact Level</h4>
              <div className="flex gap-1">
                {[1, 2, 3].map(level => (
                  <Star
                    key={level}
                    className={`w-5 h-5 ${
                      level <= selectedEvent.impact
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {selectedEvent.learnings && (
              <div>
                <h4 className="font-medium mb-2">Key Learnings</h4>
                <ul className="space-y-2">
                  {selectedEvent.learnings.map((learning, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <ArrowRightFromLine className="w-4 h-4 mt-0.5 text-blue-500" />
                      <span>{learning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedEvent.status === 'failure' && (
              <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">What Went Wrong</span>
                </div>
                <p className="text-sm text-red-600">
                  {selectedEvent.learnings?.[0]}
                </p>
              </div>
            )}

            {selectedEvent.goalId && (
              <div className="mt-2">
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/goals')}>
                  View Related Goal →
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TimelinePlanner;