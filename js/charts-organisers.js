// charts-organisers.js — Chart.js initializations for the organiser report
// Depends on data.js (DATA object) and Chart.js

const C = {
  green: '#00A82C', greenHover: '#53B04B', greenLight: '#7DC87D', greenDark: '#3D7A3D',
  dark: '#282A30', darkest: '#1d1f24', light: '#EBEDF0', white: '#FFFFFF',
  blue: '#5B9BD5', blueLight: '#8FBCE6', amber: '#E8A838', red: '#D94F4F', border: '#BBBDBF'
};
const palette = [C.green, C.dark, C.greenHover, C.blue, C.border, C.greenLight, C.greenDark, C.blueLight, C.amber, C.red];

Chart.defaults.font.family = "'Open Sans', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.tooltip.cornerRadius = 6;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.animation.duration = 800;

function isDark(id) { const el = document.getElementById(id); return el ? el.closest('.dark-slide, .accent-slide, .cta-slide') !== null : false; }
function gridColor(id) { return isDark(id) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'; }
function tickColor(id) { return isDark(id) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)'; }
function legendColor(id) { return isDark(id) ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'; }
const fmtGBP = v => '\u00A3' + v.toLocaleString('en-GB');

// ── Dynamic Lead Time Cards with trend arrows ──
function buildLeadTimeCards() {
  const container = document.getElementById('leadTimeCards');
  if (!container) return;

  const descriptions = {
    'Award Ceremony': 'High-profile events with complex logistics — start 5+ months out to secure prestige venues',
    'Gala Dinner': 'Large formal events demanding premium venues — begin your search early',
    'Conference': 'Large capacity venues book up fast — begin your search nearly 4 months ahead',
    'Summer Party': 'Peak-season demand means the best outdoor and rooftop spaces go early',
    'Christmas Party': 'December availability shrinks fast — 3+ months lead time is now standard',
    'Networking': 'Growing lead times as networking events become larger and more popular',
    'Private Dining': 'Intimate events with specific venue requirements — plan well ahead',
    'Corporate Party': 'Versatile category but popular venues still need advance booking',
    'Pop-Up': 'Flexible format but trending shorter lead times — act fast',
    'Meeting': 'Shortest lead times, but planning ahead still secures better rooms'
  };

  // Show top 4 categories to fit viewport
  const cats = DATA.leadTimes.byCategory.slice(0, 4);
  cats.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'stat-card';

    let arrowHtml = '';
    if (cat.median2022 !== null && cat.median2022 !== undefined) {
      const diff = cat.median - cat.median2022;
      if (diff > 0) {
        arrowHtml = '<span class="trend-arrow up">\u2191 +' + diff + ' days</span>';
      } else if (diff < 0) {
        arrowHtml = '<span class="trend-arrow down">\u2193 ' + diff + ' days</span>';
      } else {
        arrowHtml = '<span class="trend-arrow" style="opacity:0.5;">— unchanged</span>';
      }
    }

    card.innerHTML =
      '<div class="stat-value">' + cat.median + ' days' + arrowHtml + '</div>' +
      '<div class="stat-label">' + cat.category + '</div>' +
      '<div class="stat-detail">' + (descriptions[cat.category] || '') + '</div>';

    container.appendChild(card);
  });
}

function initCharts() {

  // ── Build dynamic lead time cards ──
  buildLeadTimeCards();

  // ── chartSpending — Line with IQR band ──
  if (document.getElementById('chartSpending')) {
    const id = 'chartSpending';
    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: DATA.bookingValues.years,
        datasets: [
          {
            label: '75th percentile',
            data: DATA.bookingValues.p75,
            borderColor: 'transparent',
            backgroundColor: 'rgba(0,168,44,0.15)',
            pointRadius: 0,
            borderWidth: 1,
            fill: '+1',
            order: 2
          },
          {
            label: '25th percentile',
            data: DATA.bookingValues.p25,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            pointRadius: 0,
            borderWidth: 1,
            fill: false,
            order: 3
          },
          {
            label: 'Average spend',
            data: DATA.bookingValues.median,
            borderColor: C.green,
            backgroundColor: C.green,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2.5,
            fill: false,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: legendColor(id),
              filter: item => item.text === 'Average spend' || item.text === 'IQR (25th–75th)'
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ctx.dataset.label + ': ' + fmtGBP(ctx.parsed.y)
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id) }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor(id) },
            ticks: {
              color: tickColor(id),
              callback: v => fmtGBP(v)
            }
          }
        }
      }
    });
  }

  // ── chartSpendByIndustry — Horizontal bar ──
  if (document.getElementById('chartSpendByIndustry')) {
    const id = 'chartSpendByIndustry';
    const segs = DATA.spendByIndustry;
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: segs.map(d => d.segment),
        datasets: [{
          label: 'Average spend',
          data: segs.map(d => d.median),
          backgroundColor: C.green,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => fmtGBP(ctx.parsed.x) }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: gridColor(id) },
            ticks: {
              color: tickColor(id),
              callback: v => fmtGBP(v)
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: tickColor(id) }
          }
        }
      }
    });
  }

  // ── chartCostByType — Horizontal bar with historical tooltip ──
  if (document.getElementById('chartCostByType')) {
    const id = 'chartCostByType';
    const top10 = DATA.valuesByCategory.slice(0, 10);
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: top10.map(d => d.category),
        datasets: [{
          label: 'Average spend',
          data: top10.map(d => d.median),
          backgroundColor: C.green,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const cat = top10[ctx.dataIndex];
                let label = fmtGBP(ctx.parsed.x);
                if (cat.median2022) {
                  const pctChange = Math.round(((cat.median - cat.median2022) / cat.median2022) * 100);
                  const arrow = pctChange >= 0 ? '\u2191' : '\u2193';
                  label += '  ' + arrow + ' ' + (pctChange >= 0 ? '+' : '') + pctChange + '% since 2022';
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: gridColor(id) },
            ticks: {
              color: tickColor(id),
              callback: v => fmtGBP(v)
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: tickColor(id) }
          }
        }
      }
    });
  }

  // ── chartPricePerHead — Horizontal bar ──
  if (document.getElementById('chartPricePerHead')) {
    const id = 'chartPricePerHead';
    const cats = DATA.pricePerHead.byCategory;
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: cats.map(d => d.category),
        datasets: [{
          label: 'Price per head',
          data: cats.map(d => d.median),
          backgroundColor: C.greenHover,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => fmtGBP(ctx.parsed.x) + ' per head' }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: gridColor(id) },
            ticks: {
              color: tickColor(id),
              callback: v => fmtGBP(v)
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: tickColor(id) }
          }
        }
      }
    });
  }

  // ── chartLeadTimes — Line with IQR band ──
  if (document.getElementById('chartLeadTimes')) {
    const id = 'chartLeadTimes';
    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: DATA.leadTimes.years,
        datasets: [
          {
            label: '75th percentile',
            data: DATA.leadTimes.p75,
            borderColor: 'transparent',
            backgroundColor: 'rgba(0,168,44,0.15)',
            pointRadius: 0,
            borderWidth: 1,
            fill: '+1',
            order: 2
          },
          {
            label: '25th percentile',
            data: DATA.leadTimes.p25,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            pointRadius: 0,
            borderWidth: 1,
            fill: false,
            order: 3
          },
          {
            label: 'Average lead time',
            data: DATA.leadTimes.median,
            borderColor: C.green,
            backgroundColor: C.green,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2.5,
            fill: false,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: legendColor(id),
              filter: item => item.text === 'Average lead time'
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + ' days'
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id) }
          },
          y: {
            min: 50,
            grid: { color: gridColor(id) },
            ticks: {
              color: tickColor(id),
              callback: v => v + 'd'
            }
          }
        }
      }
    });
  }

  // ── chartSeasonality — Vertical bar, 12 months ──
  if (document.getElementById('chartSeasonality')) {
    const id = 'chartSeasonality';
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: DATA.seasonality.months,
        datasets: [{
          label: '% of bookings',
          data: DATA.seasonality.overall,
          backgroundColor: C.green,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ctx.parsed.y + '%' }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor(id) }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor(id) },
            ticks: {
              color: tickColor(id),
              callback: v => v + '%'
            }
          }
        }
      }
    });
  }

  // ── chartDayOfWeek — Vertical bar, 7 days ──
  if (document.getElementById('chartDayOfWeek')) {
    const id = 'chartDayOfWeek';
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: DATA.dayOfWeek.days,
        datasets: [{
          label: '% of bookings',
          data: DATA.dayOfWeek.pcts,
          backgroundColor: C.green,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + '%' }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor(id) }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor(id) },
            ticks: {
              color: tickColor(id),
              callback: v => v + '%'
            }
          }
        }
      }
    });
  }

  // ── Seasonal sparklines (4x bar + line combo charts) ──
  const seasonalTypes = [
    { canvasId: 'chartSeasonXmas', key: 'Christmas Party' },
    { canvasId: 'chartSeasonSummer', key: 'Summer Party' },
    { canvasId: 'chartSeasonConf', key: 'Conference' },
    { canvasId: 'chartSeasonCorpParty', key: 'Corporate Party' }
  ];

  seasonalTypes.forEach(({ canvasId, key }) => {
    if (document.getElementById(canvasId)) {
      const id = canvasId;
      const enquiryValues = DATA.seasonality.byType[key];
      const closeValues = DATA.seasonality.closeByType ? DATA.seasonality.closeByType[key] : null;

      const datasets = [
        {
          label: 'Event date',
          data: enquiryValues,
          backgroundColor: 'rgba(0,168,44,0.6)',
          borderRadius: 3,
          order: 2
        }
      ];

      // Add close-date overlay line if data exists
      if (closeValues) {
        datasets.push({
          label: 'Close month',
          data: closeValues,
          type: 'line',
          borderColor: C.amber,
          backgroundColor: C.amber,
          pointRadius: 2,
          pointHoverRadius: 4,
          borderWidth: 2,
          borderDash: [4, 2],
          fill: false,
          tension: 0.3,
          order: 1
        });
      }

      new Chart(document.getElementById(id), {
        type: 'bar',
        data: {
          labels: DATA.seasonality.months,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const prefix = ctx.dataset.label || '';
                  return prefix + ': ' + ctx.parsed.y + '%';
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: tickColor(id), font: { size: 9 } }
            },
            y: {
              display: false,
              beginAtZero: true
            }
          }
        }
      });
    }
  });

  // ── chartCategoryTrend — Horizontal bar, % change in enquiry volume 2022→2025 ──
  if (document.getElementById('chartCategoryTrend')) {
    const id = 'chartCategoryTrend';
    const indexes = DATA.categoryMix.enquiryIndex;
    const marketGrowth = DATA.marketVolume ? DATA.marketVolume.enquiryIndex[3] - 100 : null;

    // Build array of {name, change} and sort descending by change
    const items = Object.keys(indexes).map(name => ({
      name: name,
      change: indexes[name][3] - 100  // 2025 index minus baseline
    })).sort((a, b) => b.change - a.change);

    const barColors = items.map(item =>
      marketGrowth !== null && item.change >= marketGrowth
        ? C.green                          // above market
        : 'rgba(255, 255, 255, 0.25)'     // below market
    );

    const chart = new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: items.map(d => d.name),
        datasets: [{
          label: '% change since 2022',
          data: items.map(d => d.change),
          backgroundColor: barColors,
          borderRadius: 4,
          barThickness: 26
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.parsed.x;
                return (val >= 0 ? '+' : '') + val + '% vs 2022';
              }
            }
          },
          // Draw a vertical reference line for total market growth
          annotation: undefined  // handled via custom plugin below
        },
        scales: {
          x: {
            grid: { color: gridColor(id) },
            ticks: {
              color: tickColor(id),
              callback: v => (v >= 0 ? '+' : '') + v + '%'
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: tickColor(id), font: { size: 12 } }
          }
        }
      },
      plugins: marketGrowth !== null ? [{
        id: 'marketLine',
        afterDraw: function (chart) {
          const xScale = chart.scales.x;
          const yScale = chart.scales.y;
          const ctx = chart.ctx;
          const x = xScale.getPixelForValue(marketGrowth);

          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(x, yScale.top);
          ctx.lineTo(x, yScale.bottom);
          ctx.stroke();

          // Label
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = '11px ' + (Chart.defaults.font.family || 'sans-serif');
          ctx.textAlign = 'center';
          ctx.fillText('Market +' + marketGrowth + '%', x, yScale.top - 6);
          ctx.restore();
        }
      }] : []
    });
  }

  // ── chartVenueShopping — Combo: bar (avg venues) + line (multi-venue %) ──
  if (document.getElementById('chartVenueShopping')) {
    const id = 'chartVenueShopping';
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: DATA.venueShopping.years,
        datasets: [
          {
            label: 'Avg venues contacted',
            data: DATA.venueShopping.avgVenues,
            backgroundColor: C.green,
            borderRadius: 4,
            yAxisID: 'y',
            order: 2
          },
          {
            label: 'Multi-venue %',
            data: DATA.venueShopping.multiVenuePct,
            type: 'line',
            borderColor: C.amber,
            backgroundColor: C.amber,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2.5,
            fill: false,
            yAxisID: 'y1',
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: legendColor(id) }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                if (ctx.dataset.yAxisID === 'y1') return ctx.dataset.label + ': ' + ctx.parsed.y + '%';
                return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1);
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor(id) }
          },
          y: {
            beginAtZero: true,
            position: 'left',
            title: { display: true, text: 'Avg venues', color: tickColor(id) },
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id) }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            title: { display: true, text: 'Multi-venue %', color: tickColor(id) },
            grid: { drawOnChartArea: false },
            ticks: {
              color: tickColor(id),
              callback: v => v + '%'
            }
          }
        }
      }
    });
  }

  // ── chartGroupSizes — Line chart, average over years ──
  if (document.getElementById('chartGroupSizes')) {
    const id = 'chartGroupSizes';
    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: DATA.groupSizes.years,
        datasets: [{
          label: 'Average group size',
          data: DATA.groupSizes.median,
          borderColor: C.green,
          backgroundColor: C.green,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2.5,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => 'Average: ' + ctx.parsed.y + ' people' }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id) }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id) }
          }
        }
      }
    });
  }

  // ── chartGroupByType — Horizontal bar ──
  if (document.getElementById('chartGroupByType')) {
    const id = 'chartGroupByType';
    const cats = DATA.groupSizes.byCategory;
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: cats.map(d => d.category),
        datasets: [{
          label: 'Average group size',
          data: cats.map(d => d.median),
          backgroundColor: C.green,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ctx.parsed.x + ' people' }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id) }
          },
          y: {
            grid: { display: false },
            ticks: { color: tickColor(id) }
          }
        }
      }
    });
  }

  // ── chartXmasEnquiry — Overlaid enquiry + close month + group size ──
  if (document.getElementById('chartXmasEnquiry')) {
    const id = 'chartXmasEnquiry';
    const datasets = [
      {
        label: 'Enquiry month',
        data: DATA.xmasParty.enquiryMonth,
        borderColor: C.green,
        backgroundColor: 'rgba(0,168,44,0.1)',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
        yAxisID: 'y'
      },
      {
        label: 'Booking confirmed',
        data: DATA.xmasParty.closeMonth,
        borderColor: C.amber,
        backgroundColor: C.amber,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        borderDash: [6, 3],
        fill: false,
        tension: 0.3,
        yAxisID: 'y'
      }
    ];

    // Add group size overlay if data exists
    if (DATA.xmasParty.groupSizeByEnquiryMonth) {
      datasets.push({
        label: 'Avg group size',
        data: DATA.xmasParty.groupSizeByEnquiryMonth,
        borderColor: C.blue,
        backgroundColor: C.blue,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        borderDash: [3, 3],
        fill: false,
        tension: 0.3,
        yAxisID: 'y1'
      });
    }

    const scales = {
      x: {
        grid: { color: gridColor(id) },
        ticks: { color: tickColor(id) }
      },
      y: {
        beginAtZero: true,
        position: 'left',
        grid: { color: gridColor(id) },
        ticks: {
          color: tickColor(id),
          callback: v => v + '%'
        }
      }
    };

    // Add secondary axis for group size
    if (DATA.xmasParty.groupSizeByEnquiryMonth) {
      scales.y1 = {
        beginAtZero: true,
        position: 'right',
        title: { display: true, text: 'Avg group size', color: tickColor(id), font: { size: 10 } },
        grid: { drawOnChartArea: false },
        ticks: {
          color: C.blue,
          font: { size: 10 }
        }
      };
    }

    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: DATA.xmasParty.months,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: legendColor(id) }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                if (ctx.dataset.yAxisID === 'y1') return ctx.dataset.label + ': ' + ctx.parsed.y + ' people';
                return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + '%';
              }
            }
          }
        },
        scales: scales
      }
    });
  }

}

document.addEventListener('DOMContentLoaded', initCharts);
