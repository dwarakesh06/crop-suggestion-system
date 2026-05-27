const fs = require("fs");
const path = require("path");

// Load crop stats from the trained model's output
let cropStats = {};
const statsPath = path.join(__dirname, "..", "..", "models", "crop_stats.json");

try {
  if (fs.existsSync(statsPath)) {
    cropStats = JSON.parse(fs.readFileSync(statsPath, "utf-8"));
  }
} catch (err) {
  console.warn("Chat: Could not load crop_stats.json:", err.message);
}

// Comprehensive crop knowledge base (growing tips, seasons, etc.)
const cropKnowledge = {
  rice: { season: "Kharif (June–November)", water: "High", type: "Cereal", tip: "Requires standing water in paddy fields. Transplanting seedlings gives better yield than direct sowing." },
  maize: { season: "Kharif & Rabi", water: "Moderate", type: "Cereal", tip: "Best planted in well-drained loamy soil. Avoid waterlogging as it causes root rot." },
  wheat: { season: "Rabi (November–April)", water: "Moderate", type: "Cereal", tip: "Thrives in cool weather during growth and warm weather during harvest. Irrigate at critical stages: crown root, tillering, flowering." },
  chickpeas: { season: "Rabi (October–March)", water: "Low", type: "Pulse", tip: "Drought-tolerant crop. Avoid excess moisture to prevent wilt disease." },
  kidneybeans: { season: "Kharif", water: "Moderate", type: "Pulse", tip: "Needs well-drained soil. Sensitive to frost and waterlogging." },
  pigeonpeas: { season: "Kharif", water: "Low-Moderate", type: "Pulse", tip: "Deep root system makes it drought-resistant. Good for intercropping with cereals." },
  mothbeans: { season: "Kharif", water: "Very Low", type: "Pulse", tip: "Extremely drought-tolerant. Grows well in arid and semi-arid regions." },
  mungbean: { season: "Kharif & Summer", water: "Low", type: "Pulse", tip: "Short duration crop (60-75 days). Excellent for crop rotation as it fixes nitrogen." },
  blackgram: { season: "Kharif & Rabi", water: "Low-Moderate", type: "Pulse", tip: "Tolerates shade well. Good as an intercrop with sugarcane or maize." },
  lentil: { season: "Rabi (October–March)", water: "Low", type: "Pulse", tip: "Grows best in cool, dry conditions. Excessive rain during flowering reduces yield." },
  sugarcane: { season: "Year-round (12-18 months)", water: "Very High", type: "Cash Crop", tip: "Requires frequent irrigation. Ratoon cropping can give 2-3 harvests from one planting." },
  cotton: { season: "Kharif (April–October)", water: "Moderate", type: "Cash Crop", tip: "Needs warm climate and black soil. Bt cotton varieties resist bollworm pest." },
  jute: { season: "Kharif (March–July)", water: "High", type: "Fiber", tip: "Known as 'Golden Fiber'. Needs warm humid climate and alluvial soil." },
  coffee: { season: "Year-round (perennial)", water: "Moderate", type: "Plantation", tip: "Shade-grown coffee produces superior quality. Arabica grows at higher altitudes than Robusta." },
  tea: { season: "Year-round (perennial)", water: "High", type: "Plantation", tip: "Needs acidic soil (pH 4.5-5.5) and well-distributed rainfall. Pruning promotes new growth." },
  potato: { season: "Rabi (October–March)", water: "Moderate", type: "Tuber", tip: "Needs well-drained sandy loam soil. Earthing up prevents greening of tubers." },
  tomato: { season: "Rabi & Kharif", water: "Moderate", type: "Vegetable", tip: "Staking supports heavy fruit load. Remove suckers for better fruit quality." },
  onion: { season: "Rabi (November–May)", water: "Moderate", type: "Vegetable", tip: "Stop irrigation 10 days before harvesting for better storage life." },
  chilli: { season: "Kharif & Rabi", water: "Moderate", type: "Spice", tip: "Pinching the first flower promotes bushier growth and more fruit production." },
  turmeric: { season: "Kharif (May–January)", water: "Moderate-High", type: "Spice", tip: "Needs well-drained soil rich in organic matter. Mulching conserves moisture." },
  ginger: { season: "Kharif (March–December)", water: "High", type: "Spice", tip: "Shade-loving crop. Use disease-free seed rhizomes treated with fungicide." },
  garlic: { season: "Rabi (October–March)", water: "Low-Moderate", type: "Spice", tip: "Plant cloves 3-5 cm deep. Stop watering 2 weeks before harvest." },
  mustard: { season: "Rabi (October–March)", water: "Low", type: "Oilseed", tip: "Frost-sensitive during flowering. One irrigation at flowering stage boosts yield significantly." },
  sunflower: { season: "Kharif & Rabi", water: "Moderate", type: "Oilseed", tip: "Heads track the sun (heliotropism). Bee pollination increases seed set by 30%." },
  sesame: { season: "Kharif (June–October)", water: "Low", type: "Oilseed", tip: "One of the oldest oilseed crops. Highly drought-tolerant once established." },
  groundnut: { season: "Kharif", water: "Moderate", type: "Oilseed", tip: "Calcium-rich soil produces better pods. Pegging stage is critical for irrigation." },
  soybeans: { season: "Kharif (June–October)", water: "Moderate", type: "Oilseed", tip: "Fixes atmospheric nitrogen. Excellent rotation crop for improving soil fertility." },
  cardamom: { season: "Year-round (perennial)", water: "High", type: "Spice", tip: "Queen of Spices. Needs shade, humidity, and well-distributed rainfall." },
  pepper: { season: "Year-round (perennial)", water: "High", type: "Spice", tip: "King of Spices. Grows as a vine needing support trees. Thrives in tropical climates." },
  coriander: { season: "Rabi (October–March)", water: "Low-Moderate", type: "Spice", tip: "Dual-purpose crop: leaves (cilantro) and seeds (coriander). Cool weather promotes leaf growth." },
  cumin: { season: "Rabi (November–March)", water: "Very Low", type: "Spice", tip: "Sensitive to excess moisture. Requires dry weather during seed maturation." },
  sorghum: { season: "Kharif & Rabi", water: "Low", type: "Cereal", tip: "Highly drought-tolerant. Can be used as grain, fodder, and biofuel crop." },
  millets: { season: "Kharif", water: "Very Low", type: "Cereal", tip: "Nutri-cereals with high nutritional value. Grow well in poor soils with minimal inputs." },
  peas: { season: "Rabi (October–March)", water: "Moderate", type: "Vegetable", tip: "Cool-season crop. Provide support/trellis for climbing varieties." },
  cauliflower: { season: "Rabi (September–March)", water: "Moderate", type: "Vegetable", tip: "Blanching (tying leaves over curd) produces white, tender curds." },
  cabbage: { season: "Rabi (September–March)", water: "Moderate", type: "Vegetable", tip: "Heavy feeder needing nitrogen-rich soil. Transplant seedlings for uniform heads." },
  banana: { season: "Year-round (10-12 months)", water: "Very High", type: "Fruit", tip: "Tissue-cultured plants give uniform, disease-free crop. Desuckering improves bunch weight." },
  mango: { season: "Summer (April–July)", water: "Low-Moderate", type: "Fruit", tip: "King of Fruits. Grafted trees bear fruit 3-4 years earlier than seed-grown trees." },
  pomegranate: { season: "Mrig Bahar (June–Feb)", water: "Low", type: "Fruit", tip: "Drought-tolerant. Bahar treatment (stress-induced flowering) gives three cropping seasons." },
  grapes: { season: "Winter harvest (Oct–Feb)", water: "Moderate", type: "Fruit", tip: "Pruning is crucial — determines yield. Trellis/bower system training is essential." },
  watermelon: { season: "Summer (Feb–June)", water: "Moderate", type: "Fruit", tip: "Needs warm soil for germination. Plastic mulch increases soil temperature and early harvest." },
  muskmelon: { season: "Summer (Feb–June)", water: "Moderate", type: "Fruit", tip: "Sandy loam soil is ideal. Reduce watering near harvest for sweeter fruit." },
  apple: { season: "Temperate (July–October)", water: "Moderate", type: "Fruit", tip: "Requires chilling hours (below 7°C) for proper flowering. Cross-pollination improves fruit set." },
  orange: { season: "Winter (November–March)", water: "Moderate", type: "Fruit", tip: "Citrus crop needing well-drained soil. Micro-irrigation prevents foot rot disease." },
  papaya: { season: "Year-round (9-12 months)", water: "Moderate", type: "Fruit", tip: "Fast-growing. Avoid waterlogging — papaya roots are extremely sensitive to standing water." },
  coconut: { season: "Year-round (perennial)", water: "Moderate-High", type: "Plantation", tip: "Tree of Life with 100+ uses. Basin irrigation during summer increases nut yield by 50%." },
  tobacco: { season: "Rabi", water: "Moderate", type: "Cash Crop", tip: "Requires fertile, well-drained soil. Topping (removing flowers) redirects energy to leaves." },
  rubber: { season: "Year-round (perennial)", water: "High", type: "Plantation", tip: "Tapping begins at 6-7 years. Rainguard channels allow tapping even during monsoon." },
  sweetpotato: { season: "Kharif & Rabi", water: "Moderate", type: "Tuber", tip: "Propagated by vine cuttings. Ridge planting improves tuber shape and drainage." },
  barley: { season: "Rabi (October–April)", water: "Low", type: "Cereal", tip: "Most salt and drought-tolerant cereal. Used for malt, animal feed, and human food." },
};

// General farming tips
const farmingTips = [
  "🌱 Crop Rotation: Alternate between legumes and cereals to maintain soil fertility and break pest cycles.",
  "💧 Drip Irrigation: Saves 30-50% water compared to flood irrigation and delivers nutrients directly to roots.",
  "🧪 Soil Testing: Get your soil tested every season. It costs little but saves a lot on unnecessary fertilizer spending.",
  "🌿 Green Manuring: Growing and plowing dhaincha or sunhemp before the main crop adds 20-30 kg nitrogen per hectare.",
  "🐛 Integrated Pest Management (IPM): Use neem-based pesticides and biological controls before chemical sprays.",
  "📅 Timely Sowing: Every week of delay in sowing reduces yield by 3-5%. Follow your region's recommended sowing calendar.",
  "🌾 Seed Treatment: Treating seeds with fungicide (Thiram/Captan) prevents seed-borne diseases and improves germination by 10-15%.",
  "☀️ Mulching: Spread crop residues or plastic mulch to conserve soil moisture, suppress weeds, and regulate soil temperature.",
  "🏔️ Contour Farming: On sloped land, plow along contours to reduce soil erosion and improve water retention.",
  "🧑‍🌾 Record Keeping: Maintain a farm diary tracking inputs, costs, weather, and yields. Data helps make better decisions each season.",
  "🌍 Organic Farming: Vermicompost and bio-fertilizers like Rhizobium and PSB reduce chemical dependency while maintaining yields.",
  "💰 MSP Awareness: Check government Minimum Support Prices (MSP) before deciding what to plant for better income planning.",
];

// Fertilizer knowledge
const fertilizerGuide = {
  nitrogen: "🧪 **Nitrogen (N)**: Essential for leaf and vegetative growth. Sources: Urea (46% N), Ammonium Sulfate (21% N), CAN (25% N). Apply in splits — 50% at sowing, 25% at tillering, 25% at flowering.",
  phosphorus: "🧪 **Phosphorus (P)**: Critical for root development and flowering. Sources: DAP (46% P₂O₅), SSP (16% P₂O₅), Rock Phosphate. Apply entire dose at sowing as a basal dose since P is immobile in soil.",
  potassium: "🧪 **Potassium (K)**: Strengthens stems, improves disease resistance, and enhances fruit quality. Sources: MOP/Muriate of Potash (60% K₂O), SOP (50% K₂O). Apply 50% basal + 50% at flowering.",
  ph: "🧪 **Soil pH**: Ideal range is 6.0-7.0 for most crops. If acidic (<5.5), apply agricultural lime. If alkaline (>7.5), apply gypsum or elemental sulfur. Get soil tested before correcting pH.",
  organic: "🌿 **Organic Fertilizers**: FYM (Farm Yard Manure) — 10-15 tons/hectare. Vermicompost — 5 tons/hectare. Neem Cake — pest-repellent + nutrient source. Green manure crops fix atmospheric nitrogen.",
  micro: "🔬 **Micronutrients**: Zinc Sulfate for zinc deficiency (common in rice/wheat). Borax for boron deficiency (affects flowering). Ferrous Sulfate for iron deficiency (chlorosis in alkaline soils).",
};

// Build a list of all crop names for matching
const allCropNames = Object.keys(cropKnowledge);

/**
 * Find which crop the user is asking about
 */
function detectCrop(message) {
  const lower = message.toLowerCase();
  for (const crop of allCropNames) {
    // Match whole word or partial (e.g., "potatoes" matches "potato")
    const regex = new RegExp(`\\b${crop}s?\\b`, "i");
    if (regex.test(lower)) {
      return crop;
    }
  }
  // Handle common aliases
  const aliases = {
    "cilantro": "coriander", "dhaniya": "coriander", "haldi": "turmeric",
    "adrak": "ginger", "lahsun": "garlic", "sarson": "mustard",
    "bajra": "millets", "ragi": "millets", "jowar": "sorghum",
    "arhar": "pigeonpeas", "toor": "pigeonpeas", "tur": "pigeonpeas",
    "chana": "chickpeas", "masoor": "lentil", "moong": "mungbean",
    "urad": "blackgram", "moth": "mothbeans", "matar": "peas",
    "aloo": "potato", "tamatar": "tomato", "pyaz": "onion",
    "mirch": "chilli", "gobhi": "cauliflower", "patta gobhi": "cabbage",
    "ganna": "sugarcane", "kapas": "cotton", "chai": "tea",
    "elaichi": "cardamom", "kali mirch": "pepper", "jeera": "cumin",
    "til": "sesame", "moongfali": "groundnut", "shakarkand": "sweetpotato",
    "aam": "mango", "kela": "banana", "angoor": "grapes",
    "tarbooz": "watermelon", "narial": "coconut", "santara": "orange",
    "seb": "apple", "papita": "papaya", "anaar": "pomegranate",
  };
  for (const [alias, crop] of Object.entries(aliases)) {
    if (lower.includes(alias)) return crop;
  }
  return null;
}

/**
 * Detect user intent from message
 */
function detectIntent(message) {
  const lower = message.toLowerCase();

  // Greeting patterns
  if (/^(hi|hello|hey|greetings|howdy|good morning|good afternoon|good evening|namaste|hii+)\b/.test(lower)) {
    return "greeting";
  }

  // Thanks
  if (/\b(thanks?|thank you|thankyou|dhanyavaad)\b/.test(lower)) {
    return "thanks";
  }

  // Goodbye
  if (/\b(bye|goodbye|see you|good night|exit|quit)\b/.test(lower)) {
    return "goodbye";
  }

  // Help
  if (/\b(help|assist|support|what can you|guide me|how to use|features)\b/.test(lower)) {
    return "help";
  }

  // Fertilizer related
  if (/\b(fertili[sz]er|npk|urea|dap|manure|compost|nutrient|nitrogen|phosphorus|potassium|ph level|soil ph|micronutrient|organic fertil)\b/.test(lower)) {
    return "fertilizer";
  }

  // Soil related
  if (/\b(soil|n p k|npk|nitrogen|phosphorus|potassium|ph|acidic|alkaline)\b/.test(lower)) {
    return "soil";
  }

  // Climate / weather
  if (/\b(climate|weather|temperature|rain|rainfall|humid|humidity|season|when to grow|when to plant|when to sow|best time)\b/.test(lower)) {
    return "climate";
  }

  // Yield
  if (/\b(yield|harvest|production|output|how much|tons|kg per|per hectare|per acre)\b/.test(lower)) {
    return "yield";
  }

  // Water / irrigation
  if (/\b(water|irrigation|irrigat|drip|sprinkler|flood)\b/.test(lower)) {
    return "water";
  }

  // General tips
  if (/\b(tip|advice|suggest|recommend|best practice|improve|increase yield|organic farming|crop rotation)\b/.test(lower)) {
    return "tips";
  }

  // Disease / pest
  if (/\b(disease|pest|insect|fungus|wilt|blight|rot|virus|bug|worm|aphid)\b/.test(lower)) {
    return "pest";
  }

  // List crops
  if (/\b(list|all crops|which crops|supported crops|available crops|how many crops|what crops)\b/.test(lower)) {
    return "list_crops";
  }

  // How to use / predict
  if (/\b(how to predict|how does|how do i|predict crop|use this|get started)\b/.test(lower)) {
    return "how_to_use";
  }

  return "general";
}

/**
 * Generate response based on intent and detected crop
 */
function generateResponse(message) {
  const intent = detectIntent(message);
  const crop = detectCrop(message);

  switch (intent) {
    case "greeting":
      return {
        text: "Hello! 🌾 I'm **CropBot**, your agricultural assistant. I can help you with:\n\n• 🌱 **Crop information** — soil, climate, growing tips for 50 crops\n• 🧪 **Fertilizer advice** — NPK recommendations and remedies\n• 📊 **Yield estimates** — expected production per hectare\n• 💡 **Farming tips** — best practices for better harvests\n\nJust ask me about any crop or farming topic!",
        suggestions: ["Tell me about rice", "Fertilizer guide", "Farming tips", "List all crops"]
      };

    case "thanks":
      return {
        text: "You're welcome! 🌾 Happy to help. Feel free to ask anything else about crops, soil, or farming. Good luck with your harvest! 🚜",
        suggestions: ["Farming tips", "Tell me about wheat", "How to use this system"]
      };

    case "goodbye":
      return {
        text: "Goodbye! 👋 Wishing you a bountiful harvest. Come back anytime you need agricultural advice. Happy farming! 🌾🚜",
        suggestions: []
      };

    case "help":
      return {
        text: "Here's what I can help you with:\n\n🌱 **Crop Details**: Ask \"*Tell me about rice*\" or \"*How to grow tomato*\"\n🧪 **Fertilizer Guide**: Ask \"*Fertilizer for wheat*\" or \"*What is NPK*\"\n🌡️ **Climate Info**: Ask \"*Best season for mango*\" or \"*Temperature for potato*\"\n📊 **Yield Info**: Ask \"*Yield of sugarcane*\" or \"*How much does banana produce*\"\n💧 **Irrigation**: Ask \"*Water needs of rice*\" or \"*Drip irrigation*\"\n🐛 **Pest Control**: Ask \"*Diseases in tomato*\" or \"*Pest management*\"\n📋 **All Crops**: Ask \"*List all crops*\"\n\nI support **50 different crops** — just name one!",
        suggestions: ["Tell me about coffee", "Best season for wheat", "Organic farming tips", "List all crops"]
      };

    case "list_crops":
      const cropList = allCropNames.map(c => c.charAt(0).toUpperCase() + c.slice(1));
      const grouped = {
        "🌾 Cereals": cropList.filter(c => cropKnowledge[c.toLowerCase()]?.type === "Cereal"),
        "🫘 Pulses": cropList.filter(c => cropKnowledge[c.toLowerCase()]?.type === "Pulse"),
        "🌻 Oilseeds": cropList.filter(c => cropKnowledge[c.toLowerCase()]?.type === "Oilseed"),
        "🌶️ Spices": cropList.filter(c => cropKnowledge[c.toLowerCase()]?.type === "Spice"),
        "🥬 Vegetables": cropList.filter(c => cropKnowledge[c.toLowerCase()]?.type === "Vegetable" || cropKnowledge[c.toLowerCase()]?.type === "Tuber"),
        "🍎 Fruits": cropList.filter(c => cropKnowledge[c.toLowerCase()]?.type === "Fruit"),
        "🏭 Cash/Plantation": cropList.filter(c => ["Cash Crop", "Plantation", "Fiber"].includes(cropKnowledge[c.toLowerCase()]?.type)),
      };
      let listText = "Here are all **50 crops** I know about:\n\n";
      for (const [category, crops] of Object.entries(grouped)) {
        if (crops.length > 0) {
          listText += `${category}: ${crops.join(", ")}\n`;
        }
      }
      listText += "\nAsk me about any crop for detailed information!";
      return { text: listText, suggestions: ["Tell me about rice", "How to grow tomato", "Fertilizer for wheat"] };

    case "fertilizer": {
      if (crop && cropStats[crop]) {
        const stats = cropStats[crop];
        const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
        let text = `🧪 **Fertilizer Guide for ${cropName}**:\n\n`;
        text += `• **Nitrogen (N)**: Ideal range ${stats.N.min}–${stats.N.max} ppm (avg: ${stats.N.mean.toFixed(1)} ppm)\n`;
        text += `• **Phosphorus (P)**: Ideal range ${stats.P.min}–${stats.P.max} ppm (avg: ${stats.P.mean.toFixed(1)} ppm)\n`;
        text += `• **Potassium (K)**: Ideal range ${stats.K.min}–${stats.K.max} ppm (avg: ${stats.K.mean.toFixed(1)} ppm)\n`;
        text += `• **Soil pH**: Ideal range ${stats.ph.min.toFixed(1)}–${stats.ph.max.toFixed(1)}\n\n`;
        if (cropKnowledge[crop]) {
          text += `💡 **Pro Tip**: ${cropKnowledge[crop].tip}`;
        }
        return { text, suggestions: [`${cropName} yield info`, `${cropName} climate`, "General fertilizer guide"] };
      }

      // General fertilizer query
      const lower = message.toLowerCase();
      if (lower.includes("nitrogen") || lower.includes("urea")) return { text: fertilizerGuide.nitrogen, suggestions: ["Phosphorus guide", "Potassium guide", "Organic fertilizers"] };
      if (lower.includes("phosphorus") || lower.includes("dap")) return { text: fertilizerGuide.phosphorus, suggestions: ["Nitrogen guide", "Potassium guide", "Micronutrients"] };
      if (lower.includes("potassium") || lower.includes("potash")) return { text: fertilizerGuide.potassium, suggestions: ["Nitrogen guide", "Phosphorus guide", "Organic fertilizers"] };
      if (lower.includes("ph")) return { text: fertilizerGuide.ph, suggestions: ["Nitrogen guide", "Organic fertilizers", "Micronutrients"] };
      if (lower.includes("organic") || lower.includes("compost") || lower.includes("manure")) return { text: fertilizerGuide.organic, suggestions: ["Nitrogen guide", "Micronutrients", "Farming tips"] };
      if (lower.includes("micro")) return { text: fertilizerGuide.micro, suggestions: ["Nitrogen guide", "Phosphorus guide", "Organic fertilizers"] };

      let text = "🧪 **Fertilizer Essentials**:\n\n";
      text += `${fertilizerGuide.nitrogen}\n\n${fertilizerGuide.phosphorus}\n\n${fertilizerGuide.potassium}\n\n`;
      text += "Ask about a specific crop for tailored NPK recommendations!";
      return { text, suggestions: ["Fertilizer for rice", "Organic fertilizers", "Soil pH guide"] };
    }

    case "soil": {
      if (crop && cropStats[crop]) {
        const stats = cropStats[crop];
        const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
        let text = `🌍 **Ideal Soil Conditions for ${cropName}**:\n\n`;
        text += `• **Nitrogen (N)**: ${stats.N.min}–${stats.N.max} ppm\n`;
        text += `• **Phosphorus (P)**: ${stats.P.min}–${stats.P.max} ppm\n`;
        text += `• **Potassium (K)**: ${stats.K.min}–${stats.K.max} ppm\n`;
        text += `• **Soil pH**: ${stats.ph.min.toFixed(1)}–${stats.ph.max.toFixed(1)}\n`;
        return { text, suggestions: [`${cropName} climate info`, `${cropName} fertilizer`, `${cropName} yield`] };
      }
      return {
        text: "🌍 **Soil Health Basics**:\n\n• Get soil tested before every cropping season\n• Ideal pH for most crops: 6.0-7.0\n• NPK ratio varies by crop — tell me which crop you're growing!\n• Add organic matter (FYM/compost) to improve soil structure\n• Avoid over-tilling — it destroys soil structure and microbial life",
        suggestions: ["Soil for rice", "Soil pH guide", "Organic fertilizers"]
      };
    }

    case "climate": {
      if (crop) {
        const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
        let text = `🌡️ **Climate Requirements for ${cropName}**:\n\n`;
        if (cropStats[crop]) {
          const stats = cropStats[crop];
          text += `• **Temperature**: ${stats.temperature.min.toFixed(1)}°C – ${stats.temperature.max.toFixed(1)}°C (avg: ${stats.temperature.mean.toFixed(1)}°C)\n`;
          text += `• **Humidity**: ${stats.humidity.min.toFixed(1)}% – ${stats.humidity.max.toFixed(1)}%\n`;
          text += `• **Rainfall**: ${stats.rainfall.min.toFixed(0)}–${stats.rainfall.max.toFixed(0)} mm\n`;
        }
        if (cropKnowledge[crop]) {
          text += `• **Season**: ${cropKnowledge[crop].season}\n`;
          text += `• **Water Need**: ${cropKnowledge[crop].water}\n`;
          text += `\n💡 **Tip**: ${cropKnowledge[crop].tip}`;
        }
        return { text, suggestions: [`${cropName} soil info`, `${cropName} yield`, "Farming tips"] };
      }
      return {
        text: "🌡️ I can tell you the ideal temperature, rainfall, humidity, and growing season for any crop. Just name the crop!\n\nFor example: *\"Climate for mango\"* or *\"Best season for wheat\"*",
        suggestions: ["Climate for rice", "Season for wheat", "Temperature for tomato"]
      };
    }

    case "yield": {
      if (crop && cropStats[crop]) {
        const stats = cropStats[crop];
        const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
        let text = `📊 **Yield Estimate for ${cropName}**:\n\n`;
        text += `• **Expected Yield**: ${stats.base_yield.min}–${stats.base_yield.max} tons per hectare\n`;
        text += `• Under optimal conditions (ideal NPK, temperature, and rainfall)\n\n`;
        if (cropKnowledge[crop]) {
          text += `• **Crop Type**: ${cropKnowledge[crop].type}\n`;
          text += `• **Season**: ${cropKnowledge[crop].season}\n`;
          text += `\n💡 **Tip**: ${cropKnowledge[crop].tip}`;
        }
        text += "\n\n📌 Use the **Predict** page to get a personalized yield estimate based on your actual soil and climate data!";
        return { text, suggestions: [`${cropName} fertilizer`, `${cropName} climate`, "Go to Predict page"] };
      }
      return {
        text: "📊 I can estimate yield for any of our 50 supported crops. Just ask: *\"Yield of sugarcane\"* or *\"How much does wheat produce?\"*\n\nFor a personalized estimate based on your actual soil data, use the **Predict** page!",
        suggestions: ["Yield of rice", "Yield of sugarcane", "Yield of banana"]
      };
    }

    case "water": {
      if (crop && cropKnowledge[crop]) {
        const info = cropKnowledge[crop];
        const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
        let text = `💧 **Water Requirements for ${cropName}**:\n\n`;
        text += `• **Water Need**: ${info.water}\n`;
        if (cropStats[crop]) {
          text += `• **Optimal Rainfall**: ${cropStats[crop].rainfall.min.toFixed(0)}–${cropStats[crop].rainfall.max.toFixed(0)} mm\n`;
        }
        text += `• **Season**: ${info.season}\n`;
        text += `\n💡 **Tip**: ${info.tip}`;
        return { text, suggestions: [`${cropName} soil info`, `${cropName} yield`, "Drip irrigation tips"] };
      }
      return {
        text: "💧 **Irrigation Best Practices**:\n\n• **Drip Irrigation**: Saves 30-50% water, best for vegetables and orchards\n• **Sprinkler**: Good for cereals and pulses on flat land\n• **Flood/Furrow**: Traditional but wastes water; suitable for rice paddies\n• **Mulching**: Reduces evaporation by 25-30%\n• **Morning Watering**: Reduces fungal disease risk\n\nAsk about a specific crop for its water needs!",
        suggestions: ["Water for rice", "Water for tomato", "Drip irrigation"]
      };
    }

    case "pest": {
      if (crop) {
        const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
        return {
          text: `🐛 **Pest & Disease Management for ${cropName}**:\n\n• **Prevention**: Use certified disease-free seeds/seedlings\n• **Seed Treatment**: Treat with Thiram/Captan before sowing\n• **Neem Spray**: 5% neem kernel extract controls many sucking pests\n• **Crop Rotation**: Breaks pest life cycles\n• **Biological Control**: Use Trichoderma for soil-borne diseases\n• **Yellow Sticky Traps**: Effective against whiteflies and aphids\n\n💡 Always identify the pest/disease correctly before applying any chemical pesticide. Contact your nearest agriculture extension officer for guidance.`,
          suggestions: [`${cropName} growing tips`, "Organic farming tips", "Fertilizer guide"]
        };
      }
      return {
        text: "🐛 **General Pest & Disease Management**:\n\n• **IPM (Integrated Pest Management)** is the gold standard\n• Start with cultural practices → biological control → chemical as last resort\n• **Neem oil** is effective against 200+ pest species\n• **Trichoderma** and **Pseudomonas** bio-agents prevent soil-borne diseases\n• Install **pheromone traps** for monitoring pest population\n• Maintain field hygiene — remove crop residues after harvest",
        suggestions: ["Pest control for rice", "Organic farming", "Farming tips"]
      };
    }

    case "tips": {
      const randomTips = farmingTips.sort(() => 0.5 - Math.random()).slice(0, 4);
      let text = "💡 **Smart Farming Tips**:\n\n";
      text += randomTips.join("\n\n");
      text += "\n\n_Ask me for more tips or about a specific crop!_";
      return { text, suggestions: ["More farming tips", "Organic farming", "Crop rotation tips"] };
    }

    case "how_to_use":
      return {
        text: "🚀 **How to Use the Crop Suggestion System**:\n\n**Step 1**: Go to the **Predict** page\n**Step 2**: Enter your soil parameters:\n   • Nitrogen (N), Phosphorus (P), Potassium (K) in ppm\n   • Temperature (°C), Humidity (%), Rainfall (mm)\n   • Soil pH level\n**Step 3**: Click **Get Prediction**\n**Step 4**: The AI model will suggest:\n   • 🌱 Best crop for your conditions\n   • 🧪 Fertilizer recommendations\n   • 📊 Expected yield estimate\n\nYou can also create an account to save your prediction history and view analytics!",
        suggestions: ["What crops are supported", "Fertilizer guide", "Farming tips"]
      };

    default: {
      // If a crop is detected, give a general overview
      if (crop) {
        const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
        let text = `🌱 **${cropName} — Complete Guide**:\n\n`;

        if (cropKnowledge[crop]) {
          const info = cropKnowledge[crop];
          text += `• **Type**: ${info.type}\n`;
          text += `• **Season**: ${info.season}\n`;
          text += `• **Water Need**: ${info.water}\n`;
          text += `• **Pro Tip**: ${info.tip}\n\n`;
        }

        if (cropStats[crop]) {
          const stats = cropStats[crop];
          text += `📊 **Ideal Growing Conditions**:\n`;
          text += `• N: ${stats.N.min}–${stats.N.max} ppm | P: ${stats.P.min}–${stats.P.max} ppm | K: ${stats.K.min}–${stats.K.max} ppm\n`;
          text += `• Temperature: ${stats.temperature.min.toFixed(1)}–${stats.temperature.max.toFixed(1)}°C\n`;
          text += `• Humidity: ${stats.humidity.min.toFixed(0)}–${stats.humidity.max.toFixed(0)}% | Rainfall: ${stats.rainfall.min.toFixed(0)}–${stats.rainfall.max.toFixed(0)} mm\n`;
          text += `• pH: ${stats.ph.min.toFixed(1)}–${stats.ph.max.toFixed(1)}\n`;
          text += `• Yield: ${stats.base_yield.min}–${stats.base_yield.max} tons/hectare\n`;
        }

        return { text, suggestions: [`${cropName} fertilizer`, `${cropName} climate`, `${cropName} yield`] };
      }

      // Complete fallback
      return {
        text: "I'm not sure I understood that. 🤔 I'm **CropBot**, specializing in agriculture. I can help with:\n\n• Information about any of our **50 supported crops**\n• **Fertilizer** and soil nutrient recommendations\n• **Climate** and season guidance\n• **Yield estimates** and farming tips\n\nTry asking something like: *\"Tell me about rice\"* or *\"Fertilizer for tomato\"*",
        suggestions: ["Help", "List all crops", "Farming tips", "How to use this system"]
      };
    }
  }
}

// Express controller
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message"
      });
    }

    const response = generateResponse(message.trim());

    return res.status(200).json({
      success: true,
      data: {
        reply: response.text,
        suggestions: response.suggestions || [],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong with the chatbot"
    });
  }
};
