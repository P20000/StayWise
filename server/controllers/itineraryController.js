const { callChatLLM } = require('../utils/nvidiaAdapter');

// @desc    Handle conversational interactions with the StayWise AI Assistant
// @route   POST /api/itinerary/chat and POST /api/itinerary/create
// @access  Public / Protected
const chatBotMessage = async (req, res) => {
  try {
    const query = req.body.message || req.body.prompt || '';
    const history = req.body.history || [];

    if (!query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required to chat with StayWise Concierge.',
      });
    }

    const systemPrompt = `You are the StayWise Concierge, a friendly, professional, and knowledgeable expert on architectural stays, curated boutique hotels, luxury villas, and travel planning across the globe (especially India, Europe, Asia, and the Americas).
Your goal is to assist guests in discovering dream destinations, recommending suitable room styles, providing practical travel tips, answering questions about itineraries, or chatting casually.
Be polite, engaging, and clear. Format your responses using clean Markdown (such as bullet points, bold text for key terms, and concise paragraphs). If your reasoning occurs inside <think>...</think> blocks, ensure the main response provides actionable and well-structured advice.`;

    try {
      if (process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY !== 'YOUR_NVIDIA_API_KEY') {
        const llmRes = await callChatLLM({
          systemPrompt,
          messages: history,
          userPrompt: query,
          maxTokens: 1024,
          timeoutMs: 4000,
        });

        if (llmRes && llmRes.reply) {
          return res.status(200).json({
            success: true,
            reply: llmRes.reply,
            thinking: llmRes.thinking || null,
          });
        }
      }
    } catch (llmError) {
      console.warn(`[CONCIERGE] LLM generation fallback triggered: ${llmError.message}`);
    }

    // Destination-grounded conversational fallback
    const lower = query.toLowerCase();
    let reply = '';
    let thinking = '1. Destination Curation: Evaluated guest preferences for target location, stay quality, and design style.\n2. Portfolio Matching: Correlated destination details with our registered boutique properties and local guides.\n3. Itinerary Synthesis: Drafted architectural recommendations and practical travel suggestions.';

    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('who are you') || lower.includes('what can you do')) {
      reply = `Hello! 👋 Welcome to **StayWise Concierge**!\n\nI am your personal travel and architectural stay advisor. Whether you're dreaming of a **cliffside luxury villa in Goa**, a **heritage boutique hotel in Jaipur**, or planning a getaway across **Rome & Paris**, I am here to help.\n\nHere is what I can help you with:\n* 🌍 **Destination & Vibe Guidance:** Discover cities and regions matching your travel mood.\n* 🏛️ **Architectural Stays:** Learn about unique design philosophies from restored colonial mansions to modern glass villas.\n* 🗺️ **Custom Itinerary Tips:** Get recommendations on neighborhoods, best times to visit, and local highlights.\n\nWhere would you like to travel next?`;
      thinking = '1. Reception: Greeted the guest and initialized the custom concierge helper.\n2. Introduction: Summarized our boutique stay portfolio and travel planning services.\n3. Consultation: Invited the guest to specify their dream region or desired architectural style.';
    } else if (lower.includes('goa') || lower.includes('beach')) {
      reply = `### 🌴 Dreaming of Goa & Coastal Retreats\n\nGoa is home to some of India's most breathtaking Portuguese-inspired architectural villas and serene beachfront estates. Here are two curated recommendations for your trip:\n\n* **Casa do Mar (Assagao)** &mdash; A restored 19th-century Portuguese villa surrounded by lush tropical gardens and private infinity pools. Perfect for a relaxing luxury vibe.\n* **The Glasshouse on the Cliff (Vagator)** &mdash; Ultra-modern minimalist architecture with panoramic Arabian Sea views and bespoke concierge service.\n\n**Best time to visit:** November through March for pleasant coastal breezes and vibrant dining scenes.\nWould you like more details on pricing tiers or recommendations for nearby experiences?`;
      thinking = '1. Regional Curation: Selected seaside and coastal architectures.\n2. Property Curation: Highlighted Portuguese colonial heritage (Casa do Mar) and contemporary seaside design.\n3. Seasonal Advice: Provided recommendations on the ideal weather window and nearby experiences.';
    } else if (lower.includes('rome') || lower.includes('italy') || lower.includes('paris') || lower.includes('europe')) {
      reply = `### 🌍 Exploring Classic European Elegance\n\nFor a romantic or luxury European escape, StayWise curates properties where historical heritage meets modern comfort:\n\n* **Palazzo Storico Suites (Rome)** &mdash; Located near Piazza Navona, featuring original 17th-century frescoes paired with contemporary Italian designer furnishings.\n* **Le Marais Architect Studio (Paris)** &mdash; A loft-style penthouse with exposed oak beams and private terrace views across Parisian rooftops.\n\n**Pro Tip:** Combine your stay with high-speed regional rail passes for a seamless itinerary across Europe!`;
      thinking = '1. Continental Selection: Highlighted landmark European boutique destinations.\n2. Design Focus: Highlighted historical ceiling frescoes (Rome) and loft conversions (Paris).\n3. Logistics Advice: Recommended regional transit passes for multi-city travel.';
    } else if (lower.includes('kochi') || lower.includes('kerala') || lower.includes('backwater')) {
      reply = `### 🛶 Serene Kerala & Heritage Stays in Kochi\n\nExperience the tranquil charm of God's Own Country with properties celebrating traditional Kerala architecture (*Nalukettu*) and colonial heritage:\n\n* **Fort Heritage Haven (Fort Kochi)** &mdash; A Dutch-era mansion featuring high teakwood ceilings, antique courtyard gardens, and sunset views over the Chinese fishing nets.\n* **Vembanad Water Villa (Kumarakom)** &mdash; Eco-luxury overwater pavilions built with reclaimed timber and private veranda docks.\n\nWould you like recommendations for private houseboats or traditional culinary experiences?`;
      thinking = '1. Regional Selection: Focused on Kerala backwaters and Cochin heritage.\n2. Architecture Focus: Selected Dutch colonial mansions and waterfront timber lodges.\n3. Experience Extension: Recommended local backwater cruising and traditional spices.';
    } else if (lower.includes('manali') || lower.includes('mountain') || lower.includes('hill')) {
      reply = `### 🏔️ Mountain Escapes & Alpine Architecture\n\nIf you crave crisp mountain air and panoramic valley views, check out our alpine and traditional stone-and-wood lodges:\n\n* **The Pine Ridge Chalet (Old Manali)** &mdash; Handcrafted cedarwood structure featuring floor-to-ceiling glass walls, indoor fireplaces, and cedar deck jacuzzis.\n* **Himalayan Stone Retreat (Naggar)** &mdash; Built using traditional interlocking stone and wood techniques (*Kathkunia*) for natural warmth and seismic resilience.\n\nIdeal for both adventure seekers and peaceful retreats!`;
      thinking = '1. Altitude Selection: Focused on Western Himalayan mountain styles.\n2. Architecture Focus: Highlighted alpine cedarwood structures and Kathkunia stone craftsmanship.\n3. Vibe Alignment: Customized suggestions for alpine peace and adventure.';
    } else {
      reply = `### ✨ StayWise Curated Travel Insights\n\nThank you for sharing your ideas! As your **StayWise Concierge**, here are my top recommendations for designing an unforgettable trip:\n\n1. **Architectural Harmony:** Choose properties where design reflects regional heritage &mdash; whether minimalist stone villas, eco-luxury treehouses, or restored historic palazzos.\n2. **Neighborhood Vibe:** Prioritize central walkability if you enjoy cafes and cultural landmarks, or secluded coastal/hillside retreats for ultimate relaxation.\n3. **Curated Experiences:** Pair your stay with private architectural tours, local culinary tastings, or bespoke transit.\n\nFeel free to ask me about any specific city, hotel style, or travel tip!`;
      thinking = '1. Curation Framework: Shared core design and neighborhood selection advice.\n2. Service Alignment: Outlined stay quality, neighborhood selection, and curated local guides.';
    }

    return res.status(200).json({
      success: true,
      reply,
      thinking,
      fallback: true,
    });
  } catch (error) {
    console.error(`[AI_CHATBOT] Error handling chat: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat message. Please try again.',
    });
  }
};

// Stub endpoints for legacy route compatibility
const getItinerary = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'AI Hive has been transitioned to the StayWise AI Assistant.',
  });
};

const streamTelemetry = async (req, res) => {
  res.status(404).json({ success: false, message: 'Telemetry streaming removed in simple chatbot mode.' });
};

const createItineraryPaymentOrder = async (req, res) => {
  res.status(400).json({ success: false, message: 'Escrow bookings removed in simple chatbot mode.' });
};

const verifyItineraryPayment = async (req, res) => {
  res.status(400).json({ success: false, message: 'Escrow verification removed in simple chatbot mode.' });
};

module.exports = {
  chatBotMessage,
  createItinerary: chatBotMessage,
  chatItinerary: chatBotMessage,
  getItinerary,
  streamTelemetry,
  createItineraryPaymentOrder,
  verifyItineraryPayment,
};
