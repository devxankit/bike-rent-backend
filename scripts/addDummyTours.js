const mongoose = require('mongoose');
require('dotenv').config();

// Import the Tour model
const Tour = require('../models/Tour');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Dummy tour data
const dummyTours = [
  {
    name: "Golden Triangle Adventure",
    description: "Explore the iconic Golden Triangle of India covering Delhi, Agra, and Jaipur. Experience the rich history, magnificent architecture, and vibrant culture of these three incredible cities.",
    price: 25000,
    originalPrice: 30000,
    discount: 17,
    duration: "6 days 5 nights",
    location: "Delhi, Agra, Jaipur",
    difficulty: "Easy",
    groupSize: "12",
    category: "Cultural",
    rating: 4.8,
    reviewCount: 156,
    bestTimeToVisit: "October to March",
    ageRestriction: "12+ years",
    fitnessLevel: "Easy",
    languages: "English, Hindi, Spanish",
    features: "Airport transfers, Professional guide, Monument entry fees, Traditional meals, Cultural shows",
    highlights: "Taj Mahal sunrise visit, Amber Fort elephant ride, Red Fort exploration, Local market shopping",
    inclusions: "Accommodation, Meals, Transport, Guide, Monument tickets, Cultural activities",
    exclusions: "International flights, Personal expenses, Travel insurance, Tips",
    whatToBring: "Comfortable walking shoes, Camera, Sunscreen, Light clothing, Valid ID",
    cancellationPolicy: "Free cancellation up to 7 days before departure. 50% refund for cancellations 3-7 days before. No refund for cancellations less than 3 days before.",
    ownerPhone: "9876543210",
    tags: "golden triangle, delhi, agra, jaipur, cultural, heritage, monuments",
    isFeatured: true,
    isActive: true,
    payAtPickup: false,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Delhi",
        activities: [
          "Airport pickup and hotel check-in",
          "Welcome briefing and orientation",
          "Evening walk in Connaught Place",
          "Traditional dinner at local restaurant"
        ]
      },
      {
        day: 2,
        title: "Delhi City Tour",
        activities: [
          "Visit Red Fort and Jama Masjid",
          "Explore Chandni Chowk market",
          "Lunch at Karim's restaurant",
          "Visit India Gate and Rashtrapati Bhavan",
          "Evening at Lotus Temple"
        ]
      },
      {
        day: 3,
        title: "Delhi to Agra",
        activities: [
          "Early morning drive to Agra",
          "Visit Agra Fort",
          "Lunch at local restaurant",
          "Sunset visit to Taj Mahal",
          "Check-in at Agra hotel"
        ]
      },
      {
        day: 4,
        title: "Agra to Jaipur",
        activities: [
          "Sunrise visit to Taj Mahal",
          "Visit Fatehpur Sikri",
          "Drive to Jaipur",
          "Evening at Pink City",
          "Traditional Rajasthani dinner"
        ]
      },
      {
        day: 5,
        title: "Jaipur Exploration",
        activities: [
          "Amber Fort with elephant ride",
          "City Palace and Jantar Mantar",
          "Hawa Mahal photo stop",
          "Local market shopping",
          "Cultural show at hotel"
        ]
      },
      {
        day: 6,
        title: "Departure",
        activities: [
          "Hotel checkout",
          "Last minute shopping",
          "Airport drop-off",
          "End of tour"
        ]
      }
    ]
  },
  {
    name: "Kerala Backwaters Paradise",
    description: "Cruise through the serene backwaters of Kerala in traditional houseboats. Experience the lush green landscapes, local villages, and authentic South Indian cuisine.",
    price: 18000,
    originalPrice: 22000,
    discount: 18,
    duration: "4 days 3 nights",
    location: "Kochi, Alleppey, Kumarakom",
    difficulty: "Easy",
    groupSize: "8",
    category: "Nature",
    rating: 4.9,
    reviewCount: 89,
    bestTimeToVisit: "September to March",
    ageRestriction: "No restriction",
    fitnessLevel: "Easy",
    languages: "English, Malayalam, Hindi",
    features: "Houseboat accommodation, Traditional meals, Village tours, Spice plantation visit, Kathakali show",
    highlights: "Backwater cruise, Village life experience, Spice plantation tour, Traditional Kerala cuisine, Kathakali performance",
    inclusions: "Houseboat stay, All meals, Village tours, Spice plantation visit, Cultural shows, Transport",
    exclusions: "Airport transfers, Personal expenses, Alcoholic beverages, Tips",
    whatToBring: "Light cotton clothes, Sun hat, Camera, Mosquito repellent, Comfortable shoes",
    cancellationPolicy: "Free cancellation up to 5 days before departure. 30% refund for cancellations 2-5 days before. No refund for cancellations less than 2 days before.",
    ownerPhone: "9876543211",
    tags: "kerala, backwaters, houseboat, nature, relaxation, south india",
    isFeatured: true,
    isActive: true,
    payAtPickup: false,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Kochi",
        activities: [
          "Airport pickup and hotel check-in",
          "Fort Kochi walking tour",
          "Chinese fishing nets visit",
          "Traditional Kerala dinner"
        ]
      },
      {
        day: 2,
        title: "Kochi to Alleppey",
        activities: [
          "Morning drive to Alleppey",
          "Houseboat check-in",
          "Backwater cruise begins",
          "Village visit and local interaction",
          "Sunset on backwaters"
        ]
      },
      {
        day: 3,
        title: "Backwater Experience",
        activities: [
          "Early morning bird watching",
          "Traditional breakfast on boat",
          "Spice plantation visit",
          "Local village market tour",
          "Evening Kathakali show"
        ]
      },
      {
        day: 4,
        title: "Departure",
        activities: [
          "Final backwater cruise",
          "Houseboat checkout",
          "Drive back to Kochi",
          "Airport drop-off"
        ]
      }
    ]
  },
  {
    name: "Himalayan Trekking Expedition",
    description: "Challenge yourself with an adventurous trek through the majestic Himalayas. Experience breathtaking mountain views, local culture, and the thrill of high-altitude trekking.",
    price: 35000,
    originalPrice: 40000,
    discount: 13,
    duration: "8 days 7 nights",
    location: "Manali, Rohtang Pass, Solang Valley",
    difficulty: "Challenging",
    groupSize: "10",
    category: "Adventure",
    rating: 4.7,
    reviewCount: 67,
    bestTimeToVisit: "May to October",
    ageRestriction: "18+ years",
    fitnessLevel: "Challenging",
    languages: "English, Hindi, Local dialects",
    features: "Professional trekking guide, Camping equipment, High-altitude training, Local porter support, Mountain rescue insurance",
    highlights: "High-altitude trekking, Mountain peak views, Local village visits, Camping under stars, Adventure activities",
    inclusions: "Trekking equipment, Camping gear, All meals, Professional guide, Porter support, Insurance",
    exclusions: "Personal gear, Travel to Manali, Personal expenses, Tips",
    whatToBring: "Trekking boots, Warm clothing, Sleeping bag, Backpack, First aid kit, Water bottles",
    cancellationPolicy: "Free cancellation up to 10 days before departure. 25% refund for cancellations 5-10 days before. No refund for cancellations less than 5 days before.",
    ownerPhone: "9876543212",
    tags: "himalayas, trekking, adventure, mountains, camping, manali",
    isFeatured: false,
    isActive: true,
    payAtPickup: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Manali",
        activities: [
          "Arrival and hotel check-in",
          "Trek briefing and equipment check",
          "Acclimatization walk",
          "Local market visit"
        ]
      },
      {
        day: 2,
        title: "Manali to Solang Valley",
        activities: [
          "Drive to Solang Valley",
          "Trekking preparation",
          "Short acclimatization trek",
          "Camp setup and training"
        ]
      },
      {
        day: 3,
        title: "Solang to Base Camp",
        activities: [
          "Early morning trek begins",
          "Scenic mountain views",
          "Base camp setup",
          "Evening briefing"
        ]
      },
      {
        day: 4,
        title: "Base Camp to Summit",
        activities: [
          "Summit attempt",
          "Peak photography",
          "Descent to base camp",
          "Celebration dinner"
        ]
      },
      {
        day: 5,
        title: "Return Journey",
        activities: [
          "Pack up camp",
          "Trek back to Solang",
          "Drive to Manali",
          "Rest and relaxation"
        ]
      },
      {
        day: 6,
        title: "Local Exploration",
        activities: [
          "Visit Hadimba Temple",
          "Manali market shopping",
          "Hot springs visit",
          "Cultural evening"
        ]
      },
      {
        day: 7,
        title: "Adventure Activities",
        activities: [
          "Paragliding in Solang",
          "River rafting",
          "Zip-lining experience",
          "Adventure sports"
        ]
      },
      {
        day: 8,
        title: "Departure",
        activities: [
          "Hotel checkout",
          "Last minute shopping",
          "Airport drop-off",
          "End of adventure"
        ]
      }
    ]
  },
  {
    name: "Rajasthan Royal Heritage",
    description: "Experience the royal grandeur of Rajasthan with visits to magnificent palaces, forts, and desert landscapes. Stay in heritage hotels and enjoy traditional hospitality.",
    price: 28000,
    originalPrice: 32000,
    discount: 13,
    duration: "7 days 6 nights",
    location: "Jaipur, Jodhpur, Udaipur, Jaisalmer",
    difficulty: "Moderate",
    groupSize: "12",
    category: "Cultural",
    rating: 4.6,
    reviewCount: 134,
    bestTimeToVisit: "October to March",
    ageRestriction: "10+ years",
    fitnessLevel: "Moderate",
    languages: "English, Hindi, Rajasthani",
    features: "Heritage hotel stays, Palace visits, Desert safari, Cultural performances, Traditional meals",
    highlights: "Amber Fort, Mehrangarh Fort, Lake Palace, Desert camping, Folk dance shows",
    inclusions: "Heritage accommodation, All meals, Palace entry fees, Desert safari, Cultural shows, Transport",
    exclusions: "International flights, Personal expenses, Camera fees, Tips",
    whatToBring: "Comfortable clothes, Camera, Sunscreen, Light jacket, Valid ID",
    cancellationPolicy: "Free cancellation up to 7 days before departure. 40% refund for cancellations 3-7 days before. No refund for cancellations less than 3 days before.",
    ownerPhone: "9876543213",
    tags: "rajasthan, palaces, forts, desert, heritage, royal",
    isFeatured: true,
    isActive: true,
    payAtPickup: false,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Jaipur",
        activities: [
          "Airport pickup and hotel check-in",
          "City Palace visit",
          "Jantar Mantar exploration",
          "Evening at Hawa Mahal"
        ]
      },
      {
        day: 2,
        title: "Jaipur Sightseeing",
        activities: [
          "Amber Fort with elephant ride",
          "Jaigarh Fort visit",
          "Local market shopping",
          "Traditional Rajasthani dinner"
        ]
      },
      {
        day: 3,
        title: "Jaipur to Jodhpur",
        activities: [
          "Drive to Jodhpur",
          "Mehrangarh Fort visit",
          "Jaswant Thada exploration",
          "Blue city walking tour"
        ]
      },
      {
        day: 4,
        title: "Jodhpur to Udaipur",
        activities: [
          "Drive to Udaipur",
          "City Palace visit",
          "Lake Pichola boat ride",
          "Sunset at Lake Palace"
        ]
      },
      {
        day: 5,
        title: "Udaipur Exploration",
        activities: [
          "Jag Mandir visit",
          "Saheliyon ki Bari",
          "Traditional craft workshop",
          "Cultural dance performance"
        ]
      },
      {
        day: 6,
        title: "Udaipur to Jaisalmer",
        activities: [
          "Drive to Jaisalmer",
          "Golden Fort visit",
          "Desert safari preparation",
          "Evening in desert camp"
        ]
      },
      {
        day: 7,
        title: "Desert Experience",
        activities: [
          "Camel safari",
          "Desert activities",
          "Folk music and dance",
          "Departure"
        ]
      }
    ]
  },
  {
    name: "Goa Beach Paradise",
    description: "Relax and unwind on the beautiful beaches of Goa. Enjoy water sports, nightlife, and the laid-back Goan lifestyle with delicious seafood and Portuguese heritage.",
    price: 15000,
    originalPrice: 18000,
    discount: 17,
    duration: "5 days 4 nights",
    location: "North Goa, South Goa",
    difficulty: "Easy",
    groupSize: "15",
    category: "Beach",
    rating: 4.5,
    reviewCount: 203,
    bestTimeToVisit: "October to May",
    ageRestriction: "No restriction",
    fitnessLevel: "Easy",
    languages: "English, Hindi, Konkani, Portuguese",
    features: "Beachfront accommodation, Water sports, Nightlife tours, Seafood dinners, Heritage walks",
    highlights: "Beach hopping, Water sports, Portuguese architecture, Nightlife, Seafood cuisine",
    inclusions: "Beach resort stay, Breakfast, Water sports, Heritage tours, Transport",
    exclusions: "Lunch and dinner, Personal expenses, Alcohol, Tips",
    whatToBring: "Beachwear, Sunscreen, Camera, Comfortable clothes, Valid ID",
    cancellationPolicy: "Free cancellation up to 3 days before departure. 50% refund for cancellations 1-3 days before. No refund for same day cancellations.",
    ownerPhone: "9876543214",
    tags: "goa, beaches, water sports, nightlife, seafood, portuguese",
    isFeatured: false,
    isActive: true,
    payAtPickup: false,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Goa",
        activities: [
          "Airport pickup and resort check-in",
          "Beach orientation",
          "Evening at Calangute Beach",
          "Welcome dinner"
        ]
      },
      {
        day: 2,
        title: "North Goa Beaches",
        activities: [
          "Baga Beach water sports",
          "Anjuna Beach visit",
          "Vagator Beach sunset",
          "Nightlife at Tito's"
        ]
      },
      {
        day: 3,
        title: "South Goa Exploration",
        activities: [
          "Palolem Beach visit",
          "Colva Beach relaxation",
          "Portuguese heritage walk",
          "Seafood dinner"
        ]
      },
      {
        day: 4,
        title: "Adventure and Culture",
        activities: [
          "Dudhsagar Waterfalls",
          "Spice plantation tour",
          "Old Goa churches",
          "Cultural evening"
        ]
      },
      {
        day: 5,
        title: "Departure",
        activities: [
          "Last beach visit",
          "Shopping at markets",
          "Resort checkout",
          "Airport drop-off"
        ]
      }
    ]
  },
  {
    name: "Kashmir Valley Explorer",
    description: "Discover the breathtaking beauty of Kashmir with its pristine lakes, snow-capped mountains, and lush valleys. Experience the 'Paradise on Earth' in all its glory.",
    price: 32000,
    originalPrice: 38000,
    discount: 16,
    duration: "6 days 5 nights",
    location: "Srinagar, Gulmarg, Pahalgam, Sonamarg",
    difficulty: "Moderate",
    groupSize: "10",
    category: "Nature",
    rating: 4.9,
    reviewCount: 78,
    bestTimeToVisit: "April to October",
    ageRestriction: "12+ years",
    fitnessLevel: "Moderate",
    languages: "English, Hindi, Kashmiri",
    features: "Houseboat stay, Gondola ride, Shikara ride, Garden visits, Traditional Kashmiri meals",
    highlights: "Dal Lake houseboat, Gulmarg gondola, Pahalgam valleys, Mughal gardens, Shikara rides",
    inclusions: "Houseboat accommodation, All meals, Gondola tickets, Garden entry fees, Transport",
    exclusions: "Airport transfers, Personal expenses, Shopping, Tips",
    whatToBring: "Warm clothing, Camera, Comfortable shoes, Sunscreen, Valid ID",
    cancellationPolicy: "Free cancellation up to 7 days before departure. 30% refund for cancellations 3-7 days before. No refund for cancellations less than 3 days before.",
    ownerPhone: "9876543215",
    tags: "kashmir, dal lake, gulmarg, pahalgam, houseboat, nature",
    isFeatured: true,
    isActive: true,
    payAtPickup: false,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Srinagar",
        activities: [
          "Airport pickup and houseboat check-in",
          "Dal Lake orientation",
          "Shikara ride on Dal Lake",
          "Traditional Kashmiri dinner"
        ]
      },
      {
        day: 2,
        title: "Srinagar City Tour",
        activities: [
          "Mughal Gardens visit",
          "Hazratbal Shrine",
          "Local market shopping",
          "Evening Shikara ride"
        ]
      },
      {
        day: 3,
        title: "Gulmarg Adventure",
        activities: [
          "Drive to Gulmarg",
          "Gondola cable car ride",
          "Mountain views and photography",
          "Return to Srinagar"
        ]
      },
      {
        day: 4,
        title: "Pahalgam Valley",
        activities: [
          "Drive to Pahalgam",
          "Betaab Valley visit",
          "Aru Valley exploration",
          "Lidder River walk"
        ]
      },
      {
        day: 5,
        title: "Sonamarg Experience",
        activities: [
          "Drive to Sonamarg",
          "Thajiwas Glacier visit",
          "Meadow walks",
          "Return to Srinagar"
        ]
      },
      {
        day: 6,
        title: "Departure",
        activities: [
          "Final Shikara ride",
          "Last minute shopping",
          "Houseboat checkout",
          "Airport drop-off"
        ]
      }
    ]
  },
  {
    name: "Spiritual Varanasi Journey",
    description: "Experience the spiritual essence of India in Varanasi, the oldest living city. Witness ancient rituals, Ganga Aarti, and explore the spiritual heart of Hinduism.",
    price: 12000,
    originalPrice: 15000,
    discount: 20,
    duration: "4 days 3 nights",
    location: "Varanasi, Sarnath",
    difficulty: "Easy",
    groupSize: "12",
    category: "Spiritual",
    rating: 4.4,
    reviewCount: 92,
    bestTimeToVisit: "October to March",
    ageRestriction: "No restriction",
    fitnessLevel: "Easy",
    languages: "English, Hindi, Sanskrit",
    features: "Ganga Aarti ceremony, Temple visits, Boat rides, Spiritual guidance, Traditional meals",
    highlights: "Ganga Aarti, Ghats exploration, Sarnath visit, Temple tours, Spiritual experiences",
    inclusions: "Hotel accommodation, All meals, Temple entry fees, Boat rides, Guide services",
    exclusions: "Personal expenses, Camera fees, Tips, Donations",
    whatToBring: "Modest clothing, Camera, Comfortable shoes, Respectful attitude, Valid ID",
    cancellationPolicy: "Free cancellation up to 5 days before departure. 25% refund for cancellations 2-5 days before. No refund for cancellations less than 2 days before.",
    ownerPhone: "9876543216",
    tags: "varanasi, spiritual, ganga, temples, sarnath, hinduism",
    isFeatured: false,
    isActive: true,
    payAtPickup: false,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Varanasi",
        activities: [
          "Airport pickup and hotel check-in",
          "Ghats orientation walk",
          "Evening Ganga Aarti",
          "Traditional dinner"
        ]
      },
      {
        day: 2,
        title: "Varanasi Ghats",
        activities: [
          "Early morning boat ride",
          "Dashashwamedh Ghat visit",
          "Manikarnika Ghat exploration",
          "Temple visits"
        ]
      },
      {
        day: 3,
        title: "Sarnath Excursion",
        activities: [
          "Drive to Sarnath",
          "Dhamek Stupa visit",
          "Buddhist temple tour",
          "Return to Varanasi"
        ]
      },
      {
        day: 4,
        title: "Spiritual Experience",
        activities: [
          "Morning prayers and rituals",
          "Final Ghat visit",
          "Spiritual shopping",
          "Departure"
        ]
      }
    ]
  },
  {
    name: "Ladakh Adventure Quest",
    description: "Embark on an epic adventure to the high-altitude desert of Ladakh. Experience unique landscapes, Buddhist monasteries, and the thrill of high-altitude travel.",
    price: 45000,
    originalPrice: 50000,
    discount: 10,
    duration: "9 days 8 nights",
    location: "Leh, Nubra Valley, Pangong Lake",
    difficulty: "Challenging",
    groupSize: "8",
    category: "Adventure",
    rating: 4.8,
    reviewCount: 45,
    bestTimeToVisit: "May to September",
    ageRestriction: "16+ years",
    fitnessLevel: "Challenging",
    languages: "English, Hindi, Ladakhi",
    features: "High-altitude acclimatization, Monastery visits, Desert camping, Adventure activities, Cultural immersion",
    highlights: "Pangong Lake, Nubra Valley, Buddhist monasteries, High-altitude passes, Desert landscapes",
    inclusions: "Accommodation, All meals, Monastery entry fees, Adventure activities, Transport, Guide",
    exclusions: "Flight to Leh, Personal expenses, Travel insurance, Tips",
    whatToBring: "Warm clothing, Sunglasses, Camera, Medications, Comfortable shoes",
    cancellationPolicy: "Free cancellation up to 15 days before departure. 20% refund for cancellations 7-15 days before. No refund for cancellations less than 7 days before.",
    ownerPhone: "9876543217",
    tags: "ladakh, pangong, nubra valley, monasteries, high altitude, adventure",
    isFeatured: true,
    isActive: true,
    payAtPickup: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Leh",
        activities: [
          "Airport pickup and hotel check-in",
          "Acclimatization rest",
          "Leh market visit",
          "Evening briefing"
        ]
      },
      {
        day: 2,
        title: "Leh Acclimatization",
        activities: [
          "Shanti Stupa visit",
          "Leh Palace exploration",
          "Local market shopping",
          "Cultural evening"
        ]
      },
      {
        day: 3,
        title: "Leh to Nubra Valley",
        activities: [
          "Drive via Khardung La Pass",
          "Nubra Valley arrival",
          "Sand dunes visit",
          "Camel ride experience"
        ]
      },
      {
        day: 4,
        title: "Nubra Valley Exploration",
        activities: [
          "Diskit Monastery visit",
          "Hunder village tour",
          "Desert activities",
          "Local interaction"
        ]
      },
      {
        day: 5,
        title: "Nubra to Pangong",
        activities: [
          "Drive to Pangong Lake",
          "Lake exploration",
          "Photography session",
          "Camping by the lake"
        ]
      },
      {
        day: 6,
        title: "Pangong Lake",
        activities: [
          "Sunrise at Pangong",
          "Lake activities",
          "Bird watching",
          "Evening relaxation"
        ]
      },
      {
        day: 7,
        title: "Pangong to Leh",
        activities: [
          "Return drive to Leh",
          "Rest and relaxation",
          "Local market visit",
          "Cultural dinner"
        ]
      },
      {
        day: 8,
        title: "Leh Monasteries",
        activities: [
          "Hemis Monastery visit",
          "Thiksey Monastery tour",
          "Shey Palace exploration",
          "Final shopping"
        ]
      },
      {
        day: 9,
        title: "Departure",
        activities: [
          "Hotel checkout",
          "Last minute shopping",
          "Airport drop-off",
          "End of adventure"
        ]
      }
    ]
  },
  {
    name: "Tamil Nadu Temple Trail",
    description: "Explore the magnificent temples and rich cultural heritage of Tamil Nadu. Visit ancient Dravidian temples, experience traditional arts, and savor authentic South Indian cuisine.",
    price: 22000,
    originalPrice: 26000,
    discount: 15,
    duration: "6 days 5 nights",
    location: "Chennai, Mahabalipuram, Kanchipuram, Madurai",
    difficulty: "Moderate",
    groupSize: "12",
    category: "Cultural",
    rating: 4.3,
    reviewCount: 67,
    bestTimeToVisit: "October to March",
    ageRestriction: "No restriction",
    fitnessLevel: "Moderate",
    languages: "English, Tamil, Hindi",
    features: "Temple visits, Cultural performances, Traditional meals, Heritage walks, Art workshops",
    highlights: "Mahabalipuram temples, Kanchipuram silk, Madurai Meenakshi, Tanjore paintings, Traditional dance",
    inclusions: "Hotel accommodation, All meals, Temple entry fees, Cultural shows, Transport, Guide",
    exclusions: "Personal expenses, Camera fees, Shopping, Tips",
    whatToBring: "Modest clothing, Camera, Comfortable shoes, Sunscreen, Valid ID",
    cancellationPolicy: "Free cancellation up to 7 days before departure. 35% refund for cancellations 3-7 days before. No refund for cancellations less than 3 days before.",
    ownerPhone: "9876543218",
    tags: "tamil nadu, temples, mahabalipuram, kanchipuram, madurai, culture",
    isFeatured: false,
    isActive: true,
    payAtPickup: false,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Chennai",
        activities: [
          "Airport pickup and hotel check-in",
          "Chennai city tour",
          "Kapaleeshwarar Temple visit",
          "Traditional dinner"
        ]
      },
      {
        day: 2,
        title: "Chennai to Mahabalipuram",
        activities: [
          "Drive to Mahabalipuram",
          "Shore Temple visit",
          "Five Rathas exploration",
          "Arjuna's Penance relief"
        ]
      },
      {
        day: 3,
        title: "Mahabalipuram to Kanchipuram",
        activities: [
          "Drive to Kanchipuram",
          "Kamakshi Amman Temple",
          "Varadaraja Perumal Temple",
          "Silk weaving demonstration"
        ]
      },
      {
        day: 4,
        title: "Kanchipuram to Madurai",
        activities: [
          "Drive to Madurai",
          "Meenakshi Amman Temple",
          "Thirumalai Nayak Palace",
          "Evening temple ceremony"
        ]
      },
      {
        day: 5,
        title: "Madurai Exploration",
        activities: [
          "Gandhi Museum visit",
          "Traditional art workshop",
          "Local market shopping",
          "Cultural dance performance"
        ]
      },
      {
        day: 6,
        title: "Departure",
        activities: [
          "Final temple visit",
          "Last minute shopping",
          "Hotel checkout",
          "Airport drop-off"
        ]
      }
    ]
  },
  {
    name: "Himachal Hill Station Retreat",
    description: "Escape to the cool hill stations of Himachal Pradesh. Experience the charm of Shimla, Manali, and Dharamshala with their colonial architecture, scenic beauty, and adventure activities.",
    price: 19000,
    originalPrice: 23000,
    discount: 17,
    duration: "5 days 4 nights",
    location: "Shimla, Manali, Dharamshala",
    difficulty: "Easy",
    groupSize: "14",
    category: "Nature",
    rating: 4.6,
    reviewCount: 112,
    bestTimeToVisit: "March to November",
    ageRestriction: "No restriction",
    fitnessLevel: "Easy",
    languages: "English, Hindi, Pahari",
    features: "Hill station accommodation, Scenic drives, Adventure activities, Local cuisine, Cultural experiences",
    highlights: "Shimla Mall Road, Manali Solang Valley, Dharamshala monasteries, Toy train ride, Adventure sports",
    inclusions: "Hotel accommodation, All meals, Adventure activities, Transport, Guide services",
    exclusions: "Personal expenses, Shopping, Tips, Optional activities",
    whatToBring: "Warm clothing, Comfortable shoes, Camera, Sunscreen, Valid ID",
    cancellationPolicy: "Free cancellation up to 5 days before departure. 40% refund for cancellations 2-5 days before. No refund for cancellations less than 2 days before.",
    ownerPhone: "9876543219",
    tags: "himachal, shimla, manali, dharamshala, hill stations, mountains",
    isFeatured: false,
    isActive: true,
    payAtPickup: false,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Shimla",
        activities: [
          "Airport pickup and hotel check-in",
          "Mall Road walk",
          "Christ Church visit",
          "Evening at Ridge"
        ]
      },
      {
        day: 2,
        title: "Shimla Exploration",
        activities: [
          "Kufri visit",
          "Toy train experience",
          "Jakhu Temple",
          "Local market shopping"
        ]
      },
      {
        day: 3,
        title: "Shimla to Manali",
        activities: [
          "Drive to Manali",
          "Hadimba Temple visit",
          "Manali market",
          "Evening relaxation"
        ]
      },
      {
        day: 4,
        title: "Manali Adventure",
        activities: [
          "Solang Valley visit",
          "Adventure activities",
          "Rohtang Pass (if accessible)",
          "Local cuisine experience"
        ]
      },
      {
        day: 5,
        title: "Departure",
        activities: [
          "Final mountain views",
          "Last minute shopping",
          "Hotel checkout",
          "Airport drop-off"
        ]
      }
    ]
  }
];

// Function to add dummy tours
const addDummyTours = async () => {
  try {
    console.log('🚀 Starting to add dummy tours...');
    
    // Clear existing tours (optional - remove this if you want to keep existing data)
    // await Tour.deleteMany({});
    // console.log('🗑️  Cleared existing tours');
    
    // Add dummy tours
    const createdTours = await Tour.insertMany(dummyTours);
    console.log(`✅ Successfully added ${createdTours.length} dummy tours!`);
    
    // Display summary
    console.log('\n📊 Tour Summary:');
    createdTours.forEach((tour, index) => {
      console.log(`${index + 1}. ${tour.name} - ₹${tour.price} (${tour.category})`);
    });
    
    console.log('\n🎉 All dummy tours have been added successfully!');
    console.log('💡 You can now update tour images through the admin panel.');
    
  } catch (error) {
    console.error('❌ Error adding dummy tours:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await addDummyTours();
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
main();
