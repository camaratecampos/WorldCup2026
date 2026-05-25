import { initDb } from './db';
import app from './index';

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
