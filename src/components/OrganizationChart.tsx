import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '@/App';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Users,
  Camera,
  Pencil,
  ShoppingBag,
  MessageCircle,
  BarChart,
  Plus,
  Link as LinkIcon,
  Settings,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Role {
  id: string;
  title: string;
  area: 'content' | 'community' | 'product' | 'operations';
  icon: React.ElementType;
  responsibilities: string[];
  teamSize: number;
  linkedDocuments: {
    type: 'goal' | 'workflow' | 'timeline' | 'process';
    id: string;
    title: string;
  }[];
  reports: string[];
  reportsTo?: string;
}

const areaColors = {
  content: 'bg-blue-50 text-blue-600 border-blue-200',
  community: 'bg-green-50 text-green-600 border-green-200',
  product: 'bg-pink-50 text-pink-600 border-pink-200',
  operations: 'bg-yellow-50 text-yellow-600 border-yellow-200',
};

const areaDescriptions = {
  content: 'Content Creation & Strategy',
  community: 'Community Management & Growth',
  product: 'Product Development & Sales',
  operations: 'Operations & Management',
};

const sampleRoles: Role[] = [
  {
    id: 'role-1',
    title: 'Creative Director',
    area: 'operations',
    icon: Settings,
    responsibilities: [
      'Overall creative vision',
      'Brand strategy',
      'Team coordination',
    ],
    teamSize: 4,
    linkedDocuments: [
      { type: 'goal', id: 'goal-1', title: 'Brand Growth Strategy' },
      { type: 'workflow', id: 'workflow-1', title: 'Content Approval Process' },
    ],
    reports: ['role-2', 'role-3', 'role-4', 'role-5'],
  },
  {
    id: 'role-2',
    title: 'Content Lead',
    area: 'content',
    icon: Pencil,
    responsibilities: [
      'Recipe development',
      'Content planning',
      'Quality assurance',
    ],
    teamSize: 2,
    linkedDocuments: [
      { type: 'goal', id: 'goal-2', title: 'Content Strategy' },
      { type: 'process', id: 'process-1', title: 'Recipe Development' },
    ],
    reports: ['role-6', 'role-7'],
    reportsTo: 'role-1',
  },
  {
    id: 'role-3',
    title: 'Visual Lead',
    area: 'content',
    icon: Camera,
    responsibilities: [
      'Photography direction',
      'Visual style guide',
      'Brand aesthetics',
    ],
    teamSize: 2,
    linkedDocuments: [
      { type: 'process', id: 'process-2', title: 'Photography Guidelines' },
    ],
    reports: ['role-8', 'role-9'],
    reportsTo: 'role-1',
  },
  {
    id: 'role-4',
    title: 'Community Manager',
    area: 'community',
    icon: MessageCircle,
    responsibilities: [
      'Social media management',
      'Community engagement',
      'Influencer relations',
    ],
    teamSize: 2,
    linkedDocuments: [
      { type: 'goal', id: 'goal-3', title: 'Community Growth' },
      { type: 'timeline', id: 'timeline-1', title: 'Engagement Calendar' },
    ],
    reports: ['role-10', 'role-11'],
    reportsTo: 'role-1',
  },
  {
    id: 'role-5',
    title: 'Product Manager',
    area: 'product',
    icon: ShoppingBag,
    responsibilities: [
      'Product development',
      'Sales strategy',
      'Market research',
    ],
    teamSize: 2,
    linkedDocuments: [
      { type: 'goal', id: 'goal-4', title: 'Product Launch Goals' },
      { type: 'workflow', id: 'workflow-2', title: 'Product Development' },
    ],
    reports: ['role-12', 'role-13'],
    reportsTo: 'role-1',
  },
];

const RoleNode = ({ role, onSelect, selectedRole, level = 0 }: {
  role: Role;
  onSelect: (role: Role) => void;
  selectedRole: Role | null;
  level?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = role.icon;
  const childRoles = sampleRoles.filter(r => r.reportsTo === role.id);
  const isSelected = selectedRole?.id === role.id;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`relative w-64 transition-all duration-200 ${
            isSelected ? 'scale-105' : ''
          }`}
        >
          <Card
            className={`cursor-pointer border-2 ${
              isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
            } ${areaColors[role.area]}`}
            onClick={() => onSelect(role)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${areaColors[role.area]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">{role.title}</h3>
                  <p className="text-sm opacity-70">{areaDescriptions[role.area]}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{role.teamSize}</span>
                </div>
                {role.linkedDocuments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    <span>{role.linkedDocuments.length}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {childRoles.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10
                bg-white rounded-full shadow-md hover:shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Vertical line from parent to children container */}
        {childRoles.length > 0 && isExpanded && (
          <div
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{
              top: '100%',
              width: '2px',
              height: '2rem',
              background: '#e2e8f0',
            }}
          />
        )}
      </div>

      {/* Child roles */}
      {childRoles.length > 0 && isExpanded && (
        <div className="mt-8">
          <div
            className="flex gap-8 relative"
            style={{ marginLeft: level * 20 }}
          >
            {/* Horizontal line connecting children */}
            <div
              className="absolute top-0 left-4 right-4 h-px bg-gray-200"
              style={{ top: '-2rem' }}
            />

            {childRoles.map((childRole) => (
              <RoleNode
                key={childRole.id}
                role={childRole}
                onSelect={onSelect}
                selectedRole={selectedRole}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrganizationChart = () => {
  const navigate = useNavigate();
  const { importedData } = useContext(DataContext);
  const [roles, setRoles] = useState<Role[]>(sampleRoles);
  
  useEffect(() => {
    if (importedData?.organization?.roles) {
      setRoles(importedData.organization.roles.map(role => ({
        ...role,
        icon: role.icon || Users,
        linkedDocuments: role.linkedDocuments || []
      })));
    }
  }, [importedData]);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const rootRole = roles.find(role => !role.reportsTo);

  const navigateToDocument = (doc: Role['linkedDocuments'][0]) => {
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
        <h1 className="text-2xl font-bold">Organization Structure</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Area Legend */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Work Areas</CardTitle>
          <CardDescription>Click on a role to view details and responsibilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(areaColors).map(([area, color]) => (
              <div
                key={area}
                className={`p-3 rounded-lg border ${color} flex items-center gap-2`}
              >
                <div className={`p-1.5 rounded-md ${color}`}>
                  {area === 'content' && <Pencil className="w-4 h-4" />}
                  {area === 'community' && <Users className="w-4 h-4" />}
                  {area === 'product' && <ShoppingBag className="w-4 h-4" />}
                  {area === 'operations' && <Settings className="w-4 h-4" />}
                </div>
                <span className="capitalize">{areaDescriptions[area as keyof typeof areaColors]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization Chart */}
      <Card className="mb-8 overflow-x-auto">
        <CardContent className="p-8">
          <div className="min-w-[800px] flex justify-center">
            {rootRole && (
              <RoleNode
                role={rootRole}
                onSelect={setSelectedRole}
                selectedRole={selectedRole}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Role Details */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${areaColors[selectedRole.area]}`}>
                  <selectedRole.icon className="w-5 h-5" />
                </div>
                {selectedRole.title}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {areaDescriptions[selectedRole.area]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Responsibilities */}
              <div>
                <h3 className="font-medium mb-3">Key Responsibilities</h3>
                <ul className="space-y-2">
                  {selectedRole.responsibilities.map((resp, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Linked Documents */}
              {selectedRole.linkedDocuments.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Linked Documents</h3>
                  <div className="grid gap-3">
                    {selectedRole.linkedDocuments.map((doc, index) => (
                      <Card
                        key={index}
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
        </Card>
      )}
    </div>
  );
};

export default OrganizationChart;