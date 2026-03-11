/* ===================================================
   Hire Space — Chart.js Initialisations
   =================================================== */

// Brand palette
const COLORS = {
  green:      '#00A82C',
  dark:       '#282A30',
  greenLight: '#53B04B',
  blue:       '#5B9BD5',
  border:     '#BBBDBF',
  greenMid:   '#7DC87D',
  greenDeep:  '#3D7A3D',
  blueLight:  '#8FBCE6',
  white:      '#FFFFFF',
  lightText:  '#F7F9FC',
  lightGray:  '#EBEDF0'
};

const PALETTE = [COLORS.green, COLORS.dark, COLORS.greenLight, COLORS.blue, COLORS.border, COLORS.greenMid, COLORS.greenDeep, COLORS.blueLight];

// Shared defaults
Chart.defaults.font.family = "'Open Sans', Helvetica, Arial, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.animation.duration = 800;

// Helpers
function isDark(sectionEl) {
  return sectionEl.classList.contains('bg-dark');
}
function textColor(sectionEl) {
  return isDark(sectionEl) ? COLORS.lightText : COLORS.dark;
}
function gridColor(sectionEl) {
  return isDark(sectionEl) ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
}
function legendColor(sectionEl) {
  return isDark(sectionEl) ? COLORS.lightText : COLORS.dark;
}

// ------------------------------------------------
// Chart instances (populated on scroll-enter)
// ------------------------------------------------
const charts = {};

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

// ------------------------------------------------
// Slide 2: Budget Trajectory — Line
// ------------------------------------------------
function initBudgetChart(sectionEl) {
  const ctx = document.getElementById('chartBudget');
  if (!ctx) return;
  destroyChart('budget');
  const d = DATA.budgetTrajectory;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);

  charts.budget = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.years,
      datasets: [
        { label: 'Median', data: d.median, borderColor: COLORS.green, backgroundColor: COLORS.green+'22', fill: false, tension: 0.3, pointRadius: 5, pointBackgroundColor: COLORS.green, borderWidth: 3 },
        { label: 'Average', data: d.average, borderColor: COLORS.blue, backgroundColor: COLORS.blue+'22', fill: false, tension: 0.3, pointRadius: 5, pointBackgroundColor: COLORS.blue, borderWidth: 3, borderDash: [6,3] },
        { label: '75th Percentile', data: d.percentile75, borderColor: COLORS.greenLight, backgroundColor: COLORS.greenLight+'22', fill: false, tension: 0.3, pointRadius: 5, pointBackgroundColor: COLORS.greenLight, borderWidth: 3 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: tc } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': £' + ctx.parsed.y.toLocaleString() } }
      },
      scales: {
        x: { ticks: { color: tc }, grid: { color: gc } },
        y: { ticks: { color: tc, callback: v => '£' + (v/1000) + 'k' }, grid: { color: gc }, beginAtZero: true }
      }
    }
  });
}

// ------------------------------------------------
// Slide 3: Venue Sourcing — Dual axis bar + line
// ------------------------------------------------
function initVenueChart(sectionEl) {
  const ctx = document.getElementById('chartVenues');
  if (!ctx) return;
  destroyChart('venues');
  const d = DATA.venuesPerEnquiry;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);

  charts.venues = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.years,
      datasets: [
        { label: 'Avg Venues per Enquiry', data: d.average, backgroundColor: COLORS.green+'CC', borderRadius: 4, yAxisID: 'y', order: 2 },
        { label: 'Multi-Venue %', data: d.multiVenuePct, borderColor: COLORS.blue, backgroundColor: COLORS.blue+'22', type: 'line', fill: false, tension: 0.3, pointRadius: 5, pointBackgroundColor: COLORS.blue, borderWidth: 3, yAxisID: 'y1', order: 1 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: tc } } },
      scales: {
        x: { ticks: { color: tc }, grid: { color: gc } },
        y: { position: 'left', ticks: { color: tc }, grid: { color: gc }, beginAtZero: true, title: { display: true, text: 'Venues per Enquiry', color: tc } },
        y1: { position: 'right', ticks: { color: tc, callback: v => v + '%' }, grid: { drawOnChartArea: false }, beginAtZero: true, title: { display: true, text: 'Multi-Venue %', color: tc } }
      }
    }
  });
}

// ------------------------------------------------
// Slide 4: Lead Times — Line with percentile bands
// ------------------------------------------------
function initLeadTimesChart(sectionEl) {
  const ctx = document.getElementById('chartLeadTimes');
  if (!ctx) return;
  destroyChart('leadTimes');
  const d = DATA.leadTimes;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);

  charts.leadTimes = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.years,
      datasets: [
        { label: '75th Percentile', data: d.p75, borderColor: COLORS.greenLight, backgroundColor: COLORS.greenLight+'18', fill: '+1', tension: 0.3, pointRadius: 4, borderWidth: 2 },
        { label: 'Median', data: d.median, borderColor: COLORS.green, backgroundColor: COLORS.green+'22', fill: '+1', tension: 0.3, pointRadius: 5, pointBackgroundColor: COLORS.green, borderWidth: 3 },
        { label: '25th Percentile', data: d.p25, borderColor: COLORS.greenMid, backgroundColor: 'transparent', fill: false, tension: 0.3, pointRadius: 4, borderWidth: 2 },
        { label: 'Average', data: d.average, borderColor: COLORS.blue, fill: false, tension: 0.3, pointRadius: 4, borderWidth: 2, borderDash: [6,3] }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: tc } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + ' days' } }
      },
      scales: {
        x: { ticks: { color: tc }, grid: { color: gc } },
        y: { ticks: { color: tc, callback: v => v + 'd' }, grid: { color: gc }, beginAtZero: true }
      }
    }
  });
}

// ------------------------------------------------
// Slide 5: Category Mix — Grouped bar
// ------------------------------------------------
function initCategoryChart(sectionEl) {
  const ctx = document.getElementById('chartCategory');
  if (!ctx) return;
  destroyChart('category');
  const d = DATA.categoryMix;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);

  // Top 8 categories
  const top8 = d.categories.slice(0, 8);
  const yearColors = [COLORS.green, COLORS.dark, COLORS.greenLight, COLORS.blue];

  const datasets = d.years.map((yr, i) => ({
    label: '' + yr,
    data: top8.map(cat => d.data[cat][i] || 0),
    backgroundColor: yearColors[i] + 'CC',
    borderRadius: 3
  }));

  charts.category = new Chart(ctx, {
    type: 'bar',
    data: { labels: top8, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: tc } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + '%' } }
      },
      scales: {
        x: { ticks: { color: tc, maxRotation: 45 }, grid: { color: gc } },
        y: { ticks: { color: tc, callback: v => v + '%' }, grid: { color: gc }, beginAtZero: true }
      }
    }
  });
}

// ------------------------------------------------
// Slide 6: Group Sizes — Line (left)
// ------------------------------------------------
function initGroupSizesChart(sectionEl) {
  const ctx = document.getElementById('chartGroupSizes');
  if (!ctx) return;
  destroyChart('groupSizes');
  const d = DATA.groupSizes;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);

  charts.groupSizes = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.years,
      datasets: [
        { label: 'Median', data: d.median, borderColor: COLORS.green, tension: 0.3, pointRadius: 5, pointBackgroundColor: COLORS.green, borderWidth: 3, fill: false },
        { label: 'Average', data: d.average, borderColor: COLORS.blue, tension: 0.3, pointRadius: 5, pointBackgroundColor: COLORS.blue, borderWidth: 3, borderDash: [6,3], fill: false },
        { label: '75th Pctl', data: d.percentile75, borderColor: COLORS.greenLight, tension: 0.3, pointRadius: 4, borderWidth: 2, fill: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: tc } } },
      scales: {
        x: { ticks: { color: tc }, grid: { color: gc } },
        y: { ticks: { color: tc }, grid: { color: gc }, beginAtZero: true, title: { display: true, text: 'Guests', color: tc } }
      }
    }
  });
}

// Slide 6: Booking Values — Horizontal bar (right)
function initBookingValuesChart(sectionEl) {
  const ctx = document.getElementById('chartBookingValues');
  if (!ctx) return;
  destroyChart('bookingValues');
  const d = DATA.bookingValues;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);

  charts.bookingValues = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.types,
      datasets: [{
        label: 'Median Booking Value',
        data: d.median,
        backgroundColor: [COLORS.green+'CC', COLORS.greenLight+'CC', COLORS.blue+'CC', COLORS.dark+'CC'],
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => '£' + ctx.parsed.x.toLocaleString() } }
      },
      scales: {
        x: { ticks: { color: tc, callback: v => '£' + (v/1000) + 'k' }, grid: { color: gc }, beginAtZero: true },
        y: { ticks: { color: tc }, grid: { display: false } }
      }
    }
  });
}

// ------------------------------------------------
// Slide 7: Seasonality — Bar (left)
// ------------------------------------------------
function initSeasonalityChart(sectionEl) {
  const ctx = document.getElementById('chartSeasonality');
  if (!ctx) return;
  destroyChart('seasonality');
  const d = DATA.seasonality;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);

  const bgColors = d.share.map(v => v >= 10 ? COLORS.green+'CC' : COLORS.green+'66');

  charts.seasonality = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.months,
      datasets: [{ label: 'Share of Events', data: d.share, backgroundColor: bgColors, borderRadius: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + '%' } }
      },
      scales: {
        x: { ticks: { color: tc }, grid: { color: gc } },
        y: { ticks: { color: tc, callback: v => v + '%' }, grid: { color: gc }, beginAtZero: true }
      }
    }
  });
}

// Slide 7: Day of Week — Bar (right)
function initDayOfWeekChart(sectionEl) {
  const ctx = document.getElementById('chartDayOfWeek');
  if (!ctx) return;
  destroyChart('dayOfWeek');
  const d = DATA.dayOfWeek;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);

  const bgColors = d.share.map(v => v >= 15 ? COLORS.green+'CC' : COLORS.green+'66');

  charts.dayOfWeek = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.days,
      datasets: [{ label: 'Share of Events', data: d.share, backgroundColor: bgColors, borderRadius: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + '%' } }
      },
      scales: {
        x: { ticks: { color: tc }, grid: { color: gc } },
        y: { ticks: { color: tc, callback: v => v + '%' }, grid: { color: gc }, beginAtZero: true }
      }
    }
  });
}

// ------------------------------------------------
// Slide 8: Venue Type by Event Type — Grouped horizontal bar
// ------------------------------------------------
function initVenueTypeByEventChart(sectionEl) {
  const ctx = document.getElementById('chartVenueTypeEvent');
  if (!ctx) return;
  destroyChart('venueTypeEvent');
  const d = DATA.venueTypeByEvent;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);

  const eventColors = [COLORS.green, COLORS.dark, COLORS.greenLight, COLORS.blue, COLORS.border];

  const datasets = d.eventTypes.map((evt, i) => ({
    label: evt,
    data: d.venueTypes.map(vt => d.data[vt][i]),
    backgroundColor: eventColors[i] + 'CC',
    borderRadius: 3
  }));

  charts.venueTypeEvent = new Chart(ctx, {
    type: 'bar',
    data: { labels: d.venueTypes, datasets },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: tc } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.x.toFixed(1) + '%' } }
      },
      scales: {
        x: { ticks: { color: tc, callback: v => v + '%' }, grid: { color: gc }, beginAtZero: true },
        y: { ticks: { color: tc, font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

// ------------------------------------------------
// Slide 9: Venue Type YoY — Small multiples
// ------------------------------------------------
function initVenueTypeYoYCharts(sectionEl) {
  const d = DATA.venueTypeYoY;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);
  const categories = Object.keys(d.categories);

  categories.forEach((cat, idx) => {
    const canvasId = 'chartYoY_' + idx;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const chartKey = 'yoy_' + idx;
    destroyChart(chartKey);

    const catData = d.categories[cat];
    // Top 4 venue types for clarity
    const topVTs = catData.venueTypes.slice(0, 4);
    const vtColors = [COLORS.green, COLORS.blue, COLORS.greenLight, COLORS.dark];

    const datasets = topVTs.map((vt, vi) => ({
      label: vt,
      data: catData.data[vt],
      borderColor: vtColors[vi],
      backgroundColor: 'transparent',
      tension: 0.3,
      pointRadius: 3,
      borderWidth: 2,
      fill: false
    }));

    charts[chartKey] = new Chart(ctx, {
      type: 'line',
      data: { labels: d.years, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + '%' } }
        },
        scales: {
          x: { ticks: { color: tc, font: { size: 10 } }, grid: { color: gc } },
          y: { ticks: { color: tc, font: { size: 10 }, callback: v => v + '%' }, grid: { color: gc }, beginAtZero: true }
        }
      }
    });
  });
}

// ------------------------------------------------
// Slide 10: Repeat Business — Doughnut
// ------------------------------------------------
function initRepeatChart(sectionEl) {
  const ctx = document.getElementById('chartRepeat');
  if (!ctx) return;
  destroyChart('repeat');
  const d = DATA.repeatBusiness;
  const tc = textColor(sectionEl);

  charts.repeat = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: d.labels,
      datasets: [{
        data: d.share,
        backgroundColor: [COLORS.green, COLORS.dark, COLORS.greenLight, COLORS.blue],
        borderWidth: 2,
        borderColor: isDark(sectionEl) ? COLORS.dark : COLORS.white
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '55%',
      plugins: {
        legend: { position: 'bottom', labels: { color: tc, padding: 16 } },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed.toFixed(1) + '% (' + d.companies[ctx.dataIndex].toLocaleString() + ' companies)' } }
      }
    }
  });
}

// ------------------------------------------------
// Slide 11: Hybrid Events — Small line
// ------------------------------------------------
function initHybridChart(sectionEl) {
  const ctx = document.getElementById('chartHybrid');
  if (!ctx) return;
  destroyChart('hybrid');
  const d = DATA.hybridTagging;
  const tc = textColor(sectionEl), gc = gridColor(sectionEl);

  charts.hybrid = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.years,
      datasets: [{
        label: 'Hybrid-Tagged %',
        data: d.percent,
        borderColor: COLORS.green,
        backgroundColor: COLORS.green + '22',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: COLORS.green,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + '%' } }
      },
      scales: {
        x: { ticks: { color: tc }, grid: { color: gc } },
        y: { ticks: { color: tc, callback: v => v + '%' }, grid: { color: gc }, beginAtZero: true, max: 6 }
      }
    }
  });
}

// ------------------------------------------------
// Init dispatcher — called by fullpage.js onLeave
// ------------------------------------------------
function initSlideCharts(index, sectionEl) {
  switch(index) {
    case 2: initBudgetChart(sectionEl); break;
    case 3: initVenueChart(sectionEl); break;
    case 4: initLeadTimesChart(sectionEl); break;
    case 5: initCategoryChart(sectionEl); break;
    case 6: initGroupSizesChart(sectionEl); initBookingValuesChart(sectionEl); break;
    case 7: initSeasonalityChart(sectionEl); initDayOfWeekChart(sectionEl); break;
    case 8: initVenueTypeByEventChart(sectionEl); break;
    case 9: initVenueTypeYoYCharts(sectionEl); break;
    case 10: initRepeatChart(sectionEl); break;
    case 11: initHybridChart(sectionEl); break;
  }
}
