export default function FarmIllustration() {
  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" className="w-full rounded-2xl shadow-lg">

      {/* Sky */}
      <rect width="600" height="400" fill="#c8e6c9"/>

      {/* Background greenery */}
      {[0,30,60,90,120,150,180,210,240,270,300,330,360,390,420,450,480,510,540,570].map((x,i) => (
        <g key={i}>
          <rect x={x} y={0} width={28} height={120} fill={i%2===0?"#388e3c":"#2e7d32"} rx="2"/>
          <ellipse cx={x+14} cy={0} rx={16} ry={20} fill={i%2===0?"#43a047":"#388e3c"}/>
        </g>
      ))}

      {/* Mid greenery layer */}
      {[0,20,40,60,80,100,120,140,160,180,200,220,240,260,280,300,320,340,360,380,400,420,440,460,480,500,520,540,560,580].map((x,i) => (
        <g key={i}>
          <rect x={x} y={90} width={18} height={80} fill={i%2===0?"#558b2f":"#33691e"} rx="1"/>
          <ellipse cx={x+9} cy={90} rx={11} ry={15} fill={i%2===0?"#689f38":"#558b2f"}/>
        </g>
      ))}

      {/* Paddy field water */}
      <ellipse cx="300" cy="310" rx="280" ry="60" fill="#b3e5fc" opacity="0.5"/>
      <rect x="0" y="270" width="600" height="130" fill="#8bc34a"/>

      {/* Muddy water patches */}
      <ellipse cx="200" cy="320" rx="120" ry="25" fill="#90a4ae" opacity="0.4"/>
      <ellipse cx="380" cy="330" rx="100" ry="20" fill="#90a4ae" opacity="0.35"/>
      <ellipse cx="100" cy="340" rx="80" ry="15" fill="#78909c" opacity="0.3"/>

      {/* Mud ground */}
      <rect x="0" y="300" width="600" height="100" fill="#795548" opacity="0.3"/>

      {/* Grass foreground */}
      {[0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,255,270,285,300,315,330,345,360,375,390,405,420,435,450,465,480,495,510,525,540,555,570,585].map((x,i) => (
        <g key={i}>
          <line x1={x+5} y1="400" x2={x+2} y2={360+Math.sin(i)*8} stroke={i%3===0?"#558b2f":"#7cb342"} strokeWidth="3" strokeLinecap="round"/>
          <line x1={x+10} y1="400" x2={x+14} y2={355+Math.cos(i)*6} stroke={i%3===1?"#689f38":"#8bc34a"} strokeWidth="2.5" strokeLinecap="round"/>
        </g>
      ))}

      {/* Plow */}
      <line x1="270" y1="310" x2="370" y2="295" stroke="#5d4037" strokeWidth="6" strokeLinecap="round"/>
      <line x1="310" y1="295" x2="330" y2="330" stroke="#6d4c41" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="330" cy="332" rx="12" ry="6" fill="#4e342e" transform="rotate(-10,330,332)"/>
      <line x1="270" y1="310" x2="255" y2="330" stroke="#5d4037" strokeWidth="5" strokeLinecap="round"/>
      <line x1="265" y1="320" x2="250" y2="340" stroke="#5d4037" strokeWidth="4" strokeLinecap="round"/>

      {/* Yoke connecting bulls */}
      <line x1="370" y1="295" x2="430" y2="285" stroke="#795548" strokeWidth="7" strokeLinecap="round"/>
      <line x1="430" y1="285" x2="490" y2="280" stroke="#795548" strokeWidth="7" strokeLinecap="round"/>
      <rect x="395" y="278" width="70" height="10" fill="#6d4c41" rx="4"/>

      {/* Bull 1 (left) */}
      <g transform="translate(390,255)">
        <ellipse cx="40" cy="38" rx="52" ry="30" fill="#9e9e9e"/>
        <ellipse cx="85" cy="25" rx="24" ry="20" fill="#9e9e9e"/>
        <ellipse cx="106" cy="30" rx="12" ry="9" fill="#bdbdbd"/>
        <circle cx="103" cy="28" r="3" fill="#424242"/>
        <circle cx="109" cy="28" r="3" fill="#424242"/>
        <circle cx="90" cy="18" r="4" fill="#212121"/>
        <circle cx="91" cy="17" r="1.5" fill="white"/>
        <path d="M80 10 Q72 -2 62 4" stroke="#757575" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M92 8 Q100 -4 110 2" stroke="#757575" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <rect x="8" y="60" width="13" height="32" fill="#757575" rx="4"/>
        <rect x="28" y="60" width="13" height="32" fill="#757575" rx="4"/>
        <rect x="52" y="60" width="13" height="32" fill="#757575" rx="4"/>
        <rect x="70" y="60" width="13" height="32" fill="#757575" rx="4"/>
        <path d="M0 30 Q-18 18 -12 6" stroke="#757575" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <ellipse cx="-12" cy="5" rx="6" ry="9" fill="#616161"/>
        {/* mud on legs */}
        <ellipse cx="14" cy="88" rx="10" ry="5" fill="#5d4037" opacity="0.5"/>
        <ellipse cx="34" cy="88" rx="10" ry="5" fill="#5d4037" opacity="0.5"/>
        <ellipse cx="58" cy="88" rx="10" ry="5" fill="#5d4037" opacity="0.5"/>
        <ellipse cx="76" cy="88" rx="10" ry="5" fill="#5d4037" opacity="0.5"/>
      </g>

      {/* Bull 2 (right) */}
      <g transform="translate(470,250)">
        <ellipse cx="40" cy="38" rx="52" ry="30" fill="#a5a5a5"/>
        <ellipse cx="85" cy="25" rx="24" ry="20" fill="#a5a5a5"/>
        <ellipse cx="106" cy="30" rx="12" ry="9" fill="#c0c0c0"/>
        <circle cx="103" cy="28" r="3" fill="#424242"/>
        <circle cx="109" cy="28" r="3" fill="#424242"/>
        <circle cx="90" cy="18" r="4" fill="#212121"/>
        <circle cx="91" cy="17" r="1.5" fill="white"/>
        <path d="M80 10 Q72 -2 62 4" stroke="#757575" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M92 8 Q100 -4 110 2" stroke="#757575" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <rect x="8" y="60" width="13" height="32" fill="#757575" rx="4"/>
        <rect x="28" y="60" width="13" height="32" fill="#757575" rx="4"/>
        <rect x="52" y="60" width="13" height="32" fill="#757575" rx="4"/>
        <rect x="70" y="60" width="13" height="32" fill="#757575" rx="4"/>
        <path d="M0 30 Q-18 18 -12 6" stroke="#757575" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <ellipse cx="-12" cy="5" rx="6" ry="9" fill="#616161"/>
        <ellipse cx="14" cy="88" rx="10" ry="5" fill="#5d4037" opacity="0.5"/>
        <ellipse cx="34" cy="88" rx="10" ry="5" fill="#5d4037" opacity="0.5"/>
        <ellipse cx="58" cy="88" rx="10" ry="5" fill="#5d4037" opacity="0.5"/>
        <ellipse cx="76" cy="88" rx="10" ry="5" fill="#5d4037" opacity="0.5"/>
      </g>

      {/* Farmer */}
      <g transform="translate(210,220)">
        {/* legs */}
        <rect x="14" y="80" width="14" height="45" fill="#e57373" rx="4"/>
        <rect x="32" y="80" width="14" height="45" fill="#ef9a9a" rx="4"/>
        {/* feet bare */}
        <ellipse cx="21" cy="126" rx="11" ry="6" fill="#5d4037"/>
        <ellipse cx="39" cy="126" rx="11" ry="6" fill="#5d4037"/>
        {/* mud on feet */}
        <ellipse cx="21" cy="128" rx="9" ry="4" fill="#4e342e" opacity="0.6"/>
        <ellipse cx="39" cy="128" rx="9" ry="4" fill="#4e342e" opacity="0.6"/>
        {/* shirt */}
        <rect x="8" y="38" width="44" height="46" fill="#eeeeee" rx="6"/>
        {/* shirt stripes */}
        {[14,20,26,32,38,44].map((x,i) => (
          <line key={i} x1={x} y1="38" x2={x} y2="84" stroke="#bdbdbd" strokeWidth="1.5"/>
        ))}
        {/* left arm reaching forward */}
        <rect x="-10" y="42" width="18" height="38" fill="#eeeeee" rx="6" transform="rotate(30,-10,42)"/>
        {/* right arm back */}
        <rect x="50" y="42" width="18" height="35" fill="#eeeeee" rx="6" transform="rotate(-15,50,42)"/>
        {/* hands */}
        <circle cx="8" cy="82" r="9" fill="#5d4037"/>
        <circle cx="62" cy="74" r="9" fill="#5d4037"/>
        {/* neck */}
        <rect x="22" y="24" width="16" height="16" fill="#5d4037" rx="4"/>
        {/* head */}
        <ellipse cx="30" cy="14" rx="20" ry="18" fill="#5d4037"/>
        {/* turban */}
        <ellipse cx="30" cy="0" rx="24" ry="10" fill="#ef9a9a"/>
        <rect x="8" y="-8" width="44" height="14" fill="#e57373" rx="6"/>
        <ellipse cx="48" cy="-2" rx="8" ry="6" fill="#ef9a9a"/>
        {/* eyes */}
        <circle cx="23" cy="14" r="3" fill="#1a1a1a"/>
        <circle cx="37" cy="14" r="3" fill="#1a1a1a"/>
        {/* mud splatter on shirt */}
        <circle cx="20" cy="65" r="5" fill="#795548" opacity="0.4"/>
        <circle cx="35" cy="72" r="4" fill="#795548" opacity="0.35"/>
        <circle cx="15" cy="75" r="3" fill="#795548" opacity="0.3"/>
      </g>

      {/* Water ripples */}
      <ellipse cx="150" cy="350" rx="40" ry="8" fill="none" stroke="#90caf9" strokeWidth="2" opacity="0.6"/>
      <ellipse cx="450" cy="360" rx="35" ry="7" fill="none" stroke="#90caf9" strokeWidth="2" opacity="0.5"/>
      <ellipse cx="300" cy="370" rx="50" ry="9" fill="none" stroke="#90caf9" strokeWidth="2" opacity="0.4"/>

    </svg>
  )
}
