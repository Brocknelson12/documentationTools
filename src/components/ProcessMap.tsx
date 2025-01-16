import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Link as LinkIcon,
  ArrowUpRight,
  FileText,
  Camera,
  Edit2,
  Share2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  type: 'preparation' | 'action' | 'validation' | 'documentation';
  timeEstimate?: string;
  cautions?: string[];
  tips?: string[];
  tools?: string[];
  linkedDocs?: {
    type: 'goal' | 'workflow' | 'timeline';
    id: string;
    title: string;
  }[];
}

interface Process {
  id: string;
  title: string;
  description: string;
  category: 'recipe' | 'content' | 'photography';
  owner: string;
  lastUpdated: Date;
  steps: ProcessStep[];
}

const sampleProcesses: Process[] = [
  {
    id: 'recipe-documentation',
    title: 'Recipe Documentation Process',
    description: 'Standard process for documenting and publishing new recipes',
    category: 'recipe',
    owner: 'Sarah Chen',
    lastUpdated: new Date(2024, 2, 15),
    steps: [
      {
        id: 'step-1',
        title: 'Recipe Testing Setup',
        description: 'Prepare workspace and gather all necessary equipment',
        type: 'preparation',
        timeEstimate: '15-30 minutes',
        tools: [
          'Kitchen scale',
          'Measuring cups/spoons',
          'Recipe template',
          'Camera',
        ],
        tips: [
          'Clean workspace thoroughly',
          'Organize ingredients by use order',
          'Charge camera batteries',
        ],
      },
      {
        id: 'step-2',
        title: 'Initial Recipe Test',
        description: 'First test cook with precise measurements',
        type: 'action',
        timeEstimate: '1-2 hours',
        cautions: [
          'Document ALL measurements precisely',
          'Note any substitutions made',
          'Track cooking times carefully',
        ],
        tips: [
          'Take process photos as you go',
          'Note any unexpected results',
          'Write down immediate observations',
        ],
      },
      {
        id: 'step-3',
        title: 'Recipe Validation',
        description: 'Review and validate recipe results',
        type: 'validation',
        timeEstimate: '30 minutes',
        tips: [
          'Taste test while still fresh',
          'Check texture and consistency',
          'Evaluate visual appeal',
        ],
        linkedDocs: [
          {
            type: 'workflow',
            id: 'recipe-workflow-1',
            title: 'Recipe Development Workflow',
          },
        ],
      },
      {
        id: 'step-4',
        title: 'Photo Documentation',
        description: 'Capture final recipe photos',
        type: 'documentation',
        timeEstimate: '45-60 minutes',
        tools: [
          'DSLR camera',
          'Lighting setup',
          'Props and backgrounds',
          'Styling tools',
        ],
        tips: [
          'Use natural light when possible',
          'Take multiple angles',
          'Style thoughtfully but naturally',
        ],
        linkedDocs: [
          {
            type: 'workflow',
            id: 'photo-workflow-1',
            title: 'Food Photography Guidelines',
          },
        ],
      },
      {
        id: 'step-5',
        title: 'Content Creation',
        description: 'Write recipe post and instructions',
        type: 'documentation',
        timeEstimate: '1-2 hours',
        tools: [
          'Recipe template',
          'Style guide',
          'SEO checklist',
        ],
        tips: [
          'Include helpful tips and variations',
          'Add prep and cook times',
          'List equipment needed',
        ],
        linkedDocs: [
          {
            type: 'goal',
            id: 'content-goal-1',
            title: 'Content Quality Standards',
          },
        ],
      },
    ],
  },
];

const stepTypeIcons = {
  preparation: Clock,
  action: Edit2,
  validation: CheckCircle2,
  documentation: FileText,
};

const stepTypeColors = {
  preparation: 'bg-blue-50 border-blue-200 text-blue-700',
  action: 'bg-green-50 border-green-200 text-green-700',
  validation: 'bg-amber-50 border-amber-200 text-amber-700',
  documentation: 'bg-purple-50 border-purple-200 text-purple-700',
};

const categoryIcons = {
  recipe: FileText,
  content: Edit2,
  photography: Camera,
};

const ProcessMap = () => {
  const navigate = useNavigate();
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const navigateToDocument = (doc: ProcessStep['linkedDocs'][0]) => {
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
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Button>
        <h1 className="text-2xl font-bold">Process Documentation</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Process
        </Button>
      </div>

      {!selectedProcess ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProcesses.map((process) => {
            const Icon = categoryIcons[process.category];
            return (
              <Card
                key={process.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => setSelectedProcess(process)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>{process.title}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {process.steps.length} steps • Updated {process.lastUpdated.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <CardDescription>{process.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedProcess.title}</CardTitle>
                  <CardDescription>{selectedProcess.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProcess(null)}
                >
                  ← Back to Processes
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{selectedProcess.steps.length} steps</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  <span>Owner: {selectedProcess.owner}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {selectedProcess.lastUpdated.toLocaleDateString()}</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {selectedProcess.steps.map((step, index) => {
              const StepIcon = stepTypeIcons[step.type];
              const isExpanded = expandedSteps.has(step.id);

              return (
                <Card key={step.id} className="relative">
                  {index > 0 && (
                    <div className="absolute -top-4 left-8 w-px h-4 bg-gray-200" />
                  )}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleStep(step.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${stepTypeColors[step.type]}`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {index + 1}. {step.title}
                          </h3>
                          {step.timeEstimate && (
                            <span className="text-sm text-gray-500">
                              ({step.timeEstimate})
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t pt-4">
                        {/* Tools and Requirements */}
                        {step.tools && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Required Tools
                            </h4>
                            <ul className="space-y-1">
                              {step.tools.map((tool, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-600 flex items-center gap-2"
                                >
                                  <div className="w-1 h-1 rounded-full bg-gray-400" />
                                  {tool}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tips */}
                        {step.tips && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Info className="w-4 h-4 text-blue-500" />
                              Helpful Tips
                            </h4>
                            <ul className="space-y-1">
                              {step.tips.map((tip, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-600 flex items-center gap-2"
                                >
                                  <div className="w-1 h-1 rounded-full bg-blue-400" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Cautions */}
                        {step.cautions && (
                          <div className="md:col-span-2">
                            <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-600">
                              <AlertTriangle className="w-4 h-4" />
                              Important Cautions
                            </h4>
                            <ul className="space-y-1">
                              {step.cautions.map((caution, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-amber-600 flex items-center gap-2"
                                >
                                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                                  {caution}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Linked Documents */}
                        {step.linkedDocs && (
                          <div className="md:col-span-2 border-t pt-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <LinkIcon className="w-4 h-4" />
                              Related Documents
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {step.linkedDocs.map((doc, idx) => (
                                <Card
                                  key={idx}
                                  className="cursor-pointer hover:shadow-md transition-all"
                                  onClick={() => navigateToDocument(doc)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm text-muted-foreground capitalize">
                                          {doc.type}
                                        </p>
                                        <p className="font-medium">{doc.title}</p>
                                      </div>
                                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessMap;