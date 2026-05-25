import { initDb } from './_lib/db';
import app from './_lib/index';

initDb().catch(console.error);

export default app;
