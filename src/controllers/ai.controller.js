const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const aiSeoGenerator = require('../services/aiSeoGenerator');

// Initialize Gemini AI
let genAI;
let model;

// Initialize AI model
function initializeAI() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not found in .env file. AI Assistant will not work.');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('✅ Google Gemini AI initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    return false;
  }
}

// Tour Assistant - Help with creating tour content
exports.tourAssistant = asyncHandler(async (req, res) => {
  const { prompt, currentData } = req.body;

  if (!prompt) {
    return res.status(400).json(
      new ApiResponse(400, null, 'Prompt is required')
    );
  }

  // Check if AI is initialized
  if (!model) {
    const initialized = initializeAI();
    if (!initialized) {
      return res.status(503).json(
        new ApiResponse(503, null, 'AI service is not configured. Please add GEMINI_API_KEY to .env file.')
      );
    }
  }

  try {
    // Build the AI prompt
    const systemPrompt = `You are a professional tour content writer for a travel agency in Uzbekistan.
Your task is to help create engaging, informative tour descriptions.

Current tour data:
${currentData ? JSON.stringify(currentData, null, 2) : 'No data yet'}

User request: ${prompt}

Please provide helpful content in JSON format with these fields (only include fields that are relevant to the request):
{
  "title": "Tour title (if requested)",
  "summary": "Brief 1-2 sentence summary (if requested)",
  "description": "Detailed tour description with paragraphs (if requested)",
  "highlights": ["Highlight 1", "Highlight 2"] (if requested, array of strings),
  "suggestions": "Any additional suggestions or improvements"
}

Keep the tone professional, engaging, and informative. Focus on Uzbekistan's rich history, culture, and unique experiences.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from response
    let aiData = {};
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // If no JSON, return raw text
        aiData = { rawResponse: text };
      }
    } catch (parseError) {
      console.log('Could not parse JSON, returning raw response');
      aiData = { rawResponse: text };
    }

    res.status(200).json(
      new ApiResponse(200, aiData, 'AI response generated successfully')
    );

  } catch (error) {
    console.error('AI Error:', error);

    // Handle specific API errors
    if (error.message?.includes('API key')) {
      return res.status(401).json(
        new ApiResponse(401, null, 'Invalid API key. Please check your GEMINI_API_KEY.')
      );
    }

    res.status(500).json(
      new ApiResponse(500, null, `AI service error: ${error.message}`)
    );
  }
});

// Quick suggestions for tour content
exports.quickSuggestions = asyncHandler(async (req, res) => {
  const { field, currentValue } = req.body;

  if (!field) {
    return res.status(400).json(
      new ApiResponse(400, null, 'Field name is required')
    );
  }

  // Check if AI is initialized
  if (!model) {
    const initialized = initializeAI();
    if (!initialized) {
      return res.status(503).json(
        new ApiResponse(503, null, 'AI service is not configured.')
      );
    }
  }

  try {
    let prompt = '';

    switch (field) {
      case 'title':
        prompt = `Suggest 3 catchy tour titles for a tour in Uzbekistan. Current: "${currentValue || 'none'}". Return as JSON array: ["title1", "title2", "title3"]`;
        break;
      case 'summary':
        prompt = `Write a brief 1-2 sentence tour summary for: "${currentValue || 'tour in Uzbekistan'}". Make it engaging and informative.`;
        break;
      case 'highlights':
        prompt = `Suggest 5 tour highlights for a tour titled: "${currentValue || 'Uzbekistan tour'}". Return as JSON array: ["highlight1", "highlight2", ...]`;
        break;
      default:
        prompt = `Provide suggestions for improving this tour ${field}: "${currentValue}"`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json(
      new ApiResponse(200, { suggestion: text }, 'Suggestions generated')
    );

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json(
      new ApiResponse(500, null, `AI service error: ${error.message}`)
    );
  }
});

// Generate SEO for tour using AI
exports.generateSEO = asyncHandler(async (req, res) => {
  const data = req.body;
  const type = data.type || 'tour'; // 'tour' or 'destination'

  // Handle destination SEO generation
  if (type === 'destination') {
    return generateDestinationSEO(data, res);
  }

  // Validate required fields for tour
  if (!data.title || !data.destination || !data.duration || !data.price) {
    return res.status(400).json(
      new ApiResponse(400, null, 'Missing required tour data: title, destination, duration, and price are required')
    );
  }

  // Check if AI SEO generator is available
  if (!aiSeoGenerator.isAvailable()) {
    console.log('AI not available, using template-based SEO generation');

    // Generate template-based SEO
    const seoData = aiSeoGenerator.generateTemplateSEO(data);
    const score = aiSeoGenerator.calculateSEOScore(seoData);

    return res.status(200).json(
      new ApiResponse(200, {
        seo: seoData,
        score: score,
        method: 'template',
        message: 'SEO generated using template (AI not configured)'
      }, 'SEO generated successfully using template')
    );
  }

  try {
    // Generate SEO using AI
    const seoData = await aiSeoGenerator.generateSEO(data);
    const score = aiSeoGenerator.calculateSEOScore(seoData);

    res.status(200).json(
      new ApiResponse(200, {
        seo: seoData,
        score: score,
        method: 'ai',
        message: 'SEO generated successfully using AI'
      }, 'SEO generated successfully')
    );

  } catch (error) {
    console.error('AI SEO Generation Error:', error);

    // Fallback to template-based SEO on error
    const seoData = aiSeoGenerator.generateTemplateSEO(data);
    const score = aiSeoGenerator.calculateSEOScore(seoData);

    res.status(200).json(
      new ApiResponse(200, {
        seo: seoData,
        score: score,
        method: 'template_fallback',
        message: 'SEO generated using template (AI error occurred)',
        error: error.message
      }, 'SEO generated using fallback template')
    );
  }
});

// Generate SEO for destination
async function generateDestinationSEO(data, res) {
  const { title, shortDescription, longDescription, countryCode, city } = data;

  if (!title) {
    return res.status(400).json(
      new ApiResponse(400, null, 'Destination title is required')
    );
  }

  // Country names mapping
  const countryNames = {
    'UZ': 'Uzbekistan',
    'TJ': 'Tajikistan',
    'KZ': 'Kazakhstan',
    'KG': 'Kyrgyzstan',
    'TM': 'Turkmenistan',
    'AZ': 'Azerbaijan',
    'GE': 'Georgia',
    'AM': 'Armenia',
    'TR': 'Turkey',
    'AE': 'UAE',
    'SA': 'Saudi Arabia',
    'EG': 'Egypt',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China'
  };

  const countryName = countryNames[countryCode] || 'Uzbekistan';
  const description = shortDescription || longDescription || '';

  // Check if AI is available
  if (!model) {
    const initialized = initializeAI();
    if (!initialized) {
      // Fallback to template-based SEO
      const seoData = generateDestinationTemplateSEO(title, description, countryName, city);
      return res.status(200).json(
        new ApiResponse(200, seoData, 'SEO generated using template (AI not configured)')
      );
    }
  }

  try {
    const prompt = `You are an expert SEO specialist for Travel Bliss, a travel agency specializing in ${countryName} travel.

Generate professional SEO content for the following travel destination:

Destination: ${title}
Country: ${countryName}
City/Region: ${city || title}
Description: ${description}

Generate SEO content with these requirements:

1. Meta Title (50-60 characters):
   - Include destination name
   - Include "Travel Bliss" brand
   - Make it compelling and click-worthy
   - Example format: "${title} Travel Guide | Discover ${countryName} | Travel Bliss"

2. Meta Description (150-160 characters):
   - Highlight unique attractions
   - Include call-to-action
   - Mention key experiences

3. Keywords (comma-separated):
   - 10-15 relevant keywords
   - Include destination name, country, travel-related terms
   - Mix of short and long-tail keywords

Return ONLY valid JSON (no markdown):
{
  "metaTitle": "your title here",
  "metaDescription": "your description here",
  "metaKeywords": "keyword1, keyword2, keyword3, ..."
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let seoData;
    try {
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      seoData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to template
      seoData = generateDestinationTemplateSEO(title, description, countryName, city);
    }

    return res.status(200).json(
      new ApiResponse(200, seoData, 'AI SEO generated successfully')
    );

  } catch (error) {
    console.error('AI Destination SEO Error:', error);
    // Fallback to template
    const seoData = generateDestinationTemplateSEO(title, description, countryName, city);
    return res.status(200).json(
      new ApiResponse(200, seoData, 'SEO generated using template (AI error)')
    );
  }
}

// Template-based SEO for destination
function generateDestinationTemplateSEO(title, description, countryName, city) {
  const metaTitle = `${title} Travel Guide | Best of ${countryName} | Travel Bliss`.substring(0, 60);

  let metaDescription = description
    ? description.substring(0, 120) + '. Plan your trip with Travel Bliss!'
    : `Discover ${title}, ${countryName}. Explore historic sites, local culture & hidden gems. Book your adventure with Travel Bliss today!`;
  metaDescription = metaDescription.substring(0, 160);

  const keywords = [
    title.toLowerCase(),
    `${title.toLowerCase()} travel`,
    `${title.toLowerCase()} tourism`,
    `visit ${title.toLowerCase()}`,
    `${title.toLowerCase()} guide`,
    countryName.toLowerCase(),
    `${countryName.toLowerCase()} travel`,
    'travel bliss',
    'silk road',
    'central asia',
    `${title.toLowerCase()} attractions`,
    `things to do ${title.toLowerCase()}`
  ].join(', ');

  return {
    metaTitle,
    metaDescription,
    metaKeywords: keywords
  };
}

// Generate Seasons for destination
exports.generateSeasons = asyncHandler(async (req, res) => {
  const { destination, countryCode } = req.body;

  if (!destination) {
    return res.status(400).json(
      new ApiResponse(400, null, 'Destination name is required')
    );
  }

  // Country names mapping
  const countryNames = {
    'UZ': 'Uzbekistan',
    'TJ': 'Tajikistan',
    'KZ': 'Kazakhstan',
    'KG': 'Kyrgyzstan',
    'TM': 'Turkmenistan',
    'AZ': 'Azerbaijan',
    'GE': 'Georgia',
    'AM': 'Armenia',
    'TR': 'Turkey',
    'AE': 'UAE',
    'SA': 'Saudi Arabia',
    'EG': 'Egypt',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China'
  };

  const countryName = countryNames[countryCode] || 'Uzbekistan';

  // Check if AI is available
  if (!model) {
    const initialized = initializeAI();
    if (!initialized) {
      // Fallback to template-based seasons
      const seasons = generateTemplateSeasons(destination, countryName);
      return res.status(200).json(
        new ApiResponse(200, { seasons, method: 'template' }, 'Seasons generated using template (AI not configured)')
      );
    }
  }

  try {
    const prompt = `You are a travel expert for ${countryName}. Generate seasonal travel guide for ${destination}.

Create 4 seasons with specific details for this destination:

Return ONLY valid JSON array (no markdown):
[
  {
    "name": "Spring",
    "icon": "🌸",
    "months": "March - May",
    "temperature": "15°C - 25°C",
    "description": "Description of spring travel in ${destination}"
  },
  {
    "name": "Summer",
    "icon": "☀️",
    "months": "June - August",
    "temperature": "25°C - 40°C",
    "description": "Description of summer travel"
  },
  {
    "name": "Autumn",
    "icon": "🍂",
    "months": "September - November",
    "temperature": "10°C - 20°C",
    "description": "Description of autumn travel"
  },
  {
    "name": "Winter",
    "icon": "❄️",
    "months": "December - February",
    "temperature": "-5°C - 10°C",
    "description": "Description of winter travel"
  }
]

Make temperatures and descriptions accurate for ${destination}, ${countryName}. Include local events, festivals, and best activities for each season.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let seasons;
    try {
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      seasons = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse AI seasons response:', parseError);
      seasons = generateTemplateSeasons(destination, countryName);
    }

    return res.status(200).json(
      new ApiResponse(200, { seasons, method: 'ai' }, 'Seasons generated successfully')
    );

  } catch (error) {
    console.error('AI Seasons Generation Error:', error);
    const seasons = generateTemplateSeasons(destination, countryName);
    return res.status(200).json(
      new ApiResponse(200, { seasons, method: 'template_fallback' }, 'Seasons generated using template (AI error)')
    );
  }
});

// Template-based seasons
function generateTemplateSeasons(destination, countryName) {
  return [
    {
      name: 'Spring',
      icon: '🌸',
      months: 'March - May',
      temperature: '15°C - 25°C',
      description: `Spring in ${destination} brings pleasant weather, blooming flowers, and the perfect conditions for sightseeing. Ideal time to explore outdoor attractions.`
    },
    {
      name: 'Summer',
      icon: '☀️',
      months: 'June - August',
      temperature: '25°C - 40°C',
      description: `Summer in ${destination} is warm and sunny. Best for cultural festivals and evening walks. Consider early morning tours to avoid peak heat.`
    },
    {
      name: 'Autumn',
      icon: '🍂',
      months: 'September - November',
      temperature: '10°C - 20°C',
      description: `Autumn offers comfortable temperatures and beautiful golden landscapes in ${destination}. Popular season for photography and harvest festivals.`
    },
    {
      name: 'Winter',
      icon: '❄️',
      months: 'December - February',
      temperature: '-5°C - 10°C',
      description: `Winter in ${destination} is quiet and peaceful. Fewer tourists, lower prices, and unique winter scenery. Perfect for indoor cultural experiences.`
    }
  ];
}

// Generate FAQs for destination
exports.generateFaqs = asyncHandler(async (req, res) => {
  const { destination, countryCode, description } = req.body;

  if (!destination) {
    return res.status(400).json(
      new ApiResponse(400, null, 'Destination name is required')
    );
  }

  // Country names mapping
  const countryNames = {
    'UZ': 'Uzbekistan',
    'TJ': 'Tajikistan',
    'KZ': 'Kazakhstan',
    'KG': 'Kyrgyzstan',
    'TM': 'Turkmenistan',
    'AZ': 'Azerbaijan',
    'GE': 'Georgia',
    'AM': 'Armenia',
    'TR': 'Turkey',
    'AE': 'UAE',
    'SA': 'Saudi Arabia',
    'EG': 'Egypt',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China'
  };

  const countryName = countryNames[countryCode] || 'Uzbekistan';

  // Check if AI is available
  if (!model) {
    const initialized = initializeAI();
    if (!initialized) {
      const faqs = generateTemplateFaqs(destination, countryName);
      return res.status(200).json(
        new ApiResponse(200, { faqs, method: 'template' }, 'FAQs generated using template (AI not configured)')
      );
    }
  }

  try {
    const prompt = `You are a travel expert for ${countryName}. Generate 5 frequently asked questions and answers about traveling to ${destination}.

Additional context: ${description || 'A popular tourist destination'}

Return ONLY valid JSON array (no markdown):
[
  {
    "question": "What is the best time to visit ${destination}?",
    "answer": "Detailed answer about best visiting times..."
  },
  {
    "question": "How do I get to ${destination}?",
    "answer": "Transportation options and tips..."
  },
  {
    "question": "What are the must-see attractions in ${destination}?",
    "answer": "List of key attractions..."
  },
  {
    "question": "Is ${destination} safe for tourists?",
    "answer": "Safety information..."
  },
  {
    "question": "What local food should I try in ${destination}?",
    "answer": "Local cuisine recommendations..."
  }
]

Make answers specific to ${destination}, ${countryName}. Include practical tips and local insights.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let faqs;
    try {
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      faqs = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse AI FAQs response:', parseError);
      faqs = generateTemplateFaqs(destination, countryName);
    }

    return res.status(200).json(
      new ApiResponse(200, { faqs, method: 'ai' }, 'FAQs generated successfully')
    );

  } catch (error) {
    console.error('AI FAQs Generation Error:', error);
    const faqs = generateTemplateFaqs(destination, countryName);
    return res.status(200).json(
      new ApiResponse(200, { faqs, method: 'template_fallback' }, 'FAQs generated using template (AI error)')
    );
  }
});

// Template-based FAQs
function generateTemplateFaqs(destination, countryName) {
  return [
    {
      question: `What is the best time to visit ${destination}?`,
      answer: `The best time to visit ${destination} is during spring (April-May) and autumn (September-October) when the weather is pleasant and ideal for sightseeing.`
    },
    {
      question: `How do I get to ${destination}?`,
      answer: `${destination} is accessible by air, rail, and road. The nearest international airport connects to major cities. Local transportation includes taxis and buses.`
    },
    {
      question: `What are the must-see attractions in ${destination}?`,
      answer: `${destination} offers historic monuments, local markets, museums, and cultural sites. Check our tour packages for curated experiences.`
    },
    {
      question: `Do I need a visa to visit ${destination}?`,
      answer: `Visa requirements for ${countryName} vary by nationality. Many countries have visa-free access or e-visa options. Check with your local embassy for current requirements.`
    },
    {
      question: `What currency is used in ${destination}?`,
      answer: `The local currency is used in ${destination}. Major hotels and restaurants accept credit cards. ATMs are available in city centers. It's recommended to carry some local cash.`
    }
  ];
}

// Initialize on module load
initializeAI();
