
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
    const { materialType, specificMaterial, origin, dimensions } = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `You are an environmental data specialist. Provide realistic carbon footprint data for this material:

Material: ${materialType} - ${specificMaterial}
Origin: ${origin || 'Unknown'}
Dimensions: ${dimensions || 'Not specified'}

Please provide a JSON response with:
{
  "carbonFactor": number (kg CO2 per kg of material),
  "density": number (kg/m³),
  "confidence": number (0-1, where 1 is most confident),
  "source": string (brief source description),
  "reasoning": string (brief explanation of the carbon factor),
  "alternatives": [
    {
      "material": string,
      "carbonFactor": number,
      "reason": string
    }
  ]
}

Base your estimates on established environmental databases like:
- ICE Database (University of Bath)
- EPD (Environmental Product Declarations)
- IDEMAT database
- Life Cycle Assessment studies

Consider factors like:
- Manufacturing processes
- Transportation (if origin specified)
- Recycled vs virgin materials
- Regional variations

For reclaimed/recycled materials, use significantly lower carbon factors than virgin materials.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in environmental impact assessment and material carbon footprints. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const carbonData = JSON.parse(content)

    return new Response(JSON.stringify(carbonData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in ai-carbon-lookup:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to get carbon data',
        carbonFactor: 2.0, // Fallback value
        density: 500, // Default density
        confidence: 0.1,
        source: 'Fallback estimate',
        reasoning: 'AI lookup failed, using default estimate'
      }),
      {
        status: 200, // Return 200 with fallback data instead of error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
