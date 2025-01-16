import React, { useState, useContext, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Circle,
  Diamond,
  Square,
  ShoppingBag,
  BookOpen,
  Youtube,
  ArrowRight,
  Plus,
  Trash2,
  ArrowRightFromLine,
  Undo2 as Undo,
  Redo2 as Redo,
  FileDown,
  FileUp
} from 'lucide-react';
import { DataContext } from '@/App';
import { useNavigate } from 'react-router-dom';

interface Node {
  id: string;
  type: 'task' | 'decision' | 'start' | 'end';
  position: { x: number; y: number };
  text: string;
  connections: string[];
  description?: string;
}

interface Workflow {
  id: string;
  title: string;
  description: string;
  goalId?: string;
  nodes: Node[];
  icon: React.ElementType;
}

interface ConnectionPreview {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const predefinedWorkflows: Workflow[] = [
  {
    id: 'recipe-development',
    title: 'Recipe Development Process',
    description: 'Step-by-step workflow for creating and publishing new recipes',
    goalId: 'recipe-dev-1',
    icon: BookOpen,
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 400, y: 50 },
        text: 'Start Recipe Development',
        connections: ['research']
      },
      {
        id: 'research',
        type: 'task',
        position: { x: 400, y: 150 },
        text: 'Research Recipe Ideas',
        description: 'Research seasonal ingredients and trending recipes',
        connections: ['initial-test']
      },
      {
        id: 'initial-test',
        type: 'task',
        position: { x: 400, y: 250 },
        text: 'Initial Recipe Test',
        description: 'First test cook with basic measurements',
        connections: ['test-review']
      },
      {
        id: 'test-review',
        type: 'decision',
        position: { x: 400, y: 350 },
        text: 'Recipe Successful?',
        description: 'Evaluate taste, texture, and presentation',
        connections: ['adjust-recipe', 'photo-prep']
      },
      {
        id: 'adjust-recipe',
        type: 'task',
        position: { x: 200, y: 450 },
        text: 'Adjust Recipe',
        description: 'Modify ingredients or instructions',
        connections: ['initial-test']
      },
      {
        id: 'photo-prep',
        type: 'task',
        position: { x: 400, y: 450 },
        text: 'Prepare for Photography',
        description: 'Style food and set up photography equipment',
        connections: ['take-photos']
      },
      {
        id: 'take-photos',
        type: 'task',
        position: { x: 400, y: 550 },
        text: 'Take Photos',
        description: 'Capture process shots and final presentation',
        connections: ['photo-review']
      },
      {
        id: 'photo-review',
        type: 'decision',
        position: { x: 400, y: 650 },
        text: 'Photos Acceptable?',
        description: 'Review photo quality and composition',
        connections: ['retake-photos', 'write-post']
      },
      {
        id: 'retake-photos',
        type: 'task',
        position: { x: 200, y: 750 },
        text: 'Retake Photos',
        description: 'Adjust styling and lighting',
        connections: ['photo-review']
      },
      {
        id: 'write-post',
        type: 'task',
        position: { x: 400, y: 750 },
        text: 'Write Blog Post',
        description: 'Write recipe instructions and blog content',
        connections: ['content-review']
      },
      {
        id: 'content-review',
        type: 'decision',
        position: { x: 400, y: 850 },
        text: 'Content Review',
        description: 'Review post for clarity and completeness',
        connections: ['revise-content', 'seo-optimize']
      },
      {
        id: 'revise-content',
        type: 'task',
        position: { x: 200, y: 950 },
        text: 'Revise Content',
        description: 'Make content adjustments',
        connections: ['content-review']
      },
      {
        id: 'seo-optimize',
        type: 'task',
        position: { x: 400, y: 950 },
        text: 'SEO Optimization',
        description: 'Add keywords and optimize for search',
        connections: ['schedule']
      },
      {
        id: 'schedule',
        type: 'task',
        position: { x: 400, y: 1050 },
        text: 'Schedule Post',
        description: 'Schedule post and social media promotion',
        connections: ['end']
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 400, y: 1150 },
        text: 'Recipe Published',
        connections: []
      }
    ]
  },
  {
    id: 'youtube-first-video',
    title: 'Create First YouTube Video',
    description: 'Step-by-step process for creating and publishing your first recipe video',
    goalId: 'content-1-1',  // Links to Content Strategy > Recipe Development
    icon: Youtube,
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 400, y: 50 },
        text: 'Start Video Creation',
        connections: ['recipe-select']
      },
      {
        id: 'recipe-select',
        type: 'task',
        position: { x: 400, y: 150 },
        text: 'Select Recipe to Feature',
        description: 'Choose a tested recipe that\'s visually appealing and beginner-friendly',
        connections: ['equipment-check']
      },
      {
        id: 'equipment-check',
        type: 'decision',
        position: { x: 400, y: 250 },
        text: 'Equipment Ready?',
        description: 'Check if you have all necessary recording equipment',
        connections: ['setup-equipment', 'prep-space']
      },
      {
        id: 'setup-equipment',
        type: 'task',
        position: { x: 200, y: 350 },
        text: 'Set Up Recording Equipment',
        description: 'Camera, lighting, microphone, and backdrop setup',
        connections: ['prep-space']
      },
      {
        id: 'prep-space',
        type: 'task',
        position: { x: 400, y: 450 },
        text: 'Prepare Cooking Space',
        description: 'Clean kitchen, arrange ingredients, and organize tools',
        connections: ['test-shot']
      },
      {
        id: 'test-shot',
        type: 'task',
        position: { x: 400, y: 550 },
        text: 'Record Test Shot',
        description: 'Film a short test to check audio and video quality',
        connections: ['quality-check']
      },
      {
        id: 'quality-check',
        type: 'decision',
        position: { x: 400, y: 650 },
        text: 'Quality Acceptable?',
        description: 'Review test footage for lighting, sound, and framing',
        connections: ['adjust-setup', 'record-video']
      },
      {
        id: 'adjust-setup',
        type: 'task',
        position: { x: 200, y: 750 },
        text: 'Adjust Setup',
        description: 'Make necessary adjustments to equipment and space',
        connections: ['test-shot']
      },
      {
        id: 'record-video',
        type: 'task',
        position: { x: 400, y: 750 },
        text: 'Record Full Video',
        description: 'Film the complete recipe preparation process',
        connections: ['edit-video']
      },
      {
        id: 'edit-video',
        type: 'task',
        position: { x: 400, y: 850 },
        text: 'Edit Video',
        description: 'Add intro, outro, music, and text overlays',
        connections: ['content-review']
      },
      {
        id: 'content-review',
        type: 'decision',
        position: { x: 400, y: 950 },
        text: 'Content Review',
        description: 'Final review of edited video',
        connections: ['revise-edit', 'prepare-upload']
      },
      {
        id: 'revise-edit',
        type: 'task',
        position: { x: 200, y: 1050 },
        text: 'Revise Edit',
        description: 'Make necessary editing adjustments',
        connections: ['content-review']
      },
      {
        id: 'prepare-upload',
        type: 'task',
        position: { x: 400, y: 1050 },
        text: 'Prepare Upload',
        description: 'Create thumbnail, title, description, and tags',
        connections: ['publish']
      },
      {
        id: 'publish',
        type: 'task',
        position: { x: 400, y: 1150 },
        text: 'Publish Video',
        description: 'Upload to YouTube and schedule/publish',
        connections: ['end']
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 400, y: 1250 },
        text: 'Video Published',
        connections: []
      }
    ]
  }
];

const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const { importedData } = useContext(DataContext);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null); 
  const [nodes, setNodes] = useState<Node[]>([]); 
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [connectionPreview, setConnectionPreview] = useState<ConnectionPreview | null>(null);
  const [history, setHistory] = useState<Node[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (importedData?.workflowTemplates) {
      const importedWorkflows: Workflow[] = importedData.workflowTemplates.map(workflow => ({
        ...workflow,
        icon: workflow.id.includes('recipe') ? BookOpen :
              workflow.id.includes('video') ? Youtube :
              workflow.id.includes('catering') ? ShoppingBag : BookOpen // Default to BookOpen if no match
      }));
      setWorkflows(importedWorkflows);
    } else {
      setWorkflows(predefinedWorkflows);
    }
  }, [importedData]);

  // Initialize nodes with the recipe development workflow
  React.useEffect(() => {
    if (selectedWorkflow) {
      setNodes(selectedWorkflow.nodes || []);
      addToHistory(selectedWorkflow.nodes || []);
    }
  }, [selectedWorkflow]);

  const nodeTypes = [
    { 
      type: 'task', 
      icon: Square, 
      color: 'bg-blue-100',
      description: 'Add a task or action step'
    },
    { 
      type: 'decision', 
      icon: Diamond, 
      color: 'bg-amber-100',
      description: 'Add a decision point with multiple paths'
    },
    { 
      type: 'start', 
      icon: Circle, 
      color: 'bg-green-100',
      description: 'Add a starting point'
    },
    { 
      type: 'end', 
      icon: Circle, 
      color: 'bg-red-100',
      description: 'Add an ending point'
    },
  ];

  const addToHistory = (newNodes: Node[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newNodes]);
    setHistoryIndex(historyIndex + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setNodes(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setNodes(history[historyIndex + 1]);
    }
  };

  const addNode = (type: Node['type']) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      text: 'New Node',
      connections: [],
    };
    addToHistory([...nodes, newNode]);
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode.id);
  };

  const startDragging = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDragging(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      let x = e.clientX - container.left;
      let y = e.clientY - container.top;
      
      // Snap to grid
      x = Math.round(x / 20) * 20;
      y = Math.round(y / 20) * 20;

      setNodes(nodes.map(node => 
        node.id === dragging 
          ? { ...node, position: { x, y } }
          : node
      ));
    } else if (connecting && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const sourceNode = nodes.find(n => n.id === connecting);
      if (sourceNode) {
        setConnectionPreview({
          startX: sourceNode.position.x + 50,
          startY: sourceNode.position.y + 32,
          endX: e.clientX - container.left,
          endY: e.clientY - container.top,
        });
      }
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    if (dragging) {
      addToHistory(nodes);
    }
  };

  const startConnecting = (nodeId: string) => {
    setConnecting(nodeId);
    const sourceNode = nodes.find(n => n.id === nodeId);
    if (sourceNode && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      setConnectionPreview({
        startX: sourceNode.position.x + 50,
        startY: sourceNode.position.y + 32,
        endX: sourceNode.position.x + 50,
        endY: sourceNode.position.y + 32,
      });
    }
  };

  const completeConnection = (targetId: string) => {
    if (connecting && connecting !== targetId) {
      const updatedNodes = nodes.map(node =>
        node.id === connecting
          ? { ...node, connections: [...node.connections, targetId] }
          : node
      );
      setNodes(updatedNodes);
      addToHistory(updatedNodes);
    }
    setConnecting(null);
    setConnectionPreview(null);
  };

  const deleteNode = (nodeId: string) => {
    const updatedNodes = nodes
      .filter(node => node.id !== nodeId)
      .map(node => ({
        ...node,
        connections: node.connections.filter(id => id !== nodeId)
      }));
    setNodes(updatedNodes);
    addToHistory(updatedNodes);
    setSelectedNode(null);
  };

  const updateNodeText = (nodeId: string, text: string) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, text } : node
    );
    setNodes(updatedNodes);
    addToHistory(updatedNodes);
    setEditingText(null);
  };

  const exportWorkflow = () => {
    const workflowData = {
      ...selectedWorkflow,
      nodes,
    };
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedWorkflow?.title.toLowerCase().replace(/\s+/g, '-')}-workflow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workflowData = JSON.parse(event.target?.result as string);
          setSelectedWorkflow(workflowData);
          setNodes(workflowData.nodes);
          addToHistory(workflowData.nodes);
        } catch (error) {
          console.error('Error parsing workflow file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderNode = (node: Node) => {
    const NodeIcon = nodeTypes.find(t => t.type === node.type)?.icon || Square;
    const nodeColor = nodeTypes.find(t => t.type === node.type)?.color || 'bg-gray-100';
    const isSelected = selectedNode === node.id;

    return (
      <div
        key={node.id}
        className={`absolute cursor-move ${nodeColor} p-4 rounded-lg shadow-md border border-gray-300
          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        style={{ left: node.position.x, top: node.position.y }}
        onMouseDown={(e) => startDragging(node.id, e)}
        onClick={(e) => {
          e.stopPropagation();
          if (connecting) {
            completeConnection(node.id);
          } else {
            setSelectedNode(node.id);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <NodeIcon className="w-5 h-5" />
          {editingText === node.id ? (
            <input
              type="text"
              value={node.text}
              onChange={(e) => updateNodeText(node.id, e.target.value)}
              onBlur={() => setEditingText(null)}
              className="bg-white px-2 py-1 rounded"
              autoFocus
            />
          ) : (
            <span onDoubleClick={() => setEditingText(node.id)}>{node.text}</span>
          )}
        </div>

        {isSelected && (
          <div className="absolute -right-12 top-0 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                startConnecting(node.id);
              }}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              title="Connect to another node"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(node.id);
              }}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              title="Delete node"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {node.description && isSelected && (
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 bg-white p-2 rounded shadow-lg text-sm w-48 text-center">
            {node.description}
          </div>
        )}
      </div>
    );
  };

  const renderGrid = () => {
    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    );
  };

  const renderConnectionPreview = () => {
    if (!connectionPreview) return null;

    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <line
          x1={connectionPreview.startX}
          y1={connectionPreview.startY}
          x2={connectionPreview.endX}
          y2={connectionPreview.endY}
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="4"
          markerEnd="url(#arrowhead-preview)"
        />
      </svg>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {!selectedWorkflow ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
          <div className="flex justify-between items-center mb-6 col-span-full">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>
            <h1 className="text-2xl font-bold">Available Workflows</h1>
          </div>
          {workflows.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 mt-12">
              <p>No workflows available. Import a workflow file to get started.</p>
            </div>
          ) : workflows.map((workflow) => {
            const Icon = workflow.icon;
            return (
              <Card
                key={workflow.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => {
                  setSelectedWorkflow(workflow);
                  setNodes(workflow.nodes);
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle>{workflow.title}</CardTitle>
                  </div>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedWorkflow(null);
                  setNodes([]);
                }}
              >
                ← Back to Workflows
              </Button>
              <h1 className="text-2xl font-bold">{selectedWorkflow.title}</h1>
            </div>
            <p className="text-gray-600 mb-4">
              {selectedWorkflow.description}
            </p>
            <div className="flex gap-4">
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>
              <div className="border-l border-gray-200" />
              <button
                onClick={exportWorkflow}
                className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                <span>Export</span>
              </button>
              <label className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2 cursor-pointer">
                <FileUp className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importWorkflow}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Add New Elements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nodeTypes.map(({ type, icon: Icon, color, description }) => (
                <button
                  key={type}
                  onClick={() => addNode(type)}
                  className={`${color} p-4 rounded-lg border border-gray-300 hover:border-gray-400
                    transition-all duration-200 hover:shadow-md text-left`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium capitalize">{type}</span>
                  </div>
                  <p className="text-sm text-gray-600">{description}</p>
                </button>
              ))}
            </div>
          </div>

          <Card className="relative h-[600px] overflow-auto border-2">
            <div
              ref={containerRef}
              className="relative w-full h-full min-w-[1200px] min-h-[1000px]"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onClick={() => {
                setSelectedNode(null);
                setConnecting(null);
                setConnectionPreview(null);
              }}
            >
              {renderGrid()}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                  <marker
                    id="arrowhead-preview"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                  </marker>
                </defs>
                {nodes.map(node =>
                  node.connections.map(targetId => {
                    const target = nodes.find(n => n.id === targetId);
                    if (!target) return null;

                    const startX = node.position.x + 50;
                    const startY = node.position.y + 32;
                    const endX = target.position.x + 50;
                    const endY = target.position.y + 32;

                    return (
                      <line
                        key={`${node.id}-${targetId}`}
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="#94a3b8"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  })
                )}
              </svg>
              {renderConnectionPreview()}
              {nodes.map(renderNode)}

              {connecting && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                  Click on a node to connect, or click anywhere to cancel
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default WorkflowBuilder;