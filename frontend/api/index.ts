import { initDb } from '../server/db';
import app from '../server/index';

initDb().catch(console.error);

export default app;
