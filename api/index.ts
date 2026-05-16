import { startServer } from '../server/_core/index';

export default async function handler(req: any, res: any) {
    const app = await startServer();
    return app(req, res);
}
