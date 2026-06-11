import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed script is disabled in production");
  }

  const [{ hashPassword }, { seedDevelopmentData }, { sqlClient }] = await Promise.all([
    import("@/lib/password"),
    import("@/lib/db/queries"),
    import("@/lib/db"),
  ]);

  const result = await seedDevelopmentData({
    firstPasswordHash: await hashPassword("password123"),
    secondPasswordHash: await hashPassword("password123"),
  });

  console.log("Seed complete");
  console.log({
    users: [
      { username: result.first.username, password: "password123" },
      { username: result.second.username, password: "password123" },
    ],
    group: result.group.name,
  });

  await sqlClient.end({ timeout: 5 });
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
