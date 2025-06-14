
import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { StockManagement } from "@/components/stock/StockManagement";
import { MaterialPassport } from "@/components/passport/MaterialPassport";
import { DesignWorkspace } from "@/components/design/DesignWorkspace";
import { BOMManager } from "@/components/bom/BOMManager";
import { AIInsights } from "@/components/insights/AIInsights";
import { TimeLogging } from "@/components/project/TimeLogging";
import { ManufacturingStages } from "@/components/project/ManufacturingStages";
import { LaborCalculator } from "@/components/project/LaborCalculator";
import { EnergyEstimator } from "@/components/project/EnergyEstimator";
import { TransportEmissions } from "@/components/carbon/TransportEmissions";
import { ShippingTracker } from "@/components/shipping/ShippingTracker";
import { TakebackSystem } from "@/components/lifecycle/TakebackSystem";
import { CircularDesign } from "@/components/design/CircularDesign";

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'stock':
        return <StockManagement />;
      case 'passport':
        return <MaterialPassport />;
      case 'design':
        return <DesignWorkspace />;
      case 'time-logging':
        return <TimeLogging projectId="main-project" onTimeUpdate={setTimeEntries} />;
      case 'manufacturing':
        return <ManufacturingStages projectId="main-project" onStageUpdate={setStages} />;
      case 'labor':
        return <LaborCalculator projectId="main-project" timeEntries={timeEntries} />;
      case 'energy':
        return <EnergyEstimator projectId="main-project" />;
      case 'bom':
        return <BOMManager />;
      case 'transport':
        return <TransportEmissions />;
      case 'shipping':
        return <ShippingTracker />;
      case 'takeback':
        return <TakebackSystem />;
      case 'circular':
        return <CircularDesign />;
      case 'insights':
        return <AIInsights />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full app-background">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto">
          <div className="min-h-full p-6">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
