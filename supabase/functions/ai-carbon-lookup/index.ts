
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { materialType, specificMaterial, origin, dimensions, quantity, unit, unitCount, weight } = await req.json()

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      console.error('Anthropic API key not found in environment')
      throw new Error('Anthropic API key not configured')
    }

    console.log('Using API key:', anthropicApiKey.substring(0, 10) + '...')

    // Calculate total quantity details for context
    const totalQuantity = quantity || 1
    const totalUnits = unitCount || 1
    const totalWeight = weight || 'unknown'
    
    const quantityContext = `
Total Quantity: ${totalQuantity} ${unit || 'units'}
Unit Count: ${totalUnits}
Estimated Weight: ${totalWeight}kg
    `.trim()

    const prompt = `You are an environmental data specialist. Calculate the TOTAL carbon footprint for this specific quantity of material:

Material: ${materialType} - ${specificMaterial}
Origin: ${origin || 'Unknown'}
Dimensions: ${dimensions || 'Not specified'}

QUANTITY DETAILS:
${quantityContext}

Please provide a JSON response with:
{
  "carbonFactor": number (kg CO2 per kg of material - per unit carbon factor),
  "totalCarbonFootprint": number (TOTAL kg CO2 for the entire quantity specified above),
  "density": number (kg/m³),
  "confidence": number (0-1, where 1 is most confident),
  "source": string (brief source description),
  "reasoning": string (brief explanation including how you calculated the total),
  "alternatives": [
    {
      "material": string,
      "carbonFactor": number,
      "reason": string
    }
  ]
}

IMPORTANT: 
- carbonFactor should be per kg of material
- totalCarbonFootprint should be the TOTAL carbon impact for the entire quantity (${totalQuantity} ${unit}, ${totalUnits} units, weight: ${totalWeight}kg)
- Base calculations on established environmental databases (ICE Database, EPD, IDEMAT, LCA studies)
- Consider manufacturing, transportation, and end-of-life impacts
- For reclaimed/recycled materials, use significantly lower factors than virgin materials
- If weight is unknown, estimate based on material type and dimensions

Respond with only valid JSON, no additional text.`

    console.log('Making request to Anthropic API...')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      }),
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error response:', errorText)
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Anthropic response:', data)
    
    const content = data.content[0]?.text

    if (!content) {
      throw new Error('No response content from Claude')
    }

    console.log('Raw content from Claude:', content)

    // Parse the JSON response
    const carbonData = JSON.parse(content)
    console.log('Parsed carbon data:', carbonData)

    return new Response(JSON.stringify(carbonData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in ai-carbon-lookup:', error)
    
    // Calculate fallback total carbon
    const fallbackCarbonFactor = 2.0
    const estimatedWeight = weight || 1
    const fallbackTotal = fallbackCarbonFactor * estimatedWeight
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to get carbon data',
        carbonFactor: fallbackCarbonFactor,
        totalCarbonFootprint: fallbackTotal,
        density: 500,
        confidence: 0.1,
        source: 'Fallback estimate',
        reasoning: `Claude lookup failed, using default estimate: ${fallbackCarbonFactor}kg CO₂/kg × ${estimatedWeight}kg = ${fallbackTotal}kg CO₂e total`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
