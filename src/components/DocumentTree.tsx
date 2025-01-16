import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Plus,
  Link as LinkIcon,
  Unlink,
  ZoomIn,
  ZoomOut,
  Move,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DocumentNode {
  id: string;
  type: 'goal' | 'workflow' | 'timeline' | 'task' | 'process';
  title: string;
  description: string;
  position: { x: number; y: number };
  scale: number;
  connections: string[];
  preview: React.ReactNode;
}

interface Connection {
  from: string;
  to: string;
}

const sampleDocuments: DocumentNode[] = [
  {
    id: 'goal-1',
    type: 'goal',
    title: 'Recipe Development Goals',
    description: 'Strategic goals for recipe creation and testing',
    position: { x: 100, y: 100 },
    scale: 0.3,
    connections: ['workflow-1', 'timeline-1'],
    preview: (
      <div className="bg-blue-50 p-4 rounded-lg w-[400px] h-[300px] overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 border-2 border-blue-200 mb-4" />
          <div className="flex gap-16">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mb-2" />
              <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-200" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 mb-2" />
              <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-200" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'workflow-1',
    type: 'workflow',
    title: 'Recipe Testing Workflow',
    description: 'Step-by-step process for testing recipes',
    position: { x: 600, y: 100 },
    scale: 0.3,
    connections: ['timeline-1'],
    preview: (
      <div className="bg-green-50 p-4 rounded-lg w-[400px] h-[300px] overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100" />
            <div className="flex-1 h-3 bg-green-100 rounded" />
          </div>
          <div className="flex items-center gap-4 pl-8">
            <div className="w-12 h-12 rounded-lg bg-green-100" />
            <div className="flex-1 h-3 bg-green-100 rounded" />
          </div>
          <div className="flex items-center gap-4 pl-16">
            <div className="w-12 h-12 rounded-lg bg-green-100" />
            <div className="flex-1 h-3 bg-green-100 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'timeline-1',
    type: 'timeline',
    title: 'Q1 Development Timeline',
    description: 'Timeline for recipe development and testing',
    position: { x: 350, y: 500 },
    scale: 0.3,
    connections: [],
    preview: (
      <div className="bg-purple-50 p-4 rounded-lg w-[400px] h-[300px] overflow-hidden">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-purple-200" />
            <div className="flex-1 h-2 bg-purple-100 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-purple-200" />
            <div className="flex-1 h-2 bg-purple-100 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-purple-200" />
            <div className="flex-1 h-2 bg-purple-100 rounded" />
          </div>
        </div>
      </div>
    ),
  },
];

const DocumentTree = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentNode[]>(sampleDocuments);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const draggedDoc = useRef<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPanPoint = useRef<{ x: number; y: number } | null>(null);

  const handleDragStart = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    draggedDoc.current = docId;
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!draggedDoc.current || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    setDocuments(prev => prev.map(doc => {
      if (doc.id === draggedDoc.current) {
        return {
          ...doc,
          position: {
            x: e.clientX - container.left - dragOffset.current.x,
            y: e.clientY - container.top - dragOffset.current.y,
          },
        };
      }
      return doc;
    }));
  };

  const handleDragEnd = () => {
    draggedDoc.current = null;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && !draggedDoc.current)) { // Middle mouse or left click when not dragging a doc
      e.preventDefault();
      isPanning.current = true;
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (isPanning.current && lastPanPoint.current) {
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
    isPanning.current = false;
    lastPanPoint.current = null;
  };

  const startConnecting = (docId: string) => {
    setConnecting(docId);
  };

  const completeConnection = (targetId: string) => {
    if (connecting && connecting !== targetId) {
      setDocuments(prev => prev.map(doc => {
        if (doc.id === connecting) {
          return {
            ...doc,
            connections: [...doc.connections, targetId],
          };
        }
        return doc;
      }));
    }
    setConnecting(null);
  };

  const removeConnection = (fromId: string, toId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === fromId) {
        return {
          ...doc,
          connections: doc.connections.filter(id => id !== toId),
        };
      }
      return doc;
    }));
  };

  const navigateToDocument = (type: DocumentNode['type']) => {
    switch (type) {
      case 'goal':
        navigate('/goals');
        break;
      case 'workflow':
        navigate('/workflows');
        break;
      case 'timeline':
        navigate('/timeline');
        break;
      case 'task':
        navigate('/tasks');
        break;
      case 'process':
        navigate('/process');
        break;
    }
  };

  const typeColors = {
    goal: 'bg-blue-50 border-blue-200',
    workflow: 'bg-green-50 border-green-200',
    timeline: 'bg-purple-50 border-purple-200',
    task: 'bg-yellow-50 border-yellow-200',
    process: 'bg-pink-50 border-pink-200',
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Button>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
          >
            <ZoomOut className="w-4 h-4 mr-2" />
            Zoom Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(s => Math.min(2, s + 0.1))}
          >
            <ZoomIn className="w-4 h-4 mr-2" />
            Zoom In
          </Button>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      <Card className="relative h-[800px] overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-auto"
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
        >
          <div
            className="absolute min-w-full min-h-full"
            style={{
              transform: `scale(${scale}) translate(${viewportOffset.x}px, ${viewportOffset.y}px)`,
              transformOrigin: '0 0',
            }}
          >
          {/* Connection Lines */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {documents.map(doc =>
              doc.connections.map(targetId => {
                const target = documents.find(d => d.id === targetId);
                if (!target) return null;

                const startX = doc.position.x + 200;
                const startY = doc.position.y + 150;
                const endX = target.position.x + 200;
                const endY = target.position.y + 150;

                return (
                  <g key={`${doc.id}-${targetId}`}>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="4"
                    />
                    {selectedDoc === doc.id && (
                      <circle
                        cx={(startX + endX) / 2}
                        cy={(startY + endY) / 2}
                        r="12"
                        className="fill-white stroke-red-500 cursor-pointer"
                        onClick={() => removeConnection(doc.id, targetId)}
                      >
                        <title>Remove Connection</title>
                      </circle>
                    )}
                  </g>
                );
              })
            )}
          </svg>

          {/* Document Nodes */}
          {documents.map(doc => (
            <div
              key={doc.id}
              className={`absolute cursor-move transition-transform duration-200
                ${selectedDoc === doc.id ? 'ring-2 ring-blue-500 ring-offset-4' : ''}`}
              style={{
                left: doc.position.x,
                top: doc.position.y,
                transform: `scale(${doc.scale})`,
              }}
              onMouseDown={(e) => handleDragStart(e, doc.id)}
              onClick={() => {
                if (connecting) {
                  completeConnection(doc.id);
                } else {
                  setSelectedDoc(selectedDoc === doc.id ? null : doc.id);
                }
              }}
            >
              <Card className={`w-[400px] border-2 ${typeColors[doc.type]}`}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription>{doc.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          startConnecting(doc.id);
                        }}
                      >
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToDocument(doc.type);
                        }}
                      >
                        <Move className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {doc.preview}
                </CardContent>
              </Card>
            </div>
          ))}

          {connecting && (
            <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
              Click another document to connect, or click anywhere to cancel
            </div>
          )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DocumentTree;