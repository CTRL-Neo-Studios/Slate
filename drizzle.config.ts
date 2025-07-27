import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./server/database/schema.ts",
    dialect: 'sqlite',
});
