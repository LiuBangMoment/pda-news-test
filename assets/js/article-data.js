/**
 * Centralized Article Database
 * Used to populate index cards, related stories, and dynamic metadata.
 */
const ARTICLES = [
  {
    id: "democracy-begins",
    title: "Nigerian democracy begins amidst fierce debate and chaos",
    deck: "Forward! reports on the first day of the Constitutional Assembly, including the judiciary hearing",
    category: "Politics",
    author: "Abraham Mutfwang",
    date: "2026-04-08T09:00:00Z",
    url: "politics-democracy-begins.html",
    img: "assets/img/national-assembly.webp"
  },
  {
    id: "progressive-bloc",
    title: "Progressive parties create joint parliamentary group",
    deck: "Following a fractured election, a new progressive bloc consolidates its platform, publishing its defining 'Points of Unity' exclusively in Forward!",
    category: "Politics",
    author: "Hadiza Usaini",
    date: "2026-04-08T06:00:00Z",
    url: "progressive-parties-group.html",
    img: "assets/img/improve.webp"
  },
  {
    id: "friln-chairman",
    title: "FRILN chairman reportedly unaware of appointment as deputy speaker",
    deck: "Theodore Nwobi asks 'what is a deputy speaker' during lunch break at the National Assembly.",
    category: "Politics",
    author: "Forward! Staff",
    date: "2026-04-08T05:00:00Z",
    url: "friln-chairman.html",
    img: "assets/img/nwobi.webp",
    imgStyle: "object-position: center 25%;"
  },
  {
    id: "makoko-rents",
    title: "Makoko rent prices skyrocket as demand for waterfront property grows",
    deck: "Local residents fear displacement as luxury developers eye the historic district.",
    category: "Lagos",
    author: "Tunde Ojo",
    date: "2026-04-08T09:00:00Z",
    url: "makoko-rents.html",
    img: "assets/img/evolving-new-makoko.webp"
  },
  {
    id: "parliament-builder",
    title: "Interactive: Build Your Own Parliament",
    deck: "Simulate the balance of power in the Constitutional Assembly. Add factions and forge theoretical majorities.",
    category: "Analysis",
    author: "Interactive Desk",
    date: "2026-04-08T02:00:00Z",
    url: "build-your-own-parliament.html",
    img: "assets/img/government-builder.webp"
  },
  {
    id: "lagos-accident",
    title: "Yet another accident at the main junction to Lagos",
    deck: "Commuters call for urgent safety upgrades as the junction remains a 'death trap'.",
    category: "Lagos",
    author: "Forward! Staff",
    date: "2026-04-07T10:00:00Z",
    url: "lagos-accident.html",
    img: "assets/img/junction-accident.webp"
  }
];

// For backward compatibility while we migrate
const NEWS_METADATA = {};
ARTICLES.forEach(a => {
  NEWS_METADATA[a.url] = a.date;
});
