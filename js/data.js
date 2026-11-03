// Edit Soul Studio — content that the pages share.
// Change things here: the WhatsApp number, work items, kits and the "Start a project" options.

export const WHATSAPP = '91XXXXXXXXXX'; // country code + number, no + or spaces
export const INSTAGRAM = 'https://www.instagram.com/editsoulstudio.in/';

// The four doors. Every page, filter and recommendation uses these keys.
export const DOORS = {
  content: { name: 'Content', verb: 'Get noticed', href: 'content/' },
  'brand-web': { name: 'Brand & Web', verb: 'Look the part', href: 'brand-web/' },
  growth: { name: 'Growth', verb: 'Get found', href: 'growth/' },
  systems: { name: 'Systems', verb: 'Run smoother', href: 'systems/' },
};

// Work. `views` shows as a counter; `sample: true` adds a "Sample" tag until the real project is in.
// For a real thumbnail add `thumb: 'media/file.jpg'` (put the image in /media).
export const WORK = [
  { title: 'Baahubali masking edit', door: 'content', kind: 'Video edit', views: 241000, link: INSTAGRAM, still: 0 },
  { title: 'Pursuit', door: 'content', kind: 'Short film', views: 21900, link: INSTAGRAM, still: 2 },
  { title: 'Instagram reel', door: 'content', kind: 'Reel', views: 13100, link: INSTAGRAM, still: 1 },
  { title: 'Café launch', door: 'brand-web', kind: 'Identity + website', sample: true, link: INSTAGRAM, still: 5 },
  { title: 'Clinic on Google', door: 'growth', kind: 'Google profile + SEO', sample: true, link: INSTAGRAM, still: 4 },
  { title: 'Restaurant QR menu', door: 'systems', kind: 'Menu + table ordering', sample: true, link: INSTAGRAM, still: 3 },
];

// Kits: the common jobs, packaged. No prices on the site.
export const KITS = [
  { id: 'launch', name: 'Launch Kit', for: 'New shops, cafés and clinics', doors: ['brand-web', 'content', 'growth'],
    gets: ['Logo and brand look', 'A website that works on phones', 'Google Business Profile set up', '4 launch reels'] },
  { id: 'monthly', name: 'Monthly Content', for: 'Businesses that post every week', doors: ['content', 'growth'],
    gets: ['One shoot every month', 'Reels and posts, edited', 'Captions written for you', 'A short monthly report'] },
  { id: 'creator', name: 'Creator Kit', for: 'YouTubers and influencers', doors: ['content', 'growth'],
    gets: ['Video editing, every week', 'Thumbnails and titles', 'Scripts and hooks', 'Channel SEO'] },
  { id: 'film', name: 'Film Post', for: 'Short films and series', doors: ['content'],
    gets: ['Edit, from assembly to final cut', 'Color grading', 'Sound design and mix', 'Subtitles, teaser and trailer'] },
  { id: 'system', name: 'Business System', for: 'Restaurants first, then clinics and shops', doors: ['systems'],
    gets: ['QR menu in your brand', 'Table ordering and staff app', 'Owner dashboard', 'Nightly report on WhatsApp'] },
  { id: 'moments', name: 'Moments', for: 'Birthdays, weddings, portraits', doors: ['content'],
    gets: ['Photo and video shoot', 'Edited photos', 'A short film of the day', 'Files ready to share'] },
];

// "Start a project": three quick questions, then WhatsApp.
export const BRIEF = {
  who: ['A business', 'A creator', 'Something personal'],
  want: [
    { label: 'More customers', recs: ['door:growth', 'kit:monthly', 'door:content'] },
    { label: 'A channel that grows', recs: ['kit:creator', 'door:content'] },
    { label: 'Launch something new', recs: ['kit:launch', 'door:brand-web'] },
    { label: 'A website', recs: ['door:brand-web', 'door:growth'] },
    { label: 'Capture an event', recs: ['kit:moments'] },
    { label: 'Finish my film', recs: ['kit:film'] },
    { label: 'Run things smoother', recs: ['kit:system', 'door:systems'] },
    { label: 'Not sure yet', recs: ['door:content', 'door:brand-web', 'door:growth'] },
  ],
  when: ['This week', 'This month', 'Just exploring'],
};
