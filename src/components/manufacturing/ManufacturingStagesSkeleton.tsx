
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ManufacturingStagesSkeleton() {
  return (
    <div className="space-y-8">
      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="professional-card animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20 shimmer"></div>
                  <div className="h-8 bg-muted rounded w-16 shimmer"></div>
                </div>
                <div className="h-6 w-6 bg-muted rounded shimmer"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manufacturing Timeline Skeleton */}
      <Card className="professional-card animate-pulse">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-muted rounded shimmer"></div>
            <div className="h-6 bg-muted rounded w-40 shimmer"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              {index < 5 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-border to-transparent"></div>
              )}
              
              <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg border hover-lift">
                <div className="h-11 w-11 bg-muted rounded-full shimmer"></div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 bg-muted rounded w-32 shimmer"></div>
                      <div className="h-6 bg-muted rounded w-20 shimmer"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-24 shimmer"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-16 shimmer"></div>
                      <div className="h-4 bg-muted rounded w-8 shimmer"></div>
                    </div>
                    <div className="h-2 bg-muted rounded-full w-full shimmer"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-4 bg-muted rounded w-24 shimmer"></div>
                    <div className="h-4 bg-muted rounded w-32 shimmer"></div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted rounded w-20 shimmer"></div>
                    <div className="h-8 bg-muted rounded w-24 shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
