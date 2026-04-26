import express from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync } from "node:fs";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "whiteboard.sqlite");
const PUBLIC_DIR = path.join(ROOT, "public");


if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });


const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");


// Schema --------------------------------------------------------------
db.exec(`
CREATE TABLE IF NOT EXISTS dogs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    surname     TEXT    NOT NULL DEFAULT '',
    breed       TEXT    NOT NULL DEFAULT 'Mixed breed',
    service     TEXT    NOT NULL,
    van_am      TEXT    NOT NULL DEFAULT '',
    van_pm      TEXT    NOT NULL DEFAULT '',
    needs_walk  INTEGER NOT NULL DEFAULT 1,
    walk_done   INTEGER NOT NULL DEFAULT 0,
    photo_done  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
`);


// Seed if empty -------------------------------------------------------
const count = db.prepare("SELECT COUNT(*) AS n FROM dogs").get().n;
if (count === 0) {
    const insert = db.prepare(`
        INSERT INTO dogs (name, surname, breed, service, van_am, van_pm, needs_walk, walk_done, photo_done)
        VALUES (@name, @surname, @breed, @service, @van_am, @van_pm, @needs_walk, @walk_done, @photo_done)
    `);
    const seed = [
        { name:"Tilly",  surname:"Hughes",     breed:"Cockapoo",         service:"half-am",  van_am:"BV1", van_pm:"P",   needs_walk:1, walk_done:0, photo_done:1 },
        { name:"Bear",   surname:"Whittaker",  breed:"Labrador",         service:"full",     van_am:"BV1", van_pm:"BV2", needs_walk:1, walk_done:1, photo_done:1 },
        { name:"Ziggy",  surname:"Jones",      breed:"Border Collie",    service:"boarding", van_am:"DV1", van_pm:"DV1", needs_walk:1, walk_done:0, photo_done:0 },
        { name:"Mabel",  surname:"Carter",     breed:"French Bulldog",   service:"half-am",  van_am:"DV2", van_pm:"P",   needs_walk:0, walk_done:0, photo_done:0 },
        { name:"Rufus",  surname:"Patel",      breed:"Golden Retriever", service:"full",     van_am:"SV1", van_pm:"SV1", needs_walk:1, walk_done:1, photo_done:1 },
        { name:"Pippa",  surname:"Okafor",     breed:"Spaniel",          service:"full",     van_am:"P",   van_pm:"BV2", needs_walk:1, walk_done:0, photo_done:0 },
        { name:"Otto",   surname:"Lindgren",   breed:"Dachshund",        service:"school",   van_am:"P",   van_pm:"P",   needs_walk:0, walk_done:0, photo_done:1 },
        { name:"Luna",   surname:"Ashton",     breed:"Whippet",          service:"boarding", van_am:"",    van_pm:"",    needs_walk:1, walk_done:1, photo_done:1 },
        { name:"Hugo",   surname:"Bennett",    breed:"Cocker Spaniel",   service:"full",     van_am:"DV1", van_pm:"DV1", needs_walk:1, walk_done:0, photo_done:0 },
        { name:"Daisy",  surname:"Reilly",     breed:"Cavapoo",          service:"grooming", van_am:"P",   van_pm:"P",   needs_walk:0, walk_done:0, photo_done:0 },
        { name:"Marlow", surname:"Sato",       breed:"Vizsla",           service:"full",     van_am:"SV1", van_pm:"SV1", needs_walk:1, walk_done:1, photo_done:1 },
        { name:"Bonnie", surname:"McAllister", breed:"Bichon Frise",     service:"half-am",  van_am:"BV1", van_pm:"P",   needs_walk:0, walk_done:0, photo_done:1 },
    ];
    const tx = db.transaction(rows => rows.forEach(r => insert.run(r)));
    tx(seed);
    console.log(`Seeded ${seed.length} dogs.`);
}


// Helpers -------------------------------------------------------------
const rowToDog = (r) => ({
    id: r.id,
    name: r.name,
    surname: r.surname,
    breed: r.breed,
    service: r.service,
    vanAm: r.van_am,
    vanPm: r.van_pm,
    needsWalk: !!r.needs_walk,
    walkDone: !!r.walk_done,
    photoDone: !!r.photo_done,
});


// API -----------------------------------------------------------------
const app = express();
app.use(express.json());
app.use((req, _res, next) => { console.log(`${new Date().toISOString()} ${req.method} ${req.url}`); next(); });


app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));


app.get("/api/dogs", (_req, res) => {
    const rows = db.prepare("SELECT * FROM dogs ORDER BY id").all();
    res.json(rows.map(rowToDog));
});


app.post("/api/dogs", (req, res) => {
    const b = req.body || {};
    if (!b.name || !String(b.name).trim()) return res.status(400).json({ error: "name is required" });
    const valid = ["half-am","half-pm","full","boarding","school","grooming"];
    const service = valid.includes(b.service) ? b.service : "full";
    const stmt = db.prepare(`
        INSERT INTO dogs (name, surname, breed, service, van_am, van_pm, needs_walk, walk_done, photo_done)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
        String(b.name).trim(),
        String(b.surname || "").trim(),
        String(b.breed || "Mixed breed").trim(),
        service,
        String(b.vanAm || ""),
        String(b.vanPm || ""),
        b.needsWalk ? 1 : 0,
        b.walkDone ? 1 : 0,
        b.photoDone ? 1 : 0,
    );
    const row = db.prepare("SELECT * FROM dogs WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(rowToDog(row));
});


app.patch("/api/dogs/:id", (req, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare("SELECT * FROM dogs WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "not found" });
    const b = req.body || {};
    const fields = [];
    const values = [];
    const map = {
        name: "name", surname: "surname", breed: "breed", service: "service",
        vanAm: "van_am", vanPm: "van_pm",
    };
    for (const [k, col] of Object.entries(map)) {
        if (b[k] !== undefined) { fields.push(`${col} = ?`); values.push(String(b[k])); }
    }
    for (const k of ["needsWalk","walkDone","photoDone"]) {
        if (b[k] !== undefined) {
            const col = k === "needsWalk" ? "needs_walk" : k === "walkDone" ? "walk_done" : "photo_done";
            fields.push(`${col} = ?`); values.push(b[k] ? 1 : 0);
        }
    }
    if (fields.length === 0) return res.json(rowToDog(existing));
    values.push(id);
    db.prepare(`UPDATE dogs SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    const row = db.prepare("SELECT * FROM dogs WHERE id = ?").get(id);
    res.json(rowToDog(row));
});


app.delete("/api/dogs/:id", (req, res) => {
    const id = Number(req.params.id);
    const info = db.prepare("DELETE FROM dogs WHERE id = ?").run(id);
    if (info.changes === 0) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
});


// Reset endpoint for the trial â clears DB and re-seeds on next request.
app.post("/api/_reset", (_req, res) => {
    db.exec("DELETE FROM dogs; DELETE FROM sqlite_sequence WHERE name='dogs';");
    res.json({ ok: true, message: "Restart the server to re-seed." });
});


// Static frontend -----------------------------------------------------
app.use(express.static(PUBLIC_DIR));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n  Fairy Tails â test trial`);
    console.log(`  ââââââââââââââââââââââââ`);
    console.log(`  Server   http://localhost:${PORT}`);
    console.log(`  Frontend http://localhost:${PORT}/`);
    console.log(`  API      http://localhost:${PORT}/api/dogs`);
    console.log(`  DB       ${DB_PATH}\n`);
});
