import { config } from "dotenv";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

class EnvironmentChecker {
  private requiredEnvVars = [
    "NEXT_PUBLIC_STRAPI_API_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
  ];

  constructor() {
    config();
  }

  public async check() {
    this.checkEnvVars();
    await this.checkStrapiConnection();
  }

  private checkEnvVars() {
    const missingVars = this.requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    if (missingVars.length > 0) {
      console.error("❌ Missing required environment variables:");
      missingVars.forEach((envVar) => console.error(`   - ${envVar}`));
      process.exit(1);
    }

    console.log("✅ All required environment variables are set");
  }

  private async checkStrapiConnection() {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

    try {
      const response = await fetch(`${strapiUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`Strapi health check failed: ${response.statusText}`);
      }
      console.log("✅ Successfully connected to Strapi");
    } catch (error) {
      console.error("❌ Failed to connect to Strapi:", error);
      process.exit(1);
    }
  }
}

const checker = new EnvironmentChecker();
checker.check().catch((error) => {
  console.error("❌ Environment check failed:", error);
  process.exit(1);
});
