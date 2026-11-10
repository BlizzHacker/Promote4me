/**
 * Promote4.me Social Media Commander Migration
 * FollowLiker / MassPlanner-style multi-platform automation schema.
 */
import { db } from '../db.js';

export function migrateCommander() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS social_accounts (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      account_name TEXT NOT NULL,
      username TEXT NOT NULL,
      credentials_json TEXT NOT NULL DEFAULT '{}',
      proxy_url TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      status_message TEXT DEFAULT '',
      follower_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      daily_post_limit INTEGER NOT NULL DEFAULT 10,
      daily_comment_limit INTEGER NOT NULL DEFAULT 50,
      daily_dm_limit INTEGER NOT NULL DEFAULT 30,
      daily_like_limit INTEGER NOT NULL DEFAULT 100,
      daily_follow_limit INTEGER NOT NULL DEFAULT 80,
      settings_json TEXT NOT NULL DEFAULT '{}',
      last_synced_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_posts (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      content TEXT NOT NULL,
      media_urls_json TEXT NOT NULL DEFAULT '[]',
      target_destinations_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft',
      scheduled_at TEXT,
      published_at TEXT,
      platform_post_id TEXT DEFAULT '',
      platform_post_url TEXT DEFAULT '',
      metrics_json TEXT NOT NULL DEFAULT '{"likes":0,"comments":0,"shares":0,"impressions":0}',
      error_message TEXT DEFAULT '',
      retry_count INTEGER DEFAULT 0,
      created_by_ai TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_comments (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      platform_post_id TEXT NOT NULL,
      platform_comment_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_handle TEXT DEFAULT '',
      comment_text TEXT NOT NULL,
      sentiment TEXT DEFAULT 'neutral',
      status TEXT NOT NULL DEFAULT 'pending',
      reply_text TEXT DEFAULT '',
      replied_at TEXT,
      replied_by TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_messages (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      conversation_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_handle TEXT DEFAULT '',
      message_text TEXT NOT NULL,
      direction TEXT NOT NULL DEFAULT 'inbound',
      status TEXT NOT NULL DEFAULT 'unread',
      ai_handled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_auto_rules (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      account_id TEXT DEFAULT '',
      platform TEXT NOT NULL,
      rule_type TEXT NOT NULL,
      trigger_match TEXT NOT NULL,
      action_type TEXT NOT NULL,
      response_template TEXT NOT NULL,
      ai_instructions TEXT DEFAULT '',
      cooldown_seconds INTEGER NOT NULL DEFAULT 300,
      daily_max_triggers INTEGER NOT NULL DEFAULT 50,
      enabled INTEGER NOT NULL DEFAULT 1,
      stats_json TEXT NOT NULL DEFAULT '{"triggered":0,"replied":0,"last_triggered_at":null}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_campaigns (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      campaign_type TEXT NOT NULL,
      target_criteria_json TEXT NOT NULL DEFAULT '{}',
      daily_limits_json TEXT NOT NULL DEFAULT '{"follows":50,"unfollows":50,"likes":100,"comments":20,"dms":15}',
      working_hours_json TEXT NOT NULL DEFAULT '{"start":9,"end":21,"timezone":"UTC"}',
      min_delay_seconds INTEGER NOT NULL DEFAULT 45,
      max_delay_seconds INTEGER NOT NULL DEFAULT 180,
      status TEXT NOT NULL DEFAULT 'active',
      progress_json TEXT NOT NULL DEFAULT '{"today":{"follows":0,"likes":0,"comments":0,"dms":0},"total_actions":0}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_activity_log (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      account_id TEXT DEFAULT '',
      platform TEXT NOT NULL,
      action_type TEXT NOT NULL,
      target TEXT NOT NULL DEFAULT '',
      content_summary TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'success',
      details_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_social_posts_sched ON social_posts(status, scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_social_posts_tenant ON social_posts(tenant_id, platform);
    CREATE INDEX IF NOT EXISTS idx_social_comments_stat ON social_comments(tenant_id, status);
    CREATE INDEX IF NOT EXISTS idx_social_messages_stat ON social_messages(tenant_id, status);
    CREATE INDEX IF NOT EXISTS idx_social_act_tenant ON social_activity_log(tenant_id, created_at);
  `);
  console.log('Social Commander database migration complete.');
}
