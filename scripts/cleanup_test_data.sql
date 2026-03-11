-- Cleanup Script: Delete all test accounts and data EXCEPT stephanie.soderborg@gmail.com
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
--
-- This script:
--   1. Finds Steph's user_id to preserve
--   2. Deletes all data from other users (FK order: children first)
--   3. Deletes other users from public.users
--   4. Deletes other users from auth.users
--   5. Preserves system tags and system questions (no user_id)
--   6. Cleans up Steph's test data too (optional — commented out)

BEGIN;

-- Step 0: Find the user_id to KEEP
DO $$
DECLARE
  keep_uid UUID;
  deleted_count INT;
BEGIN
  SELECT user_id INTO keep_uid FROM public.users WHERE email = 'stephanie.soderborg@gmail.com';

  IF keep_uid IS NULL THEN
    RAISE EXCEPTION 'Could not find stephanie.soderborg@gmail.com in public.users — aborting';
  END IF;

  RAISE NOTICE 'Keeping user: % (stephanie.soderborg@gmail.com)', keep_uid;

  -- Step 1: Delete child tables first (FK dependencies)

  -- achievement_tags (depends on professional_achievements)
  DELETE FROM achievement_tags
  WHERE achievement_id IN (
    SELECT achievement_id FROM professional_achievements WHERE user_id != keep_uid
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % achievement_tags rows', deleted_count;

  -- achievement_responses (depends on professional_achievements)
  DELETE FROM achievement_responses
  WHERE achievement_id IN (
    SELECT achievement_id FROM professional_achievements WHERE user_id != keep_uid
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % achievement_responses rows', deleted_count;

  -- professional_achievements (depends on entries, projects)
  DELETE FROM professional_achievements WHERE user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % professional_achievements rows', deleted_count;

  -- entries
  DELETE FROM entries WHERE user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % entries rows', deleted_count;

  -- projects
  DELETE FROM projects WHERE user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % projects rows', deleted_count;

  -- companies (clear FK on users first)
  UPDATE users SET current_company_id = NULL WHERE user_id != keep_uid;
  DELETE FROM companies WHERE user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % companies rows', deleted_count;

  -- notification_schedules
  DELETE FROM notification_schedules WHERE user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % notification_schedules rows', deleted_count;

  -- user_preferences
  DELETE FROM user_preferences WHERE user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % user_preferences rows', deleted_count;

  -- export_history
  DELETE FROM export_history WHERE user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % export_history rows', deleted_count;

  -- subscriptions
  DELETE FROM subscriptions WHERE user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % subscriptions rows', deleted_count;

  -- sessions
  DELETE FROM sessions WHERE user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % sessions rows', deleted_count;

  -- user-created tags (preserve system tags where user_id IS NULL)
  DELETE FROM tags WHERE user_id IS NOT NULL AND user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % user tags rows', deleted_count;

  -- Step 2: Delete from public.users
  DELETE FROM users WHERE user_id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % public.users rows', deleted_count;

  -- Step 3: Delete from auth.users
  DELETE FROM auth.users WHERE id != keep_uid;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % auth.users rows', deleted_count;

  RAISE NOTICE '✓ Cleanup complete. Only stephanie.soderborg@gmail.com remains.';
END $$;

COMMIT;

-- ============================================================
-- OPTIONAL: Uncomment below to also wipe Steph's TEST DATA
-- (entries, achievements, etc.) while keeping her account.
-- Useful for a truly fresh start.
-- ============================================================
--
-- BEGIN;
-- DO $$
-- DECLARE
--   keep_uid UUID;
-- BEGIN
--   SELECT user_id INTO keep_uid FROM public.users WHERE email = 'stephanie.soderborg@gmail.com';
--
--   DELETE FROM achievement_tags WHERE achievement_id IN (
--     SELECT achievement_id FROM professional_achievements WHERE user_id = keep_uid
--   );
--   DELETE FROM achievement_responses WHERE achievement_id IN (
--     SELECT achievement_id FROM professional_achievements WHERE user_id = keep_uid
--   );
--   DELETE FROM professional_achievements WHERE user_id = keep_uid;
--   DELETE FROM entries WHERE user_id = keep_uid;
--   DELETE FROM projects WHERE user_id = keep_uid;
--
--   RAISE NOTICE 'Steph test data wiped. Account, companies, preferences, schedules preserved.';
-- END $$;
-- COMMIT;
