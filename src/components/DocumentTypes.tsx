import React, { useState, useContext } from 'react';
import { DataContext } from '@/App';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Network,
  FileJson,
  GitBranch,
  Timer,
  BarChart3,
  Users,
  GitMerge,
  CalendarRange,
  FileStack,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const documentTypes = [
  {
    id: 'customers',
    title: 'Customer Base',
    description: 'Visualize and analyze your target customer segments',
    icon: Users,
    color: 'bg-orange-500',
    examples: ['Demographics', 'Social media usage', 'Income levels']
  },
  {
    id: 'goals',
    title: 'Goal Network',
    description: 'Create hierarchical goal structures with dependencies and progress tracking',
    icon: Network,
    color: 'bg-blue-500',
    examples: ['Business objectives', 'Project milestones', 'Team targets']
  },
  {
    id: 'workflows',
    title: 'Workflow Builder',
    description: 'Design and document business processes and decision flows',
    icon: GitBranch,
    color: 'bg-green-500',
    examples: ['Approval processes', 'Customer journeys', 'Production flows']
  },
  {
    id: 'timeline',
    title: 'Timeline Planner',
    description: 'Visualize project timelines and track progress over time',
    icon: Timer,
    color: 'bg-purple-500',
    examples: ['Project schedules', 'Release planning', 'Event timelines']
  },
  {
    id: 'metrics',
    title: 'Metrics Dashboard',
    description: 'Track and visualize key performance indicators and metrics',
    icon: BarChart3,
    color: 'bg-yellow-500',
    examples: ['KPI tracking', 'Sales metrics', 'Performance analytics']
  },
  {
    id: 'tasks',
    title: 'Task Manager',
    description: 'Track and manage tasks with visual status indicators',
    icon: FileStack,
    color: 'bg-red-500',
    examples: ['Project tasks', 'Development work', 'Content creation']
  },
  {
    id: 'org',
    title: 'Organization Chart',
    description: 'Create and manage organizational structures and team hierarchies',
    icon: Users,
    color: 'bg-pink-500',
    examples: ['Team structure', 'Reporting lines', 'Department organization']
  },
  {
    id: 'process',
    title: 'Process Map',
    description: 'Document detailed business processes and standard operating procedures',
    icon: GitMerge,
    color: 'bg-indigo-500',
    examples: ['Operating procedures', 'Quality control', 'Training processes']
  },
  {
    id: 'gantt',
    title: 'Gantt Chart',
    description: 'Plan and track project tasks with dependencies and timelines',
    icon: CalendarRange,
    color: 'bg-orange-500',
    examples: ['Project planning', 'Resource allocation', 'Sprint planning']
  },
  {
    id: 'docs',
    title: 'Document Tree',
    description: 'Organize and link related documentation and resources',
    icon: FileStack,
    color: 'bg-teal-500',
    examples: ['Knowledge base', 'Documentation links', 'Resource library']
  }
];

const DocumentTypes = () => {
  const navigate = useNavigate();
  const { setImportedData } = useContext(DataContext);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);

  const handleJsonSubmit = () => {
    try {
      const json = JSON.parse(jsonInput);
      setImportedData(json);
      // Navigate to appropriate tool based on content
      if (json.goals) {
        navigate('/goals');
      } else if (json.workflows) {
        navigate('/workflows');
      } else if (json.timeline) {
        navigate('/timeline');
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Documentation Tools</h1>
          <p className="text-xl text-gray-600">
            Choose a tool to start documenting your business processes
          </p>
        </div>

        {/* JSON Import Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileJson className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Import Documentation</h2>
                  <p className="text-sm text-gray-600">Paste your JSON data or upload a file</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowJsonInput(!showJsonInput)}
                >
                  {showJsonInput ? 'Hide JSON Input' : 'Show JSON Input'}
                </Button>
                <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const json = JSON.parse(event.target?.result as string);
                          setImportedData(json);
                          setJsonInput(event.target?.result as string);
                          // Navigate to appropriate tool based on content
                          if (json.goals) {
                            navigate('/goals');
                          } else if (json.workflows) {
                            navigate('/workflows');
                          } else if (json.timeline) {
                            navigate('/timeline');
                          }
                        } catch (error) {
                          console.error('Error parsing JSON:', error);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <Button>
                  Import JSON
                </Button>
              </label>
              </div>
            </div>
            {showJsonInput && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste your JSON data here..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <Button
                  onClick={handleJsonSubmit}
                  disabled={!jsonInput}
                  className="w-full"
                >
                  Submit JSON
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                onClick={() => navigate(`/${type.id}`)}
              >
                <CardHeader>
                  <div className={`${type.color} text-white p-3 rounded-lg w-fit`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl mt-2">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500">Example uses:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {type.examples.map((example, idx) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentTypes;