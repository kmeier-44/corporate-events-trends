// Corporate Events Booking Trends Data 2022-2025
// Source: Hire Space MongoDB (corporate won bookings)

const DATA = {

  // Slide 2: Budget Trajectory
  budgetTrajectory: {
    years: [2022, 2023, 2024, 2025],
    median:         [6500, 10000, 10000, 10500],
    average:        [17055, 18787, 78108, 19329],
    percentile75:   [20000, 23000, 20000, 20000]
  },

  // Slide 3: Venue Sourcing Behaviour
  venuesPerEnquiry: {
    years: [2022, 2023, 2024, 2025],
    average:      [3.8, 4.9, 4.6, 6.6],
    multiVenuePct: [43.4, 45.9, 40.4, 55.0]
  },

  // Slide 4: Lead Times
  leadTimes: {
    years: [2022, 2023, 2024, 2025],
    p25:     [26, 23, 21, 22],
    median:  [53, 56, 57, 57],
    p75:     [101, 106, 113, 113],
    average: [75, 78, 80, 82]
  },

  // Slide 5: Event Category Mix
  categoryMix: {
    categories: ['Conference', 'Meeting', 'Corporate Party', 'Pop-Up', 'Screening', 'Networking', 'Christmas Party', 'Private Dining', 'Summer Party', 'Birthday Party', 'Ticketed Event', 'Product Launch'],
    years: [2022, 2023, 2024, 2025],
    data: {
      'Conference':      [7.4,  15.6, 20.9, null],
      'Meeting':         [14.8, 14.4, 14.6, 13.0],
      'Corporate Party': [9.2,  12.0, 11.6, 11.7],
      'Pop-Up':          [11.5,  9.5,  7.9, 10.2],
      'Screening':       [10.5,  3.3, null, 11.5],
      'Networking':      [6.1,   3.2, null,  7.1],
      'Christmas Party': [null,  8.0,  7.2, null],
      'Private Dining':  [null,  4.4,  6.9, null],
      'Summer Party':    [4.3,   3.2,  6.6,  4.3],
      'Birthday Party':  [3.7,  null, null,  6.1],
      'Ticketed Event':  [5.2,  null, null,  7.0],
      'Product Launch':  [null, null, null,  4.5]
    }
  },

  // Slide 6: Group Sizes
  groupSizes: {
    years: [2022, 2023, 2024, 2025],
    median:       [60, 60, 60, 60],
    average:      [130, 141, 141, 134],
    percentile75: [140, 150, 140, 130]
  },

  // Slide 6: Booking Values (by event type)
  bookingValues: {
    types:  ['Award Ceremony', 'Christmas Party', 'Networking Event', 'Conference'],
    median: [17422, 12500, 11912, 9833]
  },

  // Slide 7: Seasonality
  seasonality: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    share:  [6.5, 7.0, 8.0, 6.7, 7.5, 10.7, 7.8, 4.0, 9.5, 8.6, 10.2, 13.4]
  },

  // Slide 7: Day of Week
  dayOfWeek: {
    days:  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    share: [7.1, 13.8, 17.2, 25.0, 14.0, 17.7, 5.3]
  },

  // Slide 8: Venue Type by Event Type (top venue types × top event types, %)
  venueTypeByEvent: {
    venueTypes: ['Conference Centre', 'Hotel', 'Meeting Rooms', 'Historic / Landmark', 'Rooftop', 'Outdoor', 'Bar', 'Restaurant'],
    eventTypes: ['Conference', 'Meeting', 'Christmas Party', 'Summer Party', 'Corporate Party'],
    // data[venueType][eventType] = percentage
    data: {
      'Conference Centre': [35.9, 32.0, 19.3, 14.9, 21.4],
      'Hotel':             [11.0, 13.2,  5.9,  4.4,  8.4],
      'Meeting Rooms':     [ 9.2, 20.9,  4.5,  3.1,  6.1],
      'Historic / Landmark': [13.6,  7.7, 15.6,  8.8,  9.0],
      'Rooftop':           [ 4.8,  5.2,  7.0, 12.5,  8.0],
      'Outdoor':           [ 5.2,  3.8,  7.0, 19.0,  5.7],
      'Bar':               [ 2.6,  1.6,  9.8,  7.1,  8.2],
      'Restaurant':        [ 1.7,  1.2,  5.6,  5.4,  6.1]
    }
  },

  // Slide 9: Venue Type YoY Trends (per event category)
  venueTypeYoY: {
    years: [2022, 2023, 2024, 2025],
    categories: {
      'Conference': {
        venueTypes: ['Conference Centre', 'Hotel', 'Meeting Rooms', 'Historic / Landmark', 'Rooftop', 'Outdoor', 'Bar', 'Restaurant'],
        data: {
          'Conference Centre': [32.6, 38.1, 34.5, 38.7],
          'Hotel':             [14.0, 12.4,  8.5, 14.3],
          'Meeting Rooms':     [ 8.1,  7.7, 10.9,  7.1],
          'Historic / Landmark': [20.9, 12.4, 14.1, 10.1],
          'Rooftop':           [ 2.3,  4.1,  5.1,  6.0],
          'Outdoor':           [ 4.7,  4.6,  5.8,  4.8],
          'Bar':               [ 5.8,  3.6,  1.7,  1.8],
          'Restaurant':        [ 2.3,  2.1,  1.2,  2.4]
        }
      },
      'Meeting': {
        venueTypes: ['Conference Centre', 'Hotel', 'Meeting Rooms', 'Historic / Landmark', 'Rooftop', 'Outdoor', 'Bar', 'Restaurant'],
        data: {
          'Conference Centre': [29.3, 32.5, 31.4, 35.7],
          'Hotel':             [12.8, 14.6, 11.7, 14.1],
          'Meeting Rooms':     [20.5, 20.1, 22.4, 20.1],
          'Historic / Landmark': [ 7.7,  7.8,  6.0, 10.1],
          'Rooftop':           [ 5.9,  5.6,  5.0,  4.0],
          'Outdoor':           [ 4.4,  5.6,  3.0,  2.0],
          'Bar':               [ 0.4,  1.1,  3.7,  1.0],
          'Restaurant':        [ 0.4,  1.1,  2.0,  1.0]
        }
      },
      'Christmas Party': {
        venueTypes: ['Conference Centre', 'Hotel', 'Meeting Rooms', 'Historic / Landmark', 'Rooftop', 'Outdoor', 'Bar', 'Restaurant'],
        data: {
          'Conference Centre': [ 7.9, 19.3, 21.1, 23.4],
          'Hotel':             [ 7.9,  6.4,  6.0,  2.1],
          'Meeting Rooms':     [ 2.6,  6.4,  4.5,  0.0],
          'Historic / Landmark': [15.8, 13.6, 18.8, 12.8],
          'Rooftop':           [ 5.3,  7.9,  7.5,  4.3],
          'Outdoor':           [ 2.6,  8.6,  8.3,  2.1],
          'Bar':               [13.2,  7.9, 10.5, 10.6],
          'Restaurant':        [ 5.3,  7.1,  4.5,  4.3]
        }
      },
      'Summer Party': {
        venueTypes: ['Conference Centre', 'Hotel', 'Rooftop', 'Outdoor', 'Bar', 'Restaurant'],
        data: {
          'Conference Centre': [15.3, 14.6, 13.8, 15.8],
          'Hotel':             [ 1.7,  6.3,  5.7,  4.0],
          'Rooftop':           [11.9, 10.4, 16.1, 10.9],
          'Outdoor':           [20.3, 27.1, 18.4, 14.9],
          'Bar':               [ 6.8,  2.1, 10.3,  6.9],
          'Restaurant':        [ 5.1,  4.2,  4.6,  6.9]
        }
      },
      'Corporate Party': {
        venueTypes: ['Conference Centre', 'Hotel', 'Meeting Rooms', 'Historic / Landmark', 'Rooftop', 'Outdoor', 'Bar', 'Restaurant'],
        data: {
          'Conference Centre': [21.5, 18.6, 20.2, 23.9],
          'Hotel':             [ 8.6,  4.9, 10.1,  9.2],
          'Meeting Rooms':     [ 9.7,  5.9,  5.9,  4.3],
          'Historic / Landmark': [ 8.6,  7.8, 10.9,  8.6],
          'Rooftop':           [ 8.6,  6.9, 10.1,  6.7],
          'Outdoor':           [ 3.2,  7.8,  8.4,  3.7],
          'Bar':               [ 5.4,  8.8,  5.9, 11.0],
          'Restaurant':        [ 6.5,  2.9,  7.6,  6.7]
        }
      }
    }
  },

  // Slide 10: Repeat Business
  repeatBusiness: {
    labels:    ['1 year only', '2 years', '3 years', '4 years'],
    companies: [18087, 2814, 829, 276],
    share:     [82.2, 12.8, 3.8, 1.3]
  },

  // Slide 11: Hybrid Events
  hybridTagging: {
    years:   [2020, 2021, 2022, 2023, 2024, 2025],
    percent: [0.0, 1.9, 4.8, 1.1, 0.0, 0.3]
  }
};
