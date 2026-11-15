-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'UserRole' AND n.nspname = current_schema()) THEN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'EDITOR', 'MODERATOR');
  END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'Gender' AND n.nspname = current_schema()) THEN
    CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
  END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'MilestoneCategory' AND n.nspname = current_schema()) THEN
    CREATE TYPE "MilestoneCategory" AS ENUM ('COGNITIVE', 'PHYSICAL', 'SOCIAL_EMOTIONAL', 'LANGUAGE', 'CREATIVE');
  END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'ContentType' AND n.nspname = current_schema()) THEN
    CREATE TYPE "ContentType" AS ENUM ('VIDEO', 'ARTICLE', 'INFOGRAPHIC', 'TIPS', 'ACTIVITY');
  END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'ContentStatus' AND n.nspname = current_schema()) THEN
    CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED');
  END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'ProductType' AND n.nspname = current_schema()) THEN
    CREATE TYPE "ProductType" AS ENUM ('BOOK_NATIONAL', 'BOOK_INTERNATIONAL', 'BOOK_SELF_PUBLISHED', 'BOOK_STORYBOOK', 'DIGITAL_LEARNING', 'ENGLISH_ASSESSMENT', 'TEACHER_ACADEMY', 'OTHER');
  END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'RecommendationPlacement' AND n.nspname = current_schema()) THEN
    CREATE TYPE "RecommendationPlacement" AS ENUM ('SIDEBAR', 'INLINE', 'BOTTOM', 'OVERLAY', 'BANNER');
  END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                 WHERE t.typname = 'Difficulty' AND n.nspname = current_schema()) THEN
    CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
  END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "supabase_id" TEXT,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "password_hash" TEXT,
    "avatar_url" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "children" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" "Gender",
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "milestones" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "age_group_id" TEXT NOT NULL,
    "category" "MilestoneCategory" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "child_milestones" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "milestone_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "child_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "age_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "min_age" INTEGER NOT NULL,
    "max_age" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "age_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "contents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT,
    "type" "ContentType" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "thumbnail_url" TEXT,
    "video_url" TEXT,
    "video_duration" INTEGER,
    "read_time" INTEGER,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "author_id" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "authors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "content_categories" (
    "content_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "content_categories_pkey" PRIMARY KEY ("content_id","category_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "content_age_groups" (
    "content_id" TEXT NOT NULL,
    "age_group_id" TEXT NOT NULL,

    CONSTRAINT "content_age_groups_pkey" PRIMARY KEY ("content_id","age_group_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "content_tags" (
    "content_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "content_tags_pkey" PRIMARY KEY ("content_id","tag_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "type" "ProductType" NOT NULL,
    "price" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "cover_image_url" TEXT,
    "thumbnail_url" TEXT,
    "images" JSONB,
    "external_url" TEXT,
    "cta_text" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_age_groups" (
    "product_id" TEXT NOT NULL,
    "age_group_id" TEXT NOT NULL,

    CONSTRAINT "product_age_groups_pkey" PRIMARY KEY ("product_id","age_group_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "content_products" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "relevance_score" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "placement" "RecommendationPlacement" NOT NULL DEFAULT 'SIDEBAR',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "learning_paths" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "estimated_time" INTEGER,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "learning_path_items" (
    "id" TEXT NOT NULL,
    "learning_path_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_path_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "community_threads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category_slug" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "community_comments" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "body" TEXT NOT NULL,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "gamification_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" TIMESTAMP(3),
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gamification_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "criteria" JSONB,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_badges" (
    "id" TEXT NOT NULL,
    "gamification_profile_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "content_views" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "duration" INTEGER,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_clicks" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT,
    "content_id" TEXT,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_supabase_id_key" ON "users"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "child_milestones_child_id_milestone_id_key" ON "child_milestones"("child_id", "milestone_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "age_groups_slug_key" ON "age_groups"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "contents_slug_key" ON "contents"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "contents_status_published_at_idx" ON "contents"("status", "published_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "contents_type_status_idx" ON "contents"("type", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "contents_author_id_idx" ON "contents"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "authors_slug_key" ON "authors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "authors_email_key" ON "authors"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "content_products_content_id_product_id_key" ON "content_products"("content_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "learning_paths_slug_key" ON "learning_paths"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "learning_path_items_learning_path_id_content_id_key" ON "learning_path_items"("learning_path_id", "content_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "bookmarks_user_id_content_id_key" ON "bookmarks"("user_id", "content_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "community_threads_created_at_idx" ON "community_threads"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "gamification_profiles_user_id_key" ON "gamification_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "badges_slug_key" ON "badges"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_badges_gamification_profile_id_badge_id_key" ON "user_badges"("gamification_profile_id", "badge_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_views_content_id_created_at_idx" ON "content_views"("content_id", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_views_user_id_created_at_idx" ON "content_views"("user_id", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "product_clicks_product_id_created_at_idx" ON "product_clicks"("product_id", "created_at");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'children_user_id_fkey') THEN
    ALTER TABLE "children" ADD CONSTRAINT "children_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'milestones_age_group_id_fkey') THEN
    ALTER TABLE "milestones" ADD CONSTRAINT "milestones_age_group_id_fkey" FOREIGN KEY ("age_group_id") REFERENCES "age_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'child_milestones_child_id_fkey') THEN
    ALTER TABLE "child_milestones" ADD CONSTRAINT "child_milestones_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'child_milestones_milestone_id_fkey') THEN
    ALTER TABLE "child_milestones" ADD CONSTRAINT "child_milestones_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contents_author_id_fkey') THEN
    ALTER TABLE "contents" ADD CONSTRAINT "contents_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_parent_id_fkey') THEN
    ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_categories_content_id_fkey') THEN
    ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_categories_category_id_fkey') THEN
    ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_age_groups_content_id_fkey') THEN
    ALTER TABLE "content_age_groups" ADD CONSTRAINT "content_age_groups_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_age_groups_age_group_id_fkey') THEN
    ALTER TABLE "content_age_groups" ADD CONSTRAINT "content_age_groups_age_group_id_fkey" FOREIGN KEY ("age_group_id") REFERENCES "age_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_tags_content_id_fkey') THEN
    ALTER TABLE "content_tags" ADD CONSTRAINT "content_tags_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_tags_tag_id_fkey') THEN
    ALTER TABLE "content_tags" ADD CONSTRAINT "content_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_age_groups_product_id_fkey') THEN
    ALTER TABLE "product_age_groups" ADD CONSTRAINT "product_age_groups_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_age_groups_age_group_id_fkey') THEN
    ALTER TABLE "product_age_groups" ADD CONSTRAINT "product_age_groups_age_group_id_fkey" FOREIGN KEY ("age_group_id") REFERENCES "age_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_products_content_id_fkey') THEN
    ALTER TABLE "content_products" ADD CONSTRAINT "content_products_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_products_product_id_fkey') THEN
    ALTER TABLE "content_products" ADD CONSTRAINT "content_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'learning_path_items_learning_path_id_fkey') THEN
    ALTER TABLE "learning_path_items" ADD CONSTRAINT "learning_path_items_learning_path_id_fkey" FOREIGN KEY ("learning_path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'learning_path_items_content_id_fkey') THEN
    ALTER TABLE "learning_path_items" ADD CONSTRAINT "learning_path_items_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookmarks_user_id_fkey') THEN
    ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookmarks_content_id_fkey') THEN
    ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'community_threads_user_id_fkey') THEN
    ALTER TABLE "community_threads" ADD CONSTRAINT "community_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'community_comments_thread_id_fkey') THEN
    ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "community_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'community_comments_user_id_fkey') THEN
    ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'community_comments_parent_id_fkey') THEN
    ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "community_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gamification_profiles_user_id_fkey') THEN
    ALTER TABLE "gamification_profiles" ADD CONSTRAINT "gamification_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_badges_gamification_profile_id_fkey') THEN
    ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_gamification_profile_id_fkey" FOREIGN KEY ("gamification_profile_id") REFERENCES "gamification_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_badges_badge_id_fkey') THEN
    ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_views_content_id_fkey') THEN
    ALTER TABLE "content_views" ADD CONSTRAINT "content_views_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_views_user_id_fkey') THEN
    ALTER TABLE "content_views" ADD CONSTRAINT "content_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_clicks_product_id_fkey') THEN
    ALTER TABLE "product_clicks" ADD CONSTRAINT "product_clicks_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_clicks_user_id_fkey') THEN
    ALTER TABLE "product_clicks" ADD CONSTRAINT "product_clicks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
