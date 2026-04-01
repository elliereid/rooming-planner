import { useState, useRef, useEffect } from "react";

function loadLS(key, fallback) {
  try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const PALETTE = [
  { bg:'#FDDDE6', text:'#9B2335', border:'#F5A7BE' },
  { bg:'#EDE0F7', text:'#6B2FA0', border:'#C9A8E8' },
  { bg:'#D5F0FF', text:'#1565A4', border:'#8CC8F0' },
  { bg:'#D6F3E8', text:'#1A6640', border:'#7FCFAA' },
  { bg:'#FEF3CC', text:'#8B6800', border:'#F0D070' },
  { bg:'#FFE9D6', text:'#A03A10', border:'#F5A87C' },
  { bg:'#F7D5E8', text:'#902060', border:'#E890C0' },
  { bg:'#E0F7D5', text:'#3A7020', border:'#98D080' },
  { bg:'#F7E8D5', text:'#804010', border:'#E8B080' },
  { bg:'#E4D5F7', text:'#4A2080', border:'#A884E0' },
  { bg:'#D5F7F0', text:'#106050', border:'#70D8C0' },
  { bg:'#F7F0D5', text:'#806000', border:'#E8D070' },
];

// BIG HOUSE floor plan — coordinate space 920 x 760
const BH_W = 920, BH_H = 760;
const BH_ELEMENTS = [
  { type:'hall', x:198, y:20,  w:18,  h:315 },
  { type:'hall', x:198, y:330, w:350, h:68  },
  { type:'hall', x:540, y:330, w:68,  h:68  },
  { type:'bath', x:210, y:20,  w:82,  h:52,  label:'a' },
  { type:'bath', x:20,  y:180, w:44,  h:56,  label:'b' },
  { type:'bath', x:256, y:195, w:76,  h:42,  label:'c' },
  { type:'bath', x:20,  y:266, w:44,  h:68,  label:'d' },
  { type:'bath', x:288, y:398, w:94,  h:48,  label:'e' },
  { type:'bath', x:126, y:520, w:84,  h:42,  label:'f' },
  { type:'bath', x:618, y:556, w:50,  h:90,  label:'g' },
  { type:'bath', x:668, y:556, w:88,  h:45,  label:'h' },
  { type:'bath', x:668, y:601, w:88,  h:45,  label:'i' },
  { type:'room', id:'bh1',   x:50,  y:20,  w:154, h:110, num:'1',     name:"Father's Room",           beds:"Queen/Double", bath:"J&J Bath A · shared w/ Rm 2" },
  { type:'room', id:'bh2',   x:296, y:20,  w:148, h:110, num:'2',     name:"Mother's Room",            beds:"Queen/Double", bath:"J&J Bath A · shared w/ Rm 1" },
  { type:'room', id:'bh3',   x:50,  y:132, w:160, h:74,  num:'3',     name:"Florentine Room",          beds:"Queen/Double", bath:"J&J Bath B · shared w/ Rm 5" },
  { type:'room', id:'bh4',   x:296, y:132, w:148, h:64,  num:'4',     name:"North Room",               beds:"Queen/Double", bath:"J&J Bath C · shared w/ Rm 6" },
  { type:'room', id:'bh5',   x:64,  y:206, w:130, h:62,  num:'5',     name:"Valley Room",              beds:"2 Twins",      bath:"Baths B & D" },
  { type:'room', id:'bh6',   x:256, y:236, w:164, h:96,  num:'6',     name:"Girls' Suite",             beds:"2 Twins",      bath:"J&J Bath C · shared w/ Rm 4" },
  { type:'room', id:'bh7',   x:64,  y:266, w:130, h:100, num:'7',     name:"Grandmother's Room",       beds:"Queen/Double", bath:"J&J Bath D" },
  { type:'room', id:'bh8',   x:20,  y:398, w:172, h:124, num:'8',     name:"Purple Room",              beds:"2 Twins",      bath:"Private Bath F (tub)" },
  { type:'room', id:'bh9',   x:288, y:446, w:134, h:92,  num:'9',     name:"Boys' Suite",              beds:"2 Twins",      bath:"Shared Bath E" },
  { type:'room', id:'bh10',  x:212, y:534, w:180, h:112, num:'10',    name:"Boys' Sleeping Porch",     beds:"3 Twins",      bath:"Shared Bath E" },
  { type:'room', id:'bh11',  x:580, y:398, w:112, h:80,  num:'11',    name:"Sewing Room",              beds:"Queen/Double", bath:"North Wing shared" },
  { type:'room', id:'bh14',  x:698, y:398, w:82,  h:80,  num:'14',    name:"Bell Room",                beds:"2 Twins",      bath:"North Wing shared" },
  { type:'room', id:'bh15',  x:784, y:398, w:110, h:80,  num:'15',    name:"Corner Room",              beds:"Queen/Double", bath:"North Wing shared" },
  { type:'room', id:'bh16',  x:784, y:478, w:110, h:78,  num:'16',    name:"Dairy View",               beds:"2 Twins",      bath:"Baths H & I" },
  { type:'room', id:'bh12',  x:498, y:556, w:120, h:90,  num:'12',    name:"Grandchildren's Room",     beds:"Queen/Double", bath:"Private Bath G (tub)" },
  { type:'room', id:'bh17',  x:742, y:556, w:152, h:90,  num:'17',    name:"Stable View",              beds:"2 Twins",      bath:"Baths H & I" },
  { type:'room', id:'bh13',  x:498, y:646, w:244, h:90,  num:'13',    name:"Grandchildren's Porch",    beds:"3 Twins",      bath:"Private Bath G (tub)" },
  { type:'room', id:'bh1819',x:742, y:646, w:152, h:90,  num:'18+19', name:"Room w/ a View + Ivy ✦ADA",beds:"Queen/Double each", bath:"North Wing + ADA Bath", note:"Rm 19 downstairs / ADA" },
];

// BLIGHTY floor plan — coordinate space 510 x 565
const BL_W = 510, BL_H = 565;
const BL_ELEMENTS = [
  { type:'bath',   x:24,  y:14,  w:232, h:62,  label:'b' },
  { type:'bath',   x:260, y:92,  w:174, h:86,  label:'a' },
  { type:'bath',   x:24,  y:174, w:100, h:58,  label:'c' },
  { type:'bath',   x:124, y:174, w:100, h:58,  label:'d' },
  { type:'common', x:218, y:288, w:216, h:146, label:'Kitchen +\nLiving Room' },
  { type:'common', x:24,  y:430, w:410, h:52,  label:'Porch' },
  { type:'room', id:'bl2', x:260, y:14,  w:174, h:80,  num:'2', name:"Corner Bedroom", beds:"Queen",        bath:"Shared Bath B (tub/shower)" },
  { type:'room', id:'bl3', x:24,  y:76,  w:200, h:100, num:'3', name:"Twin Bedroom",   beds:"2 Twins",      bath:"Bath B + Powder Room C" },
  { type:'room', id:'bl1', x:260, y:176, w:174, h:114, num:'1', name:"Master Bedroom", beds:"King",         bath:"Master Bath A (ADA shower)" },
  { type:'room', id:'bl4', x:24,  y:288, w:196, h:144, num:'4', name:"Bunk Room ↑",    beds:"4 Twin Bunks", bath:"Shared Bath B (tub/shower)", note:"Upstairs · two pairs of bunk beds" },
];

export default function RoomPlanner() {
  const [building, setBuilding]       = useState(() => loadLS('bp_building', 'bighouse'));
  const [guests, setGuests]           = useState(() => loadLS('bp_guests', []));
  const [assignments, setAssignments] = useState(() => loadLS('bp_assignments', {}));
  const [inputName, setInputName]     = useState('');
  const [dragging, setDragging]       = useState(null);
  const [dropTarget, setDropTarget]   = useState(null);
  const [tooltip, setTooltip]         = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const colorCounter     = useRef(loadLS('bp_guests', []).reduce((max, g) => Math.max(max, (g.colorIdx ?? -1) + 1), 0));
  const planContainerRef = useRef(null);
  const [planScale, setPlanScale] = useState(1);

  useEffect(() => saveLS('bp_building',    building),    [building]);
  useEffect(() => saveLS('bp_guests',      guests),      [guests]);
  useEffect(() => saveLS('bp_assignments', assignments), [assignments]);

  const elements = building === 'bighouse' ? BH_ELEMENTS : BL_ELEMENTS;
  const planW    = building === 'bighouse' ? BH_W : BL_W;
  const planH    = building === 'bighouse' ? BH_H : BL_H;

  useEffect(() => {
    const el = planContainerRef.current;
    if (!el) return;
    const update = (w, h) => setPlanScale(Math.min(w / planW, h / planH, 1.3));
    const obs = new ResizeObserver(([entry]) => update(entry.contentRect.width, entry.contentRect.height));
    obs.observe(el);
    const r = el.getBoundingClientRect();
    if (r.width > 0) update(r.width, r.height);
    return () => obs.disconnect();
  }, [planW, planH]);

  const addGuest = () => {
    const name = inputName.trim();
    if (!name) return;
    const colorIdx = colorCounter.current % PALETTE.length;
    colorCounter.current++;
    setGuests(prev => [...prev, { id:`g_${Date.now()}`, name, colorIdx }]);
    setInputName('');
  };

  const removeGuest = (guestId) => {
    setGuests(prev => prev.filter(g => g.id !== guestId));
    setAssignments(prev => {
      const next = {};
      for (const [rid, gids] of Object.entries(prev)) {
        const f = gids.filter(id => id !== guestId);
        if (f.length) next[rid] = f;
      }
      return next;
    });
  };

  const assign = (guestId, toRoomId) => {
    setAssignments(prev => {
      const next = {};
      for (const [rid, gids] of Object.entries(prev)) {
        const f = gids.filter(id => id !== guestId);
        if (f.length) next[rid] = f;
      }
      if (toRoomId) next[toRoomId] = [...(next[toRoomId] || []), guestId];
      return next;
    });
  };

  const unassign = (guestId, roomId) => {
    setAssignments(prev => {
      const next = { ...prev };
      if (next[roomId]) {
        const f = next[roomId].filter(id => id !== guestId);
        if (f.length) next[roomId] = f; else delete next[roomId];
      }
      return next;
    });
  };

  const getOccupants  = (roomId) => (assignments[roomId] || []).map(id => guests.find(g => g.id === id)).filter(Boolean);
  const isAssigned    = (guestId) => Object.values(assignments).some(g => g.includes(guestId));
  const unassignedG   = guests.filter(g => !isAssigned(g.id));
  const assignedG     = guests.filter(g =>  isAssigned(g.id));
  const totalAssigned = Object.values(assignments).flat().length;
  const rooms         = elements.filter(e => e.type === 'room');

  return (
      <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'#F4EDE6', overflow:'hidden' }}>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#D0C0B0;border-radius:3px;}
        .room-box{position:absolute;border-radius:7px;border:2px solid #AACCE0;background:rgba(205,232,248,.72);
          display:flex;flex-direction:column;transition:border-color .13s,background .13s,box-shadow .13s,transform .12s;cursor:default;}
        .room-box:hover{border-color:#78AECE;z-index:8;background:rgba(205,232,248,.92);box-shadow:0 2px 14px rgba(0,80,160,.12);}
        .room-box.over{border-color:#3A8ECE!important;background:rgba(176,220,252,.95)!important;
          box-shadow:0 0 0 3px rgba(58,142,206,.28),0 4px 18px rgba(0,0,0,.14)!important;transform:scale(1.025);z-index:20;}
        .room-box.filled{border-color:#B09AD8;background:rgba(226,214,248,.72);}
        .room-box.filled:hover{background:rgba(226,214,248,.92);border-color:#907AC8;}
        .hall-box{position:absolute;background:#CCC4BC;border-radius:3px;}
        .bath-box{position:absolute;background:#4E7C46;border-radius:4px;display:flex;align-items:center;
          justify-content:center;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,.9);}
        .common-box{position:absolute;background:rgba(214,208,200,.5);border:1.5px solid #C4BAB0;border-radius:5px;
          display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;
          font-size:11px;color:#8B7E72;text-align:center;line-height:1.45;}
        .chip{display:inline-flex;align-items:center;gap:2px;padding:2px 6px;border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;cursor:grab;user-select:none;
          border-width:1.5px;border-style:solid;white-space:nowrap;transition:transform .12s,filter .12s;line-height:1.3;}
        .chip:active{cursor:grabbing;opacity:.8;}.chip:hover{transform:translateY(-1px);filter:saturate(1.2);}
        .chip-x{background:none;border:none;cursor:pointer;padding:0;font-size:12px;line-height:1;
          color:inherit;opacity:.4;flex-shrink:0;}.chip-x:hover{opacity:1;}
        .sidebar-chip{display:flex;align-items:center;justify-content:space-between;padding:5px 10px;
          border-radius:12px;width:100%;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;
          cursor:grab;user-select:none;border-width:1.5px;border-style:solid;transition:transform .13s,filter .13s;}
        .sidebar-chip:active{cursor:grabbing;}.sidebar-chip:hover{transform:translateX(3px);filter:saturate(1.15);}
        .input{padding:8px 11px;border:1.5px solid #D0C0B8;border-radius:8px;font-family:'DM Sans',sans-serif;
          font-size:12px;background:white;outline:none;width:100%;transition:border-color .2s,box-shadow .2s;}
        .input:focus{border-color:#C8966A;box-shadow:0 0 0 3px rgba(200,150,106,.15);}
        .btn-add{padding:8px 13px;background:linear-gradient(135deg,#C8966A,#E0AD82);color:white;border:none;
          border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;
          cursor:pointer;flex-shrink:0;transition:filter .2s,transform .15s;}
        .btn-add:hover{filter:brightness(1.08);transform:translateY(-1px);}
        .btn-ghost{padding:6px 12px;background:transparent;border-radius:7px;font-family:'DM Sans',sans-serif;
          font-size:11px;font-weight:500;cursor:pointer;border:1.5px solid;transition:background .18s;}
        .tab{padding:6px 16px;border-radius:18px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;
          cursor:pointer;border:2px solid;transition:all .18s;letter-spacing:.3px;}
        .tab-on{background:#C8966A;color:white;border-color:#C8966A;}
        .tab-off{background:transparent;color:#C8966A;border-color:#E0C8B0;}.tab-off:hover{background:#FAF0E8;}
        .unassign-zone{padding:10px;border:2px dashed #D4A878;border-radius:8px;font-family:'DM Sans',sans-serif;
          font-size:11px;color:#C8966A;text-align:center;animation:pulse 1.8s ease infinite;margin-top:10px;}
        @keyframes pulse{0%,100%{opacity:.65}50%{opacity:1}}
        .tooltip{position:fixed;pointer-events:none;z-index:999;background:rgba(26,20,16,.93);color:white;
          padding:9px 13px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:11px;line-height:1.7;
          max-width:220px;box-shadow:0 6px 24px rgba(0,0,0,.28);}
        .summary-row{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;
          padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid #EAD8C8;}
        .summary-row:last-child{border-bottom:none;}
      `}</style>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#2A2520,#3D3028)', padding:'13px 22px',
          display:'flex', alignItems:'center', gap:16, boxShadow:'0 4px 24px rgba(0,0,0,.24)', flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", color:'#D4A878', fontSize:10, fontStyle:'italic', letterSpacing:1.5, marginBottom:2 }}>Weekend · Rooming Planner</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", color:'white', fontSize:19, fontWeight:700 }}>🌸 Bachelorette Party</div>
          </div>
          <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,.08)', padding:4, borderRadius:22 }}>
            <button className={`tab ${building==='bighouse'?'tab-on':'tab-off'}`} onClick={()=>setBuilding('bighouse')}>🏠 Big House</button>
            <button className={`tab ${building==='blighty'?'tab-on':'tab-off'}`}  onClick={()=>setBuilding('blighty')}>🌿 Blighty</button>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:16, alignItems:'center' }}>
            <button className="btn-ghost" onClick={()=>setShowSummary(s=>!s)} style={{ color:'#D4C0A8', borderColor:'rgba(212,192,168,.4)' }}>
              {showSummary ? '← Floor Plan' : '📋 Summary'}
            </button>
            {totalAssigned > 0 && <button className="btn-ghost" onClick={()=>setAssignments({})} style={{ color:'#D4C0A8', borderColor:'rgba(212,192,168,.4)' }}>↺ Clear</button>}
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", color:'#D4A878', fontSize:20, fontWeight:700, lineHeight:1 }}>{guests.length}</div>
              <div style={{ fontFamily:'DM Sans', color:'#9B8878', fontSize:8, letterSpacing:1.5 }}>GUESTS</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", color: guests.length>0&&totalAssigned===guests.length?'#7ECFA8':'#D4A878', fontSize:20, fontWeight:700, lineHeight:1 }}>{totalAssigned}/{guests.length}</div>
              <div style={{ fontFamily:'DM Sans', color:'#9B8878', fontSize:8, letterSpacing:1.5 }}>PLACED</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/* Sidebar */}
          <div style={{ width:206, flexShrink:0, background:'rgba(255,255,255,.88)', borderRight:'1px solid #E4D0C0',
            padding:'16px 12px', overflowY:'auto', display:'flex', flexDirection:'column' }}
               onDragOver={e=>e.preventDefault()}
               onDrop={e=>{ e.preventDefault(); if(dragging?.fromRoom) unassign(dragging.guestId,dragging.fromRoom); setDragging(null); setDropTarget(null); }}>

            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:14, color:'#8B6858', marginBottom:12 }}>Guest List</div>
            <div style={{ display:'flex', gap:5, marginBottom:16 }}>
              <input className="input" placeholder="Guest name..." value={inputName}
                     onChange={e=>setInputName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addGuest()} />
              <button className="btn-add" onClick={addGuest}>+</button>
            </div>

            {unassignedG.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontFamily:'DM Sans', fontSize:8, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:'#A09080', marginBottom:7 }}>Unassigned · {unassignedG.length}</div>
                  {unassignedG.map(g=>(
                      <div key={g.id} style={{ marginBottom:5 }}>
                        <div className="sidebar-chip" draggable
                             onDragStart={e=>{ setDragging({guestId:g.id,fromRoom:null}); e.dataTransfer.effectAllowed='move'; }}
                             onDragEnd={()=>{ setDragging(null); setDropTarget(null); }}
                             style={{ background:PALETTE[g.colorIdx].bg, color:PALETTE[g.colorIdx].text, borderColor:PALETTE[g.colorIdx].border }}>
                          <span>✦ {g.name}</span>
                          <button className="chip-x" onClick={()=>removeGuest(g.id)}>×</button>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {assignedG.length > 0 && (
                <div>
                  <div style={{ fontFamily:'DM Sans', fontSize:8, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:'#A09080', marginBottom:7 }}>Placed · {assignedG.length}</div>
                  {assignedG.map(g=>(
                      <div key={g.id} style={{ marginBottom:5 }}>
                        <div className="sidebar-chip" style={{ background:PALETTE[g.colorIdx].bg, color:PALETTE[g.colorIdx].text, borderColor:PALETTE[g.colorIdx].border, opacity:.58, cursor:'default' }}>
                          <span>✓ {g.name}</span>
                          <button className="chip-x" onClick={()=>removeGuest(g.id)}>×</button>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {dragging?.fromRoom && <div className="unassign-zone">↩ Drop here to unassign</div>}
            {guests.length===0 && (
                <div style={{ color:'#BBA898', fontSize:11, fontFamily:'DM Sans', fontStyle:'italic', textAlign:'center', padding:'20px 4px', lineHeight:1.9 }}>
                  Type a name &amp; press Enter<br/>then drag onto a room ✦
                </div>
            )}
          </div>

          {/* Floor Plan / Summary */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {!showSummary ? (
                <div ref={planContainerRef} style={{ flex:1, overflow:'auto', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
                  {/* Outer wrapper maintains correct scrollable size */}
                  <div style={{ position:'relative', width:planW*planScale, height:planH*planScale, flexShrink:0 }}>
                    {/* Inner canvas at native resolution, scaled via CSS transform */}
                    <div style={{ position:'absolute', top:0, left:0, width:planW, height:planH, transform:`scale(${planScale})`, transformOrigin:'top left' }}>
                      {elements.map((el, i) => {
                        if (el.type==='hall')   return <div key={i} className="hall-box"   style={{ left:el.x, top:el.y, width:el.w, height:el.h }} />;
                        if (el.type==='bath')   return <div key={i} className="bath-box"   style={{ left:el.x, top:el.y, width:el.w, height:el.h }}>{el.label}</div>;
                        if (el.type==='common') return <div key={i} className="common-box" style={{ left:el.x, top:el.y, width:el.w, height:el.h }}>{el.label}</div>;
                        if (el.type==='room') {
                          const occs   = getOccupants(el.id);
                          const isOver = dropTarget === el.id;
                          const narrow = el.w < 90;

                          // inv = 1/planScale so text stays a consistent screen size regardless of zoom.
                          // e.g. if canvas is at 0.6× zoom, inv=1.67 — fonts are drawn 1.67× bigger
                          // in native coords so after scaling they land at the target screen size.
                          const inv       = 1 / planScale;
                          const numSize   = Math.round(15 * inv);   // room number: ~15px on screen
                          const nameSize  = Math.round(11 * inv);   // room name:   ~11px on screen
                          const chipSize  = Math.round(10 * inv);   // guest chip:  ~10px on screen
                          const hintSize  = Math.round(9  * inv);   // "drop here":  ~9px on screen
                          const padV      = Math.round(4  * inv);
                          const padH      = Math.round(6  * inv);
                          const gap       = Math.round(3  * inv);
                          const chipPadH  = Math.round(6  * inv);
                          const chipPadV  = Math.round(3  * inv);
                          const chipR     = Math.round(10 * inv);

                          return (
                              <div key={el.id} className={`room-box${isOver?' over':''}${occs.length?' filled':''}`}
                                   style={{ left:el.x, top:el.y, width:el.w, height:el.h }}
                                   onMouseEnter={e=>setTooltip({el,x:e.clientX+14,y:e.clientY-8})}
                                   onMouseMove={e=>setTooltip(t=>t?{...t,x:e.clientX+14,y:e.clientY-8}:null)}
                                   onMouseLeave={()=>setTooltip(null)}
                                   onDragOver={e=>{e.preventDefault();setDropTarget(el.id);}}
                                   onDragLeave={()=>setDropTarget(null)}
                                   onDrop={e=>{e.preventDefault();if(dragging)assign(dragging.guestId,el.id);setDragging(null);setDropTarget(null);}}>

                                {/* Room header — number + name */}
                                <div style={{ display:'flex', alignItems:'baseline', gap: Math.round(5*inv),
                                  padding:`${padV}px ${padH}px ${Math.round(3*inv)}px`, flexShrink:0,
                                  borderBottom:occs.length?'1px solid rgba(120,80,180,.22)':'1px solid rgba(80,130,180,.18)' }}>
                            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:numSize,
                              fontWeight:700, color:occs.length?'#6030A0':'#2A5878', lineHeight:1, flexShrink:0 }}>
                              {el.num}
                            </span>
                                  {!narrow && (
                                      <span style={{ fontFamily:'DM Sans', fontSize:nameSize, fontWeight:500, lineHeight:1.2,
                                        color:occs.length?'#7850B8':'#456888',
                                        overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2,
                                        WebkitBoxOrient:'vertical' }}>
                                {el.name}
                              </span>
                                  )}
                                </div>

                                {/* Guest chips */}
                                <div style={{ flex:1, padding:`${Math.round(3*inv)}px ${Math.round(4*inv)}px`,
                                  display:'flex', flexWrap:'wrap', gap, alignContent:'flex-start', overflowY:'auto' }}>
                                  {occs.map(g=>(
                                      <span key={g.id} draggable
                                            onDragStart={e=>{setDragging({guestId:g.id,fromRoom:el.id});e.dataTransfer.effectAllowed='move';e.stopPropagation();}}
                                            onDragEnd={()=>{setDragging(null);setDropTarget(null);}}
                                            style={{ display:'inline-flex', alignItems:'center', gap:Math.round(2*inv),
                                              padding:`${chipPadV}px ${chipPadH}px`, borderRadius:chipR,
                                              fontSize:chipSize, fontFamily:'DM Sans', fontWeight:600,
                                              cursor:'grab', userSelect:'none', whiteSpace:'nowrap',
                                              border:'1.5px solid', borderColor:PALETTE[g.colorIdx].border,
                                              background:PALETTE[g.colorIdx].bg, color:PALETTE[g.colorIdx].text }}>
                                {g.name.split(' ')[0]}
                                        <button style={{ background:'none', border:'none', cursor:'pointer', padding:0,
                                          fontSize:Math.round(13*inv), lineHeight:1, color:'inherit', opacity:.45 }}
                                                onClick={e=>{e.stopPropagation();unassign(g.id,el.id);}}>×</button>
                              </span>
                                  ))}
                                  {occs.length===0&&isOver && (
                                      <span style={{ fontSize:hintSize, fontFamily:'DM Sans', color:'#3A8ECE', fontStyle:'italic' }}>drop here</span>
                                  )}
                                </div>
                              </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
            ) : (
                <div style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, fontStyle:'italic', color:'#3A2E28', marginBottom:22 }}>
                    Assignment Summary — {building==='bighouse'?'Big House':'Blighty'}
                  </div>
                  {rooms.filter(r=>(assignments[r.id]||[]).length>0).map(r=>{
                    const occs = getOccupants(r.id);
                    return (
                        <div key={r.id} className="summary-row">
                          <div style={{ minWidth:200, flexShrink:0 }}>
                            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, fontWeight:700, color:'#3A2E28' }}>Room {r.num} · {r.name}</div>
                            <div style={{ fontFamily:'DM Sans', fontSize:9, color:'#9B8070', marginTop:2 }}>🛏 {r.beds} · 🛁 {r.bath}</div>
                          </div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                            {occs.map(g=>(
                                <span key={g.id} style={{ display:'inline-flex', alignItems:'center', padding:'4px 12px', borderRadius:14,
                                  fontSize:12, fontFamily:'DM Sans', fontWeight:600,
                                  background:PALETTE[g.colorIdx].bg, color:PALETTE[g.colorIdx].text, border:`1.5px solid ${PALETTE[g.colorIdx].border}` }}>
                          {g.name}
                        </span>
                            ))}
                          </div>
                        </div>
                    );
                  })}
                  {unassignedG.length > 0 && (
                      <div style={{ marginTop:20, padding:14, background:'#FFF8F0', borderRadius:10, border:'1px solid #EAD8C8' }}>
                        <div style={{ fontFamily:'DM Sans', fontSize:8, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#C89060', marginBottom:10 }}>Still Unassigned · {unassignedG.length}</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                          {unassignedG.map(g=>(
                              <span key={g.id} style={{ display:'inline-flex', padding:'4px 12px', borderRadius:14, fontSize:12, fontFamily:'DM Sans', fontWeight:600,
                                background:PALETTE[g.colorIdx].bg, color:PALETTE[g.colorIdx].text, border:`1.5px solid ${PALETTE[g.colorIdx].border}` }}>
                        {g.name}
                      </span>
                          ))}
                        </div>
                      </div>
                  )}
                  {rooms.filter(r=>(assignments[r.id]||[]).length>0).length===0 && (
                      <div style={{ color:'#BBA898', fontFamily:'DM Sans', fontSize:12, fontStyle:'italic' }}>No assignments yet — go back and drag guests to rooms!</div>
                  )}
                </div>
            )}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
            <div className="tooltip" style={{ left:tooltip.x, top:tooltip.y }}>
              <div style={{ fontWeight:700, fontFamily:"'Cormorant Garamond',serif", fontSize:13, marginBottom:3 }}>Room {tooltip.el.num} · {tooltip.el.name}</div>
              <div style={{ opacity:.85 }}>🛏 {tooltip.el.beds}</div>
              <div style={{ opacity:.85 }}>🛁 {tooltip.el.bath}</div>
              {tooltip.el.note && <div style={{ opacity:.65, fontStyle:'italic', marginTop:3 }}>{tooltip.el.note}</div>}
              {getOccupants(tooltip.el.id).length > 0 && (
                  <div style={{ marginTop:5, paddingTop:5, borderTop:'1px solid rgba(255,255,255,.2)' }}>👥 {getOccupants(tooltip.el.id).map(g=>g.name).join(', ')}</div>
              )}
            </div>
        )}
      </div>
  );
}