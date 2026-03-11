/* ===================================================
   Hire Space — Chart.js Initialisations
   =================================================== */

const C = {
  green: '#00A82C',
  greenHover: '#53B04B',
  greenLight: '#7DC87D',
  greenDark: '#3D7A3D',
  dark: '#282A30',
  darkest: '#1d1f24',
  light: '#EBEDF0',
  white: '#FFFFFF',
  blue: '#5B9BD5',
  blueLight: '#8FBCE6',
  amber: '#E8A838',
  red: '#D94F4F',
  border: '#BBBDBF'
};

/* Palette for multi-series */
const palette = [C.green, C.dark, C.greenHover, C.blue, C.border, C.greenLight, C.greenDark, C.blueLight, C.amber, C.red];

/* ── Chart.js defaults ── */
Chart.defaults.font.family = "'Open Sans', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.tooltip.cornerRadius = 6;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.animation.duration = 800;

/* Helper: detect dark slide */
function isDark(canvasId) {
  const el = document.getElementById(canvasId);
  return el ? el.closest('.dark-slide, .accent-slide, .cta-slide') !== null : false;
}

function gridColor(canvasId) {
  return isDark(canvasId) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
}
function tickColor(canvasId) {
  return isDark(canvasId) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)';
}
function legendColor(canvasId) {
  return isDark(canvasId) ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
}

/* ── Currency formatter ── */
const fmtGBP = v => '£' + v.toLocaleString('en-GB');
const fmtPct = v => v + '%';

/* ══════════════════════════════════════════════════
   INIT ALL CHARTS
   ══════════════════════════════════════════════════ */

function initCharts() {

  /* ── 3. Volume & Conversion ── */
  new Chart(document.getElementById('chartVolume'), {
    type: 'bar',
    data: {
      labels: DATA.volume.years,
      datasets: [
        {
          label: 'Total Enquiries',
          data: DATA.volume.enquiries,
          backgroundColor: C.green,
          borderRadius: 4,
          yAxisID: 'y',
          order: 2
        },
        {
          label: 'Conversion Rate',
          data: DATA.volume.conversionRate,
          type: 'line',
          borderColor: C.amber,
          backgroundColor: C.amber,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          yAxisID: 'y1',
          order: 1
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: tickColor('chartVolume') } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label === 'Conversion Rate'
              ? ctx.dataset.label + ': ' + ctx.raw + '%'
              : ctx.dataset.label + ': ' + ctx.raw.toLocaleString()
          }
        }
      },
      scales: {
        x: { ticks: { color: tickColor('chartVolume') }, grid: { display: false } },
        y: {
          position: 'left',
          ticks: { color: tickColor('chartVolume'), callback: v => (v/1000)+'k' },
          grid: { color: gridColor('chartVolume') },
          title: { display: true, text: 'Enquiries', color: tickColor('chartVolume') }
        },
        y1: {
          position: 'right',
          min: 0, max: 12,
          ticks: { color: C.amber, callback: v => v + '%' },
          grid: { display: false },
          title: { display: true, text: 'Conversion %', color: C.amber }
        }
      }
    }
  });

  /* ── 4a. Booking Values (band chart) ── */
  new Chart(document.getElementById('chartValues'), {
    type: 'line',
    data: {
      labels: DATA.bookingValues.years,
      datasets: [
        {
          label: 'Upper range (75th)',
          data: DATA.bookingValues.p75,
          borderColor: 'transparent',
          backgroundColor: 'rgba(0,168,44,0.15)',
          fill: '+1',
          pointRadius: 0
        },
        {
          label: 'Typical spend (median)',
          data: DATA.bookingValues.median,
          borderColor: C.green,
          backgroundColor: C.green,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          fill: false
        },
        {
          label: 'Lower range (25th)',
          data: DATA.bookingValues.p25,
          borderColor: 'transparent',
          backgroundColor: 'rgba(0,168,44,0.15)',
          fill: '-1',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: legendColor('chartValues'), filter: item => item.text === 'Typical spend (median)' }
        },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtGBP(ctx.raw) } }
      },
      scales: {
        x: { ticks: { color: tickColor('chartValues') }, grid: { display: false } },
        y: {
          ticks: { color: tickColor('chartValues'), callback: v => fmtGBP(v) },
          grid: { color: gridColor('chartValues') }
        }
      }
    }
  });

  /* ── 4b. Price Per Head ── */
  new Chart(document.getElementById('chartPPH'), {
    type: 'bar',
    data: {
      labels: DATA.pricePerHead.years,
      datasets: [{
        label: 'Median £ per head',
        data: DATA.pricePerHead.median,
        backgroundColor: [C.greenDark, C.greenHover, C.green, C.green],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => fmtGBP(ctx.raw) + ' per head' } }
      },
      scales: {
        x: { ticks: { color: tickColor('chartPPH') }, grid: { display: false } },
        y: {
          ticks: { color: tickColor('chartPPH'), callback: v => '£' + v },
          grid: { color: gridColor('chartPPH') },
          beginAtZero: true
        }
      }
    }
  });

  /* ── 5. Values by Category ── */
  const catData = DATA.valuesByCategory.slice(0, 12);
  new Chart(document.getElementById('chartValuesByCat'), {
    type: 'bar',
    data: {
      labels: catData.map(d => d.category),
      datasets: [{
        label: 'Typical booking value (median)',
        data: catData.map(d => d.median),
        backgroundColor: catData.map((d, i) => i < 3 ? C.green : (i < 7 ? C.greenHover : C.greenLight)),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => fmtGBP(ctx.raw) + ' (n=' + catData[ctx.dataIndex].n + ')' } }
      },
      scales: {
        x: {
          ticks: { color: tickColor('chartValuesByCat'), callback: v => fmtGBP(v) },
          grid: { color: gridColor('chartValuesByCat') }
        },
        y: { ticks: { color: tickColor('chartValuesByCat'), font: { size: 11 } }, grid: { display: false } }
      }
    }
  });

  /* ── 6a. Lead Time Trend ── */
  new Chart(document.getElementById('chartLeadTrend'), {
    type: 'line',
    data: {
      labels: DATA.leadTimes.years,
      datasets: [
        {
          label: 'Planning buffer (75th)',
          data: DATA.leadTimes.p75,
          borderColor: 'transparent',
          backgroundColor: 'rgba(0,168,44,0.12)',
          fill: '+1',
          pointRadius: 0
        },
        {
          label: 'Typical lead time',
          data: DATA.leadTimes.median,
          borderColor: C.green,
          backgroundColor: C.green,
          pointRadius: 5,
          tension: 0.3,
          fill: false
        },
        {
          label: 'Minimum window (25th)',
          data: DATA.leadTimes.p25,
          borderColor: 'transparent',
          backgroundColor: 'rgba(0,168,44,0.12)',
          fill: '-1',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: legendColor('chartLeadTrend'), filter: item => item.text === 'Typical lead time' }
        },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + ' days' } }
      },
      scales: {
        x: { ticks: { color: tickColor('chartLeadTrend') }, grid: { display: false } },
        y: {
          ticks: { color: tickColor('chartLeadTrend'), callback: v => v + 'd' },
          grid: { color: gridColor('chartLeadTrend') }
        }
      }
    }
  });

  /* ── 6b. Lead Time by Category ── */
  const ltCats = DATA.leadTimes.byCategory.slice(0, 8);
  new Chart(document.getElementById('chartLeadByCat'), {
    type: 'bar',
    data: {
      labels: ltCats.map(d => d.category),
      datasets: [{
        label: 'Typical days ahead',
        data: ltCats.map(d => d.median),
        backgroundColor: ltCats.map((_, i) => i < 2 ? C.red : (i < 5 ? C.amber : C.green)),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.raw + ' days (median)' } }
      },
      scales: {
        x: {
          ticks: { color: tickColor('chartLeadByCat'), callback: v => v + 'd' },
          grid: { color: gridColor('chartLeadByCat') }
        },
        y: { ticks: { color: tickColor('chartLeadByCat'), font: { size: 11 } }, grid: { display: false } }
      }
    }
  });

  /* ── 7. Category Mix ── */
  const cmData = DATA.categoryMix;
  new Chart(document.getElementById('chartCategoryMix'), {
    type: 'bar',
    data: {
      labels: cmData.years,
      datasets: cmData.categories.slice(0, 8).map((cat, i) => ({
        label: cat.name,
        data: cat.pcts,
        backgroundColor: palette[i],
        borderRadius: 2
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: tickColor('chartCategoryMix'), boxWidth: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + '%' } }
      },
      scales: {
        x: { stacked: true, ticks: { color: tickColor('chartCategoryMix') }, grid: { display: false } },
        y: {
          stacked: true,
          ticks: { color: tickColor('chartCategoryMix'), callback: v => v + '%' },
          grid: { color: gridColor('chartCategoryMix') }
        }
      }
    }
  });

  /* ── 8a. Seasonality ── */
  const seasData = DATA.seasonality;
  new Chart(document.getElementById('chartSeasonality'), {
    type: 'bar',
    data: {
      labels: seasData.months,
      datasets: [
        {
          label: 'Overall',
          data: seasData.overall,
          backgroundColor: C.green,
          borderRadius: 3
        },
        {
          label: 'Conferences',
          data: seasData.byType['Conference'],
          type: 'line',
          borderColor: C.blue,
          backgroundColor: C.blue,
          pointRadius: 3,
          tension: 0.3
        },
        {
          label: 'Corporate Parties',
          data: seasData.byType['Corporate Party'],
          type: 'line',
          borderColor: C.amber,
          backgroundColor: C.amber,
          pointRadius: 3,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: legendColor('chartSeasonality'), boxWidth: 12, font: { size: 10 } } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + '%' } }
      },
      scales: {
        x: { ticks: { color: tickColor('chartSeasonality'), font: { size: 10 } }, grid: { display: false } },
        y: {
          ticks: { color: tickColor('chartSeasonality'), callback: v => v + '%' },
          grid: { color: gridColor('chartSeasonality') }
        }
      }
    }
  });

  /* ── 8b. Day of Week ── */
  new Chart(document.getElementById('chartDOW'), {
    type: 'bar',
    data: {
      labels: DATA.dayOfWeek.days,
      datasets: [{
        label: 'Share of events',
        data: DATA.dayOfWeek.pcts,
        backgroundColor: DATA.dayOfWeek.pcts.map(v => v > 20 ? C.green : (v > 10 ? C.greenHover : C.greenLight)),
        borderRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.raw + '% of events' } }
      },
      scales: {
        x: { ticks: { color: tickColor('chartDOW') }, grid: { display: false } },
        y: {
          ticks: { color: tickColor('chartDOW'), callback: v => v + '%' },
          grid: { color: gridColor('chartDOW') },
          beginAtZero: true
        }
      }
    }
  });

  /* ── 9. Venue Shopping ── */
  new Chart(document.getElementById('chartShopping'), {
    type: 'bar',
    data: {
      labels: DATA.venueShopping.years,
      datasets: [
        {
          label: 'Avg. venues per enquiry',
          data: DATA.venueShopping.avgVenues,
          backgroundColor: C.green,
          borderRadius: 4,
          yAxisID: 'y'
        },
        {
          label: 'Multi-venue enquiries',
          data: DATA.venueShopping.multiVenuePct,
          type: 'line',
          borderColor: C.blue,
          backgroundColor: C.blue,
          pointRadius: 5,
          tension: 0.3,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: tickColor('chartShopping'), boxWidth: 12 } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label === 'Multi-venue enquiries'
              ? ctx.dataset.label + ': ' + ctx.raw + '%'
              : ctx.dataset.label + ': ' + ctx.raw
          }
        }
      },
      scales: {
        x: { ticks: { color: tickColor('chartShopping') }, grid: { display: false } },
        y: {
          position: 'left',
          ticks: { color: tickColor('chartShopping') },
          grid: { color: gridColor('chartShopping') },
          title: { display: true, text: 'Venues', color: tickColor('chartShopping') },
          beginAtZero: true
        },
        y1: {
          position: 'right',
          min: 30, max: 70,
          ticks: { color: C.blue, callback: v => v + '%' },
          grid: { display: false },
          title: { display: true, text: 'Multi-venue %', color: C.blue }
        }
      }
    }
  });

  /* ── 10. Venue Type YoY ── */
  const vtData = DATA.venueTypeYoY;
  const vtColors = [C.green, C.dark, C.blue, C.greenHover, C.amber, C.greenLight, C.border];
  new Chart(document.getElementById('chartVenueYoY'), {
    type: 'line',
    data: {
      labels: vtData.years,
      datasets: vtData.types.map((t, i) => ({
        label: t.type,
        data: t.pcts,
        borderColor: vtColors[i],
        backgroundColor: vtColors[i],
        pointRadius: 4,
        tension: 0.3,
        borderWidth: t.type === 'Conference Centre' ? 3 : 2
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: legendColor('chartVenueYoY'), boxWidth: 12, font: { size: 10 } } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + '%' } }
      },
      scales: {
        x: { ticks: { color: tickColor('chartVenueYoY') }, grid: { display: false } },
        y: {
          ticks: { color: tickColor('chartVenueYoY'), callback: v => v + '%' },
          grid: { color: gridColor('chartVenueYoY') }
        }
      }
    }
  });

  /* ── 11. Venue Type Pricing ── */
  const vpData = DATA.venueTypePricing;
  new Chart(document.getElementById('chartVenuePricing'), {
    type: 'bar',
    data: {
      labels: vpData.map(d => d.type),
      datasets: [{
        label: 'Typical booking value',
        data: vpData.map(d => d.median),
        backgroundColor: vpData.map((d, i) => {
          if (d.median > 9000) return C.green;
          if (d.median > 5000) return C.greenHover;
          return C.greenLight;
        }),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => fmtGBP(ctx.raw) + ' median (n=' + vpData[ctx.dataIndex].n + ')' } }
      },
      scales: {
        x: {
          ticks: { color: tickColor('chartVenuePricing'), callback: v => fmtGBP(v) },
          grid: { color: gridColor('chartVenuePricing') }
        },
        y: {
          ticks: { color: tickColor('chartVenuePricing'), font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

/* ══════════════════════════════════════════════════
   FULLPAGE.JS INIT
   ══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
  new fullpage('#fullpage', {
    licenseKey: '',
    autoScrolling: true,
    scrollingSpeed: 700,
    navigation: true,
    navigationPosition: 'right',
    navigationTooltips: [
      'Title', 'Summary', 'Market', 'Spending',
      'By Category', 'Planning', 'Event Types',
      'Timing', 'Venue Selection', 'Venue Trends',
      'Venue Pricing', 'Takeaways', ''
    ],
    afterLoad: function(origin, destination) {
      // Animate stat cards
      destination.item.querySelectorAll('.stat-card, .callout, .insight-card').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
          el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 100 + i * 80);
      });
    }
  });

  initCharts();
});
