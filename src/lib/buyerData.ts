// Demo buyer data for the tiered dashboard system

export interface Buyer {
  id: string;
  name: string;
  location: string;
  locationIcon: string;
  score: number;
  budget: string;
  bedrooms: string;
  timeline: string;
  paymentMethod: 'cash' | 'mortgage';
  priority: 'P1-Urgent' | 'P1-High Intent' | 'P2-Qualified' | 'P3-Nurture';
  purpose: 'Investment' | 'Primary Home' | 'For Child' | 'Holiday Home';
  preferredAreas: string[];
  contactsRemaining: number;
  lastActive: Date;
  avatar?: string;
  isFirstRefusal?: boolean;
  // Contact information
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  preferred_contact_method?: 'email' | 'whatsapp' | 'both';
  contactsCount?: number; // how many users have contacted this buyer, max 4
}

export interface Conversation {
  id: string;
  buyer: Buyer;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: Date;
  unread: boolean;
  status: 'awaiting_response' | 'buyer_responded' | 'no_response' | 'closed';
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'buyer';
  delivered?: boolean;
  read?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'Meta Ads' | 'Google Ads' | 'LinkedIn';
  targetLocation: string;
  status: 'active' | 'paused' | 'completed';
  leads: number;
  spend: number;
  costPerLead: number;
  startDate: Date;
  endDate?: Date;
}

// Generate demo buyers with different score ranges
const generateBuyers = (): Buyer[] => {
  const names = [
    'James Wilson', 'Sarah Chen', 'Mohammed Al-Rashid', 'Emma Thompson',
    'David Okonkwo', 'Priya Patel', 'Oliver Brown', 'Fatima Hassan',
    'Michael Johnson', 'Sophie Williams', 'Ahmed Khan', 'Jennifer Lee',
    'Robert Davis', 'Aisha Mohammed', 'Thomas Anderson', 'Maria Garcia',
    'William Taylor', 'Zara Hussain', 'Daniel Martinez', 'Lisa Wong',
    'Christopher Lee', 'Anna Kowalski', 'Richard Miller', 'Helen Zhang'
  ];

  const locations = [
    'London, UK', 'Dubai, UAE', 'Lagos, Nigeria', 'Singapore',
    'Hong Kong', 'Manchester, UK', 'New York, USA', 'Mumbai, India',
    'Toronto, Canada', 'Sydney, Australia', 'Birmingham, UK', 'Riyadh, Saudi Arabia'
  ];

  const budgets = [
    '£400K-600K', '£600K-800K', '£800K-1M', '£1M-1.5M', '£1.5M-2M', '£2M+'
  ];

  const bedrooms = ['1 Bed', '2 Bed', '3 Bed', '4+ Bed'];
  
  const timelines = ['Within 28 days', '0-3 months', '3-6 months', '6-12 months'];
  
  const purposes: Buyer['purpose'][] = ['Investment', 'Primary Home', 'For Child', 'Holiday Home'];
  
  const areas = [
    'Canary Wharf', 'Chelsea', 'Kensington', 'Shoreditch', 'Mayfair',
    'Battersea', 'Greenwich', 'Stratford', 'Wimbledon', 'Richmond'
  ];

  return names.map((name, index) => {
    const score = Math.floor(Math.random() * 60) + 30; // 30-90
    let priority: Buyer['priority'];
    if (score >= 80) priority = 'P1-Urgent';
    else if (score >= 70) priority = 'P1-High Intent';
    else if (score >= 50) priority = 'P2-Qualified';
    else priority = 'P3-Nurture';

    // Generate contact info
    const firstName = name.split(' ')[0].toLowerCase();
    const lastName = name.split(' ')[1]?.[0]?.toLowerCase() || 'x';
    const hasEmail = Math.random() > 0.1; // 90% have email
    const hasPhone = Math.random() > 0.3; // 70% have phone
    const hasWhatsApp = hasPhone && Math.random() > 0.4; // 60% of those with phone have WhatsApp
    
    // Determine preferred contact method based on available channels
    let preferred_contact_method: Buyer['preferred_contact_method'];
    if (hasEmail && hasWhatsApp) {
      preferred_contact_method = Math.random() > 0.5 ? 'both' : (Math.random() > 0.5 ? 'email' : 'whatsapp');
    } else if (hasEmail) {
      preferred_contact_method = 'email';
    } else if (hasWhatsApp) {
      preferred_contact_method = 'whatsapp';
    }

    return {
      id: `buyer_${index + 1}`,
      name,
      location: locations[index % locations.length],
      locationIcon: '📍',
      score,
      budget: budgets[Math.floor(Math.random() * budgets.length)],
      bedrooms: bedrooms[Math.floor(Math.random() * bedrooms.length)],
      timeline: timelines[Math.floor(Math.random() * timelines.length)],
      paymentMethod: (Math.random() > 0.4 ? 'cash' : 'mortgage') as 'cash' | 'mortgage',
      priority,
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      preferredAreas: [areas[Math.floor(Math.random() * areas.length)], areas[Math.floor(Math.random() * areas.length)]],
      contactsRemaining: Math.floor(Math.random() * 4) + 1,
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      isFirstRefusal: score >= 80,
      // Contact information
      email: hasEmail ? `${firstName}.${lastName}@example.com` : undefined,
      phone: hasPhone ? `+447700900${(100 + index).toString().padStart(3, '0')}` : undefined,
      whatsapp_number: hasWhatsApp ? `+447700900${(100 + index).toString().padStart(3, '0')}` : undefined,
      preferred_contact_method,
      contactsCount: Math.floor(Math.random() * 4), // 0-3 contacts already made
    };
  }).sort((a, b) => b.score - a.score);
};

export const demoBuyers = generateBuyers();

// Filter buyers by tier
export const getBuyersByTier = (tier: 'access' | 'growth' | 'enterprise'): Buyer[] => {
  switch (tier) {
    case 'access':
      return demoBuyers.filter(b => b.score >= 50 && b.score < 70);
    case 'growth':
      return demoBuyers.filter(b => b.score >= 50);
    case 'enterprise':
      return demoBuyers;
  }
};

export const getFirstRefusalBuyers = (): Buyer[] => {
  return demoBuyers.filter(b => b.score >= 80);
};

// Generate demo conversations
export const generateConversations = (buyers: Buyer[]): Conversation[] => {
  const sampleMessages = [
    "Hi, I'm interested in the 2-bed apartments at Canary Wharf. Can you tell me more about the prices?",
    "Thank you for the information. I'd like to schedule a viewing if possible.",
    "What's the expected completion date for this development?",
    "Are there any investment properties with guaranteed rental yields?",
    "I'm looking for something with good transport links to the City.",
  ];

  return buyers.slice(0, 8).map((buyer, index) => {
    const messageCount = Math.floor(Math.random() * 5) + 2;
    const messages: Message[] = [];
    
    for (let i = 0; i < messageCount; i++) {
      messages.push({
        id: `msg_${buyer.id}_${i}`,
        content: i % 2 === 0 
          ? sampleMessages[i % sampleMessages.length]
          : "Thanks for your message. I'll send you the details shortly.",
        timestamp: new Date(Date.now() - (messageCount - i) * 3600000),
        sender: i % 2 === 0 ? 'buyer' : 'user',
        delivered: true,
        read: i < messageCount - 1,
      });
    }

    const statuses: Conversation['status'][] = ['awaiting_response', 'buyer_responded', 'no_response', 'closed'];

    return {
      id: `conv_${buyer.id}`,
      buyer,
      messages,
      lastMessage: messages[messages.length - 1].content,
      lastMessageTime: messages[messages.length - 1].timestamp,
      unread: Math.random() > 0.6,
      status: statuses[index % statuses.length],
    };
  });
};

export const demoConversations = generateConversations(demoBuyers);

// Generate demo campaigns
export const demoCampaigns: Campaign[] = [
  {
    id: 'camp_1',
    name: 'London HNWI Investors',
    platform: 'Meta Ads',
    targetLocation: 'London, UK',
    status: 'active',
    leads: 47,
    spend: 2340,
    costPerLead: 49.79,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'camp_2',
    name: 'Dubai Cash Buyers',
    platform: 'Meta Ads',
    targetLocation: 'Dubai, UAE',
    status: 'active',
    leads: 32,
    spend: 1890,
    costPerLead: 59.06,
    startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'camp_3',
    name: 'Nigeria First-Time Buyers',
    platform: 'Google Ads',
    targetLocation: 'Lagos, Nigeria',
    status: 'paused',
    leads: 18,
    spend: 980,
    costPerLead: 54.44,
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'camp_4',
    name: 'Singapore Investors',
    platform: 'LinkedIn',
    targetLocation: 'Singapore',
    status: 'completed',
    leads: 24,
    spend: 1450,
    costPerLead: 60.42,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];

// Account manager data (Tier 3 only)
export const accountManager = {
  name: 'Alex Thompson',
  title: 'Senior Account Manager',
  avatar: 'AT',
  phone: '+44 20 7946 0958',
  email: 'alex.thompson@naybourhood.ai',
  whatsapp: '+447946095800',
  availability: 'Mon-Fri, 9am-6pm GMT',
};

// Stats calculation helpers
export const calculateStats = (tier: 'access' | 'growth' | 'enterprise') => {
  const buyers = getBuyersByTier(tier);
  const contacted = Math.floor(buyers.length * 0.3);
  const responses = Math.floor(contacted * 0.45);
  const viewings = Math.floor(responses * 0.35);
  
  return {
    availableBuyers: buyers.length,
    buyersContacted: contacted,
    responses,
    responseRate: Math.round((responses / contacted) * 100),
    viewingsBooked: viewings,
    conversionRate: Math.round((viewings / responses) * 100),
    campaignLeads: demoCampaigns.filter(c => c.status === 'active').reduce((sum, c) => sum + c.leads, 0),
    activeCampaigns: demoCampaigns.filter(c => c.status === 'active').length,
    firstRefusalCount: getFirstRefusalBuyers().length,
  };
};

// Score breakdown for Tier 2+ display
export const getScoreBreakdown = (buyer: Buyer) => {
  const breakdown = {
    timeline: 0,
    paymentMethod: 0,
    purpose: 0,
    budgetMatch: 0,
    engagement: 0,
  };

  // Timeline scoring
  if (buyer.timeline === 'Within 28 days') breakdown.timeline = 30;
  else if (buyer.timeline === '0-3 months') breakdown.timeline = 24;
  else if (buyer.timeline === '3-6 months') breakdown.timeline = 15;
  else breakdown.timeline = 8;

  // Payment method
  breakdown.paymentMethod = buyer.paymentMethod === 'cash' ? 20 : 12;

  // Purpose
  if (buyer.purpose === 'Investment') breakdown.purpose = 18;
  else if (buyer.purpose === 'Primary Home') breakdown.purpose = 15;
  else breakdown.purpose = 10;

  // Budget match (simulated)
  breakdown.budgetMatch = Math.floor(Math.random() * 10) + 10;

  // Engagement (simulated)
  breakdown.engagement = buyer.score - breakdown.timeline - breakdown.paymentMethod - breakdown.purpose - breakdown.budgetMatch;
  breakdown.engagement = Math.max(0, breakdown.engagement);

  return breakdown;
};
