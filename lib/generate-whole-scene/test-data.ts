import { Character } from "@/types/character";
import { Story } from "@/types/story";

export const TEST_STORY: Story = {
  id: 1,
  createdAt: "2024-01-01T00:00:00Z",
  title: "The Forbidden Mage",
  worldIdea:
    "In a world where magic is forbidden, a young mage discovers an ancient artifact.",
  imageUrl: "https://example.com/image.jpg",
  narratorVoiceId: "1",
  worldOverview: {
    history:
      "After the Cataclysm Wars, magic was outlawed by the Council of Seven. Users of magic are hunted by specialized inquisitors equipped with anti-magic technology.",
  },
  storyOverview: {
    premise:
      "Elena, a secret mage, discovers a crystal containing the memories of an ancient archmage. As she learns to harness its power, she uncovers a conspiracy within the Council itself.",
    mainCharacterIdeas: [
      {
        name: "Elena",
        description:
          "A young mage hiding her abilities while working as a scribe in the Council archives",
      },
      {
        name: "Theron",
        description:
          "A veteran inquisitor with a secret connection to Elena's past",
      },
      {
        name: "Mira",
        description:
          "A rebel mage leader fighting against the Council's oppression",
      },
    ],
  },
};

export const TEST_ELENA: Character = {
  id: 1,
  storyId: 1,
  createdAt: "",
  portraitUrl: "",
  voiceId: "",
  voiceSampleUrl: "",
  displayName: "Elena",
  fullName: "Elena Ravencroft",
  age: 24,
  gender: "female",
  personality:
    "Cautious yet curious, Elena is a meticulous researcher with a hidden rebellious streak. She's highly intelligent and observant, carefully concealing her magical abilities behind a facade of scholarly diligence. While outwardly compliant, she harbors a deep resentment towards the Council's oppressive anti-magic laws. Her years of secrecy have made her resourceful, quick-witted, and adept at reading people and situations.",
  physicalDescription: {
    hairStyle:
      "Long, silky hair usually kept neatly braided or tied back for archive work",
    hairColor: "Deep chestnut brown with natural copper highlights",
    eyeColor: "Striking sapphire blue with subtle flecks of silver",
    skinTone: "Fair complexion with a slight indoor pallor",
    build: "Slender and graceful, average height with delicate features",
    facialFeatures:
      "Heart-shaped face with high cheekbones and delicate jawline",
    clothing:
      "Modest archive worker robes in muted browns and grays, simple cut with practical pockets and ink-resistant sleeves",
    accessories:
      "Reading glasses, leather document satchel, concealed crystal pendant, writing implements",
    distinctiveFeatures:
      "Barely visible magical sigils on her palms that shimmer faintly when she's emotional",
    expression:
      "Carefully neutral and studious, but with an observant intensity in her eyes",
  },
  backstory:
    "Born in the aftermath of the Cataclysm Wars, Elena was orphaned at a young age when her parents were discovered and executed for practicing magic. Taken in by a distant relative who worked as a Council scribe, she learned to suppress her magical abilities and blend into the bureaucratic system. She strategically chose a position in the Council archives, believing it would provide her with both safety and access to forbidden knowledge. Her magical talents remained dormant but unextinguished, waiting for the right moment to emerge.",
  goals: [
    "Uncover the truth behind the Council's anti-magic policies",
    "Protect herself from the inquisitors while learning to master her magical abilities",
    "Discover the full potential of the ancient archmage's crystal and its hidden memories",
  ],
  relationships: [
    "Distant mentor who helped her hide her magical abilities",
    "Potential ally within the Council archives",
    "Unknown connection to the ancient archmage through the discovered crystal",
  ],
};

export const TEST_THERON: Character = {
  id: 2,
  storyId: 1,
  createdAt: "",
  portraitUrl: "",
  voiceId: "",
  voiceSampleUrl: "",
  displayName: "Theron",
  fullName: "Theron Blackwood",
  age: 38,
  gender: "male",
  personality:
    "Stoic and disciplined on the surface, but internally conflicted. Theron is a complex individual who maintains an outwardly rigid demeanor as an inquisitor, yet harbors deep internal moral struggles. He's methodical, observant, and haunted by past memories. Despite his professional exterior, he possesses a hidden compassionate core and a sense of justice that often conflicts with the Council's ruthless methods.",
  physicalDescription: {
    hairStyle: "Short, military-precise cut with natural waves",
    hairColor: "Dark brown with distinguished silver at the temples",
    eyeColor: "Ice blue with an intense, piercing quality",
    skinTone: "Weather-beaten tan from years of outdoor pursuit",
    build: "Tall and imposing with a warrior's physique, broad shoulders",
    facialFeatures: "Strong jawline, noble nose, and pronounced cheekbones",
    clothing:
      "Pristine inquisitor's uniform in black and silver, perfectly maintained with formal decorations",
    accessories:
      "Anti-magic detector gear, ceremonial sword, inquisitor's badge of office",
    distinctiveFeatures:
      "Subtle magical suppression runes embedded in his uniform's threading",
    expression: "Stern and watchful, with rare moments of hidden empathy",
  },
  backstory:
    "Theron was once a promising young mage himself, whose family was destroyed during the final days of the Cataclysm Wars. Witnessing the devastating potential of uncontrolled magic, he chose to become an inquisitor, believing he could prevent further destruction. Unknown to his colleagues, he secretly carries guilt about his own magical heritage and the family he lost. His sister, Elena's mother, was a powerful mage who was executed by the Council, leaving young Elena orphaned. This hidden connection to Elena drives his internal conflict and shapes his true motivations.",
  goals: [
    "Protect Elena without revealing their true familial connection",
    "Uncover the truth behind the Council's real motivations",
    "Find a way to reconcile his past with his current role as an inquisitor",
  ],
  relationships: [
    "Elena (secret niece)",
    "Council of Seven (professional affiliation)",
    "Surviving inquisitor colleagues",
  ],
};

export const TEST_MIRA: Character = {
  id: 3,
  storyId: 1,
  createdAt: "",
  portraitUrl: "",
  voiceId: "",
  voiceSampleUrl: "",
  displayName: "Mira",
  fullName: "Mira Ravencroft",
  age: 29,
  gender: "female",
  personality:
    "Fierce, strategic, and compassionate. Mira is a charismatic leader with an unwavering determination to protect magical users. She's analytical and calculated in her approach to rebellion, but deeply empathetic towards those suffering under the Council's oppression. Her leadership style combines sharp tactical thinking with a profound sense of moral conviction.",
  physicalDescription: {
    hairStyle: "Long and flowing with intricate braids at the temples",
    hairColor: "Rich auburn with natural golden highlights",
    eyeColor: "Vibrant emerald green with a magnetic intensity",
    skinTone: "Warm olive complexion with a healthy outdoor glow",
    build: "Athletic and agile, medium height with toned physique",
    facialFeatures: "Sharp, determined features with high cheekbones",
    clothing:
      "Practical rebel gear in dark greens and browns, reinforced for combat",
    accessories:
      "Hidden magical artifacts, enchanted daggers, resistance leader's medallion",
    distinctiveFeatures:
      "Subtle magical aura visible to other mages, birthmark shaped like a crescent moon",
    expression: "Determined and fierce, with a charismatic presence",
  },
  backstory:
    "Born in the aftermath of the Cataclysm Wars, Mira witnessed her parents' execution by Council inquisitors when she was 12 years old. They were discovered practicing healing magic to help wounded civilians. This traumatic experience drove her underground, where she learned to survive and eventually became a beacon of hope for persecuted magic users. She spent years building a network of hidden mages, developing sophisticated methods to evade the Council's anti-magic technology and create safe havens for those with magical abilities.",
  goals: [
    "Dismantle the oppressive system of the Council of Seven",
    "Create a safe sanctuary for magic users to live and practice their abilities freely",
    "Uncover and expose the true motivations behind the magic ban",
  ],
  relationships: [
    "Elena (potential ally in uncovering Council's secrets)",
    "Underground network of rebel mages",
    "Survivors of magical persecution",
  ],
};

export const TEST_VAREN: Character = {
  id: 4,
  storyId: 1,
  createdAt: "",
  portraitUrl: "",
  voiceId: "",
  voiceSampleUrl: "",
  displayName: "Varen",
  fullName: "Councilor Eldric Varen",
  age: 72,
  gender: "male",
  personality:
    "Calculating, introspective, and strategically compassionate. Varen is a master of political nuance, able to maintain a carefully neutral exterior while secretly working to preserve magical knowledge. He possesses a razor-sharp intellect and an ability to play the long game, often appearing to conform while subtly undermining the most extreme anti-magic policies.",
  physicalDescription: {
    hairStyle: "Neatly combed back, perfectly maintained",
    hairColor: "Pure silver-white",
    eyeColor: "Sharp gray with decades of wisdom",
    skinTone: "Pale and aristocratic",
    build: "Tall and lean with an elderly yet dignified bearing",
    facialFeatures: "Distinguished aquiline features, high forehead",
    clothing:
      "Formal Council robes in deep blue and silver with subtle magical preservation runes",
    accessories:
      "Councilor's staff of office, various rings of political significance",
    distinctiveFeatures:
      "Ancient magical signet ring disguised as a Council seal",
    expression: "Carefully neutral with hints of hidden knowledge",
  },
  backstory:
    "During the Cataclysm Wars, Varen witnessed the devastating potential of uncontrolled magic, but also recognized its potential for healing and progress. As a young political advisor, he was instrumental in negotiating the initial magic ban, believing it was the only way to prevent further destruction. However, he secretly worked to preserve critical magical knowledge, understanding that complete eradication would be a greater tragedy. He strategically positioned himself within the Council of Seven, using his political acumen to create hidden sanctuaries and protect select magical artifacts and practitioners from total extinction.",
  goals: [
    "Protect the remnants of magical knowledge from complete destruction",
    "Maintain a delicate balance between public safety and magical preservation",
    "Identify and subtly support potential magical practitioners who could responsibly use magical arts",
  ],
  relationships: [
    "Confidential allies within the Council",
    "Hidden network of scholars and former magic users",
    "Distant mentorship with select young potential mages",
  ],
};

