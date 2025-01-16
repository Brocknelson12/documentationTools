import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import DocumentTypes from "@/components/DocumentTypes";
import WorkflowBuilder from "@/components/WorkflowBuilder";
import ProcessMap from "@/components/ProcessMap";
import GoalNetwork from "@/components/GoalNetwork";
import TaskManager from "@/components/TaskManager";
import OrganizationChart from "@/components/OrganizationChart";
import GanttChart from "@/components/GanttChart";
import DocumentTree from "@/components/DocumentTree";
import MetricsDashboard from "@/components/MetricsDashboard";
import TimelinePlanner from "@/components/TimelinePlanner";
import CustomerBase from '@/components/CustomerBase';

export const DataContext = createContext<any>(null);

function App() {
  const [importedData, setImportedData] = useState<any>(null);

  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const modules = import.meta.glob([
          './data/defaults/*.json',
          './data/goals/*.json',
          './data/food-business.json'
        ]);
        const data: any = {};
        
        for (const path in modules) {
          const module = await modules[path]();
          const fileName = path.split('/').pop()?.replace('.json', '');
          
          if (fileName) {
            data[fileName] = module.default;
          }
        }
        
        // Set workflow templates from the workflows data
        if (data.workflows?.workflows) {
          data.workflowTemplates = data.workflows.workflows;
        }
        
        setImportedData(data);
      } catch (error) {
        console.error('Error loading defaults:', error);
      }
    };

    loadDefaults();
  }, []);

  return (
    <DataContext.Provider value={{ importedData, setImportedData }}>
      <Router>
        <Routes>
          <Route path="/" element={<DocumentTypes />} />
          <Route path="/workflows" element={<WorkflowBuilder />} />
          <Route path="/process" element={<ProcessMap />} />
          <Route path="/goals" element={<GoalNetwork />} />
          <Route path="/metrics" element={<MetricsDashboard />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/org" element={<OrganizationChart />} />
          <Route path="/gantt" element={<GanttChart />} />
          <Route path="/docs" element={<DocumentTree />} />
          <Route path="/timeline" element={<TimelinePlanner />} />
          <Route path="/customers" element={<CustomerBase />} />
        </Routes>
      </Router>
    </DataContext.Provider>
  );
}

export default App;
