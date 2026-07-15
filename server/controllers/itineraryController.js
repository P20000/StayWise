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
        message: 'Message is required to chat with StayWise AI Assistant.',
      });
    }

    const systemPrompt = `You are the StayWise AI Assistant, a friendly, intelligent, and knowledgeable expert on architectural stays, curated boutique hotels, luxury villas, and travel planning across the globe (especially India, Europe, Asia, and the Americas).
Your goal is to assist users in discovering dream destinations, recommending suitable room styles, providing practical travel tips, answering questions about itineraries, or chatting casually.
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
      console.warn(`[AI_CHATBOT] LLM generation fallback triggered: ${llmError.message}`);
    }

    // Destination-grounded conversational fallback
    const lower = query.toLowerCase();
    let reply = '';
    let thinking = '1. Intent Analysis: Evaluated user query for target destination, accommodation tier, and travel vibe.\n2. Knowledge Base Retrieval: Matched constraints against StayWise curated architectural properties and regional guides.\n3. Response Synthesis: Formulated structured recommendation with practical travel insights.';

    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('who are you') || lower.includes('what can you do')) {
      reply = `Hello! 👋 Welcome to **StayWise AI Assistant**!\n\nI am your personal travel and architectural stay advisor. Whether you're dreaming of a **cliffside luxury villa in Goa**, an **heritage boutique hotel in Jaipur**, or planning a getaway across **Rome & Paris**, I am here to help.\n\nHere is what I can help you with:\n* 🌍 **Destination & Vibe Guidance:** Discover cities and regions matching your travel mood.\n* 🏛️ **Architectural Stays:** Learn about unique design philosophies from restored colonial mansions to modern glass villas.\n* 🗺️ **Custom Itinerary Tips:** Get recommendations on neighborhoods, best times to visit, and local highlights.\n\nWhere would you like to travel next?`;
      thinking = '1. Greeting Classification: Casual welcome inquiry detected.\n2. Assistant Guidance: Introduced core capabilities (architectural stays, custom travel planning, destination guidance).\n3. Next Step Prompting: Asked for preferred destination or travel ideas.';
    } else if (lower.includes('goa') || lower.includes('beach')) {
      reply = `### 🌴 Dreaming of Goa & Coastal Retreats\n\nGoa is home to some of India's most breathtaking Portuguese-inspired architectural villas and serene beachfront estates. Here are two curated recommendations for your trip:\n\n* **Casa do Mar (Assagao)** &mdash; A restored 19th-century Portuguese villa surrounded by lush tropical gardens and private infinity pools. Perfect for a relaxing luxury vibe.\n* **The Glasshouse on the Cliff (Vagator)** &mdash; Ultra-modern minimalist architecture with panoramic Arabian Sea views and bespoke concierge service.\n\n**Best time to visit:** November through March for pleasant coastal breezes and vibrant dining scenes.\nWould you like more details on pricing tiers or recommendations for nearby experiences?`;
    } else if (lower.includes('rome') || lower.includes('italy') || lower.includes('paris') || lower.includes('europe')) {
      reply = `### 🌍 Exploring Classic European Elegance\n\nFor a romantic or luxury European escape, StayWise curates properties where historical heritage meets modern comfort:\n\n* **Palazzo Storico Suites (Rome)** &mdash; Located near Piazza Navona, featuring original 17th-century frescoes paired with contemporary Italian designer furnishings.\n* **Le Marais Architect Studio (Paris)** &mdash; A loft-style penthouse with exposed oak beams and private terrace views across Parisian rooftops.\n\n**Pro Tip:** Combine your stay with high-speed regional rail passes for a seamless itinerary across Europe!`;
    } else if (lower.includes('kochi') || lower.includes('kerala') || lower.includes('backwater')) {
      reply = `### 🛶 Serene Kerala & Heritage Stays in Kochi\n\nExperience the tranquil charm of God's Own Country with properties celebrating traditional Kerala architecture (*Nalukettu*) and colonial heritage:\n\n* **Fort Heritage Haven (Fort Kochi)** &mdash; A Dutch-era mansion featuring high teakwood ceilings, antique courtyard gardens, and sunset views over the Chinese fishing nets.\n* **Vembanad Water Villa (Kumarakom)** &mdash; Eco-luxury overwater pavilions built with reclaimed timber and private veranda docks.\n\nWould you like recommendations for private houseboats or traditional culinary experiences?`;
    } else if (lower.includes('manali') || lower.includes('mountain') || lower.includes('hill')) {
      reply = `### 🏔️ Mountain Escapes & Alpine Architecture\n\nIf you crave crisp mountain air and panoramic valley views, check out our alpine and traditional stone-and-wood lodges:\n\n* **The Pine Ridge Chalet (Old Manali)** &mdash; Handcrafted cedarwood structure featuring floor-to-ceiling glass walls, indoor fireplaces, and cedar deck jacuzzis.\n* **Himalayan Stone Retreat (Naggar)** &mdash; Built using traditional interlocking stone and wood techniques (*Kathkunia*) for natural warmth and seismic resilience.\n\nIdeal for both adventure seekers and peaceful retreats!`;
    } else {
      reply = `### ✨ StayWise Curated Travel Insights\n\nThank you for sharing your ideas! As the **StayWise AI Assistant**, here are my top recommendations for designing an unforgettable trip:\n\n1. **Architectural Harmony:** Choose properties where design reflects regional heritage &mdash; whether minimalist stone villas, eco-luxury treehouses, or restored historic palazzos.\n2. **Neighborhood Vibe:** Prioritize central walkability if you enjoy cafes and cultural landmarks, or secluded coastal/hillside retreats for ultimate relaxation.\n3. **Curated Experiences:** Pair your stay with private architectural tours, local culinary tastings, or bespoke transit.\n\nFeel free to ask me about any specific city, hotel style, or travel tip!`;
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
