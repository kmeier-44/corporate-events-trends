// ──────────────────────────────────────────────────────────────
//  Personalisation layer for the Organisers Report
//  Activated when ?cid= is present in the URL.
//  Fetches contact prefs from the Cloud Run proxy and:
//    1. Shows/hides event-type and industry-specific slides
//    2. Adds industry comparison insights to event type slides
//    3. Swaps the CTA to the owner's meeting link
//    4. Personalises headings with company name / owner name
// ──────────────────────────────────────────────────────────────

(function () {
  'use strict';

  var PROXY_URL = 'https://contact-prefs-proxy-953543879564.europe-west2.run.app/contact-prefs';
  var params = new URLSearchParams(window.location.search);
  var cid = params.get('cid');
  if (!cid) return; // No personalisation needed

  // ── Fetch contact data ──
  window._personaliseReady = fetch(PROXY_URL + '?cid=' + encodeURIComponent(cid))
    .then(function (res) {
      if (!res.ok) throw new Error('Proxy returned ' + res.status);
      return res.json();
    })
    .then(function (data) {
      applyPersonalisation(data);
      return data;
    })
    .catch(function (err) {
      console.warn('[personalise] Failed to load contact data:', err);
    })
    .finally(function () {
      hideLoadingOverlay();
    });

  function hideLoadingOverlay() {
    var overlay = document.getElementById('personalise-overlay');
    if (overlay) {
      overlay.classList.add('personalise-overlay--hidden');
      setTimeout(function () { overlay.remove(); }, 500);
    }
  }

  // ── Main personalisation logic ──
  function applyPersonalisation(data) {
    if (!data) return;
    window._contactPrefs = data;

    // Resolve industry profile first — needed by event type slides
    var industryProfile = resolveIndustryProfile(data.industry);

    personaliseTitle(data);
    personaliseCta(data);
    showEventTypeSlides(data, industryProfile);
    showIndustrySlide(data, industryProfile);
    personaliseVenueSourcing(industryProfile);
    showEventTypeTrendsSlide(industryProfile);
    personaliseLeadTimes(data);
  }

  // ── Resolve industry profile from HubSpot industry value ──
  function resolveIndustryProfile(industry) {
    if (!industry) return null;
    var needle = industry.toLowerCase();
    var profiles = DATA.industryProfiles;
    for (var i = 0; i < profiles.length; i++) {
      var p = profiles[i];
      if (!p.hubspotValues) continue;
      for (var j = 0; j < p.hubspotValues.length; j++) {
        if (p.hubspotValues[j].toLowerCase() === needle) return p;
      }
    }
    return null;
  }

  // ── Title slide ──
  function personaliseTitle(data) {
    var subtitle = document.querySelector('.title-slide .subtitle');
    if (subtitle && data.company_name) {
      subtitle.textContent = 'Personalised insights for ' + data.company_name + ' \u2014 powered by 40,000+ corporate enquiries';
    }

    var spans = document.querySelectorAll('.title-slide p');
    for (var i = 0; i < spans.length; i++) {
      if (spans[i].textContent.indexOf('For Event Organisers') !== -1) {
        if (data.owner_name) spans[i].textContent = 'Prepared by ' + data.owner_name;
        break;
      }
    }
  }

  // ── CTA swap ──
  function personaliseCta(data) {
    var stickyBtn = document.querySelector('.sticky-cta__btn');
    if (stickyBtn && data.meeting_link) {
      var sep = data.meeting_link.indexOf('?') === -1 ? '?' : '&';
      stickyBtn.href = data.meeting_link + sep + 'utm_source=Corporate%20Events%20Report';
      stickyBtn.innerHTML = 'Book a Call with ' + (data.owner_first_name || 'Your Manager') + ' <span>&rarr;</span>';
    }

    var ctaBtn = document.querySelector('.cta-slide .cta-btn');
    if (ctaBtn && data.meeting_link) {
      var sep2 = data.meeting_link.indexOf('?') === -1 ? '?' : '&';
      ctaBtn.href = data.meeting_link + sep2 + 'utm_source=Corporate%20Events%20Report';
      ctaBtn.innerHTML = 'Book a Call with ' + (data.owner_first_name || 'Your Manager') + ' &rarr;';
    }

    var ctaHeading = document.querySelector('.cta-slide h2');
    if (ctaHeading && data.owner_first_name) {
      ctaHeading.textContent = 'Ready to Plan Your Next Event?';
    }
  }

  // ── Event type slides ──
  function showEventTypeSlides(data, industryProfile) {
    if (!data.preferred_event_types) return;

    var types = data.preferred_event_types.split(',').map(function (t) { return t.trim(); });
    var matched = [];

    types.forEach(function (hsValue) {
      // Normalise: proxy may return "summer parties" or "summer-parties"
      var normalised = hsValue.replace(/\s+/g, '-');
      var key = HUBSPOT_TO_EVENT_KEY[normalised] || HUBSPOT_TO_EVENT_KEY[hsValue];
      if (!key || !DATA.eventTypeProfiles[key]) return;
      matched.push({ key: key, profile: DATA.eventTypeProfiles[key] });
    });

    if (matched.length === 0) return;

    var toShow = matched.slice(0, 3);
    toShow.forEach(function (item) {
      var slide = document.getElementById('personalised-event-' + item.key);
      if (slide) {
        slide.style.display = '';
        slide.classList.remove('personalised-hidden');
        populateEventSlide(item.key, item.profile, industryProfile);
      }
    });
  }

  // ── Populate event type slide ──
  function populateEventSlide(key, profile, industryProfile) {
    var slide = document.getElementById('personalised-event-' + key);
    if (!slide) return;

    var fill = function (selector, value) {
      var el = slide.querySelector(selector);
      if (el) el.textContent = value;
    };

    fill('.pe-spend-median', formatCurrency(profile.spend.median));
    fill('.pe-spend-range', formatCurrency(profile.spend.p25) + ' \u2013 ' + formatCurrency(profile.spend.p75));
    fill('.pe-pph', formatCurrency(profile.pph));
    fill('.pe-group-median', profile.groupSize.median.toLocaleString());
    fill('.pe-group-range', profile.groupSize.p25 + ' \u2013 ' + profile.groupSize.p75);
    fill('.pe-lead-median', profile.leadDays.median + ' days');
    fill('.pe-lead-range', profile.leadDays.p25 + ' \u2013 ' + profile.leadDays.p75 + ' days');
    fill('.pe-peak-months', profile.peakMonths.join(', '));
    fill('.pe-peak-day', profile.peakDay);
    fill('.pe-tip', profile.tip);
    // sample size footnote removed per user feedback

    // Inject industry comparison if we have an industry match
    if (industryProfile) {
      injectIndustryComparison(slide, profile, industryProfile);
    }
  }

  // ── Industry comparison insights injected into event type slides ──
  function injectIndustryComparison(slide, eventProfile, indProfile) {
    var container = slide.querySelector('.pe-industry-comparison');
    if (!container) return;

    var insights = generateComparisonInsights(eventProfile, indProfile);
    if (insights.length === 0) return;

    // Build heading
    var heading = document.createElement('h3');
    heading.className = 'pe-comparison-heading';
    heading.textContent = 'How This Compares to ' + indProfile.industry;
    container.appendChild(heading);

    // Build comparison cards
    var grid = document.createElement('div');
    grid.className = 'pe-comparison-grid';

    insights.forEach(function (insight) {
      var card = document.createElement('div');
      card.className = 'pe-comparison-card';

      var indicator = document.createElement('div');
      indicator.className = 'pe-comparison-indicator ' + insight.direction;
      indicator.textContent = insight.delta;

      var label = document.createElement('div');
      label.className = 'pe-comparison-label';
      label.textContent = insight.label;

      var detail = document.createElement('div');
      detail.className = 'pe-comparison-detail';
      detail.textContent = insight.detail;

      card.appendChild(indicator);
      card.appendChild(label);
      card.appendChild(detail);
      grid.appendChild(card);
    });

    container.appendChild(grid);

    // Add a contextual takeaway
    var takeaway = generateTakeaway(eventProfile, indProfile);
    if (takeaway) {
      var p = document.createElement('p');
      p.className = 'pe-comparison-takeaway';
      p.textContent = takeaway;
      container.appendChild(p);
    }
  }

  // ── Generate comparison data points ──
  function generateComparisonInsights(eventProfile, indProfile) {
    var insights = [];

    // Spend comparison
    var spendDelta = eventProfile.spend.median - indProfile.medianSpend;
    var spendPct = Math.round((spendDelta / indProfile.medianSpend) * 100);
    insights.push({
      label: 'Spend vs Industry Average',
      delta: (spendPct >= 0 ? '+' : '') + spendPct + '%',
      detail: formatCurrency(eventProfile.spend.median) + ' vs ' + formatCurrency(indProfile.medianSpend) + ' industry median',
      direction: spendPct >= 0 ? 'higher' : 'lower'
    });

    // PPH comparison
    var pphDelta = eventProfile.pph - indProfile.pph;
    var pphPct = Math.round((pphDelta / indProfile.pph) * 100);
    insights.push({
      label: 'Per Head vs Industry',
      delta: (pphPct >= 0 ? '+' : '') + pphPct + '%',
      detail: formatCurrency(eventProfile.pph) + ' vs ' + formatCurrency(indProfile.pph) + ' industry average',
      direction: pphPct >= 0 ? 'higher' : 'lower'
    });

    // Group size comparison
    var groupDelta = eventProfile.groupSize.median - indProfile.groupSize;
    var groupPct = Math.round((groupDelta / indProfile.groupSize) * 100);
    insights.push({
      label: 'Group Size vs Industry',
      delta: (groupPct >= 0 ? '+' : '') + groupPct + '%',
      detail: eventProfile.groupSize.median + ' vs ' + indProfile.groupSize + ' industry average',
      direction: groupPct >= 0 ? 'larger' : 'smaller'
    });

    // Lead time comparison
    var leadDelta = eventProfile.leadDays.median - indProfile.leadDays;
    var leadPct = Math.round((leadDelta / indProfile.leadDays) * 100);
    insights.push({
      label: 'Lead Time vs Industry',
      delta: (leadPct >= 0 ? '+' : '') + leadPct + '%',
      detail: eventProfile.leadDays.median + ' vs ' + indProfile.leadDays + ' days industry average',
      direction: leadPct >= 0 ? 'longer' : 'shorter'
    });

    return insights;
  }

  // ── Generate a contextual takeaway sentence ──
  function generateTakeaway(eventProfile, indProfile) {
    var spendRatio = eventProfile.spend.median / indProfile.medianSpend;
    var leadRatio = eventProfile.leadDays.median / indProfile.leadDays;
    var groupRatio = eventProfile.groupSize.median / indProfile.groupSize;

    var parts = [];

    if (spendRatio > 1.3) {
      parts.push(eventProfile.label + 's cost significantly more than your industry average \u2014 budget ' + Math.round((spendRatio - 1) * 100) + '% above your usual spend');
    } else if (spendRatio < 0.7) {
      parts.push(eventProfile.label + 's are a cost-effective format for your sector, coming in well below industry norms');
    }

    if (leadRatio > 1.2) {
      parts.push('plan ' + Math.round((leadRatio - 1) * 100) + '% further ahead than your typical events to secure the right venue');
    } else if (leadRatio < 0.8) {
      parts.push('these events have shorter planning cycles than your industry norm \u2014 but starting early still helps');
    }

    if (groupRatio > 1.5) {
      parts.push('group sizes run much larger, so prioritise venues with high-capacity spaces');
    } else if (groupRatio < 0.5) {
      parts.push('these are more intimate events \u2014 consider boutique or private dining venues');
    }

    if (parts.length === 0) return null;
    // Capitalise first part and join
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return parts.join('. ') + '.';
  }

  // ── Industry slide ──
  function showIndustrySlide(data, industryProfile) {
    if (!industryProfile) return;

    var slide = document.getElementById('personalised-industry');
    if (!slide) return;

    slide.style.display = '';
    slide.classList.remove('personalised-hidden');

    var fill = function (selector, value) {
      var el = slide.querySelector(selector);
      if (el) el.textContent = value;
    };

    fill('.pi-industry-name', industryProfile.industry);
    fill('.pi-spend-median', formatCurrency(industryProfile.medianSpend));
    fill('.pi-spend-range', formatCurrency(industryProfile.p25) + ' \u2013 ' + formatCurrency(industryProfile.p75));
    fill('.pi-pph', formatCurrency(industryProfile.pph));
    fill('.pi-group-size', industryProfile.groupSize.toLocaleString());
    fill('.pi-lead-days', industryProfile.leadDays + ' days');

    injectMarketComparison(slide, industryProfile);
    createIndustryChart(slide, industryProfile);

    var heading = slide.querySelector('h2');
    if (heading) {
      heading.textContent = 'How ' + industryProfile.industry + ' Companies Book Events';
    }
  }

  // ── Horizontal bar chart: this industry vs all industries ──
  function createIndustryChart(slide, indProfile) {
    var canvas = slide.querySelector('#chartIndustryCompare');
    if (!canvas || typeof Chart === 'undefined') return;

    // Sort all industries by median spend and highlight the current one
    var allProfiles = DATA.industryProfiles.slice().sort(function (a, b) {
      return b.medianSpend - a.medianSpend;
    });

    var labels = allProfiles.map(function (p) { return p.industry; });
    var values = allProfiles.map(function (p) { return p.medianSpend; });
    var colours = allProfiles.map(function (p) {
      return p.industry === indProfile.industry ? '#00A82C' : 'rgba(255,255,255,0.15)';
    });
    var borderColours = allProfiles.map(function (p) {
      return p.industry === indProfile.industry ? '#00A82C' : 'rgba(255,255,255,0.25)';
    });

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colours,
          borderColor: borderColours,
          borderWidth: 1,
          borderRadius: 4
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
              label: function (ctx) { return '\u00A3' + ctx.parsed.x.toLocaleString() + ' median spend'; }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: {
              color: 'rgba(255,255,255,0.5)',
              callback: function (v) { return '\u00A3' + (v / 1000).toFixed(0) + 'k'; }
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: function (ctx) {
                return labels[ctx.index] === indProfile.industry ? '#00A82C' : 'rgba(255,255,255,0.6)';
              },
              font: function (ctx) {
                return { weight: labels[ctx.index] === indProfile.industry ? '700' : '400', size: 11 };
              }
            }
          }
        }
      }
    });
  }

  // ── Market-wide comparison insights for industry slide ──
  function injectMarketComparison(slide, indProfile) {
    var container = slide.querySelector('.pi-market-comparison');
    if (!container) return;

    var marketSpend = DATA.bookingValues.median[2]; // 2025
    var marketPph = DATA.pricePerHead.median[2]; // 2025

    // Rank among industries
    var sorted = DATA.industryProfiles.slice().sort(function (a, b) { return b.medianSpend - a.medianSpend; });
    var rank = 0;
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i].industry === indProfile.industry) { rank = i + 1; break; }
    }

    var heading = document.createElement('h3');
    heading.className = 'pe-comparison-heading';
    heading.textContent = 'How You Compare';
    container.appendChild(heading);

    var insights = [];

    if (rank > 0) {
      var rankText = rank === 1 ? 'the highest-spending' :
        rank === sorted.length ? 'the lowest-spending' :
        ordinal(rank) + ' highest-spending';
      insights.push(indProfile.industry + ' is ' + rankText + ' industry out of ' + sorted.length + ' sectors we track');
    }

    var spendDelta = Math.round(((indProfile.medianSpend - marketSpend) / marketSpend) * 100);
    if (Math.abs(spendDelta) >= 5) {
      insights.push('Median spend is ' + Math.abs(spendDelta) + '% ' +
        (spendDelta > 0 ? 'above' : 'below') + ' the overall market median of ' + formatCurrency(marketSpend));
    }

    var pphDelta = Math.round(((indProfile.pph - marketPph) / marketPph) * 100);
    if (Math.abs(pphDelta) >= 5) {
      insights.push('Per-head costs run ' + Math.abs(pphDelta) + '% ' +
        (pphDelta > 0 ? 'higher' : 'lower') + ' than the market average of ' + formatCurrency(marketPph));
    }

    if (indProfile.leadDays > 110) {
      insights.push('With ' + indProfile.leadDays + '-day lead times, your sector plans well ahead \u2014 use this to negotiate better rates');
    } else if (indProfile.leadDays < 90) {
      insights.push('Your sector books faster than most at ' + indProfile.leadDays + ' days \u2014 planning earlier unlocks better availability');
    }

    if (insights.length === 0) return;

    var list = document.createElement('ul');
    list.className = 'pi-market-insights';
    insights.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    });
    container.appendChild(list);
  }

  // ── Personalise Venue Sourcing slide (slide 9) with industry-specific trends ──
  function personaliseVenueSourcing(indProfile) {
    if (!indProfile) return;

    var vtData = DATA.venueTypesByIndustry && DATA.venueTypesByIndustry[indProfile.industry];
    if (!vtData) return;

    // Minimum threshold: if the top gaining change is < 1.0pp, keep generic market-wide cards
    var topChange = vtData.gaining && vtData.gaining.length > 0 ? vtData.gaining[0].change : 0;
    if (topChange < 1.0) return;

    var container = document.getElementById('venue-type-trends');
    if (!container) return;

    // Clear existing generic cards
    container.innerHTML = '';

    // Gaining heading + cards
    if (vtData.gaining && vtData.gaining.length > 0) {
      var gainH = document.createElement('h3');
      gainH.textContent = 'Venue Types Gaining Share in ' + indProfile.industry;
      container.appendChild(gainH);

      var gainCards = document.createElement('div');
      gainCards.className = 'venue-trend-cards';
      vtData.gaining.slice(0, 4).forEach(function (t) {
        var card = document.createElement('div');
        card.className = 'venue-trend-card';
        card.innerHTML = '<div class="stat-value">+' + t.change.toFixed(1) + '%</div>' +
          '<div class="stat-label">' + t.type + '</div>' +
          '<div class="stat-detail">' + t.from.toFixed(1) + '% &rarr; ' + t.to.toFixed(1) + '%</div>';
        gainCards.appendChild(card);
      });
      container.appendChild(gainCards);
    }

    // Declining heading + cards
    if (vtData.declining && vtData.declining.length > 0) {
      var decH = document.createElement('h3');
      decH.style.marginTop = '20px';
      decH.textContent = 'Venue Types Declining';
      container.appendChild(decH);

      var decCards = document.createElement('div');
      decCards.className = 'venue-trend-cards';
      vtData.declining.forEach(function (t) {
        var card = document.createElement('div');
        card.className = 'venue-trend-card declining';
        card.innerHTML = '<div class="stat-value">' + t.change.toFixed(1) + '%</div>' +
          '<div class="stat-label">' + t.type + '</div>' +
          '<div class="stat-detail">' + t.from.toFixed(1) + '% &rarr; ' + t.to.toFixed(1) + '%</div>';
        decCards.appendChild(card);
      });
      container.appendChild(decCards);
    }
  }

  // ── Personalise Lead Times cards (slide 5) ──
  // Show the user's preferred event types first, then fill remaining slots
  // with top categories from the generic list.
  function personaliseLeadTimes(data) {
    if (!data.preferred_event_types) return;

    var container = document.getElementById('leadTimeCards');
    if (!container) return;

    var allCats = DATA.leadTimes.byCategory;
    if (!allCats || allCats.length === 0) return;

    // Map eventTypeProfiles keys to byCategory category names
    var keyToCategoryName = {};
    for (var k in DATA.eventTypeProfiles) {
      if (DATA.eventTypeProfiles.hasOwnProperty(k)) {
        keyToCategoryName[k] = DATA.eventTypeProfiles[k].label;
      }
    }

    // Parse preferred event types and map to byCategory entries
    var types = data.preferred_event_types.split(',').map(function (t) { return t.trim(); });
    var preferredNames = [];

    types.forEach(function (hsValue) {
      var normalised = hsValue.replace(/\s+/g, '-');
      var key = HUBSPOT_TO_EVENT_KEY[normalised] || HUBSPOT_TO_EVENT_KEY[hsValue];
      if (key && keyToCategoryName[key]) {
        preferredNames.push(keyToCategoryName[key]);
      }
    });

    if (preferredNames.length === 0) return;

    // Find matching byCategory entries for preferred types
    var preferred = [];
    var preferredSet = {};
    preferredNames.forEach(function (name) {
      for (var i = 0; i < allCats.length; i++) {
        if (allCats[i].category === name && !preferredSet[name]) {
          preferred.push(allCats[i]);
          preferredSet[name] = true;
          break;
        }
      }
    });

    // Fill remaining slots with top categories not already included
    var maxCards = 5;
    var remaining = maxCards - preferred.length;
    var fillers = [];
    for (var i = 0; i < allCats.length && fillers.length < remaining; i++) {
      if (!preferredSet[allCats[i].category]) {
        fillers.push(allCats[i]);
      }
    }

    var finalList = preferred.concat(fillers);

    // Descriptions (same as charts-organisers.js)
    var descriptions = {
      'Award Ceremony': 'High-profile events with complex logistics \u2014 start 5+ months out to secure prestige venues',
      'Gala Dinner': 'Large formal events demanding premium venues \u2014 begin your search early',
      'Conference': 'Large capacity venues book up fast \u2014 begin your search nearly 4 months ahead',
      'Summer Party': 'Peak-season demand means the best outdoor and rooftop spaces go early',
      'Christmas Party': 'December availability shrinks fast \u2014 3+ months lead time is now standard',
      'Networking': 'Growing lead times as networking events become larger and more popular',
      'Private Dining': 'Intimate events with specific venue requirements \u2014 plan well ahead',
      'Corporate Party': 'Versatile category but popular venues still need advance booking',
      'Pop-Up': 'Flexible format but trending shorter lead times \u2014 act fast',
      'Meeting': 'Shortest lead times, but planning ahead still secures better rooms'
    };

    // Rebuild the cards
    container.innerHTML = '';

    finalList.forEach(function (cat, idx) {
      var card = document.createElement('div');
      card.className = 'stat-card';

      // Highlight preferred types
      var isPreferred = !!preferredSet[cat.category];
      var badge = isPreferred ? '<span class="preferred-badge">Your event type</span>' : '';

      var arrowHtml = '';
      if (cat.median2022 !== null && cat.median2022 !== undefined) {
        var diff = cat.median - cat.median2022;
        if (diff > 0) {
          arrowHtml = '<span class="trend-arrow up">\u2191 +' + diff + ' days</span>';
        } else if (diff < 0) {
          arrowHtml = '<span class="trend-arrow down">\u2193 ' + diff + ' days</span>';
        }
      }

      card.innerHTML =
        badge +
        '<div class="stat-value">' + cat.median + ' days' + arrowHtml + '</div>' +
        '<div class="stat-label">' + cat.category + '</div>' +
        '<div class="stat-detail">' + (descriptions[cat.category] || '') + '</div>';

      container.appendChild(card);
    });

    // Update the title to reflect personalisation
    var title = document.querySelector('.lead-time-stats-title');
    if (title) {
      title.textContent = 'Lead Times for Your Event Types';
    }
  }

  // ── Event Type Trends slide (personalised by industry) ──
  function showEventTypeTrendsSlide(indProfile) {
    if (!indProfile) return;

    var etData = DATA.eventTypesByIndustry && DATA.eventTypesByIndustry[indProfile.industry];
    if (!etData) return;

    var slide = document.getElementById('personalised-event-type-trends');
    if (!slide) return;

    slide.style.display = '';
    slide.classList.remove('personalised-hidden');

    var container = slide.querySelector('.event-type-trends-content');
    if (!container) return;

    container.innerHTML = '';

    // Gaining
    if (etData.gaining && etData.gaining.length > 0) {
      var gainH = document.createElement('h3');
      gainH.textContent = 'Event Types Gaining Share';
      container.appendChild(gainH);

      var gainCards = document.createElement('div');
      gainCards.className = 'venue-trend-cards';
      etData.gaining.slice(0, 4).forEach(function (t) {
        var card = document.createElement('div');
        card.className = 'venue-trend-card';
        card.innerHTML = '<div class="stat-value">+' + t.change.toFixed(1) + '%</div>' +
          '<div class="stat-label">' + t.type + '</div>' +
          '<div class="stat-detail">' + t.from.toFixed(1) + '% &rarr; ' + t.to.toFixed(1) + '%</div>';
        gainCards.appendChild(card);
      });
      container.appendChild(gainCards);
    }

    // Declining
    if (etData.declining && etData.declining.length > 0) {
      var decH = document.createElement('h3');
      decH.style.marginTop = '20px';
      decH.textContent = 'Event Types Declining';
      container.appendChild(decH);

      var decCards = document.createElement('div');
      decCards.className = 'venue-trend-cards';
      etData.declining.slice(0, 4).forEach(function (t) {
        var card = document.createElement('div');
        card.className = 'venue-trend-card declining';
        card.innerHTML = '<div class="stat-value">' + t.change.toFixed(1) + '%</div>' +
          '<div class="stat-label">' + t.type + '</div>' +
          '<div class="stat-detail">' + t.from.toFixed(1) + '% &rarr; ' + t.to.toFixed(1) + '%</div>';
        decCards.appendChild(card);
      });
      container.appendChild(decCards);
    }

    // Takeaway
    var takeaway = document.createElement('p');
    takeaway.className = 'event-type-trends-takeaway';
    takeaway.textContent = 'Based on share of all enquiries in ' + indProfile.industry + ', comparing 2022\u20132023 vs 2024\u20132025.';
    container.appendChild(takeaway);
  }

  // ── Ordinal helper ──
  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  // ── Utility ──
  function formatCurrency(n) {
    if (n >= 1000) return '\u00A3' + n.toLocaleString();
    return '\u00A3' + n;
  }

})();
