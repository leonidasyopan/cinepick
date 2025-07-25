
import React from 'react';
import { CryIcon, LaughIcon, WonderIcon, UserIcon, UsersIcon, HeartIcon, FamilyIcon } from '../../components/icons/index.ts';
import type { RefinementPair } from './types';

export const MOODS = [
    { id: 'Crying', label: 'Cry', icon: <CryIcon /> },
    { id: 'Laughing', label: 'Laugh', icon: <LaughIcon /> },
    { id: 'Wondering', label: 'Wonder', icon: <WonderIcon /> },
];

export const SUB_MOODS: Record<string, { id: string; label: string }[]> = {
    Crying: [
        { id: 'A good cry to let it all out', label: 'Cathartic Cry' },
        { id: 'Something bittersweet and heartwarming', label: 'Heartwarming Tears' },
        { id: 'A tragic story that will stick with me', label: 'Tragic & Poetic' },
    ],
    Laughing: [
        { id: 'Lighthearted & Wholesome', label: 'Light & Wholesome' },
        { id: 'Witty & Sarcastic', label: 'Witty & Sarcastic' },
        { id: 'Absurd & Over-the-Top', label: 'Absurd & Goofy' },
    ],
    Wondering: [
        { id: 'A mind-bending mystery or thriller', label: 'Mind-Bending' },
        { id: 'An epic adventure in another world', label: 'Epic Adventure' },
        { id: 'A thought-provoking documentary', label: 'Documentary' },
    ],
};

export const OCCASIONS = [
    { id: 'Just watching a movie by myself', label: 'Solo Night', icon: <UserIcon /> },
    { id: 'Movie Night with friends', label: 'With Friends', icon: <UsersIcon /> },
    { id: 'Date Night with my special one', label: 'Date Night', icon: <HeartIcon /> },
    { id: 'Watching a movie with family or relatives', label: 'Family Time', icon: <FamilyIcon /> },
];

export const DETAILED_GENRE_REFINEMENTS: Record<string, Record<string, Record<string, RefinementPair[]>>> = {
  "Laughing": {
    "Lighthearted & Wholesome": {
      "Just watching a movie by myself": [
        { optionA: "Slice-of-Life Comedy", optionB: "Cynical Satire", description: "Wholesome look at life vs. ironic critique of it." },
        { optionA: "Animated Wholesome Film", optionB: "Melancholy Indie Dramedy", description: "Optimism vs. quiet emotional depth." },
        { optionA: "Gentle Comedy-Documentary", optionB: "Lonely Road Movie", description: "Light learning vs. self-reflection on the move." }
      ],
      "Movie Night with friends": [
        { optionA: "Feel-Good Ensemble Comedy", optionB: "Dark Comedy of Manners", description: "Friendship and joy vs. social critique and sarcasm." },
        { optionA: "Musical Comedy", optionB: "Deadpan Humor", description: "Energetic and joyful vs. flat, ironic delivery." },
        { optionA: "Holiday-Themed Comedy", optionB: "Coming-of-Age Drama", description: "Celebration vs. internal conflict in growth." }
      ],
      "Date Night with my special one": [
        { optionA: "Romantic Comedy", optionB: "Dark Romantic Comedy", description: "Light love vs. twisted affection." },
        { optionA: "Musical Romance", optionB: "Witty Relationship Dramas", description: "Emotion through song vs. realism through dialogue." },
        { optionA: "Feel-Good Fantasy", optionB: "Melancholic Sci-Fi Romance", description: "Fairy-tale vibes vs. philosophical love." }
      ],
      "Watching a movie with family or relatives": [
        { optionA: "Animated Comedy", optionB: "Classic Sitcom Revival", description: "Timeless charm vs. nostalgic adult humor." },
        { optionA: "Animal Adventures", optionB: "Absurdist Family Comedy", description: "Cuddly and cute vs. chaotic and weird." },
        { optionA: "Inspirational Sports Comedy", optionB: "Mockumentary Style", description: "Uplift vs. parody." }
      ]
    },
    "Witty & Sarcastic": {
      "Just watching a movie by myself": [
        { optionA: "Satirical Comedy", optionB: "Philosophical Drama", description: "Laughing at society vs. questioning it deeply." },
        { optionA: "Clever Crime Comedy", optionB: "Noir-Inspired Melancholy", description: "Sharp humor vs. brooding introspection." },
        { optionA: "Dry British Comedy", optionB: "Existentialist Indie", description: "Understated wit vs. quiet despair." }
      ],
      "Movie Night with friends": [
        { optionA: "Dark Comedy", optionB: "Slapstick Parody", description: "Smart cynicism vs. physical chaos." },
        { optionA: "Political Satire", optionB: "Stoner Comedy", description: "Sharp critique vs. absurd escapism." },
        { optionA: "Sharp Social Comedy", optionB: "Mockumentary", description: "Savvy commentary vs. meta-humor." }
      ],
      "Date Night with my special one": [
        { optionA: "Witty Romantic Comedy", optionB: "Biting Breakup Comedy", description: "Playful love vs. caustic relationships." },
        { optionA: "Dialogue-Driven Indie Comedy", optionB: "Screwball Chaos", description: "Cerebral repartee vs. wild miscommunication." },
        { optionA: "Elegant Period Comedy", optionB: "Cringe Comedy", description: "Refined wit vs. awkward realism." }
      ],
      "Watching a movie with family or relatives": [
        { optionA: "Animated Satire", optionB: "Classic Feel-Good Animation", description: "Clever critique vs. cheerful simplicity." },
        { optionA: "Irony-Laced Coming-of-Age", optionB: "Wholesome Growth Stories", description: "Cynical adolescence vs. hopeful learning." },
        { optionA: "Parent-Focused Comedy", optionB: "Childlike Absurdist Fun", description: "Modern family struggles vs. carefree antics." }
      ]
    },
    "Absurd & Over-the-Top": {
      "Just watching a movie by myself": [
        { optionA: "Absurdist Comedy", optionB: "Philosophical Absurdism", description: "Zany nonsense vs. Camus-style reflection." },
        { optionA: "Surreal Animated Comedy", optionB: "Deadpan Anti-Comedy", description: "Hypercolor madness vs. stoic humor." },
        { optionA: "Meta-Comedy", optionB: "Slow-Paced Indie Satire", description: "Self-aware wildness vs. subtle weirdness." }
      ],
      "Movie Night with friends": [
        { optionA: "Slapstick Comedy", optionB: "Cerebral Comedy", description: "Physical nonsense vs. smart subtlety." },
        { optionA: "Cult Parody", optionB: "Socially Awkward Humor", description: "Extreme antics vs. cringe realism." },
        { optionA: "Improvised Ensemble Comedy", optionB: "Dark Humor Game Night", description: "Chaotic spontaneity vs. twisted party themes." }
      ],
      "Date Night with my special one": [
        { optionA: "Romantic Absurdist Comedy", optionB: "Grounded Love Story", description: "Time loops & weirdness vs. emotional realism." },
        { optionA: "Musical Farce", optionB: "Indie Romance with Sarcasm", description: "Loud ridiculous fun vs. dry romantic wit." },
        { optionA: "Fantasy Comedy", optionB: "Bittersweet Comedy-Drama", description: "Playful whimsy vs. emotional undercurrent." }
      ],
      "Watching a movie with family or relatives": [
        { optionA: "Animated Chaos", optionB: "Classic Calm Family Tale", description: "High-energy overload vs. gentle narrative." },
        { optionA: "Fantasy Adventure Comedy", optionB: "Heartfelt Animation", description: "Ridiculous world-building vs. emotional connection." },
        { optionA: "Talking Animal Comedy", optionB: "Slice-of-Life Family Film", description: "Wild hijinks vs. ordinary magic." }
      ]
    }
  },
  "Crying": {
    "A good cry to let it all out": {
      "Just watching a movie by myself": [
        { optionA: "Emotional Drama", optionB: "Detached Minimalist Film", description: "Deep feeling vs. quiet emptiness." },
        { optionA: "Personal Tragedy", optionB: "Hopeful Redemption Story", description: "Rock bottom vs. rising again." },
        { optionA: "Raw Indie Grief Film", optionB: "Lyrical Visual Poem", description: "Brutal honesty vs. aesthetic emotion." }
      ],
      "Movie Night with friends": [
        { optionA: "Friendship Melodrama", optionB: "Biting Drama-Comedy", description: "Tearful bonds vs. sharp edge." },
        { optionA: "Disaster Film with Heart", optionB: "Crisis Satire", description: "Collective grief vs. absurd take on chaos." },
        { optionA: "Coming-of-Age Trauma", optionB: "Playful Bittersweet Nostalgia", description: "Heavy adolescence vs. reflective charm." }
      ],
      "Date Night with my special one": [
        { optionA: "Romantic Melodrama", optionB: "Breakup Indie", description: "Sweeping tragedy vs. quiet collapse." },
        { optionA: "Slow-Burn Love Story", optionB: "Unsentimental Romance", description: "Emotional highs vs. realism." },
        { optionA: "Period Love Tragedy", optionB: "Modern Emotional Disconnection", description: "Historic pain vs. digital-era alienation." }
      ],
      "Watching a movie with family or relatives": [
        { optionA: "Inspirational Family Drama", optionB: "Loss & Growth Story", description: "Overcoming vs. enduring." },
        { optionA: "Animal Companion Tearjerker", optionB: "Wartime Family Separation", description: "Cute sadness vs. historical pain." },
        { optionA: "Animated Grief Tale", optionB: "Uplifting Real-Life Adaptation", description: "Gentle tears vs. real triumph." }
      ]
    },
    "Something bittersweet and heartwarming": {
      "Just watching a movie by myself": [
        { optionA: "Quiet Feel-Good Drama", optionB: "Existential Indie", description: "Warmth vs. meaning-searching." },
        { optionA: "Memoir-Based Film", optionB: "Fictionalized Biography", description: "Personal connection vs. literary distance." },
        { optionA: "Slice-of-Life Uplift", optionB: "Lonely Reflection Piece", description: "Subtle joy vs. solitude." }
      ],
      "Movie Night with friends": [
        { optionA: "Found-Family Story", optionB: "Disillusioned Friendship Tale", description: "Love that builds vs. love that fades." },
        { optionA: "Holiday-Themed Heartwarmer", optionB: "Irony-Laced Dramedy", description: "Togetherness vs. realism." },
        { optionA: "Musical with Emotion", optionB: "Low-Key Ensemble Piece", description: "Soaring feeling vs. grounded intimacy." }
      ],
      "Date Night with my special one": [
        { optionA: "Love Against All Odds", optionB: "Lonely But Loving Story", description: "Big feeling vs. small comfort." },
        { optionA: "Slow-Build Romance", optionB: "Melancholic Comedy", description: "Sweet vs. subtly sad." },
        { optionA: "Animated Love Tale", optionB: "Philosophical Sci-Fi Love", description: "Universal emotion vs. abstract meaning." }
      ],
      "Watching a movie with family or relatives": [
        { optionA: "Parent-Child Bond Film", optionB: "Loss & Recovery Story", description: "Tight family vs. grief process." },
        { optionA: "Inspirational Sports Drama", optionB: "Quiet Small-Town Story", description: "Victory arc vs. gentle lesson." },
        { optionA: "Animal & Kid Tale", optionB: "Grandparent Stories", description: "Cute loyalty vs. generational love." }
      ]
    },
    "A tragic story that will stick with me": {
      "Just watching a movie by myself": [
        { optionA: "Art-House Tragedy", optionB: "Detached Visual Masterpiece", description: "Emotional spiral vs. dreamlike metaphor." },
        { optionA: "Foreign Language Drama", optionB: "Minimalist Philosophy Film", description: "Rich sorrow vs. abstract beauty." },
        { optionA: "Mythic Tragedy", optionB: "Existential Sci-Fi", description: "Fate vs. absurdity." }
      ],
      "Movie Night with friends": [
        { optionA: "Shakespearean Adaptation", optionB: "Modern Love Tragedy", description: "Classic doom vs. contemporary heartbreak." },
        { optionA: "Stylized Tragic Love Story", optionB: "Emo Indie Drama", description: "Beautiful despair vs. raw angst." },
        { optionA: "Epic War Love", optionB: "Slow-Burn Domestic Collapse", description: "External battles vs. internal breakdown." }
      ],
      "Date Night with my special one": [
        { optionA: "Star-Crossed Lovers Tale", optionB: "Bittersweet Sci-Fi", description: "Epic doom vs. introspective wonder." },
        { optionA: "Ethereal Romance", optionB: "Sharp Breakup Film", description: "Dreamlike bond vs. raw disillusion." },
        { optionA: "Foreign Poetic Love", optionB: "Modern Alienation", description: "Language of love vs. silence of distance." }
      ],
      "Watching a movie with family or relatives": [
        { optionA: "Generational Trauma Story", optionB: "Cultural Memory Piece", description: "Inherited pain vs. collective reflection." },
        { optionA: "Coming-of-Age in Hard Times", optionB: "Fable-Like Drama", description: "Hard truth vs. magical sadness." },
        { optionA: "Historical Family Collapse", optionB: "Reconciliation Drama", description: "Loss vs. repair." }
      ]
    }
  },
  "Wondering": {
    "A mind-bending mystery or thriller": {
      "Just watching a movie by myself": [
        { optionA: "Existential Sci-Fi", optionB: "Spiritual Allegory", description: "Technology vs. transcendence." },
        { optionA: "Psychological Thriller", optionB: "Abstract Art Film", description: "Perception games vs. dream logic." },
        { optionA: "Time-Bending Mystery", optionB: "Surreal Slow Burn", description: "Puzzle vs. atmosphere." }
      ],
      "Movie Night with friends": [
        { optionA: "Sci-Fi Social Experiment", optionB: "Satirical Dystopia", description: "What if... vs. what now?" },
        { optionA: "Twisty Narrative Puzzle", optionB: "Meta Film", description: "Unraveling plot vs. self-aware chaos." },
        { optionA: "Intense Drama with a Twist", optionB: "Campy Mind Trip", description: "Serious vs. bizarre fun." }
      ],
      "Date Night with my special one": [
        { optionA: "Sci-Fi Romance", optionB: "Memory Puzzle", description: "Futuristic love vs. forgotten love." },
        { optionA: "Time Loop Rom-Com", optionB: "Cerebral Disconnection Tale", description: "Playful vs. philosophical." },
        { optionA: "Alternate Reality Thriller", optionB: "Poetic Experimental Romance", description: "High stakes vs. vibe-driven story." }
      ],
      "Watching a movie with family or relatives": [
        { optionA: "Animated Sci-Fi", optionB: "Quiet Philosophical Tale", description: "Imaginative vs. meditative." },
        { optionA: "Adventure Through Dimensions", optionB: "Emotional Simplicity", description: "Big spectacle vs. soft focus." },
        { optionA: "Fantasy Metaphor Film", optionB: "Coming-of-Age Spiritual Quest", description: "Symbolic vs. soul-searching." }
      ]
    },
    "An epic adventure in another world": {
      "Just watching a movie by myself": [
        { optionA: "Hero’s Journey Film", optionB: "Anti-Hero Saga", description: "Hopeful vs. morally complex." },
        { optionA: "Historical Epic", optionB: "Post-Apocalyptic Solitude", description: "Large-scale conflict vs. quiet survival." },
        { optionA: "Fantasy Classic", optionB: "Myth Retelling", description: "Escapist vs. deconstructive." }
      ],
      "Movie Night with friends": [
        { optionA: "Action-Adventure Blockbuster", optionB: "Mock Epic", description: "Thrill ride vs. parody." },
        { optionA: "Heist Ensemble", optionB: "Messy Misfit Comedy", description: "Precision vs. chaos." },
        { optionA: "Fantasy Team-Up", optionB: "Outrageous Road Trip", description: "Quest vs. absurdity." }
      ],
      "Date Night with my special one": [
        { optionA: "Romantic Epic", optionB: "Tragic Hero's Journey", description: "Love & war vs. sacrifice." },
        { optionA: "Fantasy Romance", optionB: "Survival Bonding Film", description: "Magical intimacy vs. tested connection." },
        { optionA: "Historical Love Quest", optionB: "Existential Mythology", description: "Real passion vs. metaphysical journey." }
      ],
      "Watching a movie with family or relatives": [
        { optionA: "Animated Fantasy Adventure", optionB: "Realistic Coming-of-Age Journey", description: "Magic vs. maturity." },
        { optionA: "Family Quest Comedy", optionB: "Cultural Heritage Epic", description: "Laughs vs. legacy." },
        { optionA: "Classic Hero Story", optionB: "Multi-Generational Saga", description: "Archetype vs. lineage." }
      ]
    },
    "A thought-provoking documentary": {
      "Just watching a movie by myself": [
        { optionA: "Philosophical Documentary", optionB: "Silent Nature Film", description: "Intellectual vs. contemplative." },
        { optionA: "True Story Reenactment", optionB: "Experimental Visual Essay", description: "Factual vs. abstract." },
        { optionA: "Science Doc", optionB: "Existential Biopic", description: "Knowledge vs. identity." }
      ],
      "Movie Night with friends": [
        { optionA: "Culture-Focused Doc", optionB: "Satirical Reenactment", description: "Respectful vs. ironic." },
        { optionA: "Investigative Journalism Doc", optionB: "Spoof Conspiracy Film", description: "Serious digging vs. ridiculous fake truth." },
        { optionA: "Adventure Doc", optionB: "Mockumentary Road Trip", description: "Awe vs. absurdity." }
      ],
      "Date Night with my special one": [
        { optionA: "Love Story Doc", optionB: "Unromantic Portrait", description: "Emotional truth vs. cold reality." },
        { optionA: "Couples Exploring Life", optionB: "Single-Person Reflection", description: "Together vs. apart." },
        { optionA: "Visual Poetic Essay", optionB: "Hard-Hitting Real-Life Romance", description: "Dreamlike vs. grounded." }
      ],
      "Watching a movie with family or relatives": [
        { optionA: "Uplifting Educational Doc", optionB: "Tearjerking Biography", description: "Inspiration vs. emotion." },
        { optionA: "Eco-Nature Doc", optionB: "Cultural Family Story", description: "Planet vs. people." },
        { optionA: "Kid-Friendly Learning Doc", optionB: "Emotional Animated Short Compilation", description: "Fun facts vs. short-form insight." }
      ]
    }
  }
};
