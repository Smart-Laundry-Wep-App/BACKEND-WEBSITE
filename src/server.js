import app from "./app.js";
import { config } from "./config/env.js";
import { db } from "./models/db.js";

const PORT = config.port;

// Ensure database is initialized
db.init();

app.listen(PORT, () => {
  console.log("=================================================");
  console.log("  🧺 SCA SMART LAUNDRY - BACKEND EXPRESS.JS");
  console.log("=================================================");
  console.log(`  🚀 Server running at : http://localhost:${PORT}`);
  console.log(`  📄 API Catalog       : http://localhost:${PORT}/api`);
  console.log(`  ❤️  Health Check      : http://localhost:${PORT}/api/health`);
  console.log(`  🛠️  Environment       : ${config.nodeEnv}`);
  console.log("=================================================");
});
