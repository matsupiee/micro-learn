import type { Art } from "./art";
export const books = {
  stoic: ["How to Be a Stoic", "Massimo Pigliucci"],
  split: ["Never Split the Difference", "Chris Voss"],
  shoe: ["Shoe Dog", "Phil Knight"],
  odyssey: ["The Odyssey", "Homer"],
  vampires: ["Our Vampires, Ourselves", "Nina Auerbach"],
  rings: ["The Lord of the Rings", "J. R. R. Tolkien"],
  brain: ["Brain Energy", "Chris Palmer"],
  die: ["Why We Die", "Venki Ramakrishnan"],
  breath: ["Breath", "James Nestor"],
  comfort: ["The Comfort Crisis", "Michael Easter"],
  power: ["The 48 Laws of Power", "Robert Greene"],
  outlive: ["Outlive", "Peter Attia"],
  atomic: ["Atomic Habits", "James Clear"],
  freak: ["Freakonomics", "Steven D. Levitt"],
  google: ["How Google Works", "Eric Schmidt"],
  mating: ["Mating in Captivity", "Esther Perel"],
  principles: ["Principles", "Ray Dalio"],
  leaders: ["Leaders Eat Last", "Simon Sinek"],
  spark: ["Spark", "John J. Ratey"],
  humans: ["Valuable Humans in Transit and Other Stories", "qntm"],
  rich: ["Rich Dad Poor Dad", "Robert T. Kiyosaki"],
  status: ["The Status Game", "Will Storr"],
  irrational: ["Predictably Irrational", "Dan Ariely"],
  propaganda: ["Propaganda", "Edward L. Bernays"],
  righteous: ["The Righteous Mind", "Jonathan Haidt"],
  ego: ["Ego Is the Enemy", "Ryan Holiday"],
  now: ["The Power of Now", "Eckhart Tolle"],
  rework: ["Rework", "Jason Fried"],
  badblood: ["Bad Blood", "John Carreyrou"],
  deep: ["Deep Work", "Cal Newport"],
  fools: ["What Do We Do with All These Fools?", "Theodor Paleologu"],
  think: ["Thinking, Fast and Slow", "Daniel Kahneman"],
  stick: ["Make It Stick", "Peter Brown"],
  web3: ["Introduction to Web 3.0", "Technology"],
  workout: ["How to Start Working Out", "Health"],
  outside: ["Think Outside the Box", "Creativity"],
  sleep: ["Sleep Better", "Health"],
} as const satisfies Partial<Record<Art, readonly [string, string]>>;
export type Book = keyof typeof books;
export const suggestions: Book[] = [
  "power",
  "outlive",
  "atomic",
  "freak",
  "google",
  "mating",
  "principles",
  "leaders",
];
export const goals = [
  "Replace social media",
  "Develop a reading habit",
  "Discover new ideas",
  "Work on personal growth",
];
export const groups = {
  "Recommended for you": [
    "Health",
    "Exercise & Fitness",
    "Longevity",
    "Personal Development",
    "Habits",
    "Economics",
  ],
  "Personal Development": [
    "Personal Development",
    "Productivity",
    "Mindfulness",
    "Time Management",
    "Habits",
    "Motivation & Inspiration",
  ],
  "Health & Wellness": ["Health", "Exercise & Fitness", "Mental Health", "Meditation", "Longevity"],
  "Finance & Economics": ["Money & Investments", "Economics"],
  "Psychology & Relationships": ["Psychology", "Love & Relationships"],
  "Career & Business": [
    "Career",
    "Startups",
    "Leadership & Management",
    "Business",
    "Entrepreneurship",
    "Corporate Culture",
    "Remote Work",
    "Strategy",
    "Human Resources",
  ],
  "Knowledge & Learning": [
    "Education",
    "Communication",
    "Problem Solving",
    "Writing",
    "Science & Nature",
    "Computer Science",
    "Artificial Intelligence",
    "Software Engineering",
  ],
  "Arts & Culture": ["Philosophy", "History", "Arts & Culture"],
  "Technology & The Future": ["Technology & The Future", "Crypto", "Cybersecurity", "Space"],
  "Entertainment & Media": ["Entertainment", "Movies", "Music", "Videos", "Podcasts", "Anime"],
  "Lifestyle & Society": [
    "Food",
    "Travel",
    "Sports",
    "Fashion",
    "Religion & Spirituality",
    "Parenting",
    "Books",
    "Science Fiction",
    "Politics",
  ],
};
export const ideas = [
  "Meet Your Two Minds",
  "Any Number Pulls You",
  "Vivid Feels Likely",
  "Your Mind Fills the Gaps",
  "Same Fact, Opposite Choice",
  "Losing Hurts More Than Winning",
  "Remembering the Ending",
  "When to Slow Down",
];
export const passages = [
  "Here’s a quick one before you read on. A bat and a ball cost **$1.10 together**.\n\nThe bat costs **a dollar more** than the ball.\n\nSo how much is the ball? Don’t work at it, just go with the number that first comes to mind.",
  "A number probably just showed up on its own. For most people, it’s **10 cents**.\n\nIt feels right. It’s also **wrong!**\n\nIf the ball were 10 cents, the two would add up to **$1.20**. The ball is **5 cents**.",
  "Notice what just happened. One part of you answered before you’d even finished reading.\n\nCall it **your fast mind**. It doesn’t do the math, but glances, guesses, and moves on.",
  "There’s a second part that could have caught the mistake. **Your slow mind**, the one that actually works things out.\n\nBut it’s lazy. It stayed quiet and let the fast one answer for both of you.",
  "This little puzzle is the whole book. **Daniel Kahneman** spent a career on these two minds.\n\nYour **fast mind** runs almost everything you do, and most of the time it’s **right**.\n\nThe trouble comes because it sounds exactly as sure when it’s wrong.",
];
export const summaries = [
  "Most of your worst calls come from trusting the first answer that pops up, because it arrives already feeling certain.\n\n**Your fast mind answers before your slow mind has even woken up.**\n\nNext time a snap judgment feels obviously right, stop and hand it to the slow one to check.",
  "A number you hear first can influence the estimate you make next. Write down your own estimate before looking at someone else’s.",
  "Examples that come easily to mind can feel more common than they are. Compare a striking story with the underlying frequency.",
  "When information is missing, your mind can still form a confident story. Ask what evidence would change your mind.",
  "Describing an outcome as a loss or a gain can change the choice you make. Try describing the same decision both ways.",
  "A loss can feel larger than an equivalent gain. Consider several decisions together before judging one risk.",
  "The most intense moment and the ending can shape your memory of an experience. Check how the whole experience felt.",
  "When the stakes are high, give your first answer a second look. Write out the steps and test an alternative.",
];
export const highlights: Record<Book, string> = {
  stoic: "Focus your effort on choices that are within your control.",
  split: "Listen for the concern behind a demand before proposing a solution.",
  shoe: "Building a company often means learning from imperfect first attempts.",
  odyssey: "Homecoming changes both the traveler and the meaning of home.",
  vampires: "The monsters a culture imagines reveal what it fears.",
  rings: "Small acts of loyalty can shape the outcome of a much larger journey.",
  brain: "Brain health depends on the body as well as the mind.",
  die: "Aging involves many interacting processes. Ask what a result actually measures.",
  breath: "Notice the rhythm of your breath during an ordinary day.",
  comfort: "Try one manageable challenge outside your usual routine.",
  think: summaries[0]!,
  power:
    "Influence begins with noticing what the people around you value. Before making a request, consider their incentives.",
  outlive: "Small investments in strength, endurance, and everyday habits can matter over decades.",
  atomic:
    "Make a habit obvious and easy. A small action repeated consistently can become part of your identity.",
  freak:
    "Look for incentives before explaining a surprising pattern. What people do often reveals more than what they say.",
  google: "Give talented people access to information and room to experiment.",
  mating:
    "Closeness and independence can coexist. Curiosity makes room for discovery even in familiar relationships.",
  principles:
    "Write down your decision rules. Test them against what actually happens and revise them.",
  leaders: "Trust grows when people feel safe enough to ask for help.",
  spark: "Movement can change the conditions for learning. Notice how you feel after a short walk.",
  humans:
    "A change in perspective can make the familiar feel strange. Consider which assumptions a story asks you to make.",
  rich: "Distinguish the things you own from the cash flow they create.",
  status:
    "People seek respect in different ways. Identify the rules of the group before interpreting behavior.",
  irrational:
    "Our choices often change with the comparison available. Look at each option on its own terms.",
  propaganda: "Ask who chose the message, the audience, and the moment before accepting a claim.",
  righteous:
    "Moral judgments often begin with intuition. Understanding another person starts with asking what matters to them.",
  ego: "Focus on the work that needs doing. Praise and recognition can distract from learning.",
  now: "Bring attention back to the present moment by noticing one sensation.",
  rework: "Test the simplest version of an idea before adding complexity.",
  badblood:
    "Extraordinary claims need independent checks. Ask what evidence would change your conclusion.",
  deep: "Protect an uninterrupted block of time for demanding work. Decide what you want to finish before you start.",
  fools: "Think carefully about the claims you accept and how you respond to disagreement.",
  stick: "Test your memory before rereading. Retrieving a difficult idea strengthens learning.",
  web3: "Distributed networks let participants verify a shared record.",
  workout: "Choose one manageable activity and give it a regular place in your day.",
  outside: "Challenge a familiar assumption and describe two alternatives.",
  sleep: "Set a consistent routine that gives you time to wind down.",
};
export function chapters(book: Book) {
  return book === "think" ? ideas : ["The key idea"];
}

const topicCatalog: Record<string, Book[]> = {
  "Personal Development": ["atomic", "deep", "now", "ego"],
  "Health & Wellness": ["spark", "outlive", "workout", "sleep"],
  "Finance & Economics": ["freak", "rich"],
  "Psychology & Relationships": ["think", "mating", "irrational", "status"],
  "Career & Business": ["rework", "google", "badblood", "leaders"],
  "Knowledge & Learning": ["stick", "think", "humans", "outside"],
  "Arts & Culture": ["righteous", "propaganda", "fools"],
  "Technology & The Future": ["google", "web3", "humans"],
  "Entertainment & Media": ["propaganda", "humans"],
  "Lifestyle & Society": ["righteous", "mating", "outlive"],
};
export function topicBooks(topic: string): Book[] | undefined {
  if (topic === "Science & Nature") return ["spark", "outlive", "think"];
  if (topic === "Artificial Intelligence") return ["google", "humans", "web3"];
  for (const [group, topics] of Object.entries(groups)) {
    if (group !== "Recommended for you" && (topics.includes(topic) || group === topic))
      return topicCatalog[group];
  }
}
