/* global React */
const { useState: useStateMW, useEffect: useEffectMW } = React;


const SERVICE_META_M = {
    "today":     { label: "Today",       icon: "ð", color: "#00AFF1" },
    "half-am":   { label: "Half AM",     icon: "âï¸", color: "#FF9500" },
    "half-pm":   { label: "Half PM",     icon: "ð", color: "#FF6B35" },
    "full":      { label: "Full day",    icon: "ð", color: "#00AFF1" },
    "boarding":  { label: "Boarding",    icon: "ð ", color: "#AF52DE" },
    "school":    { label: "School",      icon: "ð", color: "#FF2D55" },
    "grooming":  { label: "Grooming",    icon: "âï¸", color: "#32ADE6" },
};
window.SERVICE_META_M = SERVICE_META_M;


function MobileWhiteboard({ dogs, syncedAgo, onTogglePhoto, onToggleWalk, onAdd, outdoor, setOutdoor }) {
    const [tab, setTab] = useStateMW("today");
    const [navTab, setNavTab] = useStateMW("today");


    // outdoor mode: bigger text, higher contrast, bigger hit areas
    const D = outdoor ? {
        rowH: 64, font: 17, sub: 14, chipH: 44, headerH: 56, navH: 80,
        ink: "#000", sub2: "#3A3A3C", border: "rgba(0,0,0,0.18)",
    } : {
        rowH: 56, font: 16, sub: 13, chipH: 38, headerH: 52, navH: 72,
        ink: "#1C1C1E", sub2: "#8E8E93", border: "rgba(60,60,67,0.12)",
    };


    const services = ["half-am","half-pm","full","boarding","school","grooming"];
    const filteredDogs = tab === "today" ? dogs : dogs.filter(d => d.service === tab);
    const photoDoneCount = dogs.filter(d => d.photoDone).length;


    return (
        <div style={mwStyles.frame}>
            <div style={{...mwStyles.topBar, minHeight: D.headerH}}>
                <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:1}}>
                    <img src="../../assets/logo.png" alt="" style={{height:34,width:"auto",flexShrink:0}}/>
                    <div style={{minWidth:0}}>
                        <div style={{fontSize:15,fontWeight:700,color:D.ink,letterSpacing:"-0.02em",lineHeight:1.1}}>Whiteboard</div>
                        <div style={{fontSize:11,color:D.sub2,fontWeight:600,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                            <span style={{color:"#34C759"}}>â</span> Synced {syncedAgo}s
                        </div>
                    </div>
                </div>
                <button onClick={() => setOutdoor(!outdoor)}
                    title="Outdoor / gloves mode"
                    style={{...mwStyles.modeBtn, background: outdoor ? "#FFD60A" : "rgba(0,175,241,0.10)", color: outdoor ? "#1C1C1E" : "#00AFF1"}}>
                    {outdoor ? "â" : "â"}
                </button>
            </div>


            {/* Stat strip */}
            <div style={mwStyles.statStrip}>
                <div style={mwStyles.statBlock}>
                    <div style={{...mwStyles.statNum, color:D.ink}}>{dogs.length}</div>
                    <div style={{...mwStyles.statLabel, color:D.sub2}}>Dogs</div>
                </div>
                <div style={mwStyles.statDivider}/>
                <div style={mwStyles.statBlock}>
                    <div style={{...mwStyles.statNum, color:D.ink}}>{photoDoneCount}/{dogs.length}</div>
                    <div style={{...mwStyles.statLabel, color:D.sub2}}>Photos</div>
                </div>
                <div style={mwStyles.statDivider}/>
                <div style={mwStyles.statBlock}>
                    <div style={{...mwStyles.statNum, color:D.ink}}>{dogs.filter(d => (d.vanAm && d.vanAm !== "P") || (d.vanPm && d.vanPm !== "P")).length}</div>
                    <div style={{...mwStyles.statLabel, color:D.sub2}}>On vans</div>
                </div>
            </div>


            {/* Segmented tab strip â horizontal scroll */}
            <div style={mwStyles.segScroller}>
                <button onClick={()=>setTab("today")} style={{
                    ...mwStyles.segBtn, height:D.chipH,
                    background: tab === "today" ? "#1C1C1E" : "rgba(0,0,0,0.06)",
                    color: tab === "today" ? "#fff" : D.ink,
                }}>
                    All <span style={{...mwStyles.segCount, background: tab === "today" ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.08)"}}>{dogs.length}</span>
                </button>
                {services.map(s => {
                    const m = SERVICE_META_M[s];
                    const active = tab === s;
                    const count = dogs.filter(d => d.service === s).length;
                    return (
                        <button key={s} onClick={()=>setTab(s)} style={{
                            ...mwStyles.segBtn, height:D.chipH,
                            background: active ? m.color : "rgba(0,0,0,0.06)",
                            color: active ? "#fff" : D.ink,
                        }}>
                            <span style={{marginRight:6}}>{m.icon}</span>{m.label}
                            <span style={{...mwStyles.segCount, background: active ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.08)"}}>{count}</span>
                        </button>
                    );
                })}
            </div>


            {/* Dog list */}
            <div style={mwStyles.list}>
                {filteredDogs.length === 0 ? (
                    <div style={mwStyles.emptyState}>
                        <div style={{fontSize:40,opacity:0.25}}>ð¾</div>
                        <div style={{fontSize:15,fontWeight:600,color:D.sub2,marginTop:8}}>No dogs in this service</div>
                        <button onClick={onAdd} style={{...mwStyles.emptyAdd, background: SERVICE_META_M[tab]?.color || "#00AFF1"}}>+ Add one</button>
                    </div>
                ) : tab === "today" ? (
                    // Grouped view for "All"
                    services.map(s => {
                        const meta = SERVICE_META_M[s];
                        const list = dogs.filter(d => d.service === s);
                        if (list.length === 0) return null;
                        return (
                            <div key={s} style={{marginBottom:16}}>
                                <div style={{...mwStyles.groupHead, background: meta.color}}>
                                    <span><span style={{marginRight:8}}>{meta.icon}</span>{meta.label}</span>
                                    <span style={mwStyles.groupCount}>{list.length}</span>
                                </div>
                                <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:6}}>
                                    {list.map(d => (
                                        <MobileDogRow key={d.id} dog={d} accent={meta.color} D={D}
                                            onTogglePhoto={() => onTogglePhoto(d.id)}
                                            onToggleWalk={() => onToggleWalk(d.id)} />
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {filteredDogs.map(d => (
                            <MobileDogRow key={d.id} dog={d} accent={SERVICE_META_M[tab].color} D={D}
                                onTogglePhoto={() => onTogglePhoto(d.id)}
                                onToggleWalk={() => onToggleWalk(d.id)} />
                        ))}
                    </div>
                )}
                <div style={{height:88}}/>
            </div>


            {/* Sticky bottom dock: FAB + tab bar */}
            <div style={mwStyles.bottomDock}>
                <div style={mwStyles.fabRow}>
                    <button onClick={onAdd} style={{...mwStyles.fab, pointerEvents:"auto"}}>
                        <span style={{fontSize:24,lineHeight:1,marginRight:6,fontWeight:300}}>+</span>
                        Add dog
                    </button>
                </div>
                <div style={{...mwStyles.bottomNav, minHeight:D.navH}}>
                    {[
                        {id:"today", icon:"ð", label:"Today"},
                        {id:"vans",  icon:"ð", label:"Vans"},
                        {id:"reports", icon:"ð", label:"Reports"},
                        {id:"notes", icon:"ð", label:"Notes"},
                    ].map(t => (
                        <button key={t.id} onClick={()=>setNavTab(t.id)} style={{
                            ...mwStyles.navBtn,
                            color: navTab === t.id ? "#00AFF1" : D.sub2,
                        }}>
                            <span style={{fontSize:22,lineHeight:1}}>{t.icon}</span>
                            <span style={{fontSize:10,fontWeight:700,marginTop:3,letterSpacing:"0.02em"}}>{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


function MobileDogRow({ dog, accent, D, onTogglePhoto, onToggleWalk }) {
    // Van pill colour by code prefix: B = blue van, D = amber, S = green, P = neutral
    const vanColor = (v) => {
        if (!v) return null;
        if (v === "P" || v.startsWith("P")) return "#8E8E93";
        if (v.startsWith("B")) return "#00AFF1";
        if (v.startsWith("D")) return "#FF9500";
        if (v.startsWith("S")) return "#34C759";
        return "#8E8E93";
    };
    const VanPill = ({ slot, code }) => (
        <span style={{
            display:"inline-flex",alignItems:"center",gap:3,
            background: code ? `${vanColor(code)}1A` : "rgba(0,0,0,0.04)",
            color: code ? vanColor(code) : "#C7C7CC",
            padding:"2px 6px",borderRadius:6,
            fontSize:10,fontWeight:800,letterSpacing:"0.02em",
            fontVariantNumeric:"tabular-nums",
        }}>
            <span style={{opacity:0.65,fontSize:9}}>{slot}</span>
            {code || "â"}
        </span>
    );


    return (
        <div style={{
            display:"flex",alignItems:"center",gap:10,
            background:"#fff",borderRadius:12,
            padding:"10px 10px 10px 12px",
            minHeight: D.rowH,
            borderLeft: `4px solid ${accent}`,
            boxShadow:"0 0.5px 0 rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.04)",
        }}>
            <div style={{
                width:38,height:38,borderRadius:9999,
                background:"linear-gradient(135deg,#E5E5EA,#C7C7CC)",
                color:D.ink,fontWeight:700,fontSize:14,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
            }}>{dog.name[0]}{dog.surname ? dog.surname[0] : ""}</div>
            <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:D.font,fontWeight:700,color:D.ink,letterSpacing:"-0.01em",lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {dog.name}{dog.surname && <span style={{fontWeight:500,color:D.sub2}}> {dog.surname}</span>}
                </div>
                <div style={{fontSize:D.sub - 1,color:D.sub2,fontWeight:500,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {dog.breed}
                </div>
                <div style={{display:"flex",gap:5,marginTop:5,alignItems:"center"}}>
                    <VanPill slot="AM" code={dog.vanAm}/>
                    <VanPill slot="PM" code={dog.vanPm}/>
                </div>
            </div>
            {/* Walk checkbox â only meaningful if needsWalk */}
            <button
                onClick={() => dog.needsWalk && onToggleWalk && onToggleWalk()}
                title={dog.needsWalk ? (dog.walkDone ? "Walk done" : "Walk pending") : "No walk booked"}
                disabled={!dog.needsWalk}
                style={{
                    width:38,height:38,borderRadius:10,
                    border: dog.needsWalk ? "none" : "1px dashed #E5E5EA",
                    cursor: dog.needsWalk ? "pointer" : "default",
                    flexShrink:0,
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                    background: !dog.needsWalk ? "transparent"
                              : dog.walkDone ? "#34C759"
                              : "rgba(52,199,89,0.12)",
                    color: !dog.needsWalk ? "#C7C7CC"
                         : dog.walkDone ? "#fff"
                         : "#1E8E3E",
                    fontSize: 14, fontWeight:800,
                }}>
                <span style={{fontSize:14,lineHeight:1}}>{dog.needsWalk ? (dog.walkDone ? "â" : "ð¶") : "â"}</span>
                <span style={{fontSize:8,fontWeight:700,letterSpacing:"0.04em",marginTop:1,opacity:0.85}}>WALK</span>
            </button>
            <button onClick={onTogglePhoto} style={{
                width:38,height:38,borderRadius:10,
                border:"none",cursor:"pointer",flexShrink:0,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                background: dog.photoDone ? "rgba(52,199,89,.14)" : "rgba(0,175,241,.10)",
                color: dog.photoDone ? "#1E8E3E" : "#00AFF1",
                fontWeight:700,
            }}>
                <span style={{fontSize:14,lineHeight:1}}>{dog.photoDone ? "â" : "ð¸"}</span>
                <span style={{fontSize:8,fontWeight:700,letterSpacing:"0.04em",marginTop:1,opacity:0.85}}>PHOTO</span>
            </button>
        </div>
    );
}


const mwStyles = {
    frame: {
        position:"relative",
        background:"#F2F2F7",
        minHeight:"100%",
        display:"flex",flexDirection:"column",
    },
    topBar: {
        position:"sticky",top:0,zIndex:10,
        background:"rgba(249,249,249,0.94)",
        backdropFilter:"saturate(180%) blur(20px)",
        WebkitBackdropFilter:"saturate(180%) blur(20px)",
        borderBottom:"0.5px solid rgba(60,60,67,0.18)",
        padding:"10px 16px",
        display:"flex",alignItems:"center",gap:10,
    },
    modeBtn: {
        width:40,height:40,borderRadius:9999,
        border:"none",cursor:"pointer",fontSize:18,fontWeight:700,
        flexShrink:0,
    },
    statStrip: {
        background:"#fff",
        margin:"10px 16px 0",
        borderRadius:14,
        padding:"12px 8px",
        display:"flex",alignItems:"center",
        boxShadow:"0 0.5px 0 rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.04)",
    },
    statBlock: {flex:1,textAlign:"center"},
    statDivider: {width:1,height:28,background:"#E5E5EA"},
    statNum: {fontSize:22,fontWeight:800,letterSpacing:"-0.02em",fontVariantNumeric:"tabular-nums",lineHeight:1},
    statLabel: {fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginTop:4},
    segScroller: {
        display:"flex",gap:8,
        padding:"12px 16px 8px",
        overflowX:"auto",
        scrollbarWidth:"none",
    },
    segBtn: {
        flexShrink:0,
        padding:"0 14px",
        borderRadius:9999,
        border:"none",cursor:"pointer",
        fontFamily:"inherit",fontSize:14,fontWeight:700,
        display:"inline-flex",alignItems:"center",
        whiteSpace:"nowrap",
    },
    segCount: {
        marginLeft:8,
        padding:"2px 8px",borderRadius:9999,
        fontSize:11,fontWeight:800,
    },
    list: {
        padding:"4px 16px 0",
        flex:1,overflowY:"auto",
    },
    groupHead: {
        padding:"8px 12px",borderRadius:10,
        color:"#fff",fontWeight:700,fontSize:13,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        textTransform:"uppercase",letterSpacing:"0.04em",
    },
    groupCount: {
        background:"rgba(255,255,255,0.28)",
        padding:"2px 10px",borderRadius:9999,
        fontSize:11,fontWeight:800,
    },
    emptyState: {
        textAlign:"center",padding:"48px 24px",
    },
    emptyAdd: {
        marginTop:16,
        height:44,padding:"0 20px",
        borderRadius:9999,border:"none",cursor:"pointer",
        color:"#fff",fontSize:14,fontWeight:700,fontFamily:"inherit",
    },
    fab: {
        height:52,padding:"0 22px",
        borderRadius:9999,
        background:"#00AFF1",color:"#fff",
        border:"none",cursor:"pointer",
        fontSize:15,fontWeight:700,fontFamily:"inherit",
        display:"flex",alignItems:"center",
        boxShadow:"0 8px 24px rgba(0,175,241,0.40), 0 2px 6px rgba(0,0,0,0.12)",
    },
    fabRow: {
        display:"flex",justifyContent:"flex-end",
        padding:"0 16px 12px",
        pointerEvents:"none",
    },
    bottomDock: {
        position:"sticky",bottom:0,zIndex:11,
        marginTop:"auto",
    },
    bottomNav: {
        background:"rgba(249,249,249,0.94)",
        backdropFilter:"saturate(180%) blur(20px)",
        WebkitBackdropFilter:"saturate(180%) blur(20px)",
        borderTop:"0.5px solid rgba(60,60,67,0.18)",
        display:"flex",
        paddingBottom:"max(8px, env(safe-area-inset-bottom))",
    },
    navBtn: {
        flex:1,minHeight:60,
        background:"none",border:"none",cursor:"pointer",
        fontFamily:"inherit",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        padding:"6px 0",
    },
};


window.MobileWhiteboard = MobileWhiteboard;
