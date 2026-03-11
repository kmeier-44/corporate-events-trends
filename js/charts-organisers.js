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

function initCharts() {

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

  // ── chartCostByType — Horizontal bar, top 10 categories ──
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
            beginAtZero: true,
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

  // ── Seasonal sparklines (4x small bar charts) ──
  const seasonalTypes = [
    { canvasId: 'chartSeasonXmas', key: 'Christmas Party' },
    { canvasId: 'chartSeasonSummer', key: 'Summer Party' },
    { canvasId: 'chartSeasonConf', key: 'Conference' },
    { canvasId: 'chartSeasonCorpParty', key: 'Corporate Party' }
  ];

  seasonalTypes.forEach(({ canvasId, key }) => {
    if (document.getElementById(canvasId)) {
      const id = canvasId;
      const values = DATA.seasonality.byType[key];
      new Chart(document.getElementById(id), {
        type: 'bar',
        data: {
          labels: DATA.seasonality.months,
          datasets: [{
            data: values,
            backgroundColor: C.green,
            borderRadius: 3
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

  // ── chartCategoryTrend — Multi-line, using enquiry counts with hidden y-axis ──
  if (document.getElementById('chartCategoryTrend')) {
    const id = 'chartCategoryTrend';
    const catNames = ['Conference', 'Corporate Party', 'Meeting', 'Christmas Party', 'Networking', 'Summer Party', 'Award Ceremony', 'Private Dining'];
    const counts = DATA.categoryMix.enquiryCounts;
    const datasets = catNames.filter(name => counts[name]).map((name, i) => ({
      label: name,
      data: counts[name],
      borderColor: palette[i],
      backgroundColor: palette[i],
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
      tension: 0.2,
      fill: false
    }));

    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: DATA.categoryMix.years,
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
            callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() + ' enquiries' }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id) }
          },
          y: {
            beginAtZero: true,
            display: false  // Hide y-axis — show shape/trend only
          }
        }
      }
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

  // ── chartXmasEnquiry — Overlaid enquiry + close month ──
  if (document.getElementById('chartXmasEnquiry')) {
    const id = 'chartXmasEnquiry';
    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: DATA.xmasParty.months,
        datasets: [
          {
            label: 'Enquiry month',
            data: DATA.xmasParty.enquiryMonth,
            borderColor: C.green,
            backgroundColor: 'rgba(0,168,44,0.1)',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2.5,
            fill: true,
            tension: 0.3
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
            tension: 0.3
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
            callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + '%' }
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
              callback: v => v + '%'
            }
          }
        }
      }
    });
  }

}

document.addEventListener('DOMContentLoaded', initCharts);
