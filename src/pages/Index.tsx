
import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { StockManagement } from "@/components/stock/StockManagement";
import { MaterialPassport } from "@/components/passport/MaterialPassport";
import { BOMManager } from "@/components/bom/BOMManager";
import { CarbonTracker } from "@/components/carbon/CarbonTracker";
import { AIInsights } from "@/components/insights/AIInsights";

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'stock':
        return <StockManagement />;
      case 'passport':
        return <MaterialPassport />;
      case 'bom':
        return <BOMManager />;
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
        <main className="flex-1 overflow-auto">
          <div className={`min-h-full ${activeView === 'dashboard' ? '' : 'p-6'}`}>
            {renderActiveView()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
