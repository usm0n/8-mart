import React, { useState, useEffect } from "react";

const NAMES = [
  "Malika","Zulfiya","Nilufar","Shahlo",
  "Madina","Feruza","Gulnora","Dildora",
  "Nargiza","Barno","Munira","Sarvinoz",
  "Mohira","Kamola","Nasiba","Umida",
];

interface Perfume {
  id: string; name: string; tagline: string; desc: string;
  notes: string[]; accent: string; bg: string;
  traits: string[]; personality: string; wish: string;
  Bottle: (p: { accent: string; size?: number }) => React.ReactElement;
}

const BottleClassic = ({ accent, size = 120 }: { accent: string; size?: number }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 120 168" fill="none">
    <defs>
      <linearGradient id="bC" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity=".9"/><stop offset="100%" stopColor={accent} stopOpacity=".4"/>
      </linearGradient>
      <linearGradient id="sC" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="white" stopOpacity=".35"/><stop offset="100%" stopColor="white" stopOpacity="0"/>
      </linearGradient>
      <filter id="gC"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect x="42" y="8" width="36" height="14" rx="4" fill={accent} opacity=".8"/>
    <rect x="48" y="4" width="24" height="8" rx="3" fill={accent} opacity=".6"/>
    <rect x="50" y="22" width="20" height="20" rx="2" fill={accent} opacity=".7"/>
    <rect x="22" y="42" width="76" height="108" rx="12" fill="url(#bC)" filter="url(#gC)"/>
    <rect x="28" y="50" width="18" height="90" rx="8" fill="url(#sC)"/>
    <rect x="32" y="74" width="56" height="50" rx="6" fill="white" opacity=".08"/>
    <line x1="40" y1="88" x2="80" y2="88" stroke="white" strokeWidth="1" opacity=".4"/>
    <line x1="44" y1="100" x2="76" y2="100" stroke="white" strokeWidth=".7" opacity=".25"/>
    <ellipse cx="60" cy="148" rx="34" ry="4" fill={accent} opacity=".18"/>
  </svg>
);

const BottleRound = ({ accent, size = 120 }: { accent: string; size?: number }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 120 156" fill="none">
    <defs>
      <radialGradient id="bR" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor={accent} stopOpacity=".95"/><stop offset="100%" stopColor={accent} stopOpacity=".45"/>
      </radialGradient>
      <linearGradient id="sR" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="white" stopOpacity=".45"/><stop offset="100%" stopColor="white" stopOpacity="0"/>
      </linearGradient>
      <filter id="gR"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect x="44" y="6" width="32" height="12" rx="6" fill={accent} opacity=".85"/>
    <rect x="50" y="18" width="20" height="18" rx="3" fill={accent} opacity=".75"/>
    <ellipse cx="60" cy="96" rx="44" ry="56" fill="url(#bR)" filter="url(#gR)"/>
    <ellipse cx="42" cy="72" rx="10" ry="22" fill="url(#sR)"/>
    <line x1="36" y1="90" x2="84" y2="90" stroke="white" strokeWidth="1" opacity=".28"/>
    <line x1="40" y1="102" x2="80" y2="102" stroke="white" strokeWidth=".7" opacity=".18"/>
    <ellipse cx="60" cy="150" rx="38" ry="4" fill={accent} opacity=".18"/>
  </svg>
);

const BottleTall = ({ accent, size = 120 }: { accent: string; size?: number }) => (
  <svg width={size * 0.75} height={size * 1.5} viewBox="0 0 90 180" fill="none">
    <defs>
      <linearGradient id="bT" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity=".88"/><stop offset="100%" stopColor={accent} stopOpacity=".38"/>
      </linearGradient>
      <linearGradient id="sT" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="white" stopOpacity=".4"/><stop offset="100%" stopColor="white" stopOpacity="0"/>
      </linearGradient>
      <filter id="gT"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect x="38" y="2" width="14" height="6" rx="3" fill={accent} opacity=".7"/>
    <rect x="32" y="8" width="26" height="10" rx="3" fill={accent} opacity=".8"/>
    <rect x="36" y="18" width="18" height="24" rx="2" fill={accent} opacity=".72"/>
    <rect x="14" y="42" width="62" height="124" rx="10" fill="url(#bT)" filter="url(#gT)"/>
    <rect x="20" y="52" width="14" height="104" rx="7" fill="url(#sT)"/>
    <line x1="30" y1="94" x2="60" y2="94" stroke="white" strokeWidth="1" opacity=".32"/>
    <line x1="33" y1="106" x2="57" y2="106" stroke="white" strokeWidth=".6" opacity=".2"/>
    <ellipse cx="45" cy="164" rx="28" ry="3.5" fill={accent} opacity=".18"/>
  </svg>
);

const BottleFaceted = ({ accent, size = 120 }: { accent: string; size?: number }) => (
  <svg width={size} height={size * 1.35} viewBox="0 0 120 162" fill="none">
    <defs>
      <linearGradient id="bF" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity=".92"/><stop offset="100%" stopColor={accent} stopOpacity=".42"/>
      </linearGradient>
      <linearGradient id="bF2" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity=".5"/><stop offset="100%" stopColor={accent} stopOpacity=".2"/>
      </linearGradient>
      <filter id="gF"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <polygon points="46,8 74,8 78,20 42,20" fill={accent} opacity=".85"/>
    <polygon points="50,2 70,2 74,8 46,8" fill={accent} opacity=".65"/>
    <rect x="50" y="20" width="20" height="18" fill={accent} opacity=".72"/>
    <polygon points="20,38 60,34 100,38 108,140 60,148 12,140" fill="url(#bF)" filter="url(#gF)"/>
    <polygon points="60,34 100,38 108,140 60,148" fill="url(#bF2)"/>
    <line x1="60" y1="34" x2="60" y2="148" stroke="white" strokeWidth=".8" opacity=".22"/>
    <polygon points="26,46 46,42 50,130 26,136" fill="white" opacity=".1"/>
    <line x1="40" y1="89" x2="80" y2="89" stroke="white" strokeWidth="1" opacity=".28"/>
    <ellipse cx="60" cy="153" rx="36" ry="4" fill={accent} opacity=".16"/>
  </svg>
);

const BottleOrb = ({ accent, size = 120 }: { accent: string; size?: number }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 120 144" fill="none">
    <defs>
      <radialGradient id="bO" cx="32%" cy="28%" r="72%">
        <stop offset="0%" stopColor={accent} stopOpacity=".95"/><stop offset="70%" stopColor={accent} stopOpacity=".55"/><stop offset="100%" stopColor={accent} stopOpacity=".3"/>
      </radialGradient>
      <filter id="gO"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <ellipse cx="60" cy="10" rx="8" ry="7" fill={accent} opacity=".9"/>
    <line x1="60" y1="17" x2="60" y2="30" stroke={accent} strokeWidth="4" opacity=".7"/>
    <circle cx="60" cy="82" r="54" fill="url(#bO)" filter="url(#gO)"/>
    <ellipse cx="40" cy="58" rx="12" ry="18" fill="white" opacity=".2"/>
    <ellipse cx="35" cy="52" rx="5" ry="8" fill="white" opacity=".15"/>
    <circle cx="60" cy="82" r="36" stroke="white" strokeWidth=".6" opacity=".1" fill="none"/>
    <ellipse cx="60" cy="134" rx="42" ry="5" fill={accent} opacity=".18"/>
  </svg>
);

const BottleSquare = ({ accent, size = 120 }: { accent: string; size?: number }) => (
  <svg width={size * 0.85} height={size * 1.4} viewBox="0 0 102 168" fill="none">
    <defs>
      <linearGradient id="bSq" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity=".9"/><stop offset="100%" stopColor={accent} stopOpacity=".35"/>
      </linearGradient>
      <linearGradient id="sSq" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={accent} stopOpacity=".5"/><stop offset="100%" stopColor={accent} stopOpacity=".2"/>
      </linearGradient>
      <filter id="gSq"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect x="30" y="4" width="42" height="16" rx="2" fill={accent} opacity=".88"/>
    <rect x="38" y="0" width="26" height="8" rx="2" fill={accent} opacity=".65"/>
    <rect x="38" y="20" width="26" height="18" fill={accent} opacity=".74"/>
    <rect x="8" y="38" width="86" height="116" rx="4" fill="url(#bSq)" filter="url(#gSq)"/>
    <polygon points="94,38 102,46 102,158 94,154" fill="url(#sSq)"/>
    <rect x="16" y="48" width="16" height="96" rx="6" fill="white" opacity=".13"/>
    <line x1="28" y1="88" x2="74" y2="88" stroke="white" strokeWidth="1" opacity=".3"/>
    <line x1="31" y1="100" x2="71" y2="100" stroke="white" strokeWidth=".6" opacity=".2"/>
    <ellipse cx="51" cy="154" rx="38" ry="4" fill={accent} opacity=".18"/>
  </svg>
);

// ── Data ─────────────────────────────────────────────────────────────────────
const PERFUMES: Perfume[] = [
  { id:"rose", Bottle:BottleClassic, name:"Qizil Atirgul", tagline:"Klassik va Sehrli", accent:"#ff6b8a", bg:"#0f0308",
    desc:"Chuqur sevgi va quvvatning ramzi.", notes:["Atirgul","Ud","Mushk","Anbar"],
    traits:["Quvvatli","Jozibador","Klassik"],
    personality:"Siz hayotni to'liq his qiladigan, qalbi kuchli va sevgisi cheksiz insonlardansiz.",
    wish:"Hayotingiz qizil atirguldek gullаsin, har bir kuningiz sevgi va quvonchga to'lsin!" },
  { id:"jasmine", Bottle:BottleRound, name:"Moviy Yasmin", tagline:"Yengil va Sirli", accent:"#c084fc", bg:"#0a0511",
    desc:"Bahor tongining nafasi. Orzular va yangilik hidi.", notes:["Yasmin","Bergamot","Shaftoli","Vanil"],
    traits:["Xayolparast","Nafis","Ijodkor"],
    personality:"Siz hayolchi va ijodkor ruhiyatga egasiz. Dunyoni o'zingizning noyob ko'zingiz bilan ko'rasiz.",
    wish:"Orzularingiz yulduzlardek chaqnab haqiqatga aylansin. Siz orzularning sohibasiz!" },
  { id:"vanilla", Bottle:BottleTall, name:"Oltin Vanil", tagline:"Issiq va Mehribon", accent:"#fbbf24", bg:"#0d0900",
    desc:"Iliq quchoq hidi. Mehribonlik va uy issiqligi.", notes:["Vanil","Karamel","Sandalovut","Krem"],
    traits:["Mehribon","Samimiy","Issiq yurak"],
    personality:"Siz atrofingizga iliqlik taratadigan, hamma sevib qoladigan insonlardansiz.",
    wish:"Yuragingiz oltin vanil kabi dunyo ahlini quchib turgani uchun minnatdorman!" },
  { id:"ocean", Bottle:BottleFaceted, name:"Dengiz Shabadasi", tagline:"Erkin va Dadil", accent:"#22d3ee", bg:"#00070f",
    desc:"Ochiq dengiz va tuz hidi. Sarguzasht va erkinlik.", notes:["Dengiz","Limon","Tuz","Yong'oq"],
    traits:["Erkin","Dadil","Sarguzashtchi"],
    personality:"Siz chegaralarni sindiruvchi, yangi ufqlarni kashf etuvchi noyob insonlardansiz.",
    wish:"Hayotingiz dengiz kabi keng bo'lsin. Har bir to'lqin sizi yangi sohillarga olib borsin!" },
  { id:"cherry", Bottle:BottleOrb, name:"Gilos Gullari", tagline:"Quvnoq va Baxtli", accent:"#f472b6", bg:"#0d0009",
    desc:"Guldagi gilos bahri. Hayot sevinci va quvnoqlik.", notes:["Gilos","Shaftoli","Gulsurp","Apelsin"],
    traits:["Quvnoq","Energiyali","Optimist"],
    personality:"Siz xonaga kirganda quyosh chiqadiganlardansiz. Kulimsingiz va dunyo kuladi.",
    wish:"Quvnoqligingiz hech qachon so'nmasin! Siz hayotga mehr uyg'otadigan insonlardansiz!" },
  { id:"oud", Bottle:BottleSquare, name:"Sharq Udi", tagline:"Ulug'vor va Chuqur", accent:"#fb923c", bg:"#0e0400",
    desc:"Sharq sir-asrori. Kuch va ulug'vorlik ramzi.", notes:["Ud","Zafaron","Atirgul","Anbar"],
    traits:["Ulug'vor","Kuchli","Hukmdor"],
    personality:"Siz xonaga kirganda hamma diqqatini jalb qiladigan betakror insonlardansiz.",
    wish:"Ulug'vorligingiz doim shunday bo'lsin! Sharq hikmati va kuchiniz bilan eng buyuk zafarlarni qo'lga kiriting!" },
];

// ── Shared ───────────────────────────────────────────────────────────────────
const Particles = ({ accent }: { accent: string }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({length:14},(_,i)=>(
      <div key={i} className="absolute rounded-full"
        style={{left:`${(i*23.7)%100}%`,bottom:0,width:1+(i%3),height:1+(i%3),
          background:accent,opacity:.28,animation:`rise ${4+(i%5)}s ${(i*.45)%6}s ease-in-out infinite`}}/>
    ))}
  </div>
);

// ── NamePage ─────────────────────────────────────────────────────────────────
export function NamePage({ onNext }: { onNext: (n: string) => void }) {
  const [hov, setHov] = useState<string|null>(null);
  const [sel, setSel] = useState<string|null>(null);

  const pick = (name: string) => {
    setSel(name);
    setTimeout(()=>onNext(name), 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{background:"linear-gradient(145deg,#0c0010,#060008 40%,#0e0005)"}}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full" style={{width:500,height:500,top:"-10%",left:"-10%",background:"radial-gradient(circle,rgba(192,132,252,.08),transparent 70%)",filter:"blur(20px)"}}/>
        <div className="absolute rounded-full" style={{width:400,height:400,bottom:"-5%",right:"-5%",background:"radial-gradient(circle,rgba(255,107,138,.07),transparent 70%)",filter:"blur(20px)"}}/>
      </div>

      <div className={`relative z-10 w-full max-w-2xl px-5 transition-all duration-600 ${sel?"opacity-0 scale-95":""}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="h-px w-14" style={{background:"linear-gradient(to right,transparent,rgba(255,107,138,.4))"}}/>
            <span style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,107,138,.65)",fontSize:".8rem",letterSpacing:".35em"}}>8 · Mart · 2025</span>
            <div className="h-px w-14" style={{background:"linear-gradient(to left,transparent,rgba(255,107,138,.4))"}}/>
          </div>
          <h1 style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(3rem,9vw,5.5rem)",fontWeight:300,color:"#fff",lineHeight:1.08}}>
            Salom,{" "}
            <em style={{fontStyle:"italic",background:"linear-gradient(120deg,#ff6b8a,#c084fc 55%,#fb923c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              kim siz?
            </em>
          </h1>
          <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.25)",fontSize:".82rem",letterSpacing:".42em",textTransform:"uppercase",marginTop:"1rem"}}>
            Ismingizni tanlang
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {NAMES.map(name => {
            const isH=hov===name, isS=sel===name;
            return (
              <button key={name} onClick={()=>pick(name)}
                onMouseEnter={()=>setHov(name)} onMouseLeave={()=>setHov(null)}
                style={{
                  fontFamily:"'EB Garamond',serif",fontSize:"1rem",letterSpacing:".03em",
                  padding:"14px 8px",cursor:"pointer",transition:"all .25s",
                  background:isS?"linear-gradient(135deg,rgba(255,107,138,.22),rgba(192,132,252,.14))":isH?"rgba(255,255,255,.055)":"rgba(255,255,255,.018)",
                  border:`1px solid ${isS?"rgba(255,107,138,.55)":isH?"rgba(255,255,255,.13)":"rgba(255,255,255,.045)"}`,
                  color:isS?"#ff9db5":isH?"rgba(255,255,255,.9)":"rgba(255,255,255,.45)",
                  transform:isS?"scale(1.06)":isH?"translateY(-2px)":"none",
                  boxShadow:isS?"0 0 22px rgba(255,107,138,.18)":"none",
                }}>
                {name}
              </button>
            );
          })}
        </div>

        <div className="text-center mt-10 text-2xl" style={{opacity:.14,letterSpacing:"1rem"}}>🌸 🌹 🪷</div>
      </div>
    </div>
  );
}

// ── PerfumePage ───────────────────────────────────────────────────────────────
export function PerfumePage({ name, onNext }: { name: string; onNext: (p: Perfume) => void }) {
  const [sel, setSel] = useState<Perfume|null>(null);
  const [leaving, setLeaving] = useState(false);

  const confirm = () => { if(!sel) return; setLeaving(true); setTimeout(()=>onNext(sel),600); };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background:"linear-gradient(160deg,#07000f,#03000a 55%,#080004)"}}>
      <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
      {sel&&<div className="absolute inset-0 pointer-events-none transition-all duration-1000" style={{background:`radial-gradient(ellipse at 50% 0%,${sel.accent}10,transparent 55%)`}}/>}

      <div className={`relative z-10 max-w-5xl mx-auto px-5 py-12 transition-all duration-500 ${leaving?"opacity-0 translate-y-5":""}`}>
        <div className="text-center mb-10">
          <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:"rgba(255,255,255,.35)",fontSize:"1rem"}}>Assalomu alaykum,</p>
          <h2 style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(2rem,5vw,3rem)",fontWeight:400,background:"linear-gradient(120deg,#ff6b8a,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {name}
          </h2>
          <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.25)",fontSize:".78rem",letterSpacing:".4em",textTransform:"uppercase",marginTop:".6rem"}}>
            Sizga mos atirni tanlang
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PERFUMES.map(p=><PCard key={p.id} p={p} sel={sel?.id===p.id} onClick={()=>setSel(p)}/>)}
        </div>

        <div className="text-center">
          <button onClick={confirm} disabled={!sel}
            style={{
              fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"1rem",letterSpacing:".06em",
              padding:"13px 52px",transition:"all .5s",cursor:sel?"pointer":"not-allowed",
              border:`1px solid ${sel?sel.accent+"70":"rgba(255,255,255,.07)"}`,
              color:sel?sel.accent:"rgba(255,255,255,.18)",
              background:sel?`${sel.accent}10`:"transparent",
              boxShadow:sel?`0 0 30px ${sel.accent}18`:"none",
            }}>
            {sel?`✦  ${sel.name} — Tanlash`:"✦  Atir tanlang"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PCard({ p, sel, onClick }: { p: Perfume; sel: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const on = sel||hov;
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="relative overflow-hidden cursor-pointer transition-all duration-500"
      style={{
        background:on?`${p.accent}0c`:"rgba(255,255,255,.015)",
        border:`1px solid ${on?p.accent+"55":"rgba(255,255,255,.055)"}`,
        transform:on?"translateY(-7px)":"none",
        boxShadow:sel?`0 20px 50px ${p.accent}22,inset 0 1px 0 ${p.accent}28`:"none",
      }}>
      {sel&&<div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(to right,transparent,${p.accent},transparent)`}}/>}
      <div className="absolute inset-0 opacity-20 pointer-events-none"><Particles accent={p.accent}/></div>
      <div className="relative z-10 p-5 flex flex-col items-center text-center">
        <div className="mb-3 transition-transform duration-500"
          style={{transform:on?"scale(1.08) translateY(-4px)":"none",filter:on?`drop-shadow(0 0 18px ${p.accent}80)`:`drop-shadow(0 4px 10px ${p.accent}30)`}}>
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
}

// ── ResultPage ────────────────────────────────────────────────────────────────
export function ResultPage({ name, perfume }: { name: string; perfume: Perfume }) {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState<any[]>([]);

  useEffect(()=>{
    setTimeout(()=>setShow(true),80);
    const c=Array.from({length:50},(_,i)=>({
      id:i,x:8+Math.random()*84,
      color:[perfume.accent,"#fff9","#fbbf24cc","#f9a8d4cc"][i%4],
      delay:i*55,size:4+Math.random()*7,circle:Math.random()>.45,
    }));
    setConfetti(c);
    setTimeout(()=>setConfetti([]),4000);
  },[]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{background:perfume.bg}}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{background:`radial-gradient(ellipse at 50% 25%,${perfume.accent}16,transparent 60%)`}}/>
        <div className="absolute bottom-0 left-0 right-0 h-56" style={{background:`linear-gradient(to top,${perfume.accent}12,transparent)`}}/>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({length:50},(_,i)=>(
          <div key={i} className="absolute rounded-full bg-white"
            style={{width:i%7===0?2:1,height:i%7===0?2:1,left:`${(i*19.3)%100}%`,top:`${(i*17.7)%100}%`,
              opacity:.08+(i%5)*.08,animation:`twinkle ${2+(i%4)}s ${(i%5)*.8}s ease-in-out infinite`}}/>
        ))}
      </div>
      <Particles accent={perfume.accent}/>
      {confetti.map(c=>(
        <div key={c.id} className="fixed pointer-events-none"
          style={{left:`${c.x}%`,top:"8%",width:c.size,height:c.size,background:c.color,
            borderRadius:c.circle?"50%":"2px",zIndex:50,animation:`fall 2.8s ${c.delay}ms ease-out forwards`}}/>
      ))}

      <div className={`relative z-10 max-w-lg w-full px-6 py-16 text-center transition-all duration-1000 ${show?"opacity-100 translate-y-0":"opacity-0 translate-y-10"}`}>
        <div className="flex justify-center mb-6" style={{animation:"float 3.5s ease-in-out infinite",filter:`drop-shadow(0 0 45px ${perfume.accent}90)`}}>
          <perfume.Bottle accent={perfume.accent} size={150}/>
        </div>

        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="h-px w-10" style={{background:perfume.accent,opacity:.35}}/>
          <span style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",color:perfume.accent+"99",fontSize:".78rem",letterSpacing:".45em",textTransform:"uppercase"}}>Sizning Atringiz</span>
          <div className="h-px w-10" style={{background:perfume.accent,opacity:.35}}/>
        </div>

        <div style={{fontFamily:"'Cormorant',serif",fontStyle:"italic",fontSize:"clamp(2.4rem,7vw,3.8rem)",fontWeight:300,color:"#fff",lineHeight:1.08,marginBottom:".3rem"}}>{name},</div>
        <div style={{fontFamily:"'Cormorant',serif",fontSize:"clamp(1.3rem,3.5vw,2rem)",color:perfume.accent,marginBottom:".3rem"}}>{perfume.name}</div>
        <div style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.28)",fontSize:".68rem",letterSpacing:".35em",textTransform:"uppercase",marginBottom:"1.8rem"}}>{perfume.tagline}</div>

        <div className="h-px w-20 mx-auto mb-7" style={{background:`linear-gradient(to right,transparent,${perfume.accent},transparent)`,opacity:.28}}/>

        <div className="flex flex-wrap justify-center gap-2 mb-7">
          {perfume.traits.map(t=>(
            <span key={t} style={{fontFamily:"'EB Garamond',serif",fontSize:".72rem",letterSpacing:".18em",textTransform:"uppercase",padding:"5px 13px",
              border:`1px solid ${perfume.accent}40`,color:`${perfume.accent}cc`,background:`${perfume.accent}0a`}}>
              {t}
            </span>
          ))}
        </div>

        <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"1.05rem",color:"rgba(255,255,255,.45)",lineHeight:1.85,marginBottom:"1.8rem"}}>
          "{perfume.personality}"
        </p>

        <div style={{padding:"1.5rem",textAlign:"left",marginBottom:"2rem",border:`1px solid ${perfume.accent}22`,background:`${perfume.accent}07`,borderTop:`2px solid ${perfume.accent}55`}}>
          <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:".88rem",letterSpacing:".32em",textTransform:"uppercase",color:perfume.accent,marginBottom:".8rem"}}>
            🌸  8-Mart Muborak!
          </div>
          <p style={{fontFamily:"'EB Garamond',serif",color:"rgba(255,255,255,.5)",fontSize:".95rem",lineHeight:1.9}}>{perfume.wish}</p>
        </div>

        <div style={{color:perfume.accent,opacity:.2,fontSize:"1.3rem",letterSpacing:"1rem"}}>✦ ✦ ✦</div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<"name"|"perfume"|"result">("name");
  const [userName, setUserName] = useState("");
  const [chosen, setChosen] = useState<Perfume|null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=EB+Garamond:ital,wght@0,400;1,400&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        body{background:#07000c}
        @keyframes rise{0%{transform:translateY(0);opacity:0}15%{opacity:.6}100%{transform:translateY(-95vh);opacity:0}}
        @keyframes float{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-14px) rotate(3deg)}}
        @keyframes fall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(90vh) rotate(720deg);opacity:0}}
        @keyframes twinkle{0%,100%{opacity:.06}50%{opacity:.65}}
      `}</style>
      {screen==="name"    && <NamePage    onNext={n=>{setUserName(n);setScreen("perfume")}}/>}
      {screen==="perfume" && <PerfumePage name={userName} onNext={p=>{setChosen(p);setScreen("result")}}/>}
      {screen==="result"  && chosen && <ResultPage name={userName} perfume={chosen}/>}
    </>
  );
}