import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PROGRAM_VERSION = "3.10";
const EXPECTED = {
  regions: 8,
  modelBuildings: 15,
  buildingUses: 15,
  frameTypes: 14,
  glassTypes: 156,
  insulationTypes: 73,
  insulationMajors: 14,
  insulationChildren: 59,
  envelopeParts: 3,
  orientations: 7,
  insulationInputMethods: 5,
} as const;

type InsulationSeedRow = { major: string; minor: string | null };

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

async function upsertInsulationType(row: InsulationSeedRow, sortOrder: number) {
  const data = {
    programVersion: PROGRAM_VERSION,
    categoryMajor: row.major,
    categoryMinor: row.minor,
    sheetValueMajor: row.major,
    sheetValueMinor: row.minor,
    sortOrder,
  };

  // Prisma の compound unique where は nullable 列に null を渡せないため分岐する（DEC-18）。
  if (row.minor === null) {
    const existing = await prisma.masterInsulationType.findFirst({
      where: {
        programVersion: PROGRAM_VERSION,
        sheetValueMajor: row.major,
        sheetValueMinor: null,
      },
    });
    if (existing) {
      await prisma.masterInsulationType.update({
        where: { id: existing.id },
        data: {
          categoryMajor: row.major,
          categoryMinor: null,
          sortOrder,
        },
      });
      return;
    }
    await prisma.masterInsulationType.create({ data });
    return;
  }

  await prisma.masterInsulationType.upsert({
    where: {
      programVersion_sheetValueMajor_sheetValueMinor: {
        programVersion: PROGRAM_VERSION,
        sheetValueMajor: row.major,
        sheetValueMinor: row.minor,
      },
    },
    create: data,
    update: {
      categoryMajor: row.major,
      categoryMinor: row.minor,
      sortOrder,
    },
  });
}

async function main() {
  const regions = loadJson<string[]>("regions.json");
  const modelNames = loadJson<string[]>("model-buildings.json");
  const buildingUses = loadJson<Array<{ use: string; model: string }>>(
    "building-uses.json",
  );
  const frameTypes = loadJson<string[]>("frame-types.json");
  const glassTypes = loadJson<string[]>("glass-types.json");
  const insulationTypes = loadJson<InsulationSeedRow[]>("insulation-types.json");
  const envelopeParts = loadJson<string[]>("envelope-parts.json");
  const orientations = loadJson<string[]>("orientations.json");
  const insulationInputMethods = loadJson<
    Array<{ methodCode: string; sheetValue: string }>
  >("insulation-input-methods.json");

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
  if (frameTypes.length !== EXPECTED.frameTypes) {
    throw new Error(
      `frame-types.json は ${EXPECTED.frameTypes} 件であるべき。実際: ${frameTypes.length}`,
    );
  }
  if (glassTypes.length !== EXPECTED.glassTypes) {
    throw new Error(
      `glass-types.json は ${EXPECTED.glassTypes} 件であるべき。実際: ${glassTypes.length}`,
    );
  }
  if (new Set(glassTypes).size !== EXPECTED.glassTypes) {
    throw new Error("glass-types.json に重複がある");
  }
  if (insulationTypes.length !== EXPECTED.insulationTypes) {
    throw new Error(
      `insulation-types.json は ${EXPECTED.insulationTypes} 件であるべき。実際: ${insulationTypes.length}`,
    );
  }
  const majorOnlyRows = insulationTypes.filter((row) => row.minor === null);
  const childRows = insulationTypes.filter((row) => row.minor !== null);
  if (majorOnlyRows.length !== EXPECTED.insulationMajors) {
    throw new Error(
      `断熱材の大分類のみ行は ${EXPECTED.insulationMajors} 件であるべき。実際: ${majorOnlyRows.length}`,
    );
  }
  if (childRows.length !== EXPECTED.insulationChildren) {
    throw new Error(
      `断熱材の小分類行は ${EXPECTED.insulationChildren} 件であるべき。実際: ${childRows.length}`,
    );
  }
  const insulationKeys = new Set(
    insulationTypes.map((row) => `${row.major}\0${row.minor ?? ""}`),
  );
  if (insulationKeys.size !== insulationTypes.length) {
    throw new Error("insulation-types.json に (major, minor) の重複がある");
  }
  if (envelopeParts.length !== EXPECTED.envelopeParts) {
    throw new Error(
      `envelope-parts.json は ${EXPECTED.envelopeParts} 件であるべき。実際: ${envelopeParts.length}`,
    );
  }
  if (orientations.length !== EXPECTED.orientations) {
    throw new Error(
      `orientations.json は ${EXPECTED.orientations} 件であるべき。実際: ${orientations.length}`,
    );
  }
  if (insulationInputMethods.length !== EXPECTED.insulationInputMethods) {
    throw new Error(
      `insulation-input-methods.json は ${EXPECTED.insulationInputMethods} 件であるべき。実際: ${insulationInputMethods.length}`,
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

  for (const [index, sheetValue] of frameTypes.entries()) {
    await prisma.masterFrameType.upsert({
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

  for (const [index, sheetValue] of glassTypes.entries()) {
    await prisma.masterGlassType.upsert({
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

  for (const [index, row] of insulationTypes.entries()) {
    await upsertInsulationType(row, index + 1);
  }

  for (const [index, sheetValue] of envelopeParts.entries()) {
    await prisma.masterEnvelopePart.upsert({
      where: {
        programVersion_sheetValue: {
          programVersion: PROGRAM_VERSION,
          sheetValue,
        },
      },
      create: {
        programVersion: PROGRAM_VERSION,
        sheetValue,
        sortOrder: index + 1,
      },
      update: { sortOrder: index + 1 },
    });
  }

  for (const [index, sheetValue] of orientations.entries()) {
    await prisma.masterOrientation.upsert({
      where: {
        programVersion_sheetValue: {
          programVersion: PROGRAM_VERSION,
          sheetValue,
        },
      },
      create: {
        programVersion: PROGRAM_VERSION,
        sheetValue,
        sortOrder: index + 1,
      },
      update: { sortOrder: index + 1 },
    });
  }

  for (const [index, row] of insulationInputMethods.entries()) {
    await prisma.masterInsulationInputMethod.upsert({
      where: {
        programVersion_methodCode: {
          programVersion: PROGRAM_VERSION,
          methodCode: row.methodCode,
        },
      },
      create: {
        programVersion: PROGRAM_VERSION,
        methodCode: row.methodCode,
        sheetValue: row.sheetValue,
        displayName: row.sheetValue,
        sortOrder: index + 1,
      },
      update: {
        sheetValue: row.sheetValue,
        displayName: row.sheetValue,
        sortOrder: index + 1,
      },
    });
  }

  console.log(
    `seed 3.10: regions=${regions.length} modelBuildings=${modelNames.length} buildingUses=${buildingUses.length} frameTypes=${frameTypes.length} glassTypes=${glassTypes.length} insulationTypes=${insulationTypes.length} envelopeParts=${envelopeParts.length} orientations=${orientations.length} insulationInputMethods=${insulationInputMethods.length}`,
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
