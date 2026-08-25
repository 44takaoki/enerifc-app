import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PROGRAM_VERSION = "3.10";
const EXPECTED = {
  regions: 8,
  modelBuildings: 15,
  buildingUses: 15,
} as const;

const prisma = new PrismaClient();
const dataDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "seed",
  "data",
  "v3.10",
);

function loadJson<T>(fileName: string): T {
  return JSON.parse(readFileSync(join(dataDir, fileName), "utf8")) as T;
}

async function main() {
  const regions = loadJson<string[]>("regions.json");
  const modelNames = loadJson<string[]>("model-buildings.json");
  const buildingUses = loadJson<Array<{ use: string; model: string }>>(
    "building-uses.json",
  );

  if (regions.length !== EXPECTED.regions) {
    throw new Error(
      `regions.json は ${EXPECTED.regions} 件であるべき（docs/master-data.md）。実際: ${regions.length}`,
    );
  }
  if (modelNames.length !== EXPECTED.modelBuildings) {
    throw new Error(
      `model-buildings.json は ${EXPECTED.modelBuildings} 件であるべき。実際: ${modelNames.length}`,
    );
  }
  if (buildingUses.length !== EXPECTED.buildingUses) {
    throw new Error(
      `building-uses.json は ${EXPECTED.buildingUses} 件であるべき。実際: ${buildingUses.length}`,
    );
  }

  await prisma.masterProgramVersion.upsert({
    where: { version: PROGRAM_VERSION },
    create: {
      version: PROGRAM_VERSION,
      displayName: "モデル建物法 Ver.3.10",
      isActive: true,
    },
    update: { displayName: "モデル建物法 Ver.3.10", isActive: true },
  });

  for (const [index, sheetValue] of regions.entries()) {
    await prisma.masterRegionCategory.upsert({
      where: {
        programVersion_sheetValue: {
          programVersion: PROGRAM_VERSION,
          sheetValue,
        },
      },
      create: {
        programVersion: PROGRAM_VERSION,
        sheetValue,
        displayName: sheetValue,
        sortOrder: index + 1,
      },
      update: { displayName: sheetValue, sortOrder: index + 1 },
    });
  }

  for (const [index, sheetValue] of modelNames.entries()) {
    await prisma.masterModelBuilding.upsert({
      where: {
        programVersion_sheetValue: {
          programVersion: PROGRAM_VERSION,
          sheetValue,
        },
      },
      create: {
        programVersion: PROGRAM_VERSION,
        sheetValue,
        displayName: sheetValue,
        description: `国定の${sheetValue}の設備前提で算出`,
        sortOrder: index + 1,
      },
      update: {
        displayName: sheetValue,
        description: `国定の${sheetValue}の設備前提で算出`,
        sortOrder: index + 1,
      },
    });
  }

  for (const [index, row] of buildingUses.entries()) {
    const model = await prisma.masterModelBuilding.findUnique({
      where: {
        programVersion_sheetValue: {
          programVersion: PROGRAM_VERSION,
          sheetValue: row.model,
        },
      },
    });
    if (!model) {
      throw new Error(`モデル建物が見つからない: ${row.model}`);
    }

    await prisma.masterBuildingUse.upsert({
      where: {
        programVersion_sheetValue: {
          programVersion: PROGRAM_VERSION,
          sheetValue: row.use,
        },
      },
      create: {
        programVersion: PROGRAM_VERSION,
        sheetValue: row.use,
        displayName: row.use,
        modelBuildingId: model.id,
        sortOrder: index + 1,
      },
      update: {
        displayName: row.use,
        modelBuildingId: model.id,
        sortOrder: index + 1,
      },
    });
  }

  console.log(
    `seed 3.10: regions=${regions.length} modelBuildings=${modelNames.length} buildingUses=${buildingUses.length}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
