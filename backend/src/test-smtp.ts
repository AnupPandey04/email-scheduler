import "dotenv/config";
import { verifyEmailTransporter } from "./services/mail.service.js";

verifyEmailTransporter()
  .then(() => {
    console.log("SMTP test passed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("SMTP test failed:", error);
    process.exit(1);
  });