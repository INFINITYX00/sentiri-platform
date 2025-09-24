
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!anthropicApiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { analysisType } = await req.json();

    // Fetch real data from database
    const [materialsResult, projectsResult, transportResult, energyResult] = await Promise.all([
      supabase.from('materials').select('*'),
      supabase.from('projects').select('*').eq('deleted', false),
      supabase.from('transport_routes').select('*'),
      supabase.from('energy_records').select('*')
    ]);

    const materials = materialsResult.data || [];
    const projects = projectsResult.data || [];
    const transport = transportResult.data || [];
    const energy = energyResult.data || [];

    // Calculate real metrics
    const totalCarbonFootprint = materials.reduce((sum, m) => sum + (m.carbon_footprint || 0), 0);
    const totalTransportEmissions = transport.reduce((sum, t) => sum + (t.carbon_impact || 0), 0);
    const totalEnergyConsumption = energy.reduce((sum, e) => sum + (e.energy_consumed || 0), 0);
    const totalProjectValue = projects.reduce((sum, p) => sum + (p.total_cost || 0), 0);

    let prompt = '';
    let responseData = {};

    switch (analysisType) {
      case 'carbon_insights':
        prompt = `As a sustainability expert, analyze this manufacturing data and provide 4 actionable carbon reduction insights:

Materials Data: ${materials.length} materials, total carbon footprint: ${totalCarbonFootprint.toFixed(2)} kg CO₂
Transport Data: ${transport.length} routes, total transport emissions: ${totalTransportEmissions.toFixed(2)} kg CO₂
Energy Data: Total energy consumption: ${totalEnergyConsumption.toFixed(2)} kWh
Projects: ${projects.length} projects, total value: $${totalProjectValue.toFixed(0)}

Top materials by carbon impact: ${materials
  .sort((a, b) => (b.carbon_footprint || 0) - (a.carbon_footprint || 0))
  .slice(0, 5)
  .map(m => `${m.name}: ${m.carbon_footprint || 0} kg CO₂`)
  .join(', ')}

Recent transport routes: ${transport
  .slice(-3)
  .map(t => `${t.origin} to ${t.destination}: ${t.carbon_impact} kg CO₂`)
  .join(', ')}

Provide insights in this JSON format:
{
  "insights": [
    {
      "type": "optimization|trend|cost|prediction",
      "title": "Short actionable title",
      "description": "Specific recommendation based on the data",
      "impact": "Quantified impact (e.g., 'Save 15.2 kg CO₂ per project')",
      "savings": "Cost or efficiency benefit",
      "confidence": number between 70-95
    }
  ]
}`;
        break;

      case 'material_optimization':
        prompt = `Analyze these materials for optimization opportunities:

${materials.map(m => 
  `${m.name} (${m.type}): ${m.quantity} ${m.unit}, ${m.carbon_footprint || 0} kg CO₂, $${m.cost_per_unit || 0}/unit from ${m.origin || 'Unknown'}`
).join('\n')}

Suggest 3 specific material substitutions or sourcing optimizations that could reduce carbon footprint. Return JSON:
{
  "recommendations": [
    {
      "current_material": "material name",
      "suggestion": "specific alternative or optimization",
      "carbon_reduction": "estimated kg CO₂ saved",
      "cost_impact": "cost change estimate",
      "implementation": "how to implement this change"
    }
  ]
}`;
        break;

      case 'transport_optimization':
        prompt = `Analyze these transport routes for optimization:

${transport.map(t => 
  `${t.origin} → ${t.destination}: ${t.distance}km via ${t.transport_type}, ${t.carbon_impact} kg CO₂`
).join('\n')}

Materials origins: ${materials.filter(m => m.origin).map(m => m.origin).join(', ')}

Suggest route optimizations and sourcing strategies. Return JSON:
{
  "optimizations": [
    {
      "current_route": "route description",
      "optimization": "specific improvement suggestion",
      "carbon_savings": "estimated CO₂ reduction",
      "cost_impact": "estimated cost change"
    }
  ],
  "sourcing_recommendations": [
    {
      "material_type": "type of material",
      "current_avg_distance": "current average transport distance",
      "recommended_sources": "closer source suggestions",
      "potential_savings": "estimated benefits"
    }
  ]
}`;
        break;

      default:
        throw new Error('Invalid analysis type');
    }

    console.log('Sending request to Claude...');
    
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errorText);
      throw new Error(`Claude API error: ${claudeResponse.status} - ${errorText}`);
    }

    const claudeData = await claudeResponse.json();
    const content = claudeData.content[0].text;
    
    try {
      responseData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', content);
      responseData = { 
        error: 'Failed to parse response', 
        raw_response: content 
      };
    }

    console.log('Claude analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        metadata: {
          materials_count: materials.length,
          projects_count: projects.length,
          transport_routes_count: transport.length,
          total_carbon_footprint: totalCarbonFootprint,
          total_transport_emissions: totalTransportEmissions,
          analysis_timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in claude-carbon-analytics function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
