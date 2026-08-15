import { StoryWorldId, StoryWorldPreset } from '@/types/storyWorlds';

export const STORY_WORLD_PRESETS: StoryWorldPreset[] = [
  {
    id: 'magical_academy',
    title: 'Magical Academy',
    titleRu: 'Магическая академия',
    shortDescription: 'Lessons, secrets, friendship and living magic.',
    shortDescriptionRu: 'Уроки, тайны, дружба и живая магия.',
    longDescription:
      'A warm and adventurous world built around a magical academy where learning feels alive. Children explore classrooms, hidden towers, enchanted libraries, talking maps, moving stairways, glowing gardens, and school traditions full of mystery and wonder. Stories in this world should combine friendship, curiosity, teamwork, and personal growth. Conflicts should stay child-friendly: misunderstandings, hidden clues, magical mishaps, challenges of courage, cooperation, and responsibility. This world should support long seasonal arcs through lessons, school events, secret places, and recurring classmates or teachers.',
    internalPromptNotes: [
      'school-based magical world',
      'focus on curiosity, friendship, and growth',
      'recurring academy locations',
      'magical but emotionally safe',
      'lessons can become adventures',
      'avoid copying any specific magical-school franchise',
    ],
    suggestedThemes: ['teamwork', 'confidence', 'kindness', 'curiosity', 'responsibility'],
    suggestedVocabularyFocus: ['school', 'friends', 'feelings', 'actions', 'places'],
    imagePath: '/assets/worlds/world-magical-academy.png',
    imagePrompt:
      'Create an original premium children’s book illustration of a magical academy world. Show a bright enchanted school with elegant towers, glowing windows, floating lanterns, a welcoming courtyard, magical classrooms hinted in the distance, and a sense of wonder and learning. Include a child-friendly magical atmosphere with soft light, warm colors, and details like books, pathways, banners, and hidden corners. The world should feel adventurous, safe, and full of friendship and curiosity. No text, no UI, no labels.',
    altText: 'A bright magical academy with towers and glowing windows',
  },
  {
    id: 'whispering_forest',
    title: 'Whispering Forest',
    titleRu: 'Шепчущий лес',
    shortDescription: 'Hidden paths, forest signs and brave choices.',
    shortDescriptionRu: 'Тайные тропы, знаки леса и смелые решения.',
    longDescription:
      'A magical forest full of changing paths, living trees, quiet signs, secret clearings, and helpful creatures. The world should feel mysterious but safe, beautiful, and emotionally rich. Adventures revolve around exploration, noticing clues, helping others, listening carefully, and making thoughtful choices. The forest may respond to kindness, courage, patience, and curiosity. Stories can include winding paths, treehouses, glowing rivers, old bridges, hidden doors, and magical creatures. This setting should support both episodic discoveries and a larger seasonal mystery.',
    internalPromptNotes: [
      'nature-rich magical setting',
      'emphasize discovery and observation',
      'quiet magic rather than combat',
      'safe mystery and emotional warmth',
      'choices can change paths and outcomes',
    ],
    suggestedThemes: ['courage', 'empathy', 'patience', 'curiosity', 'helping_others'],
    suggestedVocabularyFocus: ['nature', 'animals', 'places', 'feelings', 'actions'],
    imagePath: '/assets/worlds/world-whispering-forest.png',
    imagePrompt:
      'Create an original premium children’s book illustration of a magical whispering forest. Show a beautiful forest path with glowing leaves, ancient trees, hidden signs, a small bridge or clearing, soft magical light, and a sense of discovery. The scene should feel mysterious but safe, warm, and inviting. Include subtle magical elements like shimmering trails, tiny lights, or enchanted plants. No text, no UI, no labels.',
    altText: 'A glowing forest path with ancient trees and soft magical lights',
  },
  {
    id: 'mystery_town',
    title: 'Mystery Town',
    titleRu: 'Таинственный город',
    shortDescription: 'Clues, clever questions and small strange secrets.',
    shortDescriptionRu: 'Улики, полезные вопросы и маленькие странные тайны.',
    longDescription:
      'A cozy, child-friendly steampunk town full of gentle mysteries, clockwork details, glowing lanterns, brass gadgets, little workshops, hidden passages, and unusual inventions. The tone should be whimsical, curious, and clever rather than dark or industrial. Children investigate missing objects, odd messages, unusual machines, strange schedules, forgotten maps, and friendly town secrets. The visual and narrative style should feel like warm steampunk for children: air tubes, clock towers, tiny mechanical helpers, brass signs, small trains, and inventors’ streets. Stories should reward observation, reasoning, asking questions, and teamwork.',
    internalPromptNotes: [
      'child-friendly steampunk',
      'clever mysteries and investigation',
      'whimsical clockwork town',
      'warm brass-and-lantern atmosphere',
      'focus on clues, questions, and problem solving',
      'avoid noir, horror, dystopia, or gritty industrial tone',
    ],
    suggestedThemes: ['problem_solving', 'listening', 'teamwork', 'confidence', 'honesty'],
    suggestedVocabularyFocus: ['places', 'actions', 'science', 'school', 'feelings'],
    imagePath: '/assets/worlds/world-mystery-town.png',
    imagePrompt:
      'Create an original premium children’s book illustration of a child-friendly steampunk mystery town. Show a cozy whimsical town square or street with brass details, clockwork decorations, lanterns, pipes, little workshops, clock towers, clever mechanical signs, and a magical problem-solving atmosphere. The style must be friendly steampunk: warm, bright, curious, imaginative, and safe for children. Avoid dystopian, dirty, dark, noir, horror, or industrial-harsh imagery. No text, no UI, no labels.',
    altText: 'A cozy steampunk town with brass details, lanterns and clockwork signs',
  },
  {
    id: 'creature_rescue_isles',
    title: 'Creature Rescue Isles',
    titleRu: 'Острова спасения существ',
    shortDescription: 'Unusual creatures, island journeys and kind choices.',
    shortDescriptionRu: 'Необычные существа, островные путешествия и добрые решения.',
    longDescription:
      'A chain of bright, magical islands where children meet unusual creatures and help them solve problems. The core of this world is empathy, care, curiosity, and adventure. Stories may include rescuing a lost creature, helping different species understand each other, exploring nesting grounds, delivering messages, and discovering why a creature behaves in a certain way. The world should feel emotionally warm and visually rich, with cliffs, little harbors, glowing caves, island paths, and friendly habitats. This world should support recurring creature species and seasonal arcs about trust and cooperation.',
    internalPromptNotes: [
      'empathy-first creature adventure',
      'island-to-island exploration',
      'child-safe creature rescue scenarios',
      'focus on care, communication, and discovery',
      'visually colorful and emotionally warm',
      'avoid creature capture, battles, or monster-collecting tropes',
    ],
    suggestedThemes: ['kindness', 'empathy', 'responsibility', 'friendship', 'helping_others'],
    suggestedVocabularyFocus: ['animals', 'nature', 'actions', 'feelings', 'places'],
    imagePath: '/assets/worlds/world-creature-rescue-isles.png',
    imagePrompt:
      'Create an original premium children’s book illustration of magical rescue islands where children help unusual creatures. Show a bright island landscape with cliffs, a small harbor or pathway, vivid plants, and one or two gentle fantastical creatures in the distance. The scene should feel warm, adventurous, and full of empathy and wonder. Avoid battle, capture, or scary monster imagery. No text, no UI, no labels.',
    altText: 'Bright rescue islands with cliffs, plants and gentle fantastical creatures',
  },
  {
    id: 'museum_of_living_wonders',
    title: 'Museum of Living Wonders',
    titleRu: 'Музей живых чудес',
    shortDescription: 'Living exhibits, secret rooms and curious discoveries.',
    shortDescriptionRu: 'Живые экспонаты, тайные комнаты и открытия.',
    longDescription:
      'A grand, magical museum where exhibits quietly come alive after children ask the right questions. The world includes halls of ancient maps, tiny moving cities, friendly dinosaur bones, glowing paintings, sound rooms, invention corners, lost-word cabinets, and doors that open into small safe adventures. The tone should feel curious, clever, warm, and full of discovery. Stories in this world should reward observation, asking questions, careful listening, and imagination. Conflicts should stay child-friendly: missing exhibit pieces, mixed-up labels, forgotten stories, lost sounds, confused objects, and gentle mysteries inside the museum. This world supports long seasonal arcs through different museum halls, recurring curators, secret collections, and an overarching mystery about why the museum is waking up.',
    internalPromptNotes: [
      'magical museum with living exhibits',
      'discovery, curiosity, and observation',
      'each hall can create a different mini-adventure',
      'safe mysteries, no horror',
      'strong fit for vocabulary, reading, listening, and questions',
      'use museum halls as recurring structure for long season arcs',
    ],
    suggestedThemes: ['curiosity', 'problem_solving', 'listening', 'responsibility', 'trying_again'],
    suggestedVocabularyFocus: ['places', 'actions', 'science', 'school', 'listen'],
    imagePath: '/assets/worlds/world-museum-of-living-wonders.png',
    imagePrompt:
      'Create an original premium children’s book illustration of a magical museum of living wonders. Show a bright grand museum hall with warm light, tall windows, glowing paintings, ancient maps, tiny moving exhibits, curious objects, and secret doors. The scene should feel safe, clever, magical, and full of discovery, like a place where children can explore questions and stories. Include subtle signs of exhibits coming alive, but no scary elements. No text, no UI, no labels.',
    altText: 'A magical museum hall with glowing paintings, maps and living exhibits',
  },
  {
    id: 'star_harbor',
    title: 'Star Harbor',
    titleRu: 'Звёздная гавань',
    shortDescription: 'Space missions, signals and new friends.',
    shortDescriptionRu: 'Космические миссии, сигналы и новые друзья.',
    longDescription:
      'A child-friendly space adventure world built around a bright orbital harbor and nearby planets. The setting should feel adventurous, imaginative, and optimistic rather than militaristic. Stories may involve receiving strange signals, helping travelers, exploring stations, visiting unusual planets, fixing communication problems, making discoveries, and meeting friendly alien communities. This world should support teamwork, problem solving, invention, and brave choices. Visually it should mix clean futuristic design with warmth, color, and wonder.',
    internalPromptNotes: [
      'optimistic child-friendly space world',
      'exploration and missions, not warfare',
      'focus on signals, cooperation, and discovery',
      'recurring star harbor locations',
      'support for science-flavored vocabulary',
      'avoid space war, empire, laser battle, or franchise-like tropes',
    ],
    suggestedThemes: ['teamwork', 'problem_solving', 'confidence', 'curiosity', 'helping_others'],
    suggestedVocabularyFocus: ['science', 'places', 'actions', 'friends', 'listen'],
    imagePath: '/assets/worlds/world-star-harbor.png',
    imagePrompt:
      'Create an original premium children’s book illustration of a child-friendly future space harbor world. Show a bright orbital harbor with sleek small spacecraft, docking platforms, floating transit lanes, friendly helper robots, glowing navigation beacons, and colorful planets or nebulae in the background. The world should clearly read as optimistic sci-fi for children: smooth futuristic materials, clean technology, space traffic, discovery, and cooperation. Do not show wooden ships, sails, pirate boats, old-world harbor buildings, fantasy castles, or medieval port details. Avoid space war, weapons, dark sci-fi, or franchise-like imagery. No text, no UI, no labels.',
    altText: 'A bright future space harbor with sleek ships, docking platforms and friendly robots',
  },
];

export const getStoryWorldPreset = (worldId?: StoryWorldId | null) =>
  STORY_WORLD_PRESETS.find((world) => world.id === worldId) || null;

export const worldLabel = (worldId?: StoryWorldId | null) => getStoryWorldPreset(worldId)?.title || '';
