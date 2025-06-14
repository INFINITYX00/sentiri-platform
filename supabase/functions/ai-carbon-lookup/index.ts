
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

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      console.error('Anthropic API key not found in environment')
      throw new Error('Anthropic API key not configured')
    }

    console.log('Using API key:', anthropicApiKey.substring(0, 10) + '...')

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

For reclaimed/recycled materials, use significantly lower carbon factors than virgin materials.

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
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

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
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to get carbon data',
        carbonFactor: 2.0, // Fallback value
        density: 500, // Default density
        confidence: 0.1,
        source: 'Fallback estimate',
        reasoning: 'Claude lookup failed, using default estimate'
      }),
      {
        status: 200, // Return 200 with fallback data instead of error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
