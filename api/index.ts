import { startServer } from '../server/_core/index.js';

export default async function handler(req: any, res: any) {
    const app = await startServer();
    return app(req, res);
}

// Ensure Express server runs on Node.js runtime
export const runtime = "nodejs";
