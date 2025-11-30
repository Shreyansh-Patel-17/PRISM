import { NextRequest } from "next/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const store = new Map<string, { count: number; start: number }>();

export default async function rateLimit(req: NextRequest) {
	const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
	const now = Date.now();
	const entry = store.get(ip) || { count: 0, start: now };
	if (now - entry.start > WINDOW_MS) {
		entry.count = 0;
		entry.start = now;
	}
	entry.count += 1;
	store.set(ip, entry);
	if (entry.count > MAX_REQUESTS) {
		const err: any = new Error("Too many requests");
		err.status = 429;
		throw err;
	}
}
