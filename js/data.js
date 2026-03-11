// Corporate Events Booking Trends 2022–2025
// Data extracted from Hire Space MongoDB (March 2026)
// All monetary values based on WON booking lines (actual spend, not budgets)

const DATA = {

  // ── A. Market Volume ──
  volume: {
    years: [2022, 2023, 2024, 2025],
    enquiries: [12452, 9906, 9579, 8964],
    won: [657, 689, 803, 740],
    conversionRate: [5.3, 7.0, 8.4, 8.3]
  },

  // ── B. Actual Booking Values (won booking lines, GBP) ──
  bookingValues: {
    years: [2022, 2023, 2024, 2025],
    median: [2818, 4523, 5757, 7230],
    p25: [720, 1224, 1608, 1921],
    p75: [10769, 12666, 15725, 21000]
  },

  // ── C. Booking Values by Event Type ──
  valuesByCategory: [
    { category: 'Private Event', median: 18222, n: 50 },
    { category: 'Award Ceremony', median: 17043, n: 63 },
    { category: 'Christmas Party', median: 12500, n: 184 },
    { category: 'Ticketed Event', median: 11667, n: 93 },
    { category: 'Summer Party', median: 11250, n: 137 },
    { category: 'Networking', median: 10819, n: 140 },
    { category: 'Conference', median: 10499, n: 376 },
    { category: 'Gala Dinner', median: 9010, n: 26 },
    { category: 'Corporate Party', median: 5000, n: 249 },
    { category: 'Private Dining', median: 4702, n: 161 },
    { category: 'Presentation', median: 4174, n: 76 },
    { category: 'Pop-Up', median: 4100, n: 130 },
    { category: 'Product Launch', median: 3800, n: 41 },
    { category: 'Screening', median: 2880, n: 232 },
    { category: 'Meeting', median: 828, n: 513 }
  ],

  // ── D. Price Per Head ──
  pricePerHead: {
    years: [2022, 2023, 2024, 2025],
    median: [63, 73, 85, 102],
    byCategory: [
      { category: 'Private Dining', median: 111 },
      { category: 'Christmas Party', median: 104 },
      { category: 'Award Ceremony', median: 100 },
      { category: 'Summer Party', median: 100 },
      { category: 'Networking', median: 98 },
      { category: 'Conference', median: 96 },
      { category: 'Ticketed Event', median: 92 },
      { category: 'Private Event', median: 91 },
      { category: 'Corporate Party', median: 74 },
      { category: 'Pop-Up', median: 62 },
      { category: 'Screening', median: 44 },
      { category: 'Meeting', median: 28 }
    ]
  },

  // ── E. Lead Times ──
  leadTimes: {
    years: [2022, 2023, 2024, 2025],
    median: [60, 72, 88, 84],
    p25: [27, 33, 45, 40],
    p75: [111, 126, 156, 160],
    byCategory: [
      { category: 'Award Ceremony', median: 155, p25: 86, p75: 264 },
      { category: 'Gala Dinner', median: 138, p25: 86, p75: 173 },
      { category: 'Conference', median: 114, p25: 62, p75: 189 },
      { category: 'Summer Party', median: 104, p25: 64, p75: 147 },
      { category: 'Christmas Party', median: 103, p25: 70, p75: 169 },
      { category: 'Networking', median: 84, p25: 47, p75: 154 },
      { category: 'Private Dining', median: 82, p25: 50, p75: 139 },
      { category: 'Corporate Party', median: 72, p25: 34, p75: 130 },
      { category: 'Pop-Up', median: 60, p25: 28, p75: 115 },
      { category: 'Meeting', median: 42, p25: 17, p75: 86 }
    ]
  },

  // ── F. Category Mix by Year (%) ──
  categoryMix: {
    years: [2022, 2023, 2024, 2025],
    categories: [
      { name: 'Conference',      pcts: [5.5, 14.9, 23.8, 10.3] },
      { name: 'Meeting',         pcts: [21.0, 19.7, 19.3, 15.3] },
      { name: 'Corporate Party', pcts: [8.5, 9.1, 7.7, 11.5] },
      { name: 'Christmas Party', pcts: [3.2, 11.2, 9.0, 3.1] },
      { name: 'Screening',       pcts: [15.1, 6.8, 0, 12.2] },
      { name: 'Networking',      pcts: [5.9, 3.8, 3.6, 8.9] },
      { name: 'Private Dining',  pcts: [4.9, 6.1, 9.5, 4.5] },
      { name: 'Summer Party',    pcts: [4.6, 3.0, 5.7, 5.8] },
      { name: 'Pop-Up',          pcts: [7.3, 4.1, 2.4, 5.9] },
      { name: 'Ticketed Event',  pcts: [3.7, 2.8, 0, 5.4] }
    ]
  },

  // ── G. Seasonality ──
  seasonality: {
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    overall: [5, 6, 7, 6, 7, 11, 7, 3, 10, 11, 12, 14],
    byType: {
      'Conference':      [5, 7, 10, 9, 6, 14, 6, 1, 14, 12, 12, 3],
      'Christmas Party': [4, 0, 2, 1, 0, 0, 1, 0, 2, 0, 10, 80],
      'Summer Party':    [1, 1, 0, 5, 4, 26, 29, 10, 14, 1, 3, 6],
      'Corporate Party': [3, 3, 5, 7, 6, 9, 6, 4, 9, 14, 16, 16]
    }
  },

  // ── H. Day of Week ──
  dayOfWeek: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pcts: [8.0, 18.4, 23.4, 29.0, 11.7, 7.1, 2.5]
  },

  // ── I. Venue Shopping Behaviour ──
  venueShopping: {
    years: [2022, 2023, 2024, 2025],
    avgVenues: [3.7, 5.2, 5.8, 6.4],
    multiVenuePct: [44, 50, 56, 55]
  },

  // ── J. Repeat Bookings ──
  repeatBookings: {
    sameVenue: { total: 2503, repeat: 75, rate: 3.0 },
    sameCompany: { total: 1815, repeat: 196, rate: 10.8 }
  },

  // ── K. Group Sizes ──
  groupSizes: {
    years: [2022, 2023, 2024, 2025],
    median: [50, 60, 60, 70],
    p25: [20, 20, 23, 25],
    p75: [120, 120, 120, 150],
    byCategory: [
      { category: 'Award Ceremony', median: 200 },
      { category: 'Gala Dinner', median: 160 },
      { category: 'Summer Party', median: 120 },
      { category: 'Christmas Party', median: 100 },
      { category: 'Networking', median: 100 },
      { category: 'Conference', median: 100 },
      { category: 'Corporate Party', median: 60 },
      { category: 'Pop-Up', median: 50 },
      { category: 'Private Dining', median: 30 },
      { category: 'Meeting', median: 20 }
    ]
  },

  // ── L. Venue Type Pricing ──
  venueTypePricing: [
    { type: 'Historic / Landmark', median: 10852, n: 592 },
    { type: 'Theatre', median: 9697, n: 142 },
    { type: 'Outdoor', median: 7550, n: 317 },
    { type: 'Rooftop', median: 6825, n: 339 },
    { type: 'Conference Centre', median: 6825, n: 1447 },
    { type: 'Bar', median: 5246, n: 254 },
    { type: 'Hotel', median: 4688, n: 483 },
    { type: 'Restaurant', median: 4059, n: 216 },
    { type: 'Meeting Rooms', median: 1797, n: 540 }
  ],

  // ── M. Venue Type YoY Trends ──
  venueTypeYoY: {
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

  // ── N. Venue Type Co-Occurrence ──
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
  ]
};
