-- Add translations support to existing tables
-- This migration adds JSON fields to store translations for dynamic content

-- Add translations to Product table
ALTER TABLE "Product" ADD COLUMN "nameTranslations" JSONB;
ALTER TABLE "Product" ADD COLUMN "descriptionTranslations" JSONB;

-- Add translations to Category table  
ALTER TABLE "Category" ADD COLUMN "nameTranslations" JSONB;
ALTER TABLE "Category" ADD COLUMN "descriptionTranslations" JSONB;

-- Add translations to Brand table
ALTER TABLE "Brand" ADD COLUMN "nameTranslations" JSONB;
ALTER TABLE "Brand" ADD COLUMN "descriptionTranslations" JSONB;

-- Add translations to Tag table
ALTER TABLE "Tag" ADD COLUMN "nameTranslations" JSONB;

-- Add translations to VariantType table
ALTER TABLE "VariantType" ADD COLUMN "nameTranslations" JSONB;
ALTER TABLE "VariantType" ADD COLUMN "descriptionTranslations" JSONB;

-- Add translations to VariantOption table
ALTER TABLE "VariantOption" ADD COLUMN "valueTranslations" JSONB;

-- Add translations to Settings table
ALTER TABLE "Settings" ADD COLUMN "siteTitleTranslations" JSONB;

-- Create indexes for better performance on translation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_product_name_translations" ON "Product" USING GIN ("nameTranslations");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_category_name_translations" ON "Category" USING GIN ("nameTranslations");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_brand_name_translations" ON "Brand" USING GIN ("nameTranslations");

-- Set default English translations for existing data
UPDATE "Product" SET 
  "nameTranslations" = jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "name")),
  "descriptionTranslations" = CASE 
    WHEN "description" IS NOT NULL THEN jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "description"))
    ELSE NULL 
  END;

UPDATE "Category" SET 
  "nameTranslations" = jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "name")),
  "descriptionTranslations" = CASE 
    WHEN "description" IS NOT NULL THEN jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "description"))
    ELSE NULL 
  END;

UPDATE "Brand" SET 
  "nameTranslations" = jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "name")),
  "descriptionTranslations" = CASE 
    WHEN "description" IS NOT NULL THEN jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "description"))
    ELSE NULL 
  END;

UPDATE "Tag" SET 
  "nameTranslations" = jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "name"));

UPDATE "VariantType" SET 
  "nameTranslations" = jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "name")),
  "descriptionTranslations" = CASE 
    WHEN "description" IS NOT NULL THEN jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "description"))
    ELSE NULL 
  END;

UPDATE "VariantOption" SET 
  "valueTranslations" = jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "value"));

UPDATE "Settings" SET 
  "siteTitleTranslations" = jsonb_build_array(jsonb_build_object('locale', 'en', 'content', "siteTitle"));