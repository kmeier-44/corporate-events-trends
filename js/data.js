// Corporate Events Booking Trends 2022-2025
// Data extracted from Hire Space MongoDB (March 2026)
// Monetary values from won booking lines summed per won booking (99.5% coverage)
// Currency: GBP (localPrice converted via FX rates where price field empty)
// Numbers shown as proportions/indexes where competitively sensitive
// Non-corporate categories (birthday parties, weddings) excluded
// NOTE: Switched from Snowflake CONTRACT (20% coverage) to booking lines (99.5%)
//       in March 2026 for better statistical representation across all event sizes

const DATA = {

  // -- Booking Values (sum of won booking line prices per booking, GBP) --
  bookingValues: {
    years: [2022, 2023, 2024, 2025],
    median: [2303, 3801, 4150, 6000],
    p25: [609, 1000, 1122, 1324],
    p75: [8814, 11560, 13760, 18053],
    indexMedian: [61, 100, 109, 158] // 2023 = 100
  },

  // -- Booking Values by Event Type --
  valuesByCategory: [
    { category: 'Award Ceremony', median: 18900 },
    { category: 'Christmas Party', median: 12150 },
    { category: 'Conference', median: 10001 },
    { category: 'Gala Dinner', median: 8437 },
    { category: 'Summer Party', median: 8073 },
    { category: 'Networking', median: 7895 },
    { category: 'Exhibition', median: 4822 },
    { category: 'Private Dining', median: 3543 },
    { category: 'Pop-Up', median: 2408 },
    { category: 'Presentation', median: 2290 },
    { category: 'Corporate Party', median: 2110 },
    { category: 'Private Event', median: 1800 },
    { category: 'Ticketed Event', median: 1431 },
    { category: 'Product Launch', median: 1303 },
    { category: 'Screening', median: 1000 },
    { category: 'Meeting', median: 905 }
  ],

  // -- Price Per Head --
  pricePerHead: {
    years: [2022, 2023, 2024, 2025],
    median: [53, 70, 74, 89],
    byCategory: [
      { category: 'Christmas Party', median: 112 },
      { category: 'Private Dining', median: 103 },
      { category: 'Award Ceremony', median: 94 },
      { category: 'Conference', median: 91 },
      { category: 'Networking', median: 89 },
      { category: 'Summer Party', median: 83 },
      { category: 'Exhibition', median: 55 },
      { category: 'Meeting', median: 54 },
      { category: 'Pop-Up', median: 42 },
      { category: 'Gala Dinner', median: 42 },
      { category: 'Private Event', median: 36 },
      { category: 'Presentation', median: 34 },
      { category: 'Corporate Party', median: 30 },
      { category: 'Screening', median: 30 },
      { category: 'Product Launch', median: 27 },
      { category: 'Ticketed Event', median: 20 }
    ]
  },

  // -- Lead Times --
  leadTimes: {
    years: [2022, 2023, 2024, 2025],
    median: [57, 71, 80, 79],
    p25: [28, 34, 41, 34],
    p75: [111, 125, 147, 149],
    byCategory: [
      { category: 'Award Ceremony', median: 113, median2022: null, p25: 60, p75: 223 },
      { category: 'Summer Party', median: 90, median2022: null, p25: 51, p75: 141 },
      { category: 'Christmas Party', median: 89, median2022: null, p25: 55, p75: 152 },
      { category: 'Networking', median: 84, median2022: null, p25: 41, p75: 158 },
      { category: 'Conference', median: 80, median2022: null, p25: 40, p75: 152 },
      { category: 'Gala Dinner', median: 66, median2022: null, p25: 28, p75: 144 },
      { category: 'Private Dining', median: 54, median2022: null, p25: 25, p75: 100 },
      { category: 'Corporate Party', median: 52, median2022: null, p25: 26, p75: 96 },
      { category: 'Pop-Up', median: 39, median2022: null, p25: 15, p75: 87 },
      { category: 'Meeting', median: 23, median2022: null, p25: 9, p75: 54 }
    ],
    // Earlier bookings convert better
    conversionByLeadTime: [
      { bucket: 'Under 2 weeks', pct: 9.6 },
      { bucket: '2-4 weeks', pct: 12.4 },
      { bucket: '1-2 months', pct: 24.3 },
      { bucket: '2-3 months', pct: 36.1 },
      { bucket: '3-6 months', pct: 43.5 },
      { bucket: '6+ months', pct: 44.0 }
    ]
  },

  // -- Market Volume (total corporate enquiries + won bookings, 2022=100) --
  marketVolume: {
    years: [2022, 2023, 2024, 2025],
    enquiryIndex: [100, 83, 100, 178],   // Total corporate enquiries
    wonIndex: [100, 94, 114, 102]         // Total won corporate bookings
  },

  // -- Category Trends (volume indexes, 2022=100) --
  // Enquiry volume index shows absolute growth/decline per event type
  // Won volume index shows confirmed booking growth/decline
  categoryMix: {
    years: [2022, 2023, 2024, 2025],
    // Enquiry volume index (2022 = 100) — all bookings, not just won
    enquiryIndex: {
      'Conference':      [100, 103, 131, 95],
      'Corporate Party': [100, 121, 152, 184],
      'Meeting':         [100, 77, 83, 135],
      'Christmas Party': [100, 112, 101, 103],
      'Networking':      [100, 68, 54, 173],
      'Summer Party':    [100, 85, 177, 185],
      'Private Dining':  [100, 78, 128, 131],
      'Award Ceremony':  [100, 173, 344, 338]
    },
    // Won booking volume index (2022 = 100) — confirmed bookings only
    wonIndex: {
      'Conference':      [100, 114, 155, 126],
      'Corporate Party': [100, 101, 121, 107],
      'Meeting':         [100, 97, 114, 89],
      'Christmas Party': [100, 157, 132, 142],
      'Networking':      [100, 88, 114, 100],
      'Summer Party':    [100, 69, 166, 100],
      'Private Dining':  [100, 95, 210, 133],
      'Award Ceremony':  [100, 173, 282, 173]
    }
  },

  // -- Seasonality --
  seasonality: {
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    overall: [6.0, 7.1, 8.3, 6.2, 6.8, 9.3, 7.3, 4.3, 9.8, 9.7, 11.6, 13.4],
    byType: {
      'Conference':      [5, 7, 11, 7, 7, 10, 6, 3, 11, 13, 13, 7],
      'Christmas Party': [2, 1, 1, 0, 0, 1, 1, 0, 1, 1, 6, 87],
      'Summer Party':    [1, 2, 1, 1, 6, 25, 33, 14, 11, 3, 2, 1],
      'Corporate Party': [6, 8, 8, 7, 9, 10, 9, 6, 12, 9, 11, 6]
    },
    // When bookings are confirmed (close month distribution %)
    closeByType: {
      'Conference':      [10.6, 8.6, 8.8, 7.7, 8.0, 7.3, 9.6, 8.6, 8.3, 8.4, 7.5, 6.7],
      'Christmas Party': [3.5, 2.1, 4.3, 4.3, 3.8, 5.0, 9.3, 11.5, 19.2, 22.2, 12.6, 2.2],
      'Summer Party':    [9.2, 10.7, 15.5, 16.7, 15.2, 12.5, 7.4, 5.1, 2.4, 1.8, 2.4, 1.2],
      'Corporate Party': [12.0, 9.2, 6.8, 8.5, 9.4, 7.6, 8.0, 8.9, 8.8, 9.3, 6.6, 5.1]
    }
  },

  // -- Day of Week --
  dayOfWeek: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pcts: [8.6, 14.9, 18.8, 23.7, 14.5, 14.9, 4.6]
  },

  // -- Venue Shopping --
  venueShopping: {
    years: [2022, 2023, 2024, 2025],
    avgVenues: [2.8, 3.4, 3.4, 3.5],
    multiVenuePct: [36, 38, 35, 32]
  },

  // -- Group Sizes --
  groupSizes: {
    years: [2022, 2023, 2024, 2025],
    median: [50, 55, 60, 70],
    p25: [20, 20, 25, 25],
    p75: [120, 120, 120, 150],
    byCategory: [
      { category: 'Award Ceremony', median: 120 },
      { category: 'Gala Dinner', median: 100 },
      { category: 'Summer Party', median: 100 },
      { category: 'Christmas Party', median: 100 },
      { category: 'Networking', median: 80 },
      { category: 'Conference', median: 80 },
      { category: 'Corporate Party', median: 50 },
      { category: 'Pop-Up', median: 30 },
      { category: 'Private Dining', median: 27 },
      { category: 'Meeting', median: 15 }
    ]
  },

  // -- Venue Type Pricing (confirmed bookings) --
  venueTypePricing: [
    { type: 'Historic / Landmark', median: 10852 },
    { type: 'Theatre', median: 9697 },
    { type: 'Outdoor', median: 7550 },
    { type: 'Rooftop', median: 6825 },
    { type: 'Conference Centre', median: 6825 },
    { type: 'Bar', median: 5246 },
    { type: 'Hotel', median: 4688 },
    { type: 'Restaurant', median: 4059 },
    { type: 'Meeting Rooms', median: 1797 }
  ],

  // -- Venue Type Confirmed (volume index, 2022=100, won bookings with venue type) --
  venueTypeConfirmed: {
    years: [2022, 2023, 2024, 2025],
    types: [
      { type: 'Hotel', index: [100, 128, 156, 161] },
      { type: 'Conference Centre', index: [100, 113, 147, 138] },
      { type: 'Bar', index: [100, 89, 138, 143] },
      { type: 'Rooftop', index: [100, 109, 155, 134] },
      { type: 'Restaurant', index: [100, 102, 136, 136] },
      { type: 'Outdoor', index: [100, 122, 151, 133] },
      { type: 'Historic / Landmark', index: [100, 114, 144, 124] },
      { type: 'Meeting Rooms', index: [100, 103, 124, 104] }
    ]
  },

  // -- Venue Type Enquiry (volume index, 2022=100, all enquiry lines with venue type) --
  // Note: total enquiry line volume declined to index 83 by 2025 — types above 83 are gaining share
  venueTypeEnquiry: {
    years: [2022, 2023, 2024, 2025],
    marketIndex: [100, 87, 84, 83],  // Total enquiry line volume reference
    types: [
      { type: 'Hotel', index: [100, 103, 104, 119] },
      { type: 'Restaurant', index: [100, 87, 88, 118] },
      { type: 'Rooftop', index: [100, 87, 96, 107] },
      { type: 'Bar', index: [100, 81, 80, 105] },
      { type: 'Conference Centre', index: [100, 104, 104, 99] },
      { type: 'Meeting Rooms', index: [100, 96, 98, 97] },
      { type: 'Outdoor', index: [100, 85, 85, 89] },
      { type: 'Historic / Landmark', index: [100, 99, 91, 77] }
    ]
  },

  // -- Venue Co-Occurrence --
  coOccurrence: [
    { type: 'Hotel', alsoWith: [
      { type: 'Conference Centre', pct: 92 },
      { type: 'Outdoor', pct: 46 },
      { type: 'Rooftop', pct: 43 }
    ]},
    { type: 'Rooftop', alsoWith: [
      { type: 'Conference Centre', pct: 87 },
      { type: 'Outdoor', pct: 72 },
      { type: 'Hotel', pct: 51 }
    ]},
    { type: 'Bar', alsoWith: [
      { type: 'Conference Centre', pct: 64 },
      { type: 'Restaurant', pct: 52 },
      { type: 'Outdoor', pct: 52 }
    ]},
    { type: 'Restaurant', alsoWith: [
      { type: 'Conference Centre', pct: 69 },
      { type: 'Bar', pct: 59 },
      { type: 'Hotel', pct: 52 }
    ]}
  ],

  // -- Christmas Party Booking Cycle --
  xmasParty: {
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    enquiryMonth: [3.2, 2.3, 2.7, 2.6, 3.5, 4.4, 7.3, 11.3, 18.8, 25.0, 14.4, 4.5],
    closeMonth:   [3.5, 2.1, 4.3, 4.3, 3.8, 5.0, 9.3, 11.5, 19.2, 22.2, 12.6, 2.2],
    eventMonth:   [2, 1, 1, 0, 0, 1, 1, 0, 1, 1, 6, 87],
    // Median group size by enquiry month (larger groups enquire earlier)
    groupSizeByEnquiryMonth: [140, 130, 120, 120, 120, 100, 100, 90, 80, 70, 50, 60],
    // Group sizes
    groupSize: {
      median: 80, p25: 50, p75: 150,
      byYear: [
        { year: 2022, median: 80, p25: 50, p75: 150 },
        { year: 2023, median: 80, p25: 50, p75: 150 },
        { year: 2024, median: 80, p25: 50, p75: 139 },
        { year: 2025, median: 80, p25: 50, p75: 140 }
      ],
      distribution: [
        { bucket: '1-50', pct: 33.1 },
        { bucket: '51-100', pct: 32.4 },
        { bucket: '101-200', pct: 22.0 },
        { bucket: '201-500', pct: 10.7 },
        { bucket: '500+', pct: 1.8 }
      ]
    }
  },

  // -- Spending by Industry (median confirmed booking value, GBP) --
  // Source: Won booking lines summed per booking, mapped via companies.segment
  spendByIndustry: [
    { segment: 'Financial Services', median: 11500 },
    { segment: 'Technology', median: 8043 },
    { segment: 'Retail & Consumer', median: 7313 },
    { segment: 'Education & Training', median: 7150 },
    { segment: 'Media & Marketing', median: 5500 },
    { segment: 'Professional Services', median: 4781 },
    { segment: 'Property & Construction', median: 4098 },
    { segment: 'Healthcare & Pharma', median: 3800 }
  ],

  // -- Booking Line Lost Reasons (grouped, % of all lost lines) --
  lostReasons: {
    overall: [
      { reason: 'Venue missed deadline', pct: 41.0 },
      { reason: 'Fast-track expired', pct: 15.2 },
      { reason: 'Client unresponsive', pct: 14.8 },
      { reason: 'Venue other', pct: 10.9 },
      { reason: 'Date not available', pct: 8.9 },
      { reason: 'Booked alternative venue', pct: 4.6 },
      { reason: 'Style mismatch', pct: 1.0 },
      { reason: 'Event cancelled', pct: 0.4 }
    ],
    xmasParty: [
      { reason: 'Venue missed deadline', pct: 32.4 },
      { reason: 'Fast-track expired', pct: 13.6 },
      { reason: 'Venue other', pct: 9.6 },
      { reason: 'Date not available', pct: 7.9 },
      { reason: 'Client unresponsive', pct: 8.6 },
      { reason: 'Booked alternative venue', pct: 5.2 },
      { reason: 'Found own venue', pct: 2.4 }
    ],
    // "Date not available" as % of lost lines, by year (overall)
    availabilityByYear: {
      years: [2022, 2023, 2024, 2025],
      overall: [4.6, 5.4, 6.2, 2.0],
      xmasParty: [4.8, 6.6, 5.4, 0.6]
    }
  },

  // -- Industry Profiles (via companies.segment mapping) --
  // Source: Won booking lines summed per booking, mapped via companies.segment → industry group
  // Period: 2022-2025
  industryProfiles: [
    { industry: 'Financial Services', medianSpend: 11500, p25: 4540, p75: 30724, pph: 112, groupSize: 100, leadDays: 98,
      hubspotValues: ['CAPITAL_MARKETS','INVESTMENT_MANAGEMENT','FINANCIAL_SERVICES','BANKING','INSURANCE','ACCOUNTING'] },
    { industry: 'Professional Services', medianSpend: 4781, p25: 2073, p75: 15362, pph: 98, groupSize: 50, leadDays: 79,
      hubspotValues: ['MANAGEMENT_CONSULTING','LAW_PRACTICE','LEGAL_SERVICES','HUMAN_RESOURCES','STAFFING_AND_RECRUITING','MARKET_RESEARCH'] },
    { industry: 'Technology', medianSpend: 8043, p25: 1966, p75: 18732, pph: 108, groupSize: 70, leadDays: 98,
      hubspotValues: ['COMPUTER_SOFTWARE','INFORMATION_TECHNOLOGY_AND_SERVICES','TELECOMMUNICATIONS'] },
    { industry: 'Education & Training', medianSpend: 7150, p25: 1541, p75: 23076, pph: 86, groupSize: 100, leadDays: 105,
      hubspotValues: ['PROFESSIONAL_TRAINING_COACHING','HIGHER_EDUCATION','EDUCATION_MANAGEMENT'] },
    { industry: 'Retail & Consumer', medianSpend: 7313, p25: 1243, p75: 16694, pph: 76, groupSize: 77, leadDays: 74,
      hubspotValues: ['RETAIL','CONSUMER_SERVICES','CONSUMER_GOODS','APPAREL_FASHION','LUXURY_GOODS_JEWELRY'] },
    { industry: 'Property & Construction', medianSpend: 4098, p25: 1075, p75: 10104, pph: 77, groupSize: 42, leadDays: 71,
      hubspotValues: ['REAL_ESTATE','CONSTRUCTION','CIVIL_ENGINEERING','ARCHITECTURE_PLANNING'] },
    { industry: 'Media & Marketing', medianSpend: 5500, p25: 1666, p75: 15300, pph: 79, groupSize: 60, leadDays: 65,
      hubspotValues: ['MARKETING_AND_ADVERTISING','PUBLIC_RELATIONS_AND_COMMUNICATIONS','PUBLISHING','ENTERTAINMENT'] },
    { industry: 'Healthcare & Pharma', medianSpend: 3800, p25: 417, p75: 12000, pph: 45, groupSize: 70, leadDays: 61,
      hubspotValues: ['HOSPITAL_HEALTH_CARE','PHARMACEUTICALS','COSMETICS'] }
  ],

  // -- Event Type Profiles (from won booking lines, 2022-2025) --
  // For personalised deep-dive slides per event type
  eventTypeProfiles: {
    'conference': {
      hubspotValue: 'conferences',
      label: 'Conference',
      spend: { median: 10001, p25: 2719, p75: 23094 },
      pph: 91, groupSize: { median: 100, p25: 50, p75: 192 },
      leadDays: { median: 98, p25: 54, p75: 180 },
      peakMonths: ['Jun', 'Sep', 'Nov'], peakDay: 'Wed',
      tip: 'Conferences typically require 3+ months lead time. Start early to access the best large-capacity venues, especially for autumn and summer events.'
    },
    'christmasParty': {
      hubspotValue: 'christmas-parties',
      label: 'Christmas Party',
      spend: { median: 12150, p25: 5298, p75: 20724 },
      pph: 111, groupSize: { median: 100, p25: 60, p75: 150 },
      leadDays: { median: 100, p25: 66, p75: 162 },
      peakMonths: ['Dec', 'Nov'], peakDay: 'Thu',
      tip: 'December dates at top venues book out by summer. Enquire by Q2 for the best selection, especially for groups over 100.'
    },
    'corporateParty': {
      hubspotValue: 'corporate-parties',
      label: 'Corporate Party',
      spend: { median: 2110, p25: 746, p75: 5192 },
      pph: 30, groupSize: { median: 60, p25: 40, p75: 100 },
      leadDays: { median: 63, p25: 33, p75: 113 },
      peakMonths: ['Nov', 'Dec', 'Oct'], peakDay: 'Sat',
      tip: 'Corporate parties peak in Q4 but run year-round. Saturday is the most popular day, so book early for weekend availability.'
    },
    'summerParty': {
      hubspotValue: 'summer-parties',
      label: 'Summer Party',
      spend: { median: 8073, p25: 3126, p75: 20054 },
      pph: 83, groupSize: { median: 112, p25: 60, p75: 200 },
      leadDays: { median: 103, p25: 57, p75: 148 },
      peakMonths: ['Jul', 'Jun', 'Sep'], peakDay: 'Thu',
      tip: 'Outdoor and rooftop venues are in high demand for summer. Book 3+ months ahead for the best al fresco options.'
    },
    'networkingEvent': {
      hubspotValue: 'networking-events',
      label: 'Networking Event',
      spend: { median: 7895, p25: 2542, p75: 17289 },
      pph: 88, groupSize: { median: 80, p25: 50, p75: 150 },
      leadDays: { median: 90, p25: 51, p75: 149 },
      peakMonths: ['Dec', 'Nov', 'Sep'], peakDay: 'Thu',
      tip: 'Networking events benefit from flexible layouts and breakout areas. Consider venues with multiple zones to encourage natural interaction.'
    },
    'awardCeremony': {
      hubspotValue: 'awards-ceremonies',
      label: 'Award Ceremony',
      spend: { median: 18900, p25: 4805, p75: 32913 },
      pph: 93, groupSize: { median: 200, p25: 100, p75: 300 },
      leadDays: { median: 136, p25: 77, p75: 236 },
      peakMonths: ['Jun', 'Nov', 'Sep'], peakDay: 'Thu',
      tip: 'Award ceremonies have the longest lead times of any event type. With 200+ guests typical, securing a large-format venue requires booking 4+ months ahead.'
    },
    'meeting': {
      hubspotValue: 'meetings',
      label: 'Meeting',
      spend: { median: 905, p25: 300, p75: 2916 },
      pph: 54, groupSize: { median: 18, p25: 8, p75: 31 },
      leadDays: { median: 32, p25: 14, p75: 71 },
      peakMonths: ['Oct', 'Nov', 'Jun'], peakDay: 'Wed',
      tip: 'Meetings are the most frequent event type on our platform. Planning 1+ month ahead gives access to premium meeting rooms and better day delegate rates.'
    },
    'corporatePrivateDining': {
      hubspotValue: 'private-dining',
      label: 'Private Dining',
      spend: { median: 3543, p25: 1870, p75: 8333 },
      pph: 102, groupSize: { median: 33, p25: 20, p75: 60 },
      leadDays: { median: 68, p25: 33, p75: 122 },
      peakMonths: ['Nov', 'Jun', 'Oct'], peakDay: 'Wed',
      tip: 'Private dining delivers a premium per-head experience. The best private dining rooms seat 20-40 and book up fast in Q4.'
    },
    'galaDinner': {
      hubspotValue: null,
      label: 'Gala Dinner',
      spend: { median: 8437, p25: 1796, p75: 20494 },
      pph: 41, groupSize: { median: 150, p25: 90, p75: 220 },
      leadDays: { median: 151, p25: 80, p75: 236 },
      peakMonths: ['Jul', 'May', 'Nov'], peakDay: 'Thu',
      tip: 'Gala dinners are large-scale formal events - typical groups of 150+ mean only a handful of venues can accommodate them. Start planning 5+ months out.'
    },
    'productLaunch': {
      hubspotValue: 'product-launches',
      label: 'Product Launch',
      spend: { median: 1303, p25: 307, p75: 10060 },
      pph: 27, groupSize: { median: 40, p25: 30, p75: 135 },
      leadDays: { median: 58, p25: 32, p75: 103 },
      peakMonths: ['Jul', 'Oct', 'Jun'], peakDay: 'Thu',
      tip: 'Product launches demand venues with strong AV infrastructure and branding flexibility. Despite shorter lead times, the best creative spaces are in high demand.'
    }
    // HubSpot values without dedicated profiles (insufficient data):
    // exhibitions (n=14), team-building, workshops, away-days
  },

  // -- Venue Types by Industry (Snowflake, ALL bookings 2022-2025) --
  // Top venue types per industry group + 2022-23 vs 2024-25 trend (pp change)
  // -- Venue Type Trends by Industry (Snowflake, ALL booking lines 2022-2025) --
  // Comparing 2022-2023 vs 2024-2025 share of enquiries by venue type
  venueTypesByIndustry: {
    'Financial Services': {
      gaining: [
        { type: 'Bars', change: 2.7, from: 5.7, to: 8.4 },
        { type: 'Restaurants', change: 2.1, from: 8.1, to: 10.2 },
        { type: 'Rooftops', change: 2.1, from: 8.7, to: 10.8 },
        { type: 'Outdoor', change: 1.3, from: 9.5, to: 10.8 }
      ],
      declining: [
        { type: 'Historic / Landmark', change: -5.5, from: 24.3, to: 18.8 },
        { type: 'Conference Centres', change: -2.0, from: 46.3, to: 44.3 },
        { type: 'Theatres', change: -0.8, from: 5.0, to: 4.2 }
      ]
    },
    'Professional Services': {
      gaining: [
        { type: 'Hotels', change: 2.9, from: 14.8, to: 17.7 },
        { type: 'Bars', change: 2.2, from: 7.2, to: 9.4 },
        { type: 'Restaurants', change: 2.1, from: 9.8, to: 11.9 },
        { type: 'Rooftops', change: 2.1, from: 9.3, to: 11.4 }
      ],
      declining: [
        { type: 'Historic / Landmark', change: -5.3, from: 26.7, to: 21.4 },
        { type: 'Conference Centres', change: -3.4, from: 46.9, to: 43.5 },
        { type: 'Event Venues', change: -2.4, from: 75.2, to: 72.8 }
      ]
    },
    'Technology': {
      gaining: [
        { type: 'Rooftops', change: 0.9, from: 8.4, to: 9.3 },
        { type: 'Restaurants', change: 0.5, from: 7.9, to: 8.4 },
        { type: 'Galleries', change: 0.4, from: 1.2, to: 1.6 },
        { type: 'Cinemas', change: 0.4, from: 2.0, to: 2.4 }
      ],
      declining: [
        { type: 'Event Venues', change: -6.8, from: 75.5, to: 68.7 },
        { type: 'Historic / Landmark', change: -6.3, from: 24.0, to: 17.7 },
        { type: 'Conference Centres', change: -4.0, from: 42.1, to: 38.1 }
      ]
    },
    'Education & Training': {
      gaining: [
        { type: 'Restaurants', change: 0.5, from: 3.5, to: 4.0 },
        { type: 'Bars', change: 0.2, from: 4.9, to: 5.1 },
        { type: 'Cinemas', change: 0.2, from: 2.5, to: 2.7 },
        { type: 'Rooftops', change: 0.1, from: 5.9, to: 6.0 }
      ],
      declining: [
        { type: 'Historic / Landmark', change: -6.9, from: 32.4, to: 25.5 },
        { type: 'Event Venues', change: -6.6, from: 78.2, to: 71.6 },
        { type: 'Conference Centres', change: -2.2, from: 54.9, to: 52.7 }
      ]
    },
    'Retail & Consumer': {
      gaining: [
        { type: 'Hotels', change: 1.8, from: 12.3, to: 14.1 },
        { type: 'Rooftops', change: 1.4, from: 5.8, to: 7.2 },
        { type: 'Outdoor', change: 1.2, from: 10.0, to: 11.2 },
        { type: 'Cinemas', change: 0.7, from: 2.1, to: 2.8 }
      ],
      declining: [
        { type: 'Event Venues', change: -4.7, from: 76.7, to: 72.0 },
        { type: 'Historic / Landmark', change: -2.7, from: 26.3, to: 23.6 },
        { type: 'Clubs', change: -1.4, from: 2.6, to: 1.2 }
      ]
    },
    'Property & Construction': {
      gaining: [
        { type: 'Hotels', change: 2.4, from: 11.9, to: 14.3 },
        { type: 'Bars', change: 2.4, from: 7.2, to: 9.6 },
        { type: 'Restaurants', change: 1.9, from: 6.6, to: 8.5 },
        { type: 'Activity Venues', change: 0.8, from: 1.8, to: 2.6 }
      ],
      declining: [
        { type: 'Historic / Landmark', change: -9.5, from: 29.6, to: 20.1 },
        { type: 'Event Venues', change: -4.6, from: 77.0, to: 72.4 },
        { type: 'Conference Centres', change: -3.2, from: 48.8, to: 45.6 }
      ]
    },
    'Media & Marketing': {
      gaining: [
        { type: 'Activity Venues', change: 0.7, from: 1.4, to: 2.1 },
        { type: 'Activity Bars', change: 0.6, from: 1.4, to: 2.0 },
        { type: 'Warehouses', change: 0.4, from: 1.6, to: 2.0 },
        { type: 'Outdoor', change: 0.3, from: 10.3, to: 10.6 }
      ],
      declining: [
        { type: 'Event Venues', change: -5.4, from: 73.2, to: 67.8 },
        { type: 'Historic / Landmark', change: -1.6, from: 22.7, to: 21.1 },
        { type: 'Meeting Rooms', change: -1.1, from: 9.0, to: 7.9 }
      ]
    },
    'Healthcare & Pharma': {
      gaining: [
        { type: 'Bars', change: 3.8, from: 6.9, to: 10.7 },
        { type: 'Activity Bars', change: 2.5, from: 1.0, to: 3.5 },
        { type: 'Activity Venues', change: 2.3, from: 1.2, to: 3.5 },
        { type: 'Social Gaming', change: 2.1, from: 1.2, to: 3.3 }
      ],
      declining: [
        { type: 'Historic / Landmark', change: -6.6, from: 26.8, to: 20.2 },
        { type: 'Conference Centres', change: -5.5, from: 48.8, to: 43.3 },
        { type: 'Hotels', change: -1.7, from: 14.7, to: 13.0 }
      ]
    }
  },

  // -- Event Type Trends by Industry (Snowflake, ALL booking lines 2022-2025) --
  // Comparing 2022-2023 vs 2024-2025 share of enquiries by event category
  eventTypesByIndustry: {
    'Financial Services': {
      gaining: [
        { type: 'Summer Parties', change: 4.2, from: 3.2, to: 7.4 },
        { type: 'Networking', change: 4.1, from: 6.0, to: 10.1 },
        { type: 'Screenings', change: 2.2, from: 6.7, to: 8.9 },
        { type: 'Award Ceremonies', change: 1.9, from: 0.4, to: 2.3 }
      ],
      declining: [
        { type: 'Meetings', change: -7.5, from: 16.8, to: 9.3 },
        { type: 'Private Dining', change: -2.4, from: 7.5, to: 5.1 },
        { type: 'Exhibitions', change: -1.3, from: 1.3, to: 0.0 }
      ]
    },
    'Professional Services': {
      gaining: [
        { type: 'Meetings', change: 5.2, from: 8.1, to: 13.3 },
        { type: 'Screenings', change: 4.0, from: 6.0, to: 10.0 },
        { type: 'Away Days', change: 1.3, from: 1.2, to: 2.5 }
      ],
      declining: [
        { type: 'Award Ceremonies', change: -4.4, from: 6.6, to: 2.2 },
        { type: 'Christmas Parties', change: -4.1, from: 10.1, to: 6.0 },
        { type: 'Conferences', change: -2.7, from: 14.3, to: 11.6 }
      ]
    },
    'Technology': {
      gaining: [
        { type: 'Summer Parties', change: 4.9, from: 4.5, to: 9.4 },
        { type: 'Conferences', change: 2.1, from: 12.7, to: 14.8 },
        { type: 'Private Dining', change: 2.1, from: 3.0, to: 5.1 },
        { type: 'Award Ceremonies', change: 1.5, from: 1.1, to: 2.6 }
      ],
      declining: [
        { type: 'Pop-Ups', change: -3.0, from: 6.0, to: 3.0 },
        { type: 'Meetings', change: -2.4, from: 9.5, to: 7.1 },
        { type: 'Private Events', change: -2.3, from: 4.1, to: 1.8 }
      ]
    },
    'Education & Training': {
      gaining: [
        { type: 'Conferences', change: 4.5, from: 19.5, to: 24.0 },
        { type: 'Award Ceremonies', change: 3.8, from: 2.9, to: 6.7 },
        { type: 'Screenings', change: 2.3, from: 5.2, to: 7.5 },
        { type: 'Summer Parties', change: 2.1, from: 2.8, to: 4.9 }
      ],
      declining: [
        { type: 'Corporate Parties', change: -2.7, from: 10.1, to: 7.4 },
        { type: 'Networking', change: -2.2, from: 8.2, to: 6.0 },
        { type: 'Meetings', change: -2.1, from: 11.9, to: 9.8 }
      ]
    },
    'Retail & Consumer': {
      gaining: [
        { type: 'Pop-Ups', change: 3.4, from: 5.1, to: 8.5 },
        { type: 'Product Launches', change: 3.3, from: 2.1, to: 5.4 },
        { type: 'Screenings', change: 2.5, from: 5.9, to: 8.4 },
        { type: 'Summer Parties', change: 1.7, from: 3.4, to: 5.1 }
      ],
      declining: [
        { type: 'Networking', change: -3.5, from: 7.0, to: 3.5 },
        { type: 'Conferences', change: -1.2, from: 14.9, to: 13.7 }
      ]
    },
    'Property & Construction': {
      gaining: [
        { type: 'Conferences', change: 7.0, from: 11.1, to: 18.1 },
        { type: 'Corporate Parties', change: 2.8, from: 8.9, to: 11.7 },
        { type: 'Pop-Ups', change: 2.5, from: 3.1, to: 5.6 },
        { type: 'Private Dining', change: 2.4, from: 1.3, to: 3.7 }
      ],
      declining: [
        { type: 'Meetings', change: -4.8, from: 11.9, to: 7.1 },
        { type: 'Networking', change: -3.0, from: 10.2, to: 7.2 },
        { type: 'Summer Parties', change: -2.2, from: 8.2, to: 6.0 }
      ]
    },
    'Media & Marketing': {
      gaining: [
        { type: 'Summer Parties', change: 4.8, from: 4.9, to: 9.7 },
        { type: 'Conferences', change: 4.6, from: 7.7, to: 12.3 },
        { type: 'Gala Dinners', change: 1.9, from: 0.6, to: 2.5 },
        { type: 'Award Ceremonies', change: 1.6, from: 2.3, to: 3.9 }
      ],
      declining: [
        { type: 'Screenings', change: -7.2, from: 15.4, to: 8.2 },
        { type: 'Meetings', change: -3.8, from: 8.0, to: 4.2 },
        { type: 'Corporate Parties', change: -2.3, from: 9.1, to: 6.8 }
      ]
    },
    'Healthcare & Pharma': {
      gaining: [
        { type: 'Conferences', change: 10.3, from: 8.9, to: 19.2 },
        { type: 'Christmas Parties', change: 5.6, from: 13.8, to: 19.4 },
        { type: 'Corporate Parties', change: 1.6, from: 5.6, to: 7.2 }
      ],
      declining: [
        { type: 'Networking', change: -12.4, from: 16.0, to: 3.6 },
        { type: 'Private Events', change: -3.8, from: 9.2, to: 5.4 },
        { type: 'Screenings', change: -3.7, from: 5.9, to: 2.2 }
      ]
    }
  }
};

// Reverse lookup: HubSpot value -> eventTypeProfiles key
const HUBSPOT_TO_EVENT_KEY = {};
for (const [key, profile] of Object.entries(DATA.eventTypeProfiles)) {
  if (profile.hubspotValue) HUBSPOT_TO_EVENT_KEY[profile.hubspotValue] = key;
}
