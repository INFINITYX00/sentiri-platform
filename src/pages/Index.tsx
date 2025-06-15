
import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { StockManagement } from "@/components/stock/StockManagement";
import { MaterialPassport } from "@/components/passport/MaterialPassport";
import { CarbonTracker } from "@/components/carbon/CarbonTracker";
import { AIInsights } from "@/components/insights/AIInsights";
import { ProjectsManager } from "@/components/projects/ProjectsManager";
import { DesignBOMManager } from "@/components/design/DesignBOMManager";
import { ProductionManager } from "@/components/production/ProductionManager";

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'stock':
        return <StockManagement />;
      case 'projects':
        return <ProjectsManager />;
      case 'design-bom':
        return <DesignBOMManager />;
      case 'production':
        return <ProductionManager />;
      case 'passport':
        return <MaterialPassport />;
      case 'carbon':
        return <CarbonTracker />;
      case 'insights':
        return <AIInsights />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto ml-6">
          {renderActiveView()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
