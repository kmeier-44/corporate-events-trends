// Corporate Events Booking Trends 2022–2025
// Data extracted from Hire Space MongoDB (March 2026)
// All monetary values based on confirmed booking lines (actual spend)
// Numbers shown as proportions/indexes where competitively sensitive
// NOTE: Booking values, PPH, values by category, and spend by industry
//       validated via Snowflake CONTRACT table (fully signed, latest per booking)
//       Coverage: ~19-23% of bookings (2023-2025). 2022 omitted due to low coverage (1.1%)

const DATA = {

  // ── Booking Values (actual confirmed spend, GBP) ──
  bookingValues: {
    years: [2023, 2024, 2025],
    median: [8562, 10922, 11500],
    p25: [3395, 4032, 4167],
    p75: [16875, 19450, 21122],
    indexMedian: [100, 128, 134] // 2023 = 100
  },

  // ── Booking Values by Event Type ──
  valuesByCategory: [
    { category: 'Exhibition', median: 22582 },
    { category: 'Product Launch', median: 15916 },
    { category: 'Gala Dinner', median: 15000 },
    { category: 'Award Ceremony', median: 14327 },
    { category: 'Private Event', median: 14143 },
    { category: 'Networking', median: 13332 },
    { category: 'Christmas Party', median: 13150 },
    { category: 'Ticketed Event', median: 12019 },
    { category: 'Conference', median: 11688 },
    { category: 'Summer Party', median: 11452 },
    { category: 'Corporate Party', median: 10063 },
    { category: 'Screening', median: 8380 },
    { category: 'Pop-Up', median: 8214 },
    { category: 'Private Dining', median: 4851 },
    { category: 'Presentation', median: 4566 },
    { category: 'Meeting', median: 4454 }
  ],

  // ── Price Per Head ──
  pricePerHead: {
    years: [2023, 2024, 2025],
    median: [101, 108, 108],
    byCategory: [
      { category: 'Product Launch', median: 134 },
      { category: 'Exhibition', median: 127 },
      { category: 'Networking', median: 125 },
      { category: 'Pop-Up', median: 125 },
      { category: 'Meeting', median: 125 },
      { category: 'Private Dining', median: 122 },
      { category: 'Christmas Party', median: 113 },
      { category: 'Ticketed Event', median: 105 },
      { category: 'Presentation', median: 102 },
      { category: 'Corporate Party', median: 98 },
      { category: 'Summer Party', median: 98 },
      { category: 'Screening', median: 98 },
      { category: 'Conference', median: 97 },
      { category: 'Private Event', median: 91 },
      { category: 'Award Ceremony', median: 82 },
      { category: 'Gala Dinner', median: 66 }
    ]
  },

  // ── Lead Times ──
  leadTimes: {
    years: [2022, 2023, 2024, 2025],
    median: [93, 100, 123, 111],
    p25: [57, 63, 70, 64],
    p75: [145, 173, 206, 203],
    byCategory: [
      { category: 'Award Ceremony', median: 156, median2022: null, p25: 78, p75: 256 },
      { category: 'Gala Dinner', median: 142, median2022: null, p25: 87, p75: 241 },
      { category: 'Christmas Party', median: 114, median2022: null, p25: 69, p75: 196 },
      { category: 'Conference', median: 113, median2022: null, p25: 64, p75: 204 },
      { category: 'Networking', median: 105, median2022: null, p25: 58, p75: 206 },
      { category: 'Summer Party', median: 90, median2022: null, p25: 56, p75: 139 },
      { category: 'Pop-Up', median: 86, median2022: null, p25: 46, p75: 164 },
      { category: 'Private Dining', median: 83, median2022: null, p25: 43, p75: 157 },
      { category: 'Corporate Party', median: 79, median2022: null, p25: 44, p75: 134 },
      { category: 'Meeting', median: 71, median2022: null, p25: 35, p75: 131 }
    ],
    // Earlier bookings convert better
    conversionByLeadTime: [
      { bucket: 'Under 2 weeks', pct: 9.6 },
      { bucket: '2–4 weeks', pct: 12.4 },
      { bucket: '1–2 months', pct: 24.3 },
      { bucket: '2–3 months', pct: 36.1 },
      { bucket: '3–6 months', pct: 43.5 },
      { bucket: '6+ months', pct: 44.0 }
    ]
  },

  // ── Category Mix (% of confirmed bookings) ──
  categoryMix: {
    years: [2022, 2023, 2024, 2025],
    categories: [
      { name: 'Conference',      pcts: [12.2, 16.5, 34.0, 12.1] },
      { name: 'Christmas Party', pcts: [4.9, 18.4, 14.8, 4.0] },
      { name: 'Corporate Party', pcts: [10.8, 8.2, 6.5, 10.2] },
      { name: 'Screening',       pcts: [9.7, 6.3, 0, 12.4] },
      { name: 'Networking',      pcts: [12.3, 8.9, 3.3, 11.6] },
      { name: 'Summer Party',    pcts: [10.4, 4.7, 7.7, 6.5] },
      { name: 'Ticketed Event',  pcts: [8.4, 6.1, 1.8, 10.1] },
      { name: 'Meeting',         pcts: [9.4, 6.5, 3.0, 6.7] },
      { name: 'Private Dining',  pcts: [3.5, 4.1, 8.2, 4.5] },
      { name: 'Pop-Up',          pcts: [0, 0, 0, 4.7] }
    ],
    // Enquiry proportions (% of that year's total enquiries) by category by year
    enquiryCounts: {
      'Conference':      [12.7, 16.3, 32.5, 16.5],
      'Corporate Party': [21.0, 17.9, 19.7, 25.7],
      'Meeting':         [22.3, 11.9, 10.0, 15.9],
      'Christmas Party': [4.7, 14.6, 11.7, 4.9],
      'Networking':      [17.8, 8.0, 3.3, 16.0],
      'Summer Party':    [10.5, 5.0, 9.5, 9.9],
      'Private Dining':  [8.9, 5.7, 10.3, 6.7],
      'Award Ceremony':  [1.5, 3.0, 5.5, 4.3]
    }
  },

  // ── Seasonality ──
  seasonality: {
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    overall: [4.6, 5.0, 6.6, 4.8, 6.1, 9.7, 6.6, 2.6, 9.6, 9.1, 15.3, 19.9],
    byType: {
      'Conference':      [5, 7, 10, 9, 6, 14, 6, 1, 14, 12, 12, 3],
      'Christmas Party': [4, 0, 2, 1, 0, 0, 1, 0, 2, 0, 10, 80],
      'Summer Party':    [1, 1, 0, 5, 4, 26, 29, 10, 14, 1, 3, 6],
      'Corporate Party': [3, 3, 5, 7, 6, 9, 6, 4, 9, 14, 16, 16]
    },
    // When bookings are confirmed (close month distribution %)
    closeByType: {
      'Conference':      [9.6, 9.9, 10.1, 6.5, 7.0, 7.0, 8.4, 10.1, 9.7, 7.9, 7.7, 6.1],
      'Christmas Party': [3.8, 3.4, 2.6, 3.2, 4.1, 4.4, 4.4, 6.8, 13.2, 21.8, 24.3, 7.9],
      'Summer Party':    [3.2, 6.2, 13.6, 8.8, 16.2, 16.6, 16.2, 3.9, 5.2, 3.6, 4.2, 2.3],
      'Corporate Party': [8.1, 8.0, 8.3, 7.3, 8.6, 8.9, 7.3, 10.0, 9.5, 9.8, 7.5, 6.7]
    }
  },

  // ── Day of Week ──
  dayOfWeek: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pcts: [8.3, 13.3, 17.9, 28.8, 19.4, 8.9, 3.4]
  },

  // ── Venue Shopping ──
  venueShopping: {
    years: [2022, 2023, 2024, 2025],
    avgVenues: [2.8, 3.4, 3.4, 3.5],
    multiVenuePct: [36, 38, 35, 32]
  },

  // ── Group Sizes ──
  groupSizes: {
    years: [2022, 2023, 2024, 2025],
    median: [200, 170, 150, 150],
    p25: [100, 100, 100, 80],
    p75: [300, 300, 300, 250],
    byCategory: [
      { category: 'Gala Dinner', median: 210 },
      { category: 'Award Ceremony', median: 200 },
      { category: 'Summer Party', median: 150 },
      { category: 'Conference', median: 150 },
      { category: 'Corporate Party', median: 150 },
      { category: 'Networking', median: 150 },
      { category: 'Pop-Up', median: 150 },
      { category: 'Christmas Party', median: 120 },
      { category: 'Meeting', median: 80 },
      { category: 'Private Dining', median: 75 }
    ]
  },

  // ── Venue Type Pricing (confirmed bookings) ──
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

  // ── Venue Type YoY (% of confirmed bookings with that type) ──
  venueTypeConfirmed: {
    years: [2022, 2023, 2024, 2025],
    types: [
      { type: 'Conference Centre', pcts: [51.0, 56.8, 58.6, 59.9] },
      { type: 'Historic / Landmark', pcts: [20.8, 24.7, 24.5, 22.7] },
      { type: 'Hotel', pcts: [17.9, 18.8, 17.8, 21.2] },
      { type: 'Rooftop', pcts: [11.8, 13.0, 14.6, 13.6] },
      { type: 'Bar', pcts: [8.7, 8.9, 10.4, 11.6] },
      { type: 'Restaurant', pcts: [7.8, 8.0, 8.6, 9.4] },
      { type: 'Meeting Rooms', pcts: [22.2, 22.7, 21.8, 18.4] }
    ]
  },

  // ── Venue Type Enquiry Trends (% of all enquiry lines with that type) ──
  venueTypeEnquiry: {
    years: [2022, 2023, 2024, 2025],
    types: [
      { type: 'Conference Centre', pcts: [53.1, 56.9, 58.0, 57.1] },
      { type: 'Historic / Landmark', pcts: [31.6, 32.1, 30.0, 25.9] },
      { type: 'Hotel', pcts: [14.2, 15.3, 15.9, 18.5] },
      { type: 'Outdoor', pcts: [15.0, 13.7, 13.7, 14.4] },
      { type: 'Meeting Rooms', pcts: [14.3, 14.2, 14.6, 14.9] },
      { type: 'Rooftop', pcts: [9.7, 8.5, 10.3, 12.1] },
      { type: 'Bar', pcts: [9.8, 9.3, 9.3, 11.8] },
      { type: 'Restaurant', pcts: [9.2, 8.9, 8.9, 11.7] }
    ]
  },

  // ── Venue Co-Occurrence ──
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

  // ── Christmas Party Booking Cycle ──
  xmasParty: {
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    enquiryMonth: [3.3, 3.6, 3.8, 3.8, 5.0, 5.8, 9.1, 13.5, 18.8, 20.5, 10.6, 2.2],
    closeMonth:   [3.1, 2.6, 3.1, 3.6, 6.2, 4.1, 3.1, 8.8, 17.6, 22.3, 17.6, 7.8],
    eventMonth:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10.4, 79.8],
    // Average group size by enquiry month (larger groups enquire earlier)
    groupSizeByEnquiryMonth: [223, 244, 232, 194, 184, 180, 158, 183, 171, 154, 114, 223],
    // Group sizes — big venues get booked up first
    groupSize: {
      median: 80, p25: 50, p75: 148,
      byYear: [
        { year: 2022, median: 80, p25: 50, p75: 150 },
        { year: 2023, median: 80, p25: 50, p75: 130 },
        { year: 2024, median: 90, p25: 50, p75: 150 },
        { year: 2025, median: 90, p25: 46, p75: 150 }
      ],
      distribution: [
        { bucket: '1–50', pct: 30.4 },
        { bucket: '51–100', pct: 35.1 },
        { bucket: '101–200', pct: 22.7 },
        { bucket: '201–500', pct: 9.8 },
        { bucket: '500+', pct: 1.9 }
      ]
    }
  },

  // ── Spending by Industry (median confirmed booking value, GBP) ──
  // Source: Snowflake CONTRACT (fully signed) + HUBSPOT.COMPANIES.INDUSTRY
  // Join: CORE_DATA.COMPANIES.HUBSPOTID = HUBSPOT.COMPANIES.HS_OBJECT_ID
  spendByIndustry: [
    { segment: 'Travel & Leisure', median: 14680 },
    { segment: 'Media & Marketing', median: 14265 },
    { segment: 'Property & Construction', median: 13386 },
    { segment: 'Education & Training', median: 11912 },
    { segment: 'Healthcare & Pharma', median: 11475 },
    { segment: 'Technology', median: 10706 },
    { segment: 'Financial Services', median: 7510 },
    { segment: 'Professional Services', median: 6395 },
    { segment: 'Retail & Consumer', median: 5270 }
  ],

  // ── Booking Line Lost Reasons (grouped, % of all lost lines) ──
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

  // ── Industry Profiles (HubSpot INDUSTRY via Snowflake) ──
  // Source: CONTRACT (fully signed) → BOOKING_LINES → CORE_DATA.COMPANIES → HUBSPOT.COMPANIES
  // Join: CORE_DATA.COMPANIES.HUBSPOTID = SEGMENT_EVENTS.HUBSPOT.COMPANIES.HS_OBJECT_ID
  // Period: 2023-2025
  industryProfiles: [
    { industry: 'Financial Services', medianSpend: 7510, p25: 3208, p75: 16333, pph: 114, groupSize: 70, leadDays: 97,
      hubspotValues: ['CAPITAL_MARKETS','INVESTMENT_MANAGEMENT','FINANCIAL_SERVICES','BANKING','INSURANCE','ACCOUNTING'] },
    { industry: 'Professional Services', medianSpend: 6395, p25: 2516, p75: 11500, pph: 103, groupSize: 70, leadDays: 96,
      hubspotValues: ['MANAGEMENT_CONSULTING','LAW_PRACTICE','LEGAL_SERVICES','HUMAN_RESOURCES','STAFFING_AND_RECRUITING','MARKET_RESEARCH'] },
    { industry: 'Technology', medianSpend: 10706, p25: 4375, p75: 19667, pph: 123, groupSize: 100, leadDays: 100,
      hubspotValues: ['COMPUTER_SOFTWARE','INFORMATION_TECHNOLOGY_AND_SERVICES','TELECOMMUNICATIONS'] },
    { industry: 'Education & Training', medianSpend: 11912, p25: 3825, p75: 19313, pph: 104, groupSize: 120, leadDays: 119,
      hubspotValues: ['PROFESSIONAL_TRAINING_COACHING','HIGHER_EDUCATION','EDUCATION_MANAGEMENT'] },
    { industry: 'Retail & Consumer', medianSpend: 5270, p25: 3275, p75: 18975, pph: 83, groupSize: 125, leadDays: 119,
      hubspotValues: ['RETAIL','CONSUMER_SERVICES','CONSUMER_GOODS','APPAREL_FASHION','LUXURY_GOODS_JEWELRY'] },
    { industry: 'Property & Construction', medianSpend: 13386, p25: 8912, p75: 22381, pph: 90, groupSize: 150, leadDays: 142,
      hubspotValues: ['REAL_ESTATE','CONSTRUCTION','CIVIL_ENGINEERING','ARCHITECTURE_PLANNING'] },
    { industry: 'Media & Marketing', medianSpend: 14265, p25: 10000, p75: 22060, pph: 110, groupSize: 150, leadDays: 130,
      hubspotValues: ['MARKETING_AND_ADVERTISING','PUBLIC_RELATIONS_AND_COMMUNICATIONS','PUBLISHING','ENTERTAINMENT'] },
    { industry: 'Travel & Leisure', medianSpend: 14680, p25: 7482, p75: 27863, pph: 137, groupSize: 120, leadDays: 110,
      hubspotValues: ['LEISURE_TRAVEL_TOURISM','TRANSPORTATION_TRUCKING_RAILROAD','GAMBLING_CASINOS','HOSPITALITY'] },
    { industry: 'Healthcare & Pharma', medianSpend: 11475, p25: 9500, p75: 17918, pph: 99, groupSize: 145, leadDays: 150,
      hubspotValues: ['HOSPITAL_HEALTH_CARE','PHARMACEUTICALS','COSMETICS'] }
  ],

  // ── Event Type Profiles (Snowflake CONTRACT, 2023-2025) ──
  // For personalised deep-dive slides per event type
  eventTypeProfiles: {
    'conference': {
      hubspotValue: 'conferences',
      label: 'Conference',
      spend: { median: 11688, p25: 5235, p75: 24918 },
      pph: 97, groupSize: { median: 150, p25: 90, p75: 225 },
      leadDays: { median: 129, p25: 79, p75: 200 },
      peakMonths: ['Nov', 'Sep', 'Jun'], peakDay: 'Fri',
      tip: 'Conferences require the longest planning horizon after award ceremonies. Start 4+ months ahead to access the best large-capacity venues.'
    },
    'christmasParty': {
      hubspotValue: 'christmas-parties',
      label: 'Christmas Party',
      spend: { median: 13500, p25: 8170, p75: 22660 },
      pph: 112, groupSize: { median: 120, p25: 100, p75: 200 },
      leadDays: { median: 118, p25: 82, p75: 232 },
      peakMonths: ['Dec', 'Nov'], peakDay: 'Fri',
      tip: 'December dates at top venues book out by summer. Enquire by Q2 for the best selection — especially for groups over 100.'
    },
    'corporateParty': {
      hubspotValue: 'corporate-parties',
      label: 'Corporate Party',
      spend: { median: 10282, p25: 3867, p75: 18830 },
      pph: 101, groupSize: { median: 100, p25: 60, p75: 200 },
      leadDays: { median: 106, p25: 68, p75: 182 },
      peakMonths: ['Dec', 'Nov', 'Jun'], peakDay: 'Fri',
      tip: 'Corporate parties are the most evenly spread through the year, but Q4 is still the busiest. Mid-week events often unlock better availability.'
    },
    'summerParty': {
      hubspotValue: 'summer-parties',
      label: 'Summer Party',
      spend: { median: 11452, p25: 5653, p75: 23333 },
      pph: 98, groupSize: { median: 122, p25: 85, p75: 200 },
      leadDays: { median: 97, p25: 67, p75: 153 },
      peakMonths: ['Jul', 'Jun', 'Sep'], peakDay: 'Fri',
      tip: 'Outdoor and rooftop venues are in high demand for summer. Book 3+ months ahead for the best al fresco options.'
    },
    'networkingEvent': {
      hubspotValue: 'networking-events',
      label: 'Networking Event',
      spend: { median: 13333, p25: 5630, p75: 21467 },
      pph: 125, groupSize: { median: 100, p25: 70, p75: 150 },
      leadDays: { median: 111, p25: 48, p75: 204 },
      peakMonths: ['Dec', 'Nov', 'Oct'], peakDay: 'Fri',
      tip: 'Networking events have the highest per-head costs after product launches. Flexible layouts and breakout areas are key — consider venues with multiple zones.'
    },
    'awardCeremony': {
      hubspotValue: 'awards-ceremonies',
      label: 'Award Ceremony',
      spend: { median: 14327, p25: 7145, p75: 33865 },
      pph: 82, groupSize: { median: 200, p25: 180, p75: 300 },
      leadDays: { median: 173, p25: 100, p75: 279 },
      peakMonths: ['Nov', 'Oct', 'Sep'], peakDay: 'Fri',
      tip: 'Award ceremonies have the longest lead times of any event type. With 200+ guests typical, securing a large-format venue requires booking 5–6 months ahead.'
    },
    'meeting': {
      hubspotValue: 'meetings',
      label: 'Meeting',
      spend: { median: 4542, p25: 1944, p75: 9134 },
      pph: 125, groupSize: { median: 30, p25: 18, p75: 68 },
      leadDays: { median: 57, p25: 24, p75: 112 },
      peakMonths: ['Sep', 'Oct', 'Nov'], peakDay: 'Wed',
      tip: 'Meetings have the shortest lead times — but even here, planning 2+ months ahead gives access to premium meeting rooms and better day delegate rates.'
    },
    'corporatePrivateDining': {
      hubspotValue: 'private-dining',
      label: 'Private Dining',
      spend: { median: 4975, p25: 2130, p75: 13310 },
      pph: 122, groupSize: { median: 40, p25: 20, p75: 100 },
      leadDays: { median: 87, p25: 54, p75: 136 },
      peakMonths: ['Oct', 'Dec', 'Nov'], peakDay: 'Fri',
      tip: 'Private dining is intimate but premium — per-head costs exceed £120. The best private dining rooms seat 20–40 and book up fast in Q4.'
    },
    'galaDinner': {
      hubspotValue: null,
      label: 'Gala Dinner',
      spend: { median: 15000, p25: 5000, p75: 21271 },
      pph: 66, groupSize: { median: 200, p25: 150, p75: 250 },
      leadDays: { median: 163, p25: 141, p75: 213 },
      peakMonths: ['Nov', 'Mar', 'May'], peakDay: 'Fri',
      tip: 'Gala dinners are large-scale formal events — typical groups of 200+ mean only a handful of venues can accommodate them. Start planning 5+ months out.'
    },
    'productLaunch': {
      hubspotValue: 'product-launches',
      label: 'Product Launch',
      spend: { median: 15916, p25: 11675, p75: 18833 },
      pph: 134, groupSize: { median: 90, p25: 58, p75: 115 },
      leadDays: { median: 56, p25: 44, p75: 88 },
      peakMonths: ['Oct', 'Nov', 'Dec'], peakDay: 'Wed',
      tip: 'Product launches have the highest per-head cost of any event type. Despite shorter lead times, venues with AV infrastructure and branding flexibility are in high demand.'
    }
    // HubSpot values without dedicated profiles (insufficient data):
    // exhibitions (n=6), team-building, workshops, away-days
  },

  // ── Venue Types by Industry (Snowflake, ALL bookings 2022-2025) ──
  // Top venue types per industry group + 2022-23 vs 2024-25 trend (pp change)
  // ── Venue Type Trends by Industry (Snowflake, ALL booking lines 2022–2025) ──
  // Comparing 2022–2023 vs 2024–2025 share of enquiries by venue type
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
    'Travel & Leisure': {
      gaining: [
        { type: 'Activity Bars', change: 1.2, from: 1.4, to: 2.6 },
        { type: 'Activity Venues', change: 1.2, from: 1.5, to: 2.7 },
        { type: 'Social Gaming', change: 0.7, from: 1.7, to: 2.4 },
        { type: 'Rooftops', change: 0.6, from: 5.6, to: 6.2 }
      ],
      declining: [
        { type: 'Event Venues', change: -3.7, from: 72.2, to: 68.5 },
        { type: 'Conference Centres', change: -2.9, from: 43.5, to: 40.6 },
        { type: 'Historic / Landmark', change: -2.0, from: 23.3, to: 21.3 }
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

  // ── Event Type Trends by Industry (Snowflake, ALL booking lines 2022–2025) ──
  // Comparing 2022–2023 vs 2024–2025 share of enquiries by event category
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
    'Travel & Leisure': {
      gaining: [
        { type: 'Corporate Parties', change: 12.4, from: 1.4, to: 13.8 },
        { type: 'Private Events', change: 6.7, from: 1.0, to: 7.7 },
        { type: 'Ticketed Events', change: 6.2, from: 7.5, to: 13.7 },
        { type: 'Exhibitions', change: 2.5, from: 1.2, to: 3.7 }
      ],
      declining: [
        { type: 'Networking', change: -11.8, from: 12.9, to: 1.1 },
        { type: 'Christmas Parties', change: -3.4, from: 7.8, to: 4.4 },
        { type: 'Summer Parties', change: -3.2, from: 5.2, to: 2.0 }
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

// Reverse lookup: HubSpot value → eventTypeProfiles key
const HUBSPOT_TO_EVENT_KEY = {};
for (const [key, profile] of Object.entries(DATA.eventTypeProfiles)) {
  if (profile.hubspotValue) HUBSPOT_TO_EVENT_KEY[profile.hubspotValue] = key;
}
