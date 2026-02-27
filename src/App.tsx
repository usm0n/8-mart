import {
  useState, useEffect, useRef, useCallback,
  type FC, type ReactElement,
} from "react";
import {
  createEntry, updateEntry, deleteEntry, addReaction,
  subscribeToAllNames, subscribeToPublicShares, getAllEntries,
  type ShareEntry, type TakenName,
} from "./firebase";

// ─────────────────────────────────────────────────────────────────────────────
// ── Constants & Types
// ─────────────────────────────────────────────────────────────────────────────
const NAMES = [
  "Malika","Zulfiya","Nilufar","Shahlo",
  "Madina","Feruza","Gulnora","Dildora",
  "Nargiza","Barno","Munira","Sarvinoz",
  "Mohira","Kamola","Nasiba","Umida",
];

// ⚠️  Change before the event
const ADMIN_PASSWORD = "parfum2026";
const LS_KEY         = "perfume_session_v3";

interface UserSession {
  name:      string;
  perfumeId: string;
  method:    string;
  isPublic:  boolean;
  anonymous: boolean;
  docId:     string;
  ts:        number;
}

interface Perfume {
  id:          string;
  name:        string;
  tagline:     string;
  desc:        string;
  notes:       string[];
  accent:      string;
  bg:          string;
  traits:      string[];
  personality: string;
  wish:        string;
  Bottle:      FC<{ accent: string; size?: number }>;
}

type Screen = "loading" | "name" | "mode" | "perfume" | "wheel" | "quiz" | "result" | "admin";
type Tab    = "result" | "perfumes" | "others";

// ─────────────────────────────────────────────────────────────────────────────
// ── Bottle SVGs
// ─────────────────────────────────────────────────────────────────────────────
const BottleClassic: FC<{ accent: string; size?: number }> = ({ accent, size = 120 }) => {
  const id = accent.replace("#", "");
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 120 168" fill="none">
      <defs>
        <linearGradient id={`bC${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={accent} stopOpacity=".9"/><stop offset="100%" stopColor={accent} stopOpacity=".4"/></linearGradient>
        <linearGradient id={`sC${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="white" stopOpacity=".35"/><stop offset="100%" stopColor="white" stopOpacity="0"/></linearGradient>
        <filter id={`gC${id}`}><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect x="42" y="8" width="36" height="14" rx="4" fill={accent} opacity=".8"/>
      <rect x="48" y="4" width="24" height="8" rx="3" fill={accent} opacity=".6"/>
      <rect x="50" y="22" width="20" height="20" rx="2" fill={accent} opacity=".7"/>
      <rect x="22" y="42" width="76" height="108" rx="12" fill={`url(#bC${id})`} filter={`url(#gC${id})`}/>
      <rect x="28" y="50" width="18" height="90" rx="8" fill={`url(#sC${id})`}/>
      <rect x="32" y="74" width="56" height="50" rx="6" fill="white" opacity=".08"/>
      <line x1="40" y1="88" x2="80" y2="88" stroke="white" strokeWidth="1" opacity=".4"/>
      <ellipse cx="60" cy="148" rx="34" ry="4" fill={accent} opacity=".18"/>
    </svg>
  );
};
const BottleRound: FC<{ accent: string; size?: number }> = ({ accent, size = 120 }) => {
  const id = accent.replace("#", "");
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 120 156" fill="none">
      <defs>
        <radialGradient id={`bR${id}`} cx="35%" cy="30%" r="70%"><stop offset="0%" stopColor={accent} stopOpacity=".95"/><stop offset="100%" stopColor={accent} stopOpacity=".45"/></radialGradient>
        <linearGradient id={`sR${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="white" stopOpacity=".45"/><stop offset="100%" stopColor="white" stopOpacity="0"/></linearGradient>
        <filter id={`gR${id}`}><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect x="44" y="6" width="32" height="12" rx="6" fill={accent} opacity=".85"/>
      <rect x="50" y="18" width="20" height="18" rx="3" fill={accent} opacity=".75"/>
      <ellipse cx="60" cy="96" rx="44" ry="56" fill={`url(#bR${id})`} filter={`url(#gR${id})`}/>
      <ellipse cx="42" cy="72" rx="10" ry="22" fill={`url(#sR${id})`}/>
      <line x1="36" y1="90" x2="84" y2="90" stroke="white" strokeWidth="1" opacity=".28"/>
      <ellipse cx="60" cy="150" rx="38" ry="4" fill={accent} opacity=".18"/>
    </svg>
  );
};
const BottleTall: FC<{ accent: string; size?: number }> = ({ accent, size = 120 }) => {
  const id = accent.replace("#", "");
  return (
    <svg width={size * 0.75} height={size * 1.5} viewBox="0 0 90 180" fill="none">
      <defs>
        <linearGradient id={`bT${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={accent} stopOpacity=".88"/><stop offset="100%" stopColor={accent} stopOpacity=".38"/></linearGradient>
        <linearGradient id={`sT${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="white" stopOpacity=".4"/><stop offset="100%" stopColor="white" stopOpacity="0"/></linearGradient>
        <filter id={`gT${id}`}><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect x="38" y="2" width="14" height="6" rx="3" fill={accent} opacity=".7"/>
      <rect x="32" y="8" width="26" height="10" rx="3" fill={accent} opacity=".8"/>
      <rect x="36" y="18" width="18" height="24" rx="2" fill={accent} opacity=".72"/>
      <rect x="14" y="42" width="62" height="124" rx="10" fill={`url(#bT${id})`} filter={`url(#gT${id})`}/>
      <rect x="20" y="52" width="14" height="104" rx="7" fill={`url(#sT${id})`}/>
      <line x1="30" y1="94" x2="60" y2="94" stroke="white" strokeWidth="1" opacity=".32"/>
      <ellipse cx="45" cy="164" rx="28" ry="3.5" fill={accent} opacity=".18"/>
    </svg>
  );
};
const BottleFaceted: FC<{ accent: string; size?: number }> = ({ accent, size = 120 }) => {
  const id = accent.replace("#", "");
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 120 162" fill="none">
      <defs>
        <linearGradient id={`bF${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={accent} stopOpacity=".92"/><stop offset="100%" stopColor={accent} stopOpacity=".42"/></linearGradient>
        <filter id={`gF${id}`}><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <polygon points="46,8 74,8 78,20 42,20" fill={accent} opacity=".85"/>
      <polygon points="50,2 70,2 74,8 46,8" fill={accent} opacity=".65"/>
      <rect x="50" y="20" width="20" height="18" fill={accent} opacity=".72"/>
      <polygon points="20,38 60,34 100,38 108,140 60,148 12,140" fill={`url(#bF${id})`} filter={`url(#gF${id})`}/>
      <polygon points="26,46 46,42 50,130 26,136" fill="white" opacity=".1"/>
      <line x1="40" y1="89" x2="80" y2="89" stroke="white" strokeWidth="1" opacity=".28"/>
      <ellipse cx="60" cy="153" rx="36" ry="4" fill={accent} opacity=".16"/>
    </svg>
  );
};
const BottleOrb: FC<{ accent: string; size?: number }> = ({ accent, size = 120 }) => {
  const id = accent.replace("#", "");
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 120 144" fill="none">
      <defs>
        <radialGradient id={`bO${id}`} cx="32%" cy="28%" r="72%"><stop offset="0%" stopColor={accent} stopOpacity=".95"/><stop offset="70%" stopColor={accent} stopOpacity=".55"/><stop offset="100%" stopColor={accent} stopOpacity=".3"/></radialGradient>
        <filter id={`gO${id}`}><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <ellipse cx="60" cy="10" rx="8" ry="7" fill={accent} opacity=".9"/>
      <line x1="60" y1="17" x2="60" y2="30" stroke={accent} strokeWidth="4" opacity=".7"/>
      <circle cx="60" cy="82" r="54" fill={`url(#bO${id})`} filter={`url(#gO${id})`}/>
      <ellipse cx="40" cy="58" rx="12" ry="18" fill="white" opacity=".2"/>
      <circle cx="60" cy="82" r="36" stroke="white" strokeWidth=".6" opacity=".1" fill="none"/>
      <ellipse cx="60" cy="134" rx="42" ry="5" fill={accent} opacity=".18"/>
    </svg>
  );
};
const BottleSquare: FC<{ accent: string; size?: number }> = ({ accent, size = 120 }) => {
  const id = accent.replace("#", "");
  return (
    <svg width={size * 0.85} height={size * 1.4} viewBox="0 0 102 168" fill="none">
      <defs>
        <linearGradient id={`bSq${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={accent} stopOpacity=".9"/><stop offset="100%" stopColor={accent} stopOpacity=".35"/></linearGradient>
        <filter id={`gSq${id}`}><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect x="30" y="4" width="42" height="16" rx="2" fill={accent} opacity=".88"/>
      <rect x="38" y="0" width="26" height="8" rx="2" fill={accent} opacity=".65"/>
      <rect x="38" y="20" width="26" height="18" fill={accent} opacity=".74"/>
      <rect x="8" y="38" width="86" height="116" rx="4" fill={`url(#bSq${id})`} filter={`url(#gSq${id})`}/>
      <rect x="16" y="48" width="16" height="96" rx="6" fill="white" opacity=".13"/>
      <line x1="28" y1="88" x2="74" y2="88" stroke="white" strokeWidth="1" opacity=".3"/>
      <ellipse cx="51" cy="154" rx="38" ry="4" fill={accent} opacity=".18"/>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Perfume Data
// ─────────────────────────────────────────────────────────────────────────────
const PERFUMES: Perfume[] = [
  { id:"vs",          Bottle:BottleClassic, name:"Victoria's Secret",   tagline:"Shirin va Jozibador",   accent:"#ff47a1", bg:"#1a000a", desc:"Meva va gullarning yorqin uyg'unligi.",               notes:["Qulupnay","Pion","Vanilla","Orxideya"],    traits:["Sho'x","Jozibador","Zamonaviy"],      personality:"Siz har qanday davraga nur va quvnoqlik olib kiruvchi go'zalsiz.",           wish:"Go'zalligingiz va tarovatingiz dunyoni hayratda qoldirishdan to'xtamasin!" },
  { id:"myway",       Bottle:BottleRound,   name:"My Way",              tagline:"Sayohat va Kashfiyot",  accent:"#3b82f6", bg:"#000511", desc:"Oq gullarning nafis va aslzoda ifori.",                notes:["Tuberosa","Jasmin","Bergamot","Musk"],     traits:["Elegant","Seryurak","Mustaqil"],       personality:"Siz yangi ufqlar sari dadil qadam tashlaydigan, dunyoqarashi keng insonsiz.", wish:"Sening yo'ling doimo omad va unutilmas xotiralarga boy bo'lsin!" },
  { id:"delina",      Bottle:BottleClassic, name:"Delina (De Marly)",   tagline:"Qirollik Hashamati",   accent:"#f9a8d4", bg:"#13040a", desc:"Turk atirguli va lyuchining sehrli raqsi.",            notes:["Atirgul","Lyuchi","Rhubarb","Vanilla"],   traits:["Nafis","Aslzoda","Unutilmas"],         personality:"Sizda tug'ma aristokratik did va ayollik latofati mujassam.",               wish:"Har bir kuningiz qirollik saroyidagidek bayramona o'tsin!" },
  { id:"imperatrice", Bottle:BottleTall,    name:"L'Imperatrice",       tagline:"Ekzotik Malika",       accent:"#f87171", bg:"#0f0101", desc:"Tarvuz va kivi shirasining yangiligi.",                notes:["Tarvuz","Kivi","Sandal","Siklomen"],      traits:["Yorqin","Energetik","Erkin"],          personality:"Siz hayotni sevadigan, har bir lahzadan zavq oladigan imperatrisasiz.",      wish:"Hayotingiz mevalar kabi shirin va suvdek tiniq bo'lsin!" },
  { id:"libre",       Bottle:BottleSquare,  name:"Libre",               tagline:"Erkinlik Ruhi",        accent:"#d97706", bg:"#110900", desc:"Lavanda va apelsin gulining jasur kombinatsiyasi.",    notes:["Lavanda","Mandarin","Vanilla","Amber"],   traits:["Jasur","Kuchli","Elegant"],            personality:"Siz o'z qoidalariga ko'ra yashaydigan, irodasi baquvvat insonsiz.",          wish:"Erkinligingiz sizga eng baland cho'qqilarni zabt etishda yordam bersin!" },
  { id:"eclat",       Bottle:BottleRound,   name:"Eclat d'Arpège",      tagline:"Bahor Sadoqati",       accent:"#c4b5fd", bg:"#080310", desc:"Nilufar va choy barglarining mayin ifori.",            notes:["Lilak","Pion","Choy","Musk"],             traits:["Yumshoq","Samimiy","Nafis"],           personality:"Sizning qalbingiz bahor tongidek beg'ubor va mehribon.",                    wish:"Yuragingizdagi bahoriy kayfiyat sizni hech qachon tark etmasin!" },
  { id:"symphony",    Bottle:BottleFaceted, name:"Symphony",            tagline:"Havo va Musiqa",       accent:"#67e8f9", bg:"#000b0e", desc:"Sitrus va zanjabilning tetiklantiruvchi uyg'unligi.",  notes:["Greypfrut","Zanjabil","Bergamot","Musk"],  traits:["Tiniq","Yengil","Ilhomlantiruvchi"],  personality:"Sizning borligingiz atrofdagilar uchun go'zal bir simfoniya kabi yoqimli.",  wish:"Hayot musiqangiz faqat quvonchli notalardan iborat bo'lsin!" },
  { id:"tk4",         Bottle:BottleTall,    name:"Thomas Kosmala No.4", tagline:"Zamonaviy va Kuchli",  accent:"#a3e635", bg:"#050a00", desc:"Ambroksan va sitrusning magnit kabi tortuvchi kuchi.",  notes:["Ambroxan","Limon","Ziravorlar","Yog'och"],traits:["Zamonaviy","Magnit","O'ziga xos"],    personality:"Siz o'zidan o'chmas iz qoldiradigan, xarakteri kuchli insonsiz.",           wish:"Sizning ta'siringiz va nuringiz har doim yo'lingizni yoritib tursin!" },
  { id:"kirke",       Bottle:BottleOrb,     name:"Kirke",               tagline:"Sehrli Jodu",          accent:"#fcd34d", bg:"#120d00", desc:"Tropik mevalar va muskusning sirliligi.",              notes:["Shaftoli","Passionfruit","Musk","Sandallovut"],traits:["Sirlu","Kuchli","Sehrli"],      personality:"Siz o'ziga rom etish san'atini mukammal egallagan jozibador shaxssiz.",     wish:"Sehrli kuchingiz sizga barcha ezgu niyatlaringizga yetishishda yordam bersin!" },
  { id:"blackopium",  Bottle:BottleClassic, name:"Black Opium",         tagline:"Tungi Sehr",           accent:"#8b5cf6", bg:"#0a0014", desc:"Kofe va vanilning mast qiluvchi hidi.",                notes:["Kofe","Vanilla","Jasmin","Sidr"],          traits:["Sirli","Ehtirosli","Jasur"],           personality:"Siz tunda porlaydigan yulduz kabi sirlisiz va o'zingizga ishonchingiz baland.",wish:"Har bir oqshomingiz mo'jizalarga va shirin lahzalarga to'la bo'lsin!" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ── Quiz Data
// ─────────────────────────────────────────────────────────────────────────────
interface QuizQuestion {
  question: string;
  emoji:    string;
  options:  { label: string; scores: Partial<Record<string, number>> }[];
}
const QUIZ_QUESTIONS: QuizQuestion[] = [
  { question:"Qaysi so'z sizni eng yaxshi tavsiflaydi?", emoji:"🌸", options:[
    {label:"Quvnoq va energetik",  scores:{vs:2,imperatrice:2,symphony:1}},
    {label:"Sirli va ehtirosli",   scores:{blackopium:2,kirke:2,libre:1}},
    {label:"Nafis va aslzoda",     scores:{delina:2,eclat:2,myway:1}},
    {label:"Erkin va dadil",       scores:{myway:2,libre:2,tk4:1}},
  ]},
  { question:"Sevimli vaqtingiz qaysi?", emoji:"✨", options:[
    {label:"Tong — yangi kun boshlanishi", scores:{myway:2,eclat:2,symphony:1}},
    {label:"Tun — yulduzlar ostida",       scores:{blackopium:2,kirke:2,libre:1}},
    {label:"Bahor — gullagan bog'",        scores:{delina:2,vs:2,eclat:1}},
    {label:"Yoz — issiq dengiz",           scores:{imperatrice:2,symphony:1,tk4:1}},
  ]},
  { question:"Qanday atir hidi sizga yaqin?", emoji:"🌹", options:[
    {label:"Shirin va mevali",       scores:{vs:2,kirke:2,imperatrice:1}},
    {label:"Gullar va bahor",        scores:{delina:2,eclat:2,vs:1}},
    {label:"Chuqur va isiriq",       scores:{blackopium:2,libre:1,tk4:1}},
    {label:"Yengil va suvdek tiniq", scores:{symphony:2,myway:2,eclat:1}},
  ]},
];

// ─────────────────────────────────────────────────────────────────────────────
// ── Session helpers
// ─────────────────────────────────────────────────────────────────────────────
const readSession  = (): UserSession | null => {
  try { const r = localStorage.getItem(LS_KEY); return r ? (JSON.parse(r) as UserSession) : null; }
  catch { return null; }
};
const writeSession = (s: UserSession)  => localStorage.setItem(LS_KEY, JSON.stringify(s));
const clearSession = ()                => localStorage.removeItem(LS_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// ── Shared UI helpers
// ─────────────────────────────────────────────────────────────────────────────
const Particles: FC<{ accent: string }> = ({ accent }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({length:14},(_,i)=>(
      <div key={i} className="absolute rounded-full"
        style={{left:`${(i*23.7)%100}%`,bottom:0,width:1+(i%3),height:1+(i%3),
          background:accent,opacity:.28,animation:`rise ${4+(i%5)}s ${(i*.45)%6}s ease-in-out infinite`}}/>
    ))}
  </div>
);

const Stars: FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({length:45},(_,i)=>(
      <div key={i} className="absolute rounded-full bg-white"
        style={{width:i%7===0?2:1,height:i%7===0?2:1,left:`${(i*19.3)%100}%`,top:`${(i*17.7)%100}%`,
          opacity:.05+(i%5)*.05,animation:`twinkle ${2+(i%4)}s ${(i%5)*.8}s ease-in-out infinite`}}/>
    ))}
  </div>
);

const timeAgo = (ts: number): string => {
  const m = Math.floor((Date.now()-ts)/60000);
  if (m<1) return "Hozir";
  if (m<60) return `${m} daqiqa oldin`;
  const h = Math.floor(m/60);
  if (h<24) return `${h} soat oldin`;
  return `${Math.floor(h/24)} kun oldin`;
};

const FilterPill: FC<{label:string;active:boolean;onClick:()=>void;accent:string}> = ({label,active,onClick,accent}) => (
  <button onClick={onClick} style={{fontFamily:"'EB Garamond',serif",fontSize:".75rem",letterSpacing:".1em",padding:"5px 13px",cursor:"pointer",transition:"all .25s",background:active?`${accent}18`:"transparent",border:`1px solid ${active?accent+"60":"rgba(255,255,255,.1)"}`,color:active?accent:"rgba(255,255,255,.32)",boxShadow:active?`0 0 12px ${accent}15`:"none"}}>{label}</button>
);

// ─────────────────────────────────────────────────────────────────────────────
// ── LoadingScreen
// ─────────────────────────────────────────────────────────────────────────────
const LoadingScreen: FC = () => {
  const [dot, setDot] = useState(0);
  useEffect(()=>{
    const t = setInterval(()=>setDot(d=>(d+1)%4),420);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{background:"linear-gradient(145deg,#0c0010,#060008 40%,#0e0005)"}}>
      <Stars/>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full" style={{width:500,height:500,top:"-10%",left:"-10%",background:"radial-gradient(circle,rgba(192,132,252,.07),transparent 70%)",filter:"blur(20px)"}}/>
        <div className="absolute rounded-full" style={{width:400,height:400,bottom:"-5%",right:"-5%",background:"radial-gradient(circle,rgba(255,107,138,.06),transparent 70%)",filter:"blur(20px)"}}/>
      </div>
      <div className="relative z-10 text-center">
        {/* Animated bottle cluster */}
        <div className="flex items-end justify-center gap-3 mb-10" style={{height:90}}>
          {[
            {accent:"#ff47a1",h:80,delay:0},
            {accent:"#c4b5fd",h:65,delay:150},
            {accent:"#fcd34d",h:90,delay:300},
            {accent:"#67e8f9",h:55,delay:150},
            {accent:"#f9a8d4",h:75,delay:0},
          ].map((b,i)=>(
            <div key={i} style={{width:10,borderRadius:"5px 5px 2px 2px",height:b.h,background:`linear-gradient(180deg,${b.accent}99,${b.accent}33)`,animation:`loadPulse 1.4s ${b.delay}ms ease-in-out infinite`,boxShadow:`0 0 18px ${b.accent}40`}}/>
          ))}
        </div>

        <div className="inline-flex items-center gap-4 mb-5">
          <div className="h-px w-12" style={{background:"linear-gradient(to right,transparent,rgba(255,107,138,.35))"}}/>
          <span style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,107,138,.5)",fontSize:".78rem",letterSpacing:".35em"}}>8 · Mart · 2025</span>
          <div className="h-px w-12" style={{background:"linear-gradient(to left,transparent,rgba(255,107,138,.35))"}}/>
        </div>

        <h1 style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(2rem,7vw,4rem)",fontWeight:300,color:"#fff",lineHeight:1.1,marginBottom:"2.5rem"}}>
          Parfyum<br/>
          <em style={{fontStyle:"italic",background:"linear-gradient(120deg,#ff6b8a,#c084fc 55%,#fb923c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Saylovlari</em>
        </h1>

        <div className="flex items-center justify-center gap-2">
          <div style={{width:6,height:6,borderRadius:"50%",background:"#ff47a1",animation:`loadDot 1.2s 0ms ease-in-out infinite`,opacity:dot===0?1:.2}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#c084fc",animation:`loadDot 1.2s 150ms ease-in-out infinite`,opacity:dot===1?1:.2}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#fcd34d",animation:`loadDot 1.2s 300ms ease-in-out infinite`,opacity:dot===2?1:.2}}/>
        </div>
        <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.2)",fontSize:".82rem",letterSpacing:".25em",marginTop:"1rem"}}>
          Yuklanmoqda{".".repeat(dot)}
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── NamePage
// ─────────────────────────────────────────────────────────────────────────────
const NamePage: FC<{onNext:(n:string)=>void; takenNames:TakenName[]}> = ({onNext,takenNames}) => {
  const [hov,setHov]   = useState<string|null>(null);
  const [sel,setSel]   = useState<string|null>(null);
  const [show,setShow] = useState(false);

  useEffect(()=>{ setTimeout(()=>setShow(true),60); },[]);

  const takenSet = new Set(takenNames.map(t=>t.name));
  const pick = (name:string) => { setSel(name); setTimeout(()=>onNext(name),550); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{background:"linear-gradient(145deg,#0c0010,#060008 40%,#0e0005)"}}>
      <Stars/>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full" style={{width:500,height:500,top:"-10%",left:"-10%",background:"radial-gradient(circle,rgba(192,132,252,.08),transparent 70%)",filter:"blur(20px)"}}/>
        <div className="absolute rounded-full" style={{width:400,height:400,bottom:"-5%",right:"-5%",background:"radial-gradient(circle,rgba(255,107,138,.07),transparent 70%)",filter:"blur(20px)"}}/>
      </div>

      <div className={`relative z-10 w-full max-w-2xl px-5 transition-all duration-700 ${show?"opacity-100 translate-y-0":"opacity-0 translate-y-6"} ${sel?"opacity-0 scale-95 pointer-events-none":""}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="h-px w-14" style={{background:"linear-gradient(to right,transparent,rgba(255,107,138,.4))"}}/>
            <span style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,107,138,.65)",fontSize:".8rem",letterSpacing:".35em"}}>8 · Mart · 2025</span>
            <div className="h-px w-14" style={{background:"linear-gradient(to left,transparent,rgba(255,107,138,.4))"}}/>
          </div>
          <h1 style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(3rem,9vw,5.5rem)",fontWeight:300,color:"#fff",lineHeight:1.08}}>
            Salom,{" "}
            <em style={{fontStyle:"italic",background:"linear-gradient(120deg,#ff6b8a,#c084fc 55%,#fb923c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>kim siz?</em>
          </h1>
          <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.25)",fontSize:".82rem",letterSpacing:".42em",textTransform:"uppercase",marginTop:"1rem"}}>Ismingizni tanlang</p>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {NAMES.map((name,i)=>{
            const taken=takenSet.has(name), isH=hov===name, isS=sel===name;
            return (
              <button key={name}
                onClick={()=>!taken&&pick(name)}
                onMouseEnter={()=>!taken&&setHov(name)}
                onMouseLeave={()=>setHov(null)}
                style={{
                  fontFamily:"'EB Garamond',serif",fontSize:"1rem",letterSpacing:".03em",
                  padding:"14px 8px",cursor:taken?"not-allowed":"pointer",
                  transition:"all .25s",
                  animationDelay:`${i*30}ms`,
                  background:isS?"linear-gradient(135deg,rgba(255,107,138,.22),rgba(192,132,252,.14))":isH?"rgba(255,255,255,.055)":"rgba(255,255,255,.018)",
                  border:`1px solid ${isS?"rgba(255,107,138,.55)":taken?"rgba(255,255,255,.025)":isH?"rgba(255,255,255,.13)":"rgba(255,255,255,.045)"}`,
                  color:taken?"rgba(255,255,255,.18)":isS?"#ff9db5":isH?"rgba(255,255,255,.9)":"rgba(255,255,255,.45)",
                  transform:isS?"scale(1.06)":isH?"translateY(-2px)":"none",
                  boxShadow:isS?"0 0 22px rgba(255,107,138,.18)":"none",
                  opacity:taken?.45:1,
                }}>
                {name}
                {taken&&<span style={{display:"block",fontSize:".52rem",color:"rgba(255,107,138,.35)",letterSpacing:".08em",marginTop:2}}>tanlangan</span>}
              </button>
            );
          })}
        </div>

        {takenSet.size>0&&(
          <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.15)",fontSize:".75rem",textAlign:"center",marginTop:"1.2rem",letterSpacing:".15em"}}>
            {takenSet.size} ta ism allaqachon tanlangan
          </p>
        )}
        <div className="text-center mt-8 text-2xl" style={{opacity:.12,letterSpacing:"1rem"}}>🌸 🌹 🪷</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── ModePage
// ─────────────────────────────────────────────────────────────────────────────
const ModePage: FC<{name:string;onMode:(m:"manual"|"wheel"|"quiz")=>void}> = ({name,onMode}) => {
  const [hov,setHov] = useState<string|null>(null);
  const modes = [
    {id:"manual" as const,emoji:"💎",title:"O'zim Tanlаyman",desc:"10 ta atir ichidan ko'nglim tortganini olaman",accent:"#f9a8d4"},
    {id:"wheel"  as const,emoji:"🎡",title:"Omad G'ildiragi", desc:"G'ildirakning ko'rsatgani mening taqdиrimdir!",accent:"#fcd34d"},
    {id:"quiz"   as const,emoji:"🔮",title:"Shaxsiyat Testi",  desc:"3 savol — atir o'zi meni topadi",accent:"#8b5cf6"},
  ];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{background:"linear-gradient(145deg,#07000f,#03000a,#080004)"}}>
      <Stars/>
      <div className="relative z-10 w-full max-w-xl px-5 text-center">
        <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.35)",fontSize:"1rem",marginBottom:".4rem"}}>Assalomu alaykum,</p>
        <h2 style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(2rem,6vw,3.2rem)",fontWeight:400,marginBottom:".5rem",background:"linear-gradient(120deg,#ff6b8a,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{name}</h2>
        <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.22)",fontSize:".78rem",letterSpacing:".4em",textTransform:"uppercase",marginBottom:"3rem"}}>Qanday tanlaysiz?</p>
        <div className="flex flex-col gap-4">
          {modes.map(m=>{
            const isH=hov===m.id;
            return (
              <button key={m.id} onClick={()=>onMode(m.id)}
                onMouseEnter={()=>setHov(m.id)} onMouseLeave={()=>setHov(null)}
                style={{position:"relative",textAlign:"left",padding:"1.4rem 1.6rem",cursor:"pointer",transition:"all .3s",background:isH?`${m.accent}10`:"rgba(255,255,255,.018)",border:`1px solid ${isH?m.accent+"55":"rgba(255,255,255,.055)"}`,transform:isH?"translateX(6px)":"none",boxShadow:isH?`0 15px 40px ${m.accent}15`:"none"}}>
                {isH&&<div className="absolute left-0 top-0 bottom-0 w-0.5" style={{background:m.accent}}/>}
                <div className="flex items-center gap-4">
                  <span style={{fontSize:"2rem"}}>{m.emoji}</span>
                  <div>
                    <div style={{fontFamily:"'Cormorant',serif",fontSize:"1.3rem",color:"#fff",marginBottom:".2rem"}}>{m.title}</div>
                    <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.35)",fontSize:".88rem"}}>{m.desc}</div>
                  </div>
                  <div style={{marginLeft:"auto",color:m.accent,opacity:isH?.8:.2,fontSize:"1.2rem",transition:"all .3s",transform:isH?"translateX(0)":"translateX(-4px)"}}>→</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── PerfumePage (manual)
// ─────────────────────────────────────────────────────────────────────────────
const PerfumePage: FC<{name:string;onNext:(p:Perfume)=>void;onBack:()=>void}> = ({name,onNext,onBack}) => {
  const [sel,setSel]       = useState<Perfume|null>(null);
  const [leaving,setLeave] = useState(false);
  const confirm = () => { if(!sel) return; setLeave(true); setTimeout(()=>onNext(sel),500); };
  return (
    <div className="min-h-screen relative overflow-hidden" style={{background:"linear-gradient(160deg,#07000f,#03000a 55%,#080004)"}}>
      <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
      {sel&&<div className="absolute inset-0 pointer-events-none transition-all duration-1000" style={{background:`radial-gradient(ellipse at 50% 0%,${sel.accent}10,transparent 55%)`}}/>}
      <div className={`relative z-10 max-w-5xl mx-auto px-5 py-10 transition-all duration-500 ${leaving?"opacity-0 translate-y-5":""}`}>
        <button onClick={onBack} style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.3)",fontSize:".82rem",letterSpacing:".2em",background:"none",border:"none",cursor:"pointer",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:6}}>← Orqaga</button>
        <div className="text-center mb-10">
          <h2 style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(2rem,5vw,3rem)",fontWeight:400,background:"linear-gradient(120deg,#ff6b8a,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{name}</h2>
          <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.25)",fontSize:".78rem",letterSpacing:".4em",textTransform:"uppercase",marginTop:".6rem"}}>Sizga mos atirni tanlang</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-32">
          {PERFUMES.map(p=><PCard key={p.id} p={p} sel={sel?.id===p.id} onClick={()=>setSel(p)}/>)}
        </div>
      </div>
      <div className={`fixed bottom-0 left-0 right-0 z-20 transition-all duration-500 ${sel?"opacity-100 translate-y-0":"opacity-0 translate-y-full pointer-events-none"}`}
        style={{background:"linear-gradient(to top,rgba(0,0,0,.9),transparent)",padding:"2rem 1rem 1.5rem"}}>
        <div className="max-w-5xl mx-auto">
          <button onClick={confirm} style={{width:"100%",fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"1rem",letterSpacing:".06em",padding:"13px 52px",transition:"all .5s",cursor:"pointer",border:`1px solid ${sel?sel.accent+"70":"rgba(255,255,255,.07)"}`,color:sel?.accent??"rgba(255,255,255,.18)",background:sel?`${sel.accent}10`:"transparent",boxShadow:sel?`0 0 30px ${sel.accent}18`:"none"}}>
            {sel?`✦  ${sel.name} — Tanlash`:"✦  Atir tanlang"}
          </button>
        </div>
      </div>
    </div>
  );
};

const PCard: FC<{p:Perfume;sel:boolean;onClick:()=>void}> = ({p,sel,onClick}) => {
  const [hov,setHov]=useState(false); const on=sel||hov;
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="relative overflow-hidden cursor-pointer transition-all duration-500"
      style={{background:on?`${p.accent}0c`:"rgba(255,255,255,.015)",border:`1px solid ${on?p.accent+"55":"rgba(255,255,255,.055)"}`,transform:on?"translateY(-7px)":"none",boxShadow:sel?`0 20px 50px ${p.accent}22,inset 0 1px 0 ${p.accent}28`:"none"}}>
      {sel&&<div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(to right,transparent,${p.accent},transparent)`}}/>}
      <div className="absolute inset-0 opacity-20 pointer-events-none"><Particles accent={p.accent}/></div>
      <div className="relative z-10 p-5 flex flex-col items-center text-center">
        <div className="mb-3 transition-transform duration-500" style={{transform:on?"scale(1.08) translateY(-4px)":"none",filter:on?`drop-shadow(0 0 18px ${p.accent}80)`:`drop-shadow(0 4px 10px ${p.accent}30)`}}>
          <p.Bottle accent={p.accent} size={100}/>
        </div>
        {sel&&<div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{background:p.accent,fontSize:".55rem"}}>✓</div>}
        <div style={{fontFamily:"'Cormorant',serif",fontSize:"1.25rem",color:"#fff",marginBottom:".15rem"}}>{p.name}</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:".82rem",color:p.accent+"bb",marginBottom:".7rem"}}>{p.tagline}</div>
        <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.38)",fontSize:".88rem",lineHeight:1.65,marginBottom:".9rem"}}>{p.desc}</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {p.notes.map(n=><span key={n} style={{fontFamily:"'EB Garamond',serif",fontSize:".7rem",padding:"2px 8px",background:`${p.accent}13`,color:`${p.accent}bb`,border:`1px solid ${p.accent}22`}}>{n}</span>)}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── SpinWheelPage
// ─────────────────────────────────────────────────────────────────────────────
const SpinWheelPage: FC<{name:string;onConfirm:(p:Perfume)=>void;onBack:()=>void}> = ({name,onConfirm,onBack}) => {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [spinning,setSpinning]     = useState(false);
  const [candidate,setCandidate]   = useState<Perfume|null>(null);
  const [showConfirm,setShowConfirm] = useState(false);
  const angleRef    = useRef(0);
  const SIZE=320, CX=160, CY=160, R=150, SEG=(2*Math.PI)/PERFUMES.length;

  const draw = useCallback((angle:number)=>{
    const ctx=canvasRef.current?.getContext("2d"); if(!ctx) return;
    ctx.clearRect(0,0,SIZE,SIZE);
    PERFUMES.forEach((p,i)=>{
      const start=angle+i*SEG-Math.PI/2, end=start+SEG;
      ctx.beginPath(); ctx.moveTo(CX,CY); ctx.arc(CX,CY,R,start,end); ctx.closePath();
      ctx.fillStyle=p.accent+"55"; ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.06)"; ctx.lineWidth=1; ctx.stroke();
      const mid=start+SEG/2;
      const isTop=Math.abs(((mid%(2*Math.PI))+2*Math.PI)%(2*Math.PI)-(3*Math.PI)/2)<SEG/2;
      if(isTop){ctx.beginPath();ctx.moveTo(CX,CY);ctx.arc(CX,CY,R,start,end);ctx.closePath();ctx.fillStyle=p.accent+"55";ctx.fill();}
      ctx.save(); ctx.translate(CX,CY); ctx.rotate(mid); ctx.textAlign="right";
      ctx.fillStyle="rgba(255,255,255,.72)"; ctx.font="bold 8.5px sans-serif";
      ctx.fillText(p.name.length>9?p.name.slice(0,8)+"…":p.name,R-12,3); ctx.restore();
    });
    ctx.beginPath(); ctx.arc(CX,CY,26,0,2*Math.PI); ctx.fillStyle="#0a000f"; ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.1)"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,.35)"; ctx.font="15px serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("✦",CX,CY);
  },[]);

  useEffect(()=>{ draw(0); },[draw]);

  const spin = ()=>{
    if(spinning||candidate) return;
    setSpinning(true);
    const total=(8+Math.random()*6)*2*Math.PI+Math.random()*2*Math.PI;
    const dur=4800, t0=performance.now(), a0=angleRef.current;
    const animate=(now:number)=>{
      const t=Math.min((now-t0)/dur,1), eased=1-Math.pow(1-t,3);
      angleRef.current=a0+total*eased; draw(angleRef.current);
      if(t<1){ requestAnimationFrame(animate); return; }
      const final=((angleRef.current%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
      const adj=((3*Math.PI)/2-final+2*Math.PI*100)%(2*Math.PI);
      const idx=Math.floor(adj/SEG)%PERFUMES.length;
      setCandidate(PERFUMES[idx]); setSpinning(false);
      setTimeout(()=>setShowConfirm(true),450);
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{background:"#07000f"}}>
      {candidate&&<div className="absolute inset-0 pointer-events-none transition-all duration-1000" style={{background:`radial-gradient(ellipse at 50% 40%,${candidate.accent}18,transparent 60%)`}}/>}
      <Particles accent={candidate?.accent??"#c084fc"}/><Stars/>

      {showConfirm&&candidate&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,.78)",backdropFilter:"blur(14px)"}}>
          <div className="relative max-w-sm w-full mx-5" style={{background:"rgba(10,3,18,.97)",border:`1px solid ${candidate.accent}40`,boxShadow:`0 40px 80px rgba(0,0,0,.7),0 0 50px ${candidate.accent}18`}}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(to right,transparent,${candidate.accent},transparent)`}}/>
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4" style={{filter:`drop-shadow(0 0 28px ${candidate.accent}80)`,animation:"float 3s ease-in-out infinite"}}><candidate.Bottle accent={candidate.accent} size={90}/></div>
              <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.3)",fontSize:".7rem",letterSpacing:".35em",textTransform:"uppercase",marginBottom:".5rem"}}>Omad g'ildiragi tanladi</div>
              <h3 style={{fontFamily:"'Cormorant',serif",fontSize:"1.7rem",color:candidate.accent,marginBottom:".2rem"}}>{candidate.name}</h3>
              <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.35)",fontSize:".88rem",marginBottom:"2rem"}}>{candidate.tagline}</p>
              <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.38)",fontSize:".88rem",marginBottom:"1.8rem"}}>Bu atirni qabul qilasizmi?</p>
              <div className="flex gap-3">
                <button onClick={()=>{setShowConfirm(false);setCandidate(null);}} style={{flex:1,fontFamily:"'EB Garamond',serif",fontSize:".9rem",padding:"11px",cursor:"pointer",background:"transparent",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.35)",transition:"all .25s"}}>🎡 Qayta</button>
                <button onClick={()=>onConfirm(candidate)} style={{flex:2,fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"1rem",padding:"11px",cursor:"pointer",background:`${candidate.accent}18`,border:`1px solid ${candidate.accent}60`,color:candidate.accent,boxShadow:`0 0 20px ${candidate.accent}20`,transition:"all .3s"}}>✦ Ha, qabul!</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md px-5 text-center">
        <button onClick={onBack} style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.3)",fontSize:".82rem",letterSpacing:".2em",background:"none",border:"none",cursor:"pointer",marginBottom:"1.5rem",display:"block"}}>← Orqaga</button>
        <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.3)",marginBottom:".5rem"}}>{name},</p>
        <h2 style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(1.8rem,5vw,2.6rem)",color:"#fff",fontWeight:300,marginBottom:"2.5rem"}}>{candidate?"Taqdiring shu!":"G'ildiraknı aylantiring"}</h2>
        <div className="relative flex justify-center mb-1">
          <div style={{width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:`22px solid rgba(255,255,255,.65)`,zIndex:10,filter:`drop-shadow(0 0 6px ${candidate?.accent??"#fff"})`}}/>
        </div>
        <div className="relative mx-auto" style={{width:SIZE,height:SIZE,cursor:spinning||candidate?"default":"pointer"}} onClick={spin}>
          <div className="absolute inset-0 rounded-full" style={{boxShadow:`0 0 60px ${candidate?.accent??"#c084fc"}25,inset 0 0 30px rgba(0,0,0,.5)`,borderRadius:"50%",transition:"box-shadow 1s"}}/>
          <canvas ref={canvasRef} width={SIZE} height={SIZE} style={{borderRadius:"50%",display:"block"}}/>
        </div>
        {!candidate&&!spinning&&<p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.18)",fontSize:".85rem",marginTop:"1.5rem"}}>Bosing yoki teging</p>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── QuizPage
// ─────────────────────────────────────────────────────────────────────────────
const QuizPage: FC<{name:string;onConfirm:(p:Perfume)=>void;onBack:()=>void}> = ({name,onConfirm,onBack}) => {
  const [step,setStep]     = useState(0);
  const [scores,setScores] = useState<Record<string,number>>({});
  const [fading,setFading] = useState(false);
  const [result,setResult] = useState<Perfume|null>(null);
  const q = QUIZ_QUESTIONS[step];

  const pick = (opt:{label:string;scores:Partial<Record<string,number>>}) => {
    if(fading) return;
    const ns={...scores};
    Object.entries(opt.scores).forEach(([id,pts])=>{ ns[id]=(ns[id]??0)+(pts??0); });
    setScores(ns); setFading(true);
    setTimeout(()=>{
      if(step+1>=QUIZ_QUESTIONS.length){
        const winner=PERFUMES.reduce((b,p)=>(ns[p.id]??0)>(ns[b.id]??0)?p:b);
        setResult(winner); setFading(false);
      } else { setStep(step+1); setFading(false); }
    },380);
  };

  const retry = ()=>{ setStep(0); setScores({}); setResult(null); };

  if(result) return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{background:result.bg}}>
      <div className="absolute inset-0 pointer-events-none" style={{background:`radial-gradient(ellipse at 50% 30%,${result.accent}20,transparent 60%)`}}/>
      <Stars/>
      <div className="relative z-10 max-w-sm w-full mx-5" style={{background:"rgba(8,2,15,.97)",border:`1px solid ${result.accent}40`,boxShadow:`0 40px 80px rgba(0,0,0,.7),0 0 50px ${result.accent}18`}}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(to right,transparent,${result.accent},transparent)`}}/>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4" style={{filter:`drop-shadow(0 0 28px ${result.accent}80)`,animation:"float 3s ease-in-out infinite"}}><result.Bottle accent={result.accent} size={90}/></div>
          <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.3)",fontSize:".7rem",letterSpacing:".35em",textTransform:"uppercase",marginBottom:".5rem"}}>Shaxsiyat testingiz natijasi</div>
          <h3 style={{fontFamily:"'Cormorant',serif",fontSize:"1.7rem",color:result.accent,marginBottom:".2rem"}}>{result.name}</h3>
          <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.35)",fontSize:".88rem",marginBottom:".8rem"}}>{result.tagline}</p>
          <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.3)",fontSize:".82rem",lineHeight:1.7,marginBottom:"2rem"}}>"{result.personality}"</p>
          <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.38)",fontSize:".88rem",marginBottom:"1.8rem"}}>Bu atirni qabul qilasizmi?</p>
          <div className="flex gap-3">
            <button onClick={retry} style={{flex:1,fontFamily:"'EB Garamond',serif",fontSize:".88rem",padding:"11px",cursor:"pointer",background:"transparent",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.35)",transition:"all .25s"}}>🔮 Qayta</button>
            <button onClick={()=>onConfirm(result)} style={{flex:2,fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"1rem",padding:"11px",cursor:"pointer",background:`${result.accent}18`,border:`1px solid ${result.accent}60`,color:result.accent,boxShadow:`0 0 20px ${result.accent}20`,transition:"all .3s"}}>✦ Ha, qabul!</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{background:"linear-gradient(145deg,#07000f,#03000a,#0a000d)"}}>
      <Particles accent="#8b5cf6"/><Stars/>
      <div className="relative z-10 w-full max-w-md px-5">
        <button onClick={onBack} style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.3)",fontSize:".82rem",letterSpacing:".2em",background:"none",border:"none",cursor:"pointer",marginBottom:"2rem",display:"block"}}>← Orqaga</button>
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.25)",fontSize:".72rem",letterSpacing:".3em"}}>SAVOL {step+1}/{QUIZ_QUESTIONS.length}</span>
            <span style={{fontFamily:"'EB Garamond',serif",color:"#8b5cf6",fontSize:".72rem",letterSpacing:".2em"}}>{name}</span>
          </div>
          <div style={{height:2,background:"rgba(255,255,255,.06)",borderRadius:1}}>
            <div style={{height:"100%",width:`${(step/QUIZ_QUESTIONS.length)*100}%`,background:"linear-gradient(to right,#8b5cf6,#c084fc)",borderRadius:1,transition:"width .5s ease"}}/>
          </div>
        </div>
        <div className={`transition-all duration-380 ${fading?"opacity-0 translate-y-4":"opacity-100 translate-y-0"}`}>
          <div className="text-center mb-8">
            <div style={{fontSize:"3rem",marginBottom:"1rem"}}>{q.emoji}</div>
            <h3 style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(1.4rem,4vw,1.8rem)",color:"#fff",fontWeight:300,lineHeight:1.3}}>{q.question}</h3>
          </div>
          <div className="flex flex-col gap-3">
            {q.options.map((opt,i)=>(
              <button key={i} onClick={()=>pick(opt)} className="text-left"
                style={{padding:"1rem 1.3rem",cursor:"pointer",background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",transition:"all .25s"}}
                onMouseEnter={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.background="rgba(139,92,246,.1)";b.style.borderColor="rgba(139,92,246,.4)";b.style.transform="translateX(5px)";}}
                onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.background="rgba(255,255,255,.025)";b.style.borderColor="rgba(255,255,255,.07)";b.style.transform="translateX(0)";}}>
                <div className="flex items-center gap-3">
                  <span style={{fontFamily:"'EB Garamond',serif",fontSize:".7rem",color:"rgba(139,92,246,.6)",letterSpacing:".2em",minWidth:"1.5rem"}}>0{i+1}</span>
                  <span style={{fontFamily:"'EB Garamond',serif",fontSize:"1rem",color:"rgba(255,255,255,.7)"}}>{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── ShareModal  — always saves, just controls isPublic
// ─────────────────────────────────────────────────────────────────────────────
const ShareModal: FC<{
  name:string; perfume:Perfume; method:string; existingDocId:string;
  onDone:(isPublic:boolean,anonymous:boolean)=>void;
}> = ({name,perfume,method,existingDocId,onDone}) => {
  const [anonymous,setAnonymous] = useState(false);
  const [saving,setSaving]       = useState(false);
  const [decided,setDecided]     = useState(false);

  const save = async (isPublic:boolean) => {
    if(saving) return;
    setSaving(true);
    try {
      await updateEntry(existingDocId, {
        isPublic,
        anonymous,
        displayName: anonymous ? "Noma'lum" : name,
      });
    } catch(e){ console.error("Update failed:",e); }
    setDecided(true);
    setTimeout(()=>onDone(isPublic,anonymous),380);
  };

  const methodLabel:Record<string,string> = {
    manual:"O'zingiz tanladingiz", wheel:"Omad g'ildiragi tanladi", quiz:"Shaxsiyat testi tanladi",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,.82)",backdropFilter:"blur(14px)"}}>
      <div className={`relative max-w-sm w-full mx-5 transition-all duration-380 ${decided?"opacity-0 scale-95":"opacity-100 scale-100"}`}
        style={{background:"rgba(10,3,20,.97)",border:`1px solid ${perfume.accent}35`,boxShadow:`0 40px 100px rgba(0,0,0,.7),0 0 60px ${perfume.accent}15`}}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(to right,transparent,${perfume.accent},transparent)`}}/>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4" style={{filter:`drop-shadow(0 0 25px ${perfume.accent}70)`}}>
            <perfume.Bottle accent={perfume.accent} size={76}/>
          </div>
          <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:perfume.accent+"55",fontSize:".7rem",letterSpacing:".3em",textTransform:"uppercase",marginBottom:".4rem"}}>{methodLabel[method]??""}</div>
          <h3 style={{fontFamily:"'Cormorant',serif",fontSize:"1.55rem",color:"#fff",marginBottom:".3rem"}}>Sinfdo'stlarga ko'rsatish?</h3>
          <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.3)",fontSize:".84rem",lineHeight:1.75,marginBottom:"1.5rem"}}>
            Tanlovingiz <strong style={{color:"rgba(255,255,255,.5)"}}>allaqachon saqlangan</strong>.<br/>Faqat uni ommaga ko'rsatasizmi?
          </p>
          <div className="flex items-center justify-between mb-5" style={{padding:"10px 14px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
            <span style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.45)",fontSize:".86rem"}}>Ismni yashirish</span>
            <button onClick={()=>setAnonymous(!anonymous)} style={{width:42,height:22,borderRadius:11,border:"none",cursor:"pointer",transition:"all .3s",position:"relative",background:anonymous?perfume.accent:"rgba(255,255,255,.12)"}}>
              <div style={{position:"absolute",top:3,width:16,height:16,borderRadius:"50%",background:"white",transition:"all .3s",left:anonymous?23:3}}/>
            </button>
          </div>
          {anonymous&&<p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:perfume.accent+"88",fontSize:".76rem",marginBottom:"1rem",marginTop:"-.3rem"}}>"Noma'lum" sifatida ko'rsatiladi</p>}
          <div className="flex gap-3">
            <button onClick={()=>save(false)} disabled={saving} style={{flex:1,fontFamily:"'EB Garamond',serif",fontSize:".88rem",padding:"11px",cursor:"pointer",background:"transparent",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.35)",transition:"all .25s",opacity:saving?.5:1}}>🔒 Yashirish</button>
            <button onClick={()=>save(true)}  disabled={saving} style={{flex:2,fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:".95rem",padding:"11px",cursor:"pointer",background:`${perfume.accent}18`,border:`1px solid ${perfume.accent}55`,color:perfume.accent,boxShadow:`0 0 20px ${perfume.accent}18`,transition:"all .3s",opacity:saving?.5:1}}>
              {saving?"...":"✦ Ko'rsatish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Others / Perfumes tabs (unchanged structure, trimmed for brevity)
// ─────────────────────────────────────────────────────────────────────────────
const OthersTab: FC<{myPerfume:Perfume}> = ({myPerfume}) => {
  const [shares,setShares]   = useState<ShareEntry[]>([]);
  const [loading,setLoading] = useState(true);
  const [filter,setFilter]   = useState("all");
  const [reacted,setReacted] = useState<Set<string>>(new Set());

  useEffect(()=>{
    const unsub=subscribeToPublicShares(d=>{setShares(d);setLoading(false);}); return unsub;
  },[]);

  const handleReact=async(id:string)=>{
    if(reacted.has(id)) return;
    setReacted(p=>new Set([...p,id])); await addReaction(id);
  };

  const counts:Record<string,number>={};
  shares.forEach(s=>{counts[s.perfumeId]=(counts[s.perfumeId]??0)+1;});
  const topId=Object.keys(counts).sort((a,b)=>(counts[b]??0)-(counts[a]??0))[0];
  const filtered=filter==="all"?shares:filter==="mine"?shares.filter(s=>s.perfumeId===myPerfume.id):shares.filter(s=>s.perfumeId===filter);

  if(loading) return <div className="flex items-center justify-center py-24"><span style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.2)",letterSpacing:".3em"}}>Yuklanmoqda...</span></div>;

  return (
    <div>
      {shares.length>0&&(
        <div className="mb-8 p-5" style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)"}}>
          <div className="text-center mb-4"><span style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.25)",fontSize:".72rem",letterSpacing:".4em",textTransform:"uppercase"}}>Jami {shares.length} ta ommaviy ulashma</span></div>
          <div className="flex items-end justify-center gap-2" style={{height:64}}>
            {PERFUMES.filter(p=>counts[p.id]).sort((a,b)=>(counts[b.id]??0)-(counts[a.id]??0)).slice(0,8).map(p=>{
              const max=Math.max(...Object.values(counts)), h=Math.max(8,((counts[p.id]??0)/max)*52);
              return (
                <div key={p.id} className="flex flex-col items-center gap-1" style={{cursor:"pointer"}} onClick={()=>setFilter(filter===p.id?"all":p.id)}>
                  <span style={{fontFamily:"'EB Garamond',serif",fontSize:".62rem",color:p.accent,opacity:.7}}>{counts[p.id]??0}</span>
                  <div style={{width:18,height:h,background:p.accent,opacity:filter===p.id?.95:.4,transition:"all .3s",position:"relative"}}>
                    {p.id===topId&&<div style={{position:"absolute",top:-16,left:"50%",transform:"translateX(-50%)",fontSize:".65rem"}}>👑</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill label="Hammasi" active={filter==="all"} onClick={()=>setFilter("all")} accent="#c084fc"/>
        <FilterPill label="Menim kabi" active={filter==="mine"} onClick={()=>setFilter("mine")} accent={myPerfume.accent}/>
        {[...new Set(shares.map(s=>s.perfumeId))].map(pid=>{
          const p=PERFUMES.find(x=>x.id===pid); if(!p) return null;
          return <FilterPill key={pid} label={p.name} active={filter===pid} onClick={()=>setFilter(filter===pid?"all":pid)} accent={p.accent}/>;
        })}
      </div>
      {filtered.length===0?(
        <div className="text-center py-16"><p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.18)",fontSize:"1rem"}}>{shares.length===0?"Hali hech kim ulashmadi. Birinchi bo'ling!":"Bu filtr bo'yicha natija yo'q."}</p></div>
      ):(
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(s=>{
            const p=PERFUMES.find(x=>x.id===s.perfumeId); if(!p) return null;
            const isR=reacted.has(s.id);
            return (
              <div key={s.id} className="relative overflow-hidden" style={{background:`${s.accent}08`,border:`1px solid ${s.accent}25`,padding:"1rem 1.2rem"}}>
                {s.perfumeId===topId&&<div className="absolute top-2 right-2" style={{fontSize:".6rem",padding:"2px 6px",background:`${s.accent}25`,color:s.accent,border:`1px solid ${s.accent}30`,fontFamily:"'EB Garamond',serif"}}>👑 TOP</div>}
                <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(to right,transparent,${s.accent}50,transparent)`}}/>
                <div className="flex items-start gap-3">
                  <div style={{flexShrink:0,filter:`drop-shadow(0 0 12px ${s.accent}60)`}}><p.Bottle accent={s.accent} size={52}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{fontFamily:"'Cormorant',serif",fontSize:"1.1rem",color:"#fff"}}>{s.displayName}</span>
                      {s.anonymous&&<span style={{fontFamily:"'EB Garamond',serif",fontSize:".62rem",color:"rgba(255,255,255,.2)",fontStyle:"italic"}}>anonim</span>}
                    </div>
                    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".85rem",color:s.accent,marginBottom:".3rem"}}>{s.perfumeName}</div>
                    <div className="flex flex-wrap gap-1 mb-2">{s.traits.map(t=><span key={t} style={{fontFamily:"'EB Garamond',serif",fontSize:".62rem",padding:"1px 7px",background:`${s.accent}12`,color:`${s.accent}99`,border:`1px solid ${s.accent}20`}}>{t}</span>)}</div>
                    <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.28)",fontSize:".78rem",lineHeight:1.6,marginBottom:".6rem"}}>"{s.personality}"</p>
                    <div className="flex items-center justify-between">
                      <span style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.15)",fontSize:".68rem"}}>{timeAgo(s.ts)}</span>
                      <button onClick={()=>handleReact(s.id)} style={{background:isR?`${s.accent}20`:"transparent",border:`1px solid ${isR?s.accent+"50":"rgba(255,255,255,.1)"}`,color:isR?s.accent:"rgba(255,255,255,.25)",fontSize:".78rem",padding:"3px 10px",cursor:isR?"default":"pointer",transition:"all .25s",fontFamily:"'EB Garamond',serif",display:"flex",alignItems:"center",gap:4}}>🌸 {s.reactions??0}</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PerfumesInfoTab: FC<{myPerfume:Perfume;shares:ShareEntry[]}> = ({myPerfume,shares}) => {
  const [hovId,setHovId]=useState<string|null>(null);
  const counts:Record<string,number>={};
  shares.forEach(s=>{counts[s.perfumeId]=(counts[s.perfumeId]??0)+1;});
  const total=shares.length;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {PERFUMES.map(p=>{
        const isMine=myPerfume.id===p.id, isH=hovId===p.id, cnt=counts[p.id]??0, pct=total>0?Math.round((cnt/total)*100):0;
        return (
          <div key={p.id} onMouseEnter={()=>setHovId(p.id)} onMouseLeave={()=>setHovId(null)}
            className="relative overflow-hidden transition-all duration-300"
            style={{background:isH||isMine?`${p.accent}0c`:"rgba(255,255,255,.015)",border:`1px solid ${isMine?p.accent+"60":isH?p.accent+"35":"rgba(255,255,255,.055)"}`,transform:isH?"translateY(-4px)":"none",boxShadow:isMine?`0 10px 40px ${p.accent}18,inset 0 1px 0 ${p.accent}25`:"none"}}>
            {isMine&&<div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(to right,transparent,${p.accent},transparent)`}}/>}
            <div className="p-4 flex gap-4 items-start">
              <div style={{flexShrink:0,filter:`drop-shadow(0 0 ${isH?"22px":"12px"} ${p.accent}${isH?"88":"50"})`,transition:"filter .3s"}}><p.Bottle accent={p.accent} size={72}/></div>
              <div className="flex-1">
                {isMine&&<div style={{fontFamily:"'EB Garamond',serif",fontSize:".6rem",letterSpacing:".3em",color:p.accent,marginBottom:".3rem",textTransform:"uppercase"}}>✦ Sizning tanlovingiz</div>}
                <div style={{fontFamily:"'Cormorant',serif",fontSize:"1.1rem",color:"#fff",marginBottom:".15rem"}}>{p.name}</div>
                <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:".76rem",color:p.accent+"bb",marginBottom:".5rem"}}>{p.tagline}</div>
                <div className="flex flex-wrap gap-1 mb-3">{p.notes.map(n=><span key={n} style={{fontFamily:"'EB Garamond',serif",fontSize:".62rem",padding:"1px 6px",background:`${p.accent}12`,color:`${p.accent}aa`,border:`1px solid ${p.accent}20`}}>{n}</span>)}</div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span style={{fontFamily:"'EB Garamond',serif",fontSize:".65rem",color:"rgba(255,255,255,.22)"}}>Tanladi</span>
                    <span style={{fontFamily:"'EB Garamond',serif",fontSize:".65rem",color:p.accent+"80"}}>{cnt} kishi{total>0?` · ${pct}%`:""}</span>
                  </div>
                  <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:p.accent,borderRadius:2,transition:"width 1s ease",opacity:.7}}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── ResultPage
// ─────────────────────────────────────────────────────────────────────────────
const ResultPage: FC<{
  name:string; perfume:Perfume; method:string;
  session:UserSession; onChangeSelection:()=>void;
}> = ({name,perfume,method,session,onChangeSelection}) => {
  const [show,setShow]           = useState(false);
  const [confetti,setConfetti]   = useState<{id:number;x:number;color:string;delay:number;size:number;circle:boolean}[]>([]);
  const [showModal,setShowModal] = useState(false);
  const [currentSession,setCurrentSession] = useState(session);
  const [activeTab,setActiveTab] = useState<Tab>("result");
  const [publicShares,setPublicShares] = useState<ShareEntry[]>([]);
  const isFirstVisit = !session.isPublic && session.ts > Date.now() - 10000; // within 10s = fresh

  useEffect(()=>{
    setTimeout(()=>setShow(true),80);
    if(isFirstVisit){
      // confetti
      setConfetti(Array.from({length:55},(_,i)=>({id:i,x:5+Math.random()*90,color:[perfume.accent,"#fff8","#fbbf24cc","#f9a8d4cc"][i%4],delay:i*50,size:4+Math.random()*7,circle:Math.random()>.45})));
      setTimeout(()=>setConfetti([]),3200);
      // Show modal fast — 600ms after mount, data is already in Firebase
      setTimeout(()=>setShowModal(true),600);
    }
    const unsub=subscribeToPublicShares(setPublicShares); return unsub;
  },[]);

  const handleModalDone=(isPublic:boolean,anonymous:boolean)=>{
    const ns:UserSession={...currentSession,isPublic,anonymous};
    writeSession(ns); setCurrentSession(ns); setShowModal(false);
  };

  const tabs:{id:Tab;label:string}[]=[{id:"result",label:"Natijam"},{id:"perfumes",label:"Atirlar"},{id:"others",label:"Boshqalar"}];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background:perfume.bg}}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{background:`radial-gradient(ellipse at 50% 25%,${perfume.accent}18,transparent 60%)`}}/>
        <div className="absolute bottom-0 left-0 right-0 h-56" style={{background:`linear-gradient(to top,${perfume.accent}12,transparent)`}}/>
      </div>
      <Stars/><Particles accent={perfume.accent}/>
      {confetti.map(c=><div key={c.id} className="fixed pointer-events-none" style={{left:`${c.x}%`,top:"8%",width:c.size,height:c.size,background:c.color,borderRadius:c.circle?"50%":"2px",zIndex:50,animation:`fall 2.8s ${c.delay}ms ease-out forwards`}}/>)}

      {showModal&&(
        <ShareModal name={name} perfume={perfume} method={method} existingDocId={currentSession.docId} onDone={handleModalDone}/>
      )}

      <div className={`relative z-10 max-w-2xl mx-auto px-5 pt-10 pb-8 transition-all duration-1000 ${show?"opacity-100 translate-y-0":"opacity-0 translate-y-10"}`}>
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1 p-1" style={{background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.07)"}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)}
                style={{fontFamily:"'EB Garamond',serif",fontSize:".78rem",letterSpacing:".12em",textTransform:"uppercase",padding:"8px 18px",cursor:"pointer",transition:"all .3s",background:activeTab===t.id?`${perfume.accent}18`:"transparent",border:`1px solid ${activeTab===t.id?perfume.accent+"50":"transparent"}`,color:activeTab===t.id?perfume.accent:"rgba(255,255,255,.32)",boxShadow:activeTab===t.id?`0 0 15px ${perfume.accent}15`:"none"}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab==="result"&&(
          <div className="text-center">
            <div className="flex justify-center mb-6" style={{animation:"float 3.5s ease-in-out infinite",filter:`drop-shadow(0 0 45px ${perfume.accent}90)`}}>
              <perfume.Bottle accent={perfume.accent} size={150}/>
            </div>
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="h-px w-10" style={{background:perfume.accent,opacity:.35}}/>
              <span style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:perfume.accent+"99",fontSize:".75rem",letterSpacing:".45em",textTransform:"uppercase"}}>Sizning Atringiz</span>
              <div className="h-px w-10" style={{background:perfume.accent,opacity:.35}}/>
            </div>
            <div style={{fontFamily:"'Cormorant',serif",fontStyle:"italic",fontSize:"clamp(2.4rem,7vw,3.8rem)",fontWeight:300,color:"#fff",lineHeight:1.08,marginBottom:".3rem"}}>{name},</div>
            <div style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(1.3rem,3.5vw,2rem)",color:perfume.accent,marginBottom:".3rem"}}>{perfume.name}</div>
            <div style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.25)",fontSize:".68rem",letterSpacing:".35em",textTransform:"uppercase",marginBottom:"1.8rem"}}>{perfume.tagline}</div>
            <div className="h-px w-20 mx-auto mb-7" style={{background:`linear-gradient(to right,transparent,${perfume.accent},transparent)`,opacity:.28}}/>
            <div className="flex flex-wrap justify-center gap-2 mb-7">
              {perfume.traits.map(t=><span key={t} style={{fontFamily:"'EB Garamond',serif",fontSize:".72rem",letterSpacing:".18em",textTransform:"uppercase",padding:"5px 13px",border:`1px solid ${perfume.accent}40`,color:`${perfume.accent}cc`,background:`${perfume.accent}0a`}}>{t}</span>)}
            </div>
            <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"1.05rem",color:"rgba(255,255,255,.45)",lineHeight:1.85,marginBottom:"1.8rem"}}>"{perfume.personality}"</p>
            <div style={{padding:"1.5rem",textAlign:"left",marginBottom:"2rem",border:`1px solid ${perfume.accent}22`,background:`${perfume.accent}07`,borderTop:`2px solid ${perfume.accent}55`}}>
              <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:".88rem",letterSpacing:".32em",textTransform:"uppercase",color:perfume.accent,marginBottom:".8rem"}}>🌸 8-Mart Muborak!</div>
              <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.5)",fontSize:".95rem",lineHeight:1.9}}>{perfume.wish}</p>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-3 justify-center mb-5">
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:".76rem",padding:"6px 16px",background:currentSession.isPublic?`${perfume.accent}12`:"rgba(255,255,255,.04)",border:`1px solid ${currentSession.isPublic?perfume.accent+"40":"rgba(255,255,255,.08)"}`,color:currentSession.isPublic?perfume.accent:"rgba(255,255,255,.28)"}}>
                {currentSession.isPublic?"🌸 Ommaga ko'rsatilmoqda":"🔒 Yashirin saqlangan"}
              </div>
              <button onClick={()=>setShowModal(true)} style={{fontFamily:"'EB Garamond',serif",fontSize:".76rem",padding:"6px 16px",cursor:"pointer",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"rgba(255,255,255,.32)",transition:"all .25s"}}>
                ⚙ Sozlamalar
              </button>
            </div>

            {/* Change selection */}
            <button onClick={onChangeSelection}
              style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:".82rem",padding:"8px 24px",cursor:"pointer",background:"transparent",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.25)",transition:"all .3s",marginBottom:"1.5rem"}}
              onMouseEnter={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.color="rgba(255,255,255,.5)";b.style.borderColor="rgba(255,255,255,.22)";}}
              onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.color="rgba(255,255,255,.25)";b.style.borderColor="rgba(255,255,255,.1)";}}>
              ↩ Boshqa atir tanlash
            </button>
            <div style={{color:perfume.accent,opacity:.18,fontSize:"1.3rem",letterSpacing:"1rem"}}>✦ ✦ ✦</div>
          </div>
        )}
        {activeTab==="perfumes"&&<PerfumesInfoTab myPerfume={perfume} shares={publicShares}/>}
        {activeTab==="others"&&<OthersTab myPerfume={perfume}/>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── AdminPage
// ─────────────────────────────────────────────────────────────────────────────
const AdminPage: FC<{onExit:()=>void}> = ({onExit}) => {
  const [authed,setAuthed]   = useState(false);
  const [pw,setPw]           = useState("");
  const [pwErr,setPwErr]     = useState(false);
  const [entries,setEntries] = useState<ShareEntry[]>([]);
  const [loading,setLoading] = useState(false);
  const [filter,setFilter]   = useState("all");
  const [mFilter,setMFilter] = useState("all");
  const [search,setSearch]   = useState("");

  const login=()=>{ if(pw===ADMIN_PASSWORD){setAuthed(true);load();} else{setPwErr(true);setTimeout(()=>setPwErr(false),1500);} };
  const load=async()=>{ setLoading(true); setEntries(await getAllEntries()); setLoading(false); };

  const filtered=entries
    .filter(e=>filter==="all"||e.perfumeId===filter)
    .filter(e=>mFilter==="all"||e.method===mFilter)
    .filter(e=>search===""||e.name.toLowerCase().includes(search.toLowerCase())||e.perfumeName.toLowerCase().includes(search.toLowerCase()));

  const counts:Record<string,number>={};
  entries.forEach(e=>{counts[e.perfumeId]=(counts[e.perfumeId]??0)+1;});
  const mCounts:Record<string,number>={};
  entries.forEach(e=>{mCounts[e.method]=(mCounts[e.method]??0)+1;});
  const mLabel:Record<string,string>={manual:"💎 Manual",wheel:"🎡 G'ildirak",quiz:"🔮 Test"};

  if(!authed) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#060008"}}>
      <Stars/>
      <div className="relative z-10 max-w-sm w-full mx-5 text-center">
        <div style={{fontSize:"2rem",marginBottom:"1.5rem",opacity:.4}}>🔐</div>
        <h2 style={{fontFamily:"'Cormorant',serif",fontSize:"2rem",color:"rgba(255,255,255,.7)",marginBottom:".5rem"}}>Admin Panel</h2>
        <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.25)",fontSize:".82rem",letterSpacing:".2em",marginBottom:"2rem"}}>Parol kiriting</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••••••"
          style={{width:"100%",fontFamily:"'EB Garamond',serif",fontSize:"1.1rem",padding:"12px 16px",background:"rgba(255,255,255,.04)",border:`1px solid ${pwErr?"rgba(255,100,100,.5)":"rgba(255,255,255,.1)"}`,color:"#fff",outline:"none",marginBottom:"1rem",textAlign:"center",letterSpacing:".3em",transition:"border-color .3s"}}/>
        {pwErr&&<p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,100,100,.7)",fontSize:".82rem",marginBottom:".8rem"}}>Parol noto'g'ri</p>}
        <button onClick={login} style={{width:"100%",fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"1rem",padding:"12px",cursor:"pointer",background:"rgba(192,132,252,.12)",border:"1px solid rgba(192,132,252,.4)",color:"#c084fc",transition:"all .3s"}}>Kirish →</button>
        <button onClick={onExit} style={{marginTop:"1rem",fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.2)",fontSize:".78rem",background:"none",border:"none",cursor:"pointer",letterSpacing:".2em"}}>← Orqaga</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative" style={{background:"#040007"}}>
      <Stars/>
      <div className="relative z-10 max-w-6xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(1.6rem,4vw,2.4rem)",color:"#fff",fontWeight:300}}>Admin Panel <span style={{color:"rgba(255,107,138,.6)"}}>✦</span></h1>
            <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.22)",fontSize:".76rem",letterSpacing:".25em",marginTop:".2rem"}}>8-MART PARFYUM SAYLOVLARI</p>
          </div>
          <div className="flex gap-3">
            <button onClick={load} style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",padding:"8px 18px",cursor:"pointer",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.4)",transition:"all .25s"}}>↻ Yangilash</button>
            <button onClick={onExit} style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",padding:"8px 18px",cursor:"pointer",background:"transparent",border:"1px solid rgba(255,255,255,.08)",color:"rgba(255,255,255,.25)",transition:"all .25s"}}>← Chiqish</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[{label:"Jami",value:entries.length,c:"#c084fc"},{label:"Ommaviy",value:entries.filter(e=>e.isPublic).length,c:"#4ade80"},{label:"Yashirin",value:entries.filter(e=>!e.isPublic).length,c:"#f87171"},{label:"Anonim",value:entries.filter(e=>e.anonymous).length,c:"#fbbf24"}].map(s=>(
            <div key={s.label} style={{padding:"1rem",background:`${s.c}0a`,border:`1px solid ${s.c}25`,textAlign:"center"}}>
              <div style={{fontFamily:"'Cormorant',serif",fontSize:"2.2rem",color:s.c,lineHeight:1}}>{s.value}</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:".68rem",color:"rgba(255,255,255,.28)",letterSpacing:".3em",textTransform:"uppercase",marginTop:".4rem"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Method breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(mCounts).map(([m,cnt])=>(
            <div key={m} onClick={()=>setMFilter(mFilter===m?"all":m)}
              style={{padding:".8rem",background:"rgba(255,255,255,.02)",border:`1px solid ${mFilter===m?"rgba(255,255,255,.18)":"rgba(255,255,255,.06)"}`,textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
              <div style={{fontFamily:"'Cormorant',serif",fontSize:"1.6rem",color:"#fff",opacity:.8}}>{cnt}</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:".72rem",color:"rgba(255,255,255,.3)",letterSpacing:".2em"}}>{mLabel[m]??m}</div>
            </div>
          ))}
        </div>

        {/* Perfume ranking */}
        {entries.length>0&&(
          <div className="mb-6 p-4" style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)"}}>
            <div style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.18)",fontSize:".68rem",letterSpacing:".35em",textTransform:"uppercase",marginBottom:"1rem"}}>Atir reytingi</div>
            <div className="flex flex-wrap gap-3">
              {PERFUMES.filter(p=>counts[p.id]).sort((a,b)=>(counts[b.id]??0)-(counts[a.id]??0)).map((p,rank)=>(
                <div key={p.id} className="flex items-center gap-2">
                  <span style={{fontFamily:"'EB Garamond',serif",fontSize:".65rem",color:"rgba(255,255,255,.2)",minWidth:"1rem"}}>{rank+1}.</span>
                  <div style={{width:8,height:8,borderRadius:"50%",background:p.accent,opacity:.8}}/>
                  <span style={{fontFamily:"'EB Garamond',serif",fontSize:".82rem",color:"rgba(255,255,255,.55)"}}>{p.name}</span>
                  <span style={{fontFamily:"'Cormorant',serif",fontSize:"1rem",color:p.accent}}>{counts[p.id]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-wrap gap-3 mb-5 items-center">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ism yoki atir..."
            style={{fontFamily:"'EB Garamond',serif",fontSize:".88rem",padding:"7px 14px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#fff",outline:"none",flex:1,minWidth:170}}/>
          <div className="flex flex-wrap gap-2">
            <FilterPill label="Hammasi" active={filter==="all"} onClick={()=>setFilter("all")} accent="#c084fc"/>
            {PERFUMES.filter(p=>counts[p.id]).map(p=>(
              <FilterPill key={p.id} label={p.name} active={filter===p.id} onClick={()=>setFilter(filter===p.id?"all":p.id)} accent={p.accent}/>
            ))}
          </div>
        </div>

        {/* Entries */}
        {loading?(
          <div className="text-center py-16"><span style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.2)",letterSpacing:".3em"}}>Yuklanmoqda...</span></div>
        ):(
          <div className="flex flex-col gap-2">
            {filtered.length===0&&<div className="text-center py-12"><p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.18)"}}>Natija yo'q</p></div>}
            {filtered.map((e,i)=>{
              const p=PERFUMES.find(x=>x.id===e.perfumeId); if(!p) return null;
              return (
                <div key={e.id} className="relative flex items-center gap-3 flex-wrap"
                  style={{padding:".85rem 1.1rem",background:`${e.accent}06`,border:`1px solid ${e.accent}20`}}>
                  <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{background:e.accent,opacity:.5}}/>
                  <span style={{fontFamily:"'EB Garamond',serif",fontSize:".62rem",color:"rgba(255,255,255,.2)",minWidth:"1.4rem"}}>{filtered.length-i}</span>
                  <div style={{flexShrink:0,filter:`drop-shadow(0 0 8px ${e.accent}50)`}}><p.Bottle accent={e.accent} size={36}/></div>
                  <div style={{minWidth:90}}>
                    <div style={{fontFamily:"'Cormorant',serif",fontSize:"1.05rem",color:"#fff"}}>{e.name}</div>
                    {e.anonymous&&<div style={{fontFamily:"'EB Garamond',serif",fontSize:".58rem",color:"rgba(255,255,255,.2)",fontStyle:"italic"}}>anonim taqdim</div>}
                  </div>
                  <div style={{flex:1,minWidth:110}}>
                    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".86rem",color:e.accent}}>{e.perfumeName}</div>
                    <div style={{fontFamily:"'EB Garamond',serif",fontSize:".7rem",color:"rgba(255,255,255,.22)"}}>{e.tagline}</div>
                  </div>
                  <div style={{fontFamily:"'EB Garamond',serif",fontSize:".7rem",color:"rgba(255,255,255,.28)",letterSpacing:".1em",minWidth:75}}>{mLabel[e.method]??e.method}</div>
                  <div style={{fontFamily:"'EB Garamond',serif",fontSize:".65rem",padding:"3px 10px",background:e.isPublic?`${e.accent}18`:"rgba(255,255,255,.04)",border:`1px solid ${e.isPublic?e.accent+"40":"rgba(255,255,255,.08)"}`,color:e.isPublic?e.accent:"rgba(255,255,255,.25)",whiteSpace:"nowrap"}}>
                    {e.isPublic?"🌸 Ommaviy":"🔒 Yashirin"}
                  </div>
                  <div style={{fontFamily:"'EB Garamond',serif",fontSize:".76rem",color:"rgba(255,255,255,.28)"}}>🌸 {e.reactions}</div>
                  <div style={{fontFamily:"'EB Garamond',serif",fontSize:".66rem",color:"rgba(255,255,255,.16)",whiteSpace:"nowrap"}}>{timeAgo(e.ts)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── App Root
// ─────────────────────────────────────────────────────────────────────────────
export default function App(): ReactElement {
  const [screen,setScreen]     = useState<Screen>("loading");
  const [userName,setUserName] = useState("");
  const [method,setMethod]     = useState("manual");
  const [chosen,setChosen]     = useState<Perfume|null>(null);
  const [session,setSession]   = useState<UserSession|null>(null);
  const [takenNames,setTakenNames] = useState<TakenName[]>([]);
  const [namesReady,setNamesReady] = useState(false);

  useEffect(()=>{
    // Admin shortcut
    if(window.location.search.includes("admin")){ setScreen("admin"); return; }

    // Subscribe to all names from Firebase — this is the "loading" phase
    const unsub = subscribeToAllNames(names=>{
      setTakenNames(names);
      if(!namesReady){
        setNamesReady(true);
        // Now decide what screen to show
        const saved = readSession();
        if(saved){
          const perfume = PERFUMES.find(p=>p.id===saved.perfumeId);
          if(perfume){
            setUserName(saved.name); setMethod(saved.method);
            setChosen(perfume); setSession(saved);
            setScreen("result"); return;
          }
        }
        setScreen("name");
      }
    });
    return unsub;
  },[]);

  /**
   * Called when a perfume is confirmed (manual click, wheel accept, quiz accept).
   * Immediately writes to Firebase with isPublic:false and stores session.
   * The ShareModal then just flips isPublic via updateEntry.
   */
  const handlePerfumeConfirmed = async (perfume:Perfume, chosenMethod:string) => {
    setChosen(perfume);
    try {
      const docId = await createEntry({
        name:        userName,
        displayName: userName,   // updated to "Noma'lum" if they choose anonymous in modal
        anonymous:   false,
        perfumeId:   perfume.id,
        perfumeName: perfume.name,
        accent:      perfume.accent,
        tagline:     perfume.tagline,
        traits:      perfume.traits,
        personality: perfume.personality,
        ts:          Date.now(),
        reactions:   0,
        isPublic:    false,       // private until user decides in modal
        method:      chosenMethod,
      });
      const newSession:UserSession = {
        name:userName, perfumeId:perfume.id, method:chosenMethod,
        isPublic:false, anonymous:false, docId, ts:Date.now(),
      };
      writeSession(newSession);
      setSession(newSession);
    } catch(e){ console.error("Auto-save failed:",e); }
    setScreen("result");
  };

  /**
   * Delete old Firebase doc, clear session, go back to mode picker.
   */
  const handleChangeSelection = async () => {
    if(session?.docId){
      try { await deleteEntry(session.docId); } catch(e){ console.error("Delete failed:",e); }
    }
    clearSession();
    setSession(null);
    setChosen(null);
    setScreen("mode");
  };

  if(screen==="admin") return <AdminPage onExit={()=>{ window.history.replaceState({},"",window.location.pathname); setScreen(session?"result":"loading"); }}/>;
  if(screen==="loading") return <LoadingScreen/>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        body{background:#07000c}
        @keyframes rise      {0%{transform:translateY(0);opacity:0}15%{opacity:.6}100%{transform:translateY(-95vh);opacity:0}}
        @keyframes float     {0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-14px) rotate(3deg)}}
        @keyframes fall      {0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(90vh) rotate(720deg);opacity:0}}
        @keyframes twinkle   {0%,100%{opacity:.05}50%{opacity:.6}}
        @keyframes fadeUp    {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loadPulse {0%,100%{transform:scaleY(.6);opacity:.5}50%{transform:scaleY(1);opacity:1}}
        @keyframes loadDot   {0%,100%{opacity:.2}50%{opacity:1}}
      `}</style>

      {screen==="name"    && <NamePage    onNext={n=>{setUserName(n);setScreen("mode");}} takenNames={takenNames}/>}
      {screen==="mode"    && <ModePage    name={userName} onMode={m=>{setMethod(m);setScreen(m==="manual"?"perfume":m==="wheel"?"wheel":"quiz");}}/>}
      {screen==="perfume" && <PerfumePage name={userName} onNext={p=>handlePerfumeConfirmed(p,method)} onBack={()=>setScreen("mode")}/>}
      {screen==="wheel"   && <SpinWheelPage name={userName} onConfirm={p=>handlePerfumeConfirmed(p,"wheel")} onBack={()=>setScreen("mode")}/>}
      {screen==="quiz"    && <QuizPage    name={userName} onConfirm={p=>handlePerfumeConfirmed(p,"quiz")} onBack={()=>setScreen("mode")}/>}
      {screen==="result"  && chosen && session && (
        <ResultPage name={userName} perfume={chosen} method={method} session={session} onChangeSelection={handleChangeSelection}/>
      )}
    </>
  );
}
