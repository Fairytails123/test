/* global React */


function Toast({ message, kind = "info" }) {
    if (!message) return null;
    const colors = {
        success: { bg: "#34C759", icon: "â" },
        info:    { bg: "#00AFF1", icon: "â»" },
        warning: { bg: "#FF9500", icon: "!" },
    };
    const c = colors[kind] || colors.info;
    return (
        <div style={{
            position: "fixed",
            bottom: 24, left: "50%", transform: "translate(-50%, 0)",
            background: c.bg, color: "#fff",
            padding: "12px 18px", borderRadius: 9999,
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 14, fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            zIndex: 200,
        }}>
            <span style={{
                width: 22, height: 22, borderRadius: 9999,
                background: "rgba(255,255,255,0.25)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
            }}>{c.icon}</span>
            {message}
        </div>
    );
}


window.Toast = Toast;
