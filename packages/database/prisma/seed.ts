import { resetAndSeedAllUnderRhine } from "../scripts/reseed-rhine-master-303";

async function main() {
  await resetAndSeedAllUnderRhine();
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  });
