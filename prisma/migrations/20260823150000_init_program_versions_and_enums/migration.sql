-- Enerifc B1: PostgreSQL enum とプログラム版マスタ
-- 方針: docs/database.md / docs/master-data.md

-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('draft', 'ifc_extracting', 'review', 'calculating', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "calculation_result_status" AS ENUM ('draft', 'calculating', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "overall_goal_status" AS ENUM ('goal_achieved', 'not_achieved');

-- CreateEnum
CREATE TYPE "data_source" AS ENUM ('ifc_auto', 'manual');

-- CreateEnum
CREATE TYPE "extraction_status" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "ifc_element_kind" AS ENUM ('storey', 'space', 'slab', 'wall', 'roof', 'floor_on_grade', 'window', 'door', 'curtain_wall', 'other');

-- CreateEnum
CREATE TYPE "opening_input_method" AS ENUM ('frame_and_glass', 'frame_and_glass_performance', 'window_performance');

-- CreateEnum
CREATE TYPE "api_run_status" AS ENUM ('pending', 'completed', 'error');

-- CreateTable
CREATE TABLE "master_program_versions" (
    "version" VARCHAR(20) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "released_at" DATE,

    CONSTRAINT "master_program_versions_pkey" PRIMARY KEY ("version")
);

INSERT INTO "master_program_versions" ("version", "display_name", "is_active")
VALUES ('3.10', 'モデル建物法 Ver.3.10', TRUE);
