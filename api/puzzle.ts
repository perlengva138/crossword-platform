import dotenv from "dotenv";
import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// vercel dev isn't reliably injecting env vars for this project's repo-linked
// setup, so load .env.local explicitly as a fallback. In production on
// Vercel, real env vars are already set on process.env and dotenv will not
// override them, so this is safe to leave in.
dotenv.config({ path: ".env.local" });

function generateId(): string {
    return Math.random().toString(36).slice(2, 8);
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {

    // TEMPORARY DEBUG — remove once KV_REST_API_URL / KV_REST_API_TOKEN show up correctly
    console.log("DEBUG env check:", {
        hasUrl: Boolean(process.env.KV_REST_API_URL),
        hasToken: Boolean(process.env.KV_REST_API_TOKEN),
        allEnvKeys: Object.keys(process.env).filter(k => k.includes("KV") || k.includes("REDIS") || k.includes("UPSTASH"))
    });

    const redis = new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!
    });

    if (req.method === "POST") {
        try {
            const puzzle = req.body;

            if (!puzzle || typeof puzzle !== "object") {
                return res.status(400).json({ error: "Invalid puzzle payload" });
            }

            const id = generateId();

            // store as a JSON string; Upstash's REST API is happiest with strings
            await redis.set(`puzzle:${id}`, JSON.stringify(puzzle));

            return res.status(200).json({ id });
        } catch (err) {
            console.error("Failed to save puzzle:", err);
            return res.status(500).json({ error: "Failed to save puzzle" });
        }
    }

    if (req.method === "GET") {
        try {
            const { id } = req.query;

            if (!id || typeof id !== "string") {
                return res.status(400).json({ error: "Missing id" });
            }

            const raw = await redis.get(`puzzle:${id}`);

            if (!raw) {
                return res.status(404).json({ error: "Puzzle not found" });
            }

            // @upstash/redis may already parse JSON automatically depending on
            // version; handle both a string and an already-parsed object.
            const puzzle = typeof raw === "string" ? JSON.parse(raw) : raw;

            return res.status(200).json(puzzle);
        } catch (err) {
            console.error("Failed to load puzzle:", err);
            return res.status(500).json({ error: "Failed to load puzzle" });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end();
}