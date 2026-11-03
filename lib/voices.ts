import type { LanguageOption, LanguageCode, VoiceOption } from "@/types/podcast";

/**
 * Curated from the official Bulbul v4 Flash voice catalogue:
 * https://docs.sarvam.ai/api/api-guides-tutorials/text-to-speech/voices
 *
 * Speaker IDs are case-sensitive and lowercase. Malayalam is not yet in the
 * v4 Flash persona catalogue, so it routes to bulbul:v3 (which documents
 * Malayalam support) with the v3 shubh / ishita voices.
 */
export const LANGUAGES: LanguageOption[] = [
  {
    code: "en-IN",
    label: "English",
    native: "English",
    model: "bulbul:v4-flash",
    voices: [
      { id: "shubh_en_narration", name: "Shubh", gender: "male", style: "narration" },
      { id: "shubh_en_audiobook", name: "Shubh", gender: "male", style: "audiobook" },
      { id: "girish_en_documentary", name: "Girish", gender: "male", style: "documentary" },
      { id: "dev_en_conversational", name: "Dev", gender: "male", style: "conversational" },
      { id: "rohan_en_recovery", name: "Rohan", gender: "male", style: "recovery" },
      { id: "varun_en_ads", name: "Varun", gender: "male", style: "ads" },
      { id: "simran_en_conversation", name: "Simran", gender: "female", style: "conversation" },
      { id: "simran_en_narration", name: "Simran", gender: "female", style: "narration" },
      { id: "ishita_en_stories", name: "Ishita", gender: "female", style: "stories" },
      { id: "aditi_en_stories", name: "Aditi", gender: "female", style: "stories" },
      { id: "roopa_en_conversational", name: "Roopa", gender: "female", style: "conversational" },
      { id: "sanchita_en_companion", name: "Sanchita", gender: "female", style: "companion" },
      { id: "neha_en_latenight", name: "Neha", gender: "female", style: "latenight" },
      { id: "amelia_en_conversational", name: "Amelia", gender: "female", style: "conversational" },
      { id: "sophia_en_conversational", name: "Sophia", gender: "female", style: "conversational" },
      { id: "zarina_en_conversation", name: "Zarina", gender: "female", style: "conversation" },
    ],
  },
  {
    code: "hi-IN",
    label: "Hindi",
    native: "हिन्दी",
    model: "bulbul:v4-flash",
    voices: [
      { id: "aayan_hi_conversational", name: "Aayan", gender: "male", style: "conversational" },
      { id: "amit_hi_conversational", name: "Amit", gender: "male", style: "conversational" },
      { id: "rahul_hi_conversational", name: "Rahul", gender: "male", style: "conversational" },
      { id: "shubh_hi_customer", name: "Shubh", gender: "male", style: "customer" },
      { id: "anand_hi_documentary", name: "Anand", gender: "male", style: "documentary" },
      { id: "ratan_hi_documentary", name: "Ratan", gender: "male", style: "documentary" },
      { id: "kavya_hi_conversational", name: "Kavya", gender: "female", style: "conversational" },
      { id: "ishita_hi_edtech", name: "Ishita", gender: "female", style: "edtech" },
      { id: "ishita_hi_ads", name: "Ishita", gender: "female", style: "ads" },
      { id: "ritu_hi_conversation", name: "Ritu", gender: "female", style: "conversation" },
      { id: "roopa_hi_narration", name: "Roopa", gender: "female", style: "narration" },
      { id: "simran_hi_conversation", name: "Simran", gender: "female", style: "conversation" },
      { id: "sanchita_hi_assistant", name: "Sanchita", gender: "female", style: "assistant" },
      { id: "shreya_hi_conversational", name: "Shreya", gender: "female", style: "conversational" },
      { id: "tanya_hi_narration", name: "Tanya", gender: "female", style: "narration" },
    ],
  },
  {
    code: "mr-IN",
    label: "Marathi",
    native: "मराठी",
    model: "bulbul:v4-flash",
    voices: [
      { id: "nilesh_mr_conversation", name: "Nilesh", gender: "male", style: "conversation" },
      { id: "soham_mr_narration", name: "Soham", gender: "male", style: "narration" },
      { id: "ishita_mr_conversational", name: "Ishita", gender: "female", style: "conversational" },
      { id: "mrunal_mr_narration", name: "Mrunal", gender: "female", style: "narration" },
      { id: "neha_mr_narration", name: "Neha", gender: "female", style: "narration" },
      { id: "rupali_mr_stories", name: "Rupali", gender: "female", style: "stories" },
      { id: "ritu_mr_narration", name: "Ritu", gender: "female", style: "narration" },
    ],
  },
  {
    code: "ta-IN",
    label: "Tamil",
    native: "தமிழ்",
    model: "bulbul:v4-flash",
    voices: [
      { id: "aravind_ta_ads", name: "Aravind", gender: "male", style: "ads" },
      { id: "gokul_ta_narration", name: "Gokul", gender: "male", style: "narration" },
      { id: "vijay_ta_narration", name: "Vijay", gender: "male", style: "narration" },
    ],
  },
  {
    code: "te-IN",
    label: "Telugu",
    native: "తెలుగు",
    model: "bulbul:v4-flash",
    voices: [
      { id: "tarun_te_narration", name: "Tarun", gender: "male", style: "narration" },
      { id: "kavitha_te_conversation", name: "Kavitha", gender: "female", style: "conversation" },
      { id: "kavitha_te_narration", name: "Kavitha", gender: "female", style: "narration" },
      { id: "pooja_te_conversation", name: "Pooja", gender: "female", style: "conversation" },
    ],
  },
  {
    code: "bn-IN",
    label: "Bengali",
    native: "বাংলা",
    model: "bulbul:v4-flash",
    voices: [
      { id: "arnab_bn_conversation", name: "Arnab", gender: "male", style: "conversation" },
      { id: "bimal_bn_suspense", name: "Bimal", gender: "male", style: "suspense" },
      { id: "roopa_bn_conversational", name: "Roopa", gender: "female", style: "conversational" },
    ],
  },
  {
    code: "gu-IN",
    label: "Gujarati",
    native: "ગુજરાતી",
    model: "bulbul:v4-flash",
    voices: [
      { id: "bhavik_gu_conversation", name: "Bhavik", gender: "male", style: "conversation" },
      { id: "pooja_gu_conversational", name: "Pooja", gender: "female", style: "conversational" },
      { id: "pooja_gu_customer", name: "Pooja", gender: "female", style: "customer" },
    ],
  },
  {
    code: "kn-IN",
    label: "Kannada",
    native: "ಕನ್ನಡ",
    model: "bulbul:v4-flash",
    voices: [
      { id: "chetan_kn_conversation", name: "Chetan", gender: "male", style: "conversation" },
      { id: "chaitra_kn_conversation", name: "Chaitra", gender: "female", style: "conversation" },
      { id: "chaitra_kn_narration", name: "Chaitra", gender: "female", style: "narration" },
      { id: "suchitra_kn_narration", name: "Suchitra", gender: "female", style: "narration" },
    ],
  },
  {
    code: "ml-IN",
    label: "Malayalam",
    native: "മലയാളം",
    model: "bulbul:v3",
    voices: [
      { id: "ishita", name: "Ishita", gender: "female", style: "conversation" },
      { id: "shubh", name: "Shubh", gender: "male", style: "narration" },
    ],
  },
  {
    code: "pa-IN",
    label: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    model: "bulbul:v4-flash",
    voices: [
      { id: "anand_pa_conversation", name: "Anand", gender: "male", style: "conversation" },
      { id: "jaspal_pa_banking", name: "Jaspal", gender: "male", style: "banking" },
      { id: "harpreet_pa_narration", name: "Harpreet", gender: "male", style: "narration" },
    ],
  },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

export function getLanguage(code: string): LanguageOption {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export function getVoice(code: string, voiceId: string): VoiceOption | undefined {
  return getLanguage(code).voices.find((v) => v.id === voiceId);
}

export function defaultVoiceIds(code: string, count: number): string[] {
  const voices = getLanguage(code).voices;
  const female = voices.filter((v) => v.gender === "female");
  const male = voices.filter((v) => v.gender === "male");
  const picks: string[] = [];
  const lead = female[0] ?? voices[0];
  const second = male[0] ?? voices[1] ?? voices[0];
  const third = female[1] ?? voices[2] ?? voices[0];
  picks.push(lead.id, second.id, third.id);
  return picks.slice(0, count);
}

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((l) => l.code === value);
}

export const STYLES: { id: string; label: string; hint: string }[] = [
  { id: "educational", label: "Educational", hint: "Explain clearly, build understanding" },
  { id: "casual", label: "Casual", hint: "Two friends talking it through" },
  { id: "interview", label: "Interview", hint: "Host draws out an expert guest" },
  { id: "debate", label: "Debate", hint: "Respectful disagreement, strong cases" },
  { id: "news", label: "News discussion", hint: "Current-affairs desk energy" },
  { id: "storytelling", label: "Storytelling", hint: "Narrative arc, vivid scenes" },
];

export const AUDIENCES: { id: string; label: string }[] = [
  { id: "general", label: "General listeners" },
  { id: "beginners", label: "Beginners" },
  { id: "students", label: "Students" },
  { id: "professionals", label: "Professionals" },
  { id: "enthusiasts", label: "Enthusiasts" },
];

export const DEPTHS: { id: string; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "standard", label: "Standard" },
  { id: "deep", label: "Deep dive" },
];
