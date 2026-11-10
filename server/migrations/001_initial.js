/**
 * Promote4.me Database Migrations
 * 
 * Consolidated from the original inline schema setup in server/index.js.
 * Migrations are idempotent — safe to run on any database state.
 */
import { db } from '../db.js';

export function migrate() {
  db.exec(`
    -- Core tables
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      google_maps_api_key TEXT DEFAULT '',
      accuracy_radius_feet INTEGER NOT NULL DEFAULT 350,
      require_gps_for_rewards INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      billing_email TEXT DEFAULT '',
      free_jobs_limit INTEGER NOT NULL DEFAULT 25,
      free_users_limit INTEGER NOT NULL DEFAULT 3,
      last_active_at TEXT,
      delete_after_inactive_at TEXT,
      map_provider TEXT NOT NULL DEFAULT 'openstreetmap',
      stripe_customer_id TEXT DEFAULT '',
      paypal_customer_id TEXT DEFAULT '',
      square_customer_id TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      photo_url TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      email_verified_at TEXT,
      last_login_at TEXT,
      last_active_at TEXT,
      auth_provider TEXT NOT NULL DEFAULT 'password',
      external_subject TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      user_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      role TEXT DEFAULT 'Member',
      pay_rate TEXT DEFAULT '',
      territory TEXT DEFAULT '',
      photo_url TEXT DEFAULT '',
      emergency_contact TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      lat REAL,
      lng REAL,
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      team_id TEXT,
      client_id TEXT,
      assigned_to TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      order_number TEXT DEFAULT '',
      source TEXT DEFAULT 'Manual',
      customer_name TEXT DEFAULT '',
      customer_email TEXT DEFAULT '',
      customer_phone TEXT DEFAULT '',
      address TEXT NOT NULL,
      lat REAL,
      lng REAL,
      status TEXT NOT NULL DEFAULT 'Assigned',
      eta TEXT DEFAULT '',
      reward_cents INTEGER NOT NULL DEFAULT 0,
      instructions TEXT DEFAULT '',
      work_mode TEXT NOT NULL DEFAULT 'in_person',
      visibility TEXT NOT NULL DEFAULT 'private',
      is_public INTEGER NOT NULL DEFAULT 0,
      trade TEXT NOT NULL DEFAULT '',
      budget_cents INTEGER NOT NULL DEFAULT 0,
      external_payload_json TEXT NOT NULL DEFAULT '{}',
      line_items_json TEXT NOT NULL DEFAULT '[]',
      proof_checklist_json TEXT NOT NULL DEFAULT '[]',
      staffer_packet_json TEXT NOT NULL DEFAULT '{}',
      admin_url TEXT NOT NULL DEFAULT '',
      payment_method TEXT NOT NULL DEFAULT '',
      order_total_cents INTEGER NOT NULL DEFAULT 0,
      order_items_summary TEXT NOT NULL DEFAULT '',
      provider_id TEXT NOT NULL DEFAULT '',
      provider_order_id TEXT NOT NULL DEFAULT '',
      carrier TEXT NOT NULL DEFAULT '',
      tracking_number TEXT NOT NULL DEFAULT '',
      tracking_url TEXT NOT NULL DEFAULT '',
      digital_delivery_url TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      job_id TEXT NOT NULL,
      user_id TEXT,
      file_url TEXT DEFAULT '',
      file_name TEXT DEFAULT '',
      note TEXT DEFAULT '',
      browser_lat REAL,
      browser_lng REAL,
      browser_accuracy_meters REAL,
      image_lat REAL,
      image_lng REAL,
      chosen_lat REAL,
      chosen_lng REAL,
      distance_feet INTEGER,
      score INTEGER NOT NULL,
      verdict TEXT NOT NULL,
      warnings TEXT DEFAULT '[]',
      exif_json TEXT NOT NULL DEFAULT '{}',
      photo_lat REAL,
      photo_lng REAL,
      photo_taken_at TEXT NOT NULL DEFAULT '',
      device_make TEXT NOT NULL DEFAULT '',
      device_model TEXT NOT NULL DEFAULT '',
      gps_source TEXT NOT NULL DEFAULT 'browser',
      gps_distance_m REAL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS job_history (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      job_id TEXT NOT NULL,
      user_id TEXT,
      event TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      name TEXT NOT NULL,
      config_json TEXT DEFAULT '{}',
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      UNIQUE(tenant_id, provider, name)
    );

    -- Auth & security tables
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS external_api_keys (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      label TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      created_by TEXT,
      created_at TEXT,
      last_used_at TEXT
    );

    -- Billing
    CREATE TABLE IF NOT EXISTS billing_events (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      plan TEXT NOT NULL,
      amount_cents INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'created',
      checkout_url TEXT DEFAULT '',
      metadata_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      user_id TEXT,
      event TEXT NOT NULL,
      ip TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      metadata_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    -- Provider connections (v2.9.8+)
    CREATE TABLE IF NOT EXISTS provider_connections (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      provider_name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'inactive',
      base_url TEXT NOT NULL DEFAULT '',
      api_key TEXT NOT NULL DEFAULT '',
      api_secret TEXT NOT NULL DEFAULT '',
      account_id TEXT NOT NULL DEFAULT '',
      webhook_secret TEXT NOT NULL DEFAULT '',
      capabilities_json TEXT NOT NULL DEFAULT '{}',
      settings_json TEXT NOT NULL DEFAULT '{}',
      last_test_at TEXT NOT NULL DEFAULT '',
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS provider_events (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      payload_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT
    );

    -- Shopify (v2.9.4+)
    CREATE TABLE IF NOT EXISTS shopify_connections (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      shop TEXT NOT NULL,
      access_token TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'beta',
      scopes TEXT NOT NULL DEFAULT '',
      created_at TEXT,
      updated_at TEXT,
      last_sync_at TEXT
    );

    CREATE TABLE IF NOT EXISTS integration_logs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      provider TEXT NOT NULL,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      payload_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT
    );

    -- Marketplace (v3.1.0+)
    CREATE TABLE IF NOT EXISTS worker_profiles (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      headline TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      remote_ready INTEGER NOT NULL DEFAULT 0,
      onsite_ready INTEGER NOT NULL DEFAULT 1,
      skills_json TEXT NOT NULL DEFAULT '[]',
      links_json TEXT NOT NULL DEFAULT '{}',
      credentials_json TEXT NOT NULL DEFAULT '[]',
      portfolio_json TEXT NOT NULL DEFAULT '[]',
      availability_json TEXT NOT NULL DEFAULT '{}',
      rating REAL NOT NULL DEFAULT 0,
      completed_jobs INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS marketplace_posts (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      post_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      work_mode TEXT NOT NULL DEFAULT 'in_person',
      category TEXT NOT NULL DEFAULT '',
      skills_json TEXT NOT NULL DEFAULT '[]',
      budget_cents INTEGER NOT NULL DEFAULT 0,
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      visibility TEXT NOT NULL DEFAULT 'public',
      status TEXT NOT NULL DEFAULT 'open',
      source_platform TEXT NOT NULL DEFAULT 'Promote4.me',
      external_url TEXT NOT NULL DEFAULT '',
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS marketplace_applications (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      worker_user_id TEXT NOT NULL,
      profile_id TEXT NOT NULL DEFAULT '',
      cover_note TEXT NOT NULL DEFAULT '',
      bid_cents INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'submitted',
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS work_source_connections (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'inactive',
      base_url TEXT NOT NULL DEFAULT '',
      api_key TEXT NOT NULL DEFAULT '',
      api_secret TEXT NOT NULL DEFAULT '',
      account_id TEXT NOT NULL DEFAULT '',
      capabilities_json TEXT NOT NULL DEFAULT '{}',
      settings_json TEXT NOT NULL DEFAULT '{}',
      last_import_at TEXT NOT NULL DEFAULT '',
      created_at TEXT,
      updated_at TEXT
    );

    -- Social search rewards (v3.2.0+)
    CREATE TABLE IF NOT EXISTS referral_rewards (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      referred_email TEXT NOT NULL DEFAULT '',
      referred_user_id TEXT NOT NULL DEFAULT '',
      reward_type TEXT NOT NULL DEFAULT 'credits',
      reward_value INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS work_search_sources (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'inactive',
      access_mode TEXT NOT NULL DEFAULT 'guide',
      base_url TEXT NOT NULL DEFAULT '',
      api_key TEXT NOT NULL DEFAULT '',
      api_secret TEXT NOT NULL DEFAULT '',
      affiliate_id TEXT NOT NULL DEFAULT '',
      settings_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS reward_ledger (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      credits INTEGER NOT NULL DEFAULT 0,
      months INTEGER NOT NULL DEFAULT 0,
      created_at TEXT
    );

    -- Public map / work hub (v3.3+)
    CREATE TABLE IF NOT EXISTS app_settings (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      setting_key TEXT NOT NULL,
      setting_value TEXT NOT NULL DEFAULT '',
      is_secret INTEGER NOT NULL DEFAULT 0,
      updated_by TEXT NOT NULL DEFAULT '',
      updated_at TEXT,
      UNIQUE(tenant_id, setting_key)
    );

    -- Public worker/buyer intake (v3.4.0+)
    CREATE TABLE IF NOT EXISTS public_worker_intake (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      work_mode TEXT NOT NULL DEFAULT 'both',
      headline TEXT NOT NULL DEFAULT '',
      skills_json TEXT NOT NULL DEFAULT '[]',
      linkedin_url TEXT NOT NULL DEFAULT '',
      resume_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS public_buyer_intake (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      budget_cents INTEGER NOT NULL DEFAULT 0,
      work_mode TEXT NOT NULL DEFAULT 'in_person',
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT,
      updated_at TEXT
    );
  `);

  console.log('Database migration complete.');
}
