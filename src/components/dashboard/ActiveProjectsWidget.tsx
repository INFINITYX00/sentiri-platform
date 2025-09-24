
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Factory, ArrowRight } from "lucide-react";
import { DashboardWidget } from "./DashboardWidget";

interface Project {
  id: string
  name: string
  status: string
  progress: number
  total_cost: number
  start_date: string
  deleted?: boolean
}

interface ActiveProjectsWidgetProps {
  projects: Project[]
}

export function ActiveProjectsWidget({ projects }: ActiveProjectsWidgetProps) {
  // Filter out deleted projects
  const activeProjects = projects.filter(project => !project.deleted);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewAllProjects = () => {
    window.location.hash = '#projects';
  };

  return (
    <DashboardWidget title="Active Projects" icon={<Factory className="h-4 w-4" />}>
      <div className="space-y-3">
        {activeProjects.length > 0 ? (
          <>
            {activeProjects.map((project) => (
              <div key={project.id} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium truncate">{project.name}</h4>
                  <Badge className={getStatusColor(project.status)} variant="outline">
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <Progress value={project.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.progress}% complete</span>
                  <span>£{project.total_cost.toFixed(0)}</span>
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={handleViewAllProjects}
            >
              View All Projects <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <Factory className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active projects</p>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}
