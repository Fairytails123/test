/* global React */
const { useState: useStateAdd } = React;


const VAN_OPTIONS = ["BV1","BV2","DV1","DV2","SV1","P","â"];


function AddDogSheet({ open, onClose, onAdd }) {
    const [name, setName] = useStateAdd("");
    const [surname, setSurname] = useStateAdd("");
    const [breed, setBreed] = useStateAdd("");
    const [service, setService] = useStateAdd("full");
    const [vanAm, setVanAm] = useStateAdd("");
    const [vanPm, setVanPm] = useStateAdd("");
    const [needsWalk, setNeedsWalk] = useStateAdd(true);


    const [error, setError] = useStateAdd("");


    if (!open) return null;


    const submit = () => {
        if (!name.trim()) {
            setError("First name is required");
            return;
        }
        setError("");
        onAdd({
            name: name.trim(),
            surname: surname.trim(),
            breed: breed.trim() || "Mixed breed",
            service,
            vanAm, vanPm,
            needsWalk,
            walkDone: false,
        });
        setName(""); setSurname(""); setBreed("");
        setService("full"); setVanAm(""); setVanPm("");
        setNeedsWalk(true);
    };


    const VanRow = ({ slot, value, setValue }) => (
        <div style={{display:"flex",gap:5,marginBottom:6,flexWrap:"wrap"}}>
            <div style={{
                width:32,fontSize:11,fontWeight:800,color:"#8E8E93",
                letterSpacing:"0.05em",textTransform:"uppercase",
                display:"flex",alignItems:"center",
            }}>{slot}</div>
            {VAN_OPTIONS.map(v => {
                const isSel = (value === v) || (v === "â" && !value);
                const isParent = v === "P";
                const accent = isParent ? "#8E8E93" : "#00AFF1";
                return (
                    <button key={v} onClick={()=>setValue(v === "â" ? "" : v)}
                        style={{
                            ...adStyles.vanPill,
                            background: isSel ? accent : `${accent}14`,
                            color: isSel ? "#fff" : accent,
                        }}>{v}</button>
                );
            })}
        </div>
    );


    return (
        <div style={adStyles.scrim} onClick={onClose}>
            <div style={adStyles.sheet} onClick={e => e.stopPropagation()}>
                <div style={adStyles.handle}/>
                <div style={adStyles.title}>Add dog to today</div>
                <div style={adStyles.subtitle}>They'll appear in the chosen service column.</div>


                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                        <label style={adStyles.label}>First name</label>
                        <input value={name} onChange={e=>{setName(e.target.value); if(error) setError("");}}
                               placeholder="Tilly"
                               style={{...adStyles.input, boxShadow: error ? "0 0 0 2px #FF3B30" : "none"}}
                               autoFocus/>
                    </div>
                    <div>
                        <label style={adStyles.label}>Surname</label>
                        <input value={surname} onChange={e=>setSurname(e.target.value)}
                               placeholder="Hughes" style={adStyles.input}/>
                    </div>
                </div>
                {error && <div style={{fontSize:12,color:"#FF3B30",fontWeight:600,marginTop:6}}>{error}</div>}


                <label style={adStyles.label}>Breed</label>
                <input value={breed} onChange={e=>setBreed(e.target.value)}
                       placeholder="e.g. Cockapoo" style={adStyles.input}/>


                <label style={adStyles.label}>Service</label>
                <div style={adStyles.segWrap}>
                    {Object.entries(window.SERVICE_META).map(([id, m]) => (
                        <button key={id} onClick={()=>setService(id)}
                            style={{
                                ...adStyles.seg,
                                background: service === id ? m.color : "transparent",
                                color: service === id ? "#fff" : "#1C1C1E",
                                fontWeight: service === id ? 700 : 600,
                                borderColor: service === id ? m.color : "#E5E5EA",
                            }}>
                            <span style={{marginRight:6}}>{m.icon}</span>{m.label}
                        </button>
                    ))}
                </div>


                <label style={adStyles.label}>Van  Â·  P = parent pickup</label>
                <VanRow slot="AM" value={vanAm} setValue={setVanAm}/>
                <VanRow slot="PM" value={vanPm} setValue={setVanPm}/>


                <label style={adStyles.label}>Walk</label>
                <button onClick={()=>setNeedsWalk(!needsWalk)} style={{
                    ...adStyles.walkToggle,
                    background: needsWalk ? "rgba(52,199,89,0.14)" : "rgba(0,0,0,0.04)",
                    color: needsWalk ? "#1E8E3E" : "#8E8E93",
                    borderColor: needsWalk ? "#34C759" : "#E5E5EA",
                }}>
                    <span style={{
                        width:22,height:22,borderRadius:6,
                        background: needsWalk ? "#34C759" : "transparent",
                        border: needsWalk ? "none" : "2px solid #C7C7CC",
                        color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:13,fontWeight:800,
                    }}>{needsWalk ? "â" : ""}</span>
                    Booked for a walk today
                </button>


                <div style={{display:"flex",gap:10,marginTop:18}}>
                    <button onClick={onClose} style={adStyles.cancelBtn}>Cancel</button>
                    <button onClick={submit} style={adStyles.confirmBtn}>Add to whiteboard</button>
                </div>
            </div>
        </div>
    );
}


const adStyles = {
    scrim: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 100,
        opacity: 1,
    },
    sheet: {
        width: "100%", maxWidth: 560,
        background: "#fff",
        borderRadius: "22px 22px 0 0",
        padding: "12px 24px 24px",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
        opacity: 1,
        transform: "translateY(0)",
        maxHeight: "90vh",
        overflowY: "auto",
    },
    handle: {
        width: 40, height: 5, borderRadius: 9999,
        background: "#E5E5EA", margin: "0 auto 14px",
    },
    title: { fontSize: 22, fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.02em" },
    subtitle: { fontSize: 13, color: "#8E8E93", fontWeight: 500, marginTop: 2, marginBottom: 14 },
    label: {
        display: "block",
        fontSize: 11, fontWeight: 700, color: "#8E8E93",
        textTransform: "uppercase", letterSpacing: "0.05em",
        marginBottom: 6, marginTop: 12,
    },
    input: {
        width: "100%", padding: "10px 12px",
        background: "#F2F2F7", border: "none",
        borderRadius: 10, fontSize: 15, fontWeight: 500,
        fontFamily: "inherit", color: "#1C1C1E",
        boxSizing: "border-box", minHeight: 44,
    },
    segWrap: {
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6,
        marginBottom: 6,
    },
    seg: {
        padding: "8px 6px", borderRadius: 10,
        border: "1px solid #E5E5EA",
        fontSize: 11, fontFamily: "inherit",
        cursor: "pointer", minHeight: 40,
        transition: "all 150ms ease",
    },
    vanPill: {
        flex: 1, minWidth: 38, height: 36,
        borderRadius: 9999, border: "none",
        fontFamily: "inherit", fontSize: 12, fontWeight: 800,
        cursor: "pointer",
        fontVariantNumeric: "tabular-nums",
    },
    walkToggle: {
        width: "100%", display:"flex", alignItems:"center", gap:10,
        padding: "10px 12px",
        borderRadius: 10, border: "1px solid",
        fontFamily: "inherit", fontSize: 14, fontWeight: 700,
        cursor: "pointer", minHeight: 44,
        textAlign: "left",
    },
    cancelBtn: {
        flex: 1, height: 48, borderRadius: 10,
        background: "rgba(0,175,241,0.08)", color: "#00AFF1",
        border: "none", fontSize: 15, fontWeight: 600, fontFamily: "inherit",
        cursor: "pointer",
    },
    confirmBtn: {
        flex: 2, height: 48, borderRadius: 10,
        background: "#00AFF1", color: "#fff",
        border: "none", fontSize: 15, fontWeight: 700, fontFamily: "inherit",
        cursor: "pointer",
    },
};


window.AddDogSheet = AddDogSheet;
