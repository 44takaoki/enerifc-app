-- Enerifc B2: プルダウン用 master_*（データは入れない。seed は B3 以降）
-- 方針: docs/database.md 6 節 / 計画 schema.sql

-- CreateTable
CREATE TABLE "master_region_categories" (
    "id" BIGSERIAL NOT NULL,
    "program_version" VARCHAR(20) NOT NULL,
    "sheet_value" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_region_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_model_buildings" (
    "id" BIGSERIAL NOT NULL,
    "program_version" VARCHAR(20) NOT NULL,
    "sheet_value" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_model_buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_building_uses" (
    "id" BIGSERIAL NOT NULL,
    "program_version" VARCHAR(20) NOT NULL,
    "sheet_value" VARCHAR(200) NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "model_building_id" BIGINT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_building_uses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_frame_types" (
    "id" BIGSERIAL NOT NULL,
    "program_version" VARCHAR(20) NOT NULL,
    "sheet_value" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_frame_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_glass_types" (
    "id" BIGSERIAL NOT NULL,
    "program_version" VARCHAR(20) NOT NULL,
    "sheet_value" VARCHAR(20) NOT NULL,
    "display_name" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_glass_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_insulation_input_methods" (
    "id" BIGSERIAL NOT NULL,
    "program_version" VARCHAR(20) NOT NULL,
    "method_code" CHAR(1) NOT NULL,
    "sheet_value" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_insulation_input_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_insulation_types" (
    "id" BIGSERIAL NOT NULL,
    "program_version" VARCHAR(20) NOT NULL,
    "category_major" VARCHAR(100) NOT NULL,
    "category_minor" VARCHAR(100),
    "thermal_conductivity" DECIMAL(8,4),
    "sheet_value_major" VARCHAR(100) NOT NULL,
    "sheet_value_minor" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_insulation_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_envelope_parts" (
    "id" BIGSERIAL NOT NULL,
    "program_version" VARCHAR(20) NOT NULL,
    "sheet_value" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_envelope_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_orientations" (
    "id" BIGSERIAL NOT NULL,
    "program_version" VARCHAR(20) NOT NULL,
    "sheet_value" VARCHAR(20) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_orientations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_region_categories_program_version_sheet_value_key" ON "master_region_categories"("program_version", "sheet_value");

-- CreateIndex
CREATE UNIQUE INDEX "master_model_buildings_program_version_sheet_value_key" ON "master_model_buildings"("program_version", "sheet_value");

-- CreateIndex
CREATE INDEX "idx_master_building_uses_model" ON "master_building_uses"("model_building_id");

-- CreateIndex
CREATE UNIQUE INDEX "master_building_uses_program_version_sheet_value_key" ON "master_building_uses"("program_version", "sheet_value");

-- CreateIndex
CREATE UNIQUE INDEX "master_frame_types_program_version_sheet_value_key" ON "master_frame_types"("program_version", "sheet_value");

-- CreateIndex
CREATE UNIQUE INDEX "master_glass_types_program_version_sheet_value_key" ON "master_glass_types"("program_version", "sheet_value");

-- CreateIndex
CREATE UNIQUE INDEX "master_insulation_input_methods_program_version_method_code_key" ON "master_insulation_input_methods"("program_version", "method_code");

-- CreateIndex
CREATE UNIQUE INDEX "master_insulation_types_version_major_minor_key" ON "master_insulation_types"("program_version", "sheet_value_major", "sheet_value_minor");

-- CreateIndex
CREATE UNIQUE INDEX "master_envelope_parts_program_version_sheet_value_key" ON "master_envelope_parts"("program_version", "sheet_value");

-- CreateIndex
CREATE UNIQUE INDEX "master_orientations_program_version_sheet_value_key" ON "master_orientations"("program_version", "sheet_value");

-- AddForeignKey
ALTER TABLE "master_region_categories" ADD CONSTRAINT "master_region_categories_program_version_fkey" FOREIGN KEY ("program_version") REFERENCES "master_program_versions"("version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_model_buildings" ADD CONSTRAINT "master_model_buildings_program_version_fkey" FOREIGN KEY ("program_version") REFERENCES "master_program_versions"("version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_building_uses" ADD CONSTRAINT "master_building_uses_program_version_fkey" FOREIGN KEY ("program_version") REFERENCES "master_program_versions"("version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_building_uses" ADD CONSTRAINT "master_building_uses_model_building_id_fkey" FOREIGN KEY ("model_building_id") REFERENCES "master_model_buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_frame_types" ADD CONSTRAINT "master_frame_types_program_version_fkey" FOREIGN KEY ("program_version") REFERENCES "master_program_versions"("version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_glass_types" ADD CONSTRAINT "master_glass_types_program_version_fkey" FOREIGN KEY ("program_version") REFERENCES "master_program_versions"("version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_insulation_input_methods" ADD CONSTRAINT "master_insulation_input_methods_program_version_fkey" FOREIGN KEY ("program_version") REFERENCES "master_program_versions"("version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_insulation_types" ADD CONSTRAINT "master_insulation_types_program_version_fkey" FOREIGN KEY ("program_version") REFERENCES "master_program_versions"("version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_envelope_parts" ADD CONSTRAINT "master_envelope_parts_program_version_fkey" FOREIGN KEY ("program_version") REFERENCES "master_program_versions"("version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_orientations" ADD CONSTRAINT "master_orientations_program_version_fkey" FOREIGN KEY ("program_version") REFERENCES "master_program_versions"("version") ON DELETE RESTRICT ON UPDATE CASCADE;
