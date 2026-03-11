// charts-venues.js — Chart.js initializations for the Venue Report
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

  // ── vChartSpending — Line with IQR band ──
  if (document.getElementById('vChartSpending')) {
    const id = 'vChartSpending';
    const d = DATA.bookingValues;
    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: d.years,
        datasets: [
          {
            label: 'IQR (p25–p75)',
            data: d.p75,
            fill: '+1',
            backgroundColor: 'rgba(0,168,44,0.12)',
            borderColor: 'transparent',
            pointRadius: 0,
            order: 2
          },
          {
            label: '_p25',
            data: d.p25,
            fill: false,
            borderColor: 'transparent',
            pointRadius: 0,
            order: 2
          },
          {
            label: 'Median booking value',
            data: d.median,
            borderColor: C.green,
            backgroundColor: C.green,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.3,
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
              filter: item => !item.text.startsWith('_')
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                if (ctx.dataset.label === 'Median booking value') return 'Median: ' + fmtGBP(ctx.parsed.y);
                if (ctx.dataset.label === 'IQR (p25\u2013p75)') {
                  const i = ctx.dataIndex;
                  return 'IQR: ' + fmtGBP(d.p25[i]) + ' \u2013 ' + fmtGBP(d.p75[i]);
                }
                return null;
              }
            }
          }
        },
        scales: {
          x: { grid: { color: gridColor(id) }, ticks: { color: tickColor(id) } },
          y: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id), callback: v => fmtGBP(v) },
            beginAtZero: true
          }
        }
      }
    });
  }

  // ── vChartCategoryTrend — Multi-line, top 6 categories ──
  if (document.getElementById('vChartCategoryTrend')) {
    const id = 'vChartCategoryTrend';
    const d = DATA.categoryMix;
    const top6 = d.categories.slice(0, 6);
    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: d.years,
        datasets: top6.map((cat, i) => ({
          label: cat.name,
          data: cat.pcts,
          borderColor: palette[i],
          backgroundColor: palette[i],
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: legendColor(id) } },
          tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } }
        },
        scales: {
          x: { grid: { color: gridColor(id) }, ticks: { color: tickColor(id) } },
          y: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id), callback: v => v + '%' },
            beginAtZero: true
          }
        }
      }
    });
  }

  // ── vChartCompetition — Bar+line combo ──
  if (document.getElementById('vChartCompetition')) {
    const id = 'vChartCompetition';
    const d = DATA.venueShopping;
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: d.years,
        datasets: [
          {
            label: 'Avg venues per enquiry',
            data: d.avgVenues,
            backgroundColor: C.green,
            borderRadius: 4,
            yAxisID: 'y',
            order: 2
          },
          {
            label: 'Multi-venue enquiries',
            data: d.multiVenuePct,
            type: 'line',
            borderColor: C.amber,
            backgroundColor: C.amber,
            borderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.3,
            yAxisID: 'y1',
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: legendColor(id) } },
          tooltip: {
            callbacks: {
              label: ctx => {
                if (ctx.dataset.yAxisID === 'y1') return ctx.dataset.label + ': ' + ctx.parsed.y + '%';
                return ctx.dataset.label + ': ' + ctx.parsed.y;
              }
            }
          }
        },
        scales: {
          x: { grid: { color: gridColor(id) }, ticks: { color: tickColor(id) } },
          y: {
            position: 'left',
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id) },
            beginAtZero: true,
            title: { display: true, text: 'Avg venues', color: tickColor(id) }
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: tickColor(id), callback: v => v + '%' },
            beginAtZero: true,
            title: { display: true, text: 'Multi-venue %', color: tickColor(id) }
          }
        }
      }
    });
  }

  // ── vChartLostReasons — Horizontal bar ──
  if (document.getElementById('vChartLostReasons')) {
    const id = 'vChartLostReasons';
    const d = DATA.lostReasons.overall;
    const redReasons = ['Venue missed deadline', 'Date not available'];
    const amberReasons = ['Client unresponsive', 'Fast-track expired'];
    const colors = d.map(item => {
      if (redReasons.includes(item.reason)) return C.red;
      if (amberReasons.includes(item.reason)) return C.amber;
      return C.green;
    });
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: d.map(item => item.reason),
        datasets: [{
          label: '% of lost lines',
          data: d.map(item => item.pct),
          backgroundColor: colors,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.parsed.x + '%' } }
        },
        scales: {
          x: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id), callback: v => v + '%' },
            beginAtZero: true
          },
          y: {
            grid: { display: false },
            ticks: { color: tickColor(id) }
          }
        }
      }
    });
  }

  // ── vChartPricing — Horizontal bar, median by venue type ──
  if (document.getElementById('vChartPricing')) {
    const id = 'vChartPricing';
    const d = DATA.venueTypePricing;
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: d.map(item => item.type),
        datasets: [{
          label: 'Median booking value',
          data: d.map(item => item.median),
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
          tooltip: { callbacks: { label: ctx => fmtGBP(ctx.parsed.x) } }
        },
        scales: {
          x: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id), callback: v => fmtGBP(v) },
            beginAtZero: true
          },
          y: {
            grid: { display: false },
            ticks: { color: tickColor(id) }
          }
        }
      }
    });
  }

  // ── vChartMarketShare — Multi-line, venue type confirmed % ──
  if (document.getElementById('vChartMarketShare')) {
    const id = 'vChartMarketShare';
    const d = DATA.venueTypeConfirmed;
    const types = d.types.slice(0, 6);
    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: d.years,
        datasets: types.map((t, i) => ({
          label: t.type,
          data: t.pcts,
          borderColor: palette[i],
          backgroundColor: palette[i],
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: legendColor(id) } },
          tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } }
        },
        scales: {
          x: { grid: { color: gridColor(id) }, ticks: { color: tickColor(id) } },
          y: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id), callback: v => v + '%' },
            beginAtZero: true
          }
        }
      }
    });
  }

  // ── vChartSeasonality — Vertical bar, 12 months ──
  if (document.getElementById('vChartSeasonality')) {
    const id = 'vChartSeasonality';
    const d = DATA.seasonality;
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: d.months,
        datasets: [{
          label: '% of bookings',
          data: d.overall,
          backgroundColor: C.green,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.parsed.y + '%' } }
        },
        scales: {
          x: { grid: { color: gridColor(id) }, ticks: { color: tickColor(id) } },
          y: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id), callback: v => v + '%' },
            beginAtZero: true
          }
        }
      }
    });
  }

  // ── vChartDayOfWeek — Vertical bar, 7 days ──
  if (document.getElementById('vChartDayOfWeek')) {
    const id = 'vChartDayOfWeek';
    const d = DATA.dayOfWeek;
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: d.days,
        datasets: [{
          label: '% of bookings',
          data: d.pcts,
          backgroundColor: C.green,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.parsed.y + '%' } }
        },
        scales: {
          x: { grid: { color: gridColor(id) }, ticks: { color: tickColor(id) } },
          y: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id), callback: v => v + '%' },
            beginAtZero: true
          }
        }
      }
    });
  }

  // ── vChartConversion — Bar, conversion by lead time bucket ──
  if (document.getElementById('vChartConversion')) {
    const id = 'vChartConversion';
    const d = DATA.leadTimes.conversionByLeadTime;
    const maxPct = Math.max(...d.map(b => b.pct));
    const barColors = d.map(b => {
      const ratio = b.pct / maxPct;
      const r = Math.round(0 + (0 - 0) * ratio);
      const g = Math.round(168 * 0.6 + (168 - 168 * 0.6) * ratio);
      const bl = Math.round(44 * 0.6 + (44 - 44 * 0.6) * ratio);
      return `rgb(${r},${g},${bl})`;
    });
    new Chart(document.getElementById(id), {
      type: 'bar',
      data: {
        labels: d.map(b => b.bucket),
        datasets: [{
          label: 'Conversion rate',
          data: d.map(b => b.pct),
          backgroundColor: barColors,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.parsed.y + '%' } }
        },
        scales: {
          x: { grid: { color: gridColor(id) }, ticks: { color: tickColor(id) } },
          y: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id), callback: v => v + '%' },
            beginAtZero: true
          }
        }
      }
    });
  }

  // ── vChartXmasEnquiry — Two-line overlay (enquiry + close timing) ──
  if (document.getElementById('vChartXmasEnquiry')) {
    const id = 'vChartXmasEnquiry';
    const d = DATA.xmasParty;
    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: d.months,
        datasets: [
          {
            label: 'Enquiry month',
            data: d.enquiryMonth,
            borderColor: C.green,
            backgroundColor: C.green,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3
          },
          {
            label: 'Close month',
            data: d.closeMonth,
            borderColor: C.amber,
            backgroundColor: C.amber,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: legendColor(id) } },
          tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + '%' } }
        },
        scales: {
          x: { grid: { color: gridColor(id) }, ticks: { color: tickColor(id) } },
          y: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id), callback: v => v + '%' },
            beginAtZero: true
          }
        }
      }
    });
  }

  // ── vChartXmasClose — Standalone close timing line (if element exists) ──
  if (document.getElementById('vChartXmasClose')) {
    const id = 'vChartXmasClose';
    const d = DATA.xmasParty;
    new Chart(document.getElementById(id), {
      type: 'line',
      data: {
        labels: d.months,
        datasets: [{
          label: 'Close month',
          data: d.closeMonth,
          borderColor: C.amber,
          backgroundColor: 'rgba(232,168,56,0.1)',
          fill: true,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: legendColor(id) } },
          tooltip: { callbacks: { label: ctx => ctx.parsed.y + '%' } }
        },
        scales: {
          x: { grid: { color: gridColor(id) }, ticks: { color: tickColor(id) } },
          y: {
            grid: { color: gridColor(id) },
            ticks: { color: tickColor(id), callback: v => v + '%' },
            beginAtZero: true
          }
        }
      }
    });
  }

}

document.addEventListener('DOMContentLoaded', initCharts);
