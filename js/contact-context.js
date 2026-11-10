(() => {
  'use strict';
  const form = document.querySelector('form[name="contact"]');
  if (!form || form.dataset.contextReady) return;
  form.dataset.contextReady = 'true';

  const industry = form.querySelector('[name="industry"]');
  const interest = form.querySelector('[name="interest"]');
  const intent = form.querySelector('[name="demo-intent"]');
  const summary = document.getElementById('contact-context');
  if (!industry || !interest || !intent || !summary) return;

  const industries = {
    restaurant: 'Restaurant', dental: 'Dental practice', legal: 'Legal practice',
    retail: 'Retail store', auto_parts: 'Auto parts'
  };
  const interests = {
    voice: 'An AI voice agent', messenger: 'A Messenger bot', email: 'An email bot',
    website: 'A website', workflow: 'Workflow automation', portals: 'Portals',
    multiple: 'More than one', unsure: 'Not sure yet'
  };
  const params = new URLSearchParams(window.location.search);
  // Reject ambiguous values as well as anything outside these public codes.
  const single = name => params.getAll(name).length === 1 ? params.get(name) : null;
  const known = (map, key) => Object.prototype.hasOwnProperty.call(map, key);
  const atDefault = select => {
    const initial = Array.from(select.options).find(option => option.defaultSelected) || select.options[0];
    return !select.dataset.contextEdited && select.value === initial.value;
  };
  const industryCode = single('industry');
  const interestCode = single('interest');
  if (known(industries, industryCode) && atDefault(industry)) industry.value = industryCode;
  if (known(interests, interestCode) && atDefault(interest)) interest.value = interests[interestCode];
  if (single('intent') === 'demo') intent.value = 'demo';

  const updateSummary = () => {
    const hasIndustry = known(industries, industry.value);
    const hasContext = hasIndustry || intent.value === 'demo' || known(interests, interestCode);
    summary.hidden = !hasContext;
    if (!hasContext) { summary.textContent = ''; return; }
    const parts = [];
    if (hasIndustry) parts.push(industries[industry.value]);
    parts.push(interest.options[interest.selectedIndex].textContent);
    summary.textContent = 'Interested in: ' + parts.join(' · ') +
      (intent.value === 'demo' ? ' · Demo walkthrough.' : '.') +
      ' You can change the selections below.';
  };
  [industry, interest].forEach(select => select.addEventListener('change', () => {
    select.dataset.contextEdited = 'true';
    updateSummary();
  }));
  // Native form resets remain usable; never reapply URL choices over a person's edits.
  form.addEventListener('reset', () => setTimeout(updateSummary, 0));
  updateSummary();
})();
