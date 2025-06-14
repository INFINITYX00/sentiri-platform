
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Recycle, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DesignSuggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  implementationEffort: "easy" | "medium" | "complex";
  applied: boolean;
  materialsSaved: string;
  carbonReduction: number;
}

export function CircularDesign() {
  const { toast } = useToast();
  
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([
    {
      id: "1",
      category: "materials",
      title: "Replace MDF with Reclaimed Wood",
      description: "Using reclaimed oak instead of MDF for table tops significantly reduces environmental impact while improving product quality and longevity.",
      impact: "high",
      implementationEffort: "medium",
      applied: true,
      materialsSaved: "12kg MDF per table",
      carbonReduction: 35.8
    },
    {
      id: "2",
      category: "assembly",
      title: "Switch to Modular Connectors",
      description: "Replacing permanent fastening methods with modular connectors allows for easier disassembly and part replacement, extending product lifespan.",
      impact: "medium",
      implementationEffort: "easy",
      applied: true,
      materialsSaved: "0.5kg metal fasteners per unit",
      carbonReduction: 12.3
    },
    {
      id: "3",
      category: "design",
      title: "Optimize Cutting Patterns",
      description: "Revising furniture dimensions to align with standard material sizes reduces offcut waste by up to 30%.",
      impact: "medium",
      implementationEffort: "easy",
      applied: false,
      materialsSaved: "3.2kg wood per furniture piece",
      carbonReduction: 8.5
    },
    {
      id: "4",
      category: "finishing",
      title: "Switch to Water-Based Finishes",
      description: "Replace solvent-based finishes with water-based alternatives to reduce VOC emissions and improve indoor air quality.",
      impact: "low",
      implementationEffort: "easy",
      applied: false,
      materialsSaved: "0.2L solvent per piece",
      carbonReduction: 5.2
    },
    {
      id: "5",
      category: "packaging",
      title: "Eliminate Plastic Packaging",
      description: "Replace plastic packaging materials with recycled cardboard and paper-based cushioning to create fully recyclable packaging.",
      impact: "high",
      implementationEffort: "medium",
      applied: true,
      materialsSaved: "1.5kg plastic per shipment",
      carbonReduction: 18.4
    }
  ]);
  
  const [newSuggestion, setNewSuggestion] = useState({
    category: "",
    title: "",
    description: "",
    impact: "medium",
    implementationEffort: "medium",
    materialsSaved: "",
    carbonReduction: ""
  });
  
  const addSuggestion = () => {
    if (!newSuggestion.category || !newSuggestion.title || !newSuggestion.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const suggestion: DesignSuggestion = {
      id: Date.now().toString(),
      category: newSuggestion.category,
      title: newSuggestion.title,
      description: newSuggestion.description,
      impact: newSuggestion.impact as "high" | "medium" | "low",
      implementationEffort: newSuggestion.implementationEffort as "easy" | "medium" | "complex",
      applied: false,
      materialsSaved: newSuggestion.materialsSaved,
      carbonReduction: parseFloat(newSuggestion.carbonReduction) || 0
    };
    
    setSuggestions([...suggestions, suggestion]);
    
    toast({
      title: "New suggestion added",
      description: newSuggestion.title,
    });
    
    setNewSuggestion({
      category: "",
      title: "",
      description: "",
      impact: "medium",
      implementationEffort: "medium",
      materialsSaved: "",
      carbonReduction: ""
    });
  };
  
  const toggleApplied = (id: string) => {
    setSuggestions(suggestions.map(suggestion => {
      if (suggestion.id === id) {
        const newState = !suggestion.applied;
        
        toast({
          title: newState ? "Suggestion applied" : "Suggestion unapplied",
          description: suggestion.title,
        });
        
        return { ...suggestion, applied: newState };
      }
      return suggestion;
    }));
  };
  
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-green-500">High Impact</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500">Medium Impact</Badge>;
      case 'low':
        return <Badge className="bg-yellow-500">Low Impact</Badge>;
      default:
        return <Badge>{impact}</Badge>;
    }
  };
  
  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'easy':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Easy</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Medium</Badge>;
      case 'complex':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Complex</Badge>;
      default:
        return <Badge variant="outline">{effort}</Badge>;
    }
  };

  const appliedCount = suggestions.filter(s => s.applied).length;
  const totalCarbonReduction = suggestions
    .filter(s => s.applied)
    .reduce((sum, s) => sum + s.carbonReduction, 0);
  
  // Group suggestions by category for the dashboard
  const categories = [...new Set(suggestions.map(s => s.category))];
  const categoryData = categories.map(category => {
    const categorySuggestions = suggestions.filter(s => s.category === category);
    const appliedInCategory = categorySuggestions.filter(s => s.applied).length;
    const totalInCategory = categorySuggestions.length;
    const carbonReductionInCategory = categorySuggestions
      .filter(s => s.applied)
      .reduce((sum, s) => sum + s.carbonReduction, 0);
    
    return {
      category,
      applied: appliedInCategory,
      total: totalInCategory,
      percentage: totalInCategory > 0 ? Math.round((appliedInCategory / totalInCategory) * 100) : 0,
      carbonReduction: carbonReductionInCategory
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applied Suggestions</p>
                <p className="text-2xl font-bold">{appliedCount}/{suggestions.length}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Carbon Reduction</p>
                <p className="text-2xl font-bold">{totalCarbonReduction.toFixed(1)} kg CO₂e</p>
              </div>
              <Recycle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Circularity Score</p>
                <p className="text-2xl font-bold">{suggestions.length > 0 ? Math.round((appliedCount / suggestions.length) * 100) : 0}%</p>
              </div>
              <Zap className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Suggestions</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="applied">Applied ({appliedCount})</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className={`sentiri-card ${suggestion.applied ? 'border-green-300 bg-green-50' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2 capitalize">{suggestion.category}</Badge>
                      <CardTitle>{suggestion.title}</CardTitle>
                    </div>
                    <div className="flex space-x-2">
                      {getImpactBadge(suggestion.impact)}
                      {getEffortBadge(suggestion.implementationEffort)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{suggestion.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Saves: {suggestion.materialsSaved}
                    </div>
                    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                      Reduces: {suggestion.carbonReduction} kg CO₂e
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant={suggestion.applied ? "outline" : "default"}
                      className={suggestion.applied ? "border-green-500 text-green-700" : "bg-primary"}
                      onClick={() => toggleApplied(suggestion.id)}
                    >
                      {suggestion.applied ? "Applied ✓" : "Mark as Applied"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="space-y-6">
            <Card className="sentiri-card">
              <CardHeader>
                <CardTitle>Circular Design Progress</CardTitle>
                <CardDescription>Implementation progress by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categoryData.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.applied}/{category.total} ({category.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Carbon reduction: {category.carbonReduction.toFixed(1)} kg CO₂e</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="sentiri-card">
                <CardHeader>
                  <CardTitle>Top Implementation Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {suggestions
                      .filter(s => !s.applied)
                      .sort((a, b) => b.carbonReduction - a.carbonReduction)
                      .slice(0, 3)
                      .map((suggestion) => (
                        <li key={suggestion.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{suggestion.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Potential reduction: {suggestion.carbonReduction} kg CO₂e
                            </p>
                          </div>
                          <Button size="sm" onClick={() => toggleApplied(suggestion.id)}>Apply</Button>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="sentiri-card">
                <CardHeader>
                  <CardTitle>Implementation Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">High Impact Items</span>
                      <Badge className="bg-green-500">
                        {suggestions.filter(s => s.impact === 'high' && s.applied).length}/
                        {suggestions.filter(s => s.impact === 'high').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Medium Impact Items</span>
                      <Badge className="bg-blue-500">
                        {suggestions.filter(s => s.impact === 'medium' && s.applied).length}/
                        {suggestions.filter(s => s.impact === 'medium').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Low Impact Items</span>
                      <Badge className="bg-yellow-500">
                        {suggestions.filter(s => s.impact === 'low' && s.applied).length}/
                        {suggestions.filter(s => s.impact === 'low').length}
                      </Badge>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Implementation Difficulty</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Easy</span>
                        <span className="text-green-600 font-medium">
                          {suggestions.filter(s => s.implementationEffort === 'easy' && s.applied).length}/
                          {suggestions.filter(s => s.implementationEffort === 'easy').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Medium</span>
                        <span className="text-yellow-600 font-medium">
                          {suggestions.filter(s => s.implementationEffort === 'medium' && s.applied).length}/
                          {suggestions.filter(s => s.implementationEffort === 'medium').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Complex</span>
                        <span className="text-orange-600 font-medium">
                          {suggestions.filter(s => s.implementationEffort === 'complex' && s.applied).length}/
                          {suggestions.filter(s => s.implementationEffort === 'complex').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applied">
          <div className="grid grid-cols-1 gap-6">
            {suggestions.filter(s => s.applied).map((suggestion) => (
              <Card key={suggestion.id} className="sentiri-card border-green-300 bg-green-50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2 capitalize">{suggestion.category}</Badge>
                      <CardTitle>{suggestion.title}</CardTitle>
                    </div>
                    <div className="flex space-x-2">
                      {getImpactBadge(suggestion.impact)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{suggestion.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Saves: {suggestion.materialsSaved}
                    </div>
                    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                      Reduces: {suggestion.carbonReduction} kg CO₂e
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-700"
                      onClick={() => toggleApplied(suggestion.id)}
                    >
                      Remove ✓
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {suggestions.filter(s => s.applied).length === 0 && (
              <Card className="sentiri-card">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No suggestions applied yet</p>
                  <p className="text-muted-foreground">Mark suggestions as applied to see them here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="add">
          <Card className="sentiri-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Add New Design Suggestion</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Title"
                  value={newSuggestion.title}
                  onChange={(e) => setNewSuggestion({...newSuggestion, title: e.target.value})}
                />
                
                <Select 
                  value={newSuggestion.category} 
                  onValueChange={(value) => setNewSuggestion({...newSuggestion, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="assembly">Assembly</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="finishing">Finishing</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="md:col-span-2">
                  <Textarea
                    placeholder="Description"
                    value={newSuggestion.description}
                    onChange={(e) => setNewSuggestion({...newSuggestion, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <Select 
                  value={newSuggestion.impact} 
                  onValueChange={(value) => setNewSuggestion({...newSuggestion, impact: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Impact Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Impact</SelectItem>
                    <SelectItem value="medium">Medium Impact</SelectItem>
                    <SelectItem value="low">Low Impact</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={newSuggestion.implementationEffort} 
                  onValueChange={(value) => setNewSuggestion({...newSuggestion, implementationEffort: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Implementation Effort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="complex">Complex</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Materials Saved (e.g., 1.5kg plastic)"
                  value={newSuggestion.materialsSaved}
                  onChange={(e) => setNewSuggestion({...newSuggestion, materialsSaved: e.target.value})}
                />
                
                <Input
                  placeholder="Carbon Reduction (kg CO₂e)"
                  type="number"
                  value={newSuggestion.carbonReduction}
                  onChange={(e) => setNewSuggestion({...newSuggestion, carbonReduction: e.target.value})}
                />
                
                <div className="md:col-span-2">
                  <Button onClick={addSuggestion} className="bg-primary hover:bg-primary/90">
                    Add Suggestion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
