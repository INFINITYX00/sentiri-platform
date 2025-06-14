
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
        return (
          <div className="page-container">
            <StockManagement />
          </div>
        );
      case 'passport':
        return (
          <div className="page-container">
            <MaterialPassport />
          </div>
        );
      case 'design':
        return (
          <div className="page-container">
            <DesignWorkspace />
          </div>
        );
      case 'time-logging':
        return (
          <div className="page-container">
            <TimeLogging projectId="main-project" onTimeUpdate={setTimeEntries} />
          </div>
        );
      case 'manufacturing':
        return (
          <div className="page-container">
            <ManufacturingStages projectId="main-project" onStageUpdate={setStages} />
          </div>
        );
      case 'labor':
        return (
          <div className="page-container">
            <LaborCalculator projectId="main-project" timeEntries={timeEntries} />
          </div>
        );
      case 'energy':
        return (
          <div className="page-container">
            <EnergyEstimator projectId="main-project" />
          </div>
        );
      case 'bom':
        return (
          <div className="page-container">
            <BOMManager />
          </div>
        );
      case 'transport':
        return (
          <div className="page-container">
            <TransportEmissions />
          </div>
        );
      case 'shipping':
        return (
          <div className="page-container">
            <ShippingTracker />
          </div>
        );
      case 'takeback':
        return (
          <div className="page-container">
            <TakebackSystem />
          </div>
        );
      case 'circular':
        return (
          <div className="page-container">
            <CircularDesign />
          </div>
        );
      case 'insights':
        return (
          <div className="page-container">
            <AIInsights />
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full app-background">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto ml-72">
          <div className="min-h-full">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
