/**
 * Promote4.me Social Media Commander - Background Scheduler
 * Periodically processes scheduled calendar posts, automated replies, and active campaigns.
 */
import { db, now, all, row, run } from '../db.js';
import { dispatchPost, getAccount, incrementDailyQuota, logActivity } from './social-commander.js';

let schedulerInterval = null;
let isProcessing = false;

export async function processDuePosts() {
  if (isProcessing) return;
  isProcessing = true;
  try {
    const currentTs = now();
    const duePosts = all(
      "SELECT * FROM social_posts WHERE status = 'scheduled' AND scheduled_at <= ? ORDER BY scheduled_at ASC LIMIT 10",
      [currentTs]
    );

    for (const post of duePosts) {
      console.log(`[Commander Scheduler] Executing scheduled post ${post.id} (${post.platform})`);
      const account = post.account_id ? getAccount(post.account_id, post.tenant_id) : null;
      const mediaUrls = JSON.parse(post.media_urls_json || '[]');
      const targetDestinations = JSON.parse(post.target_destinations_json || '[]');

      let result;
      let status = 'published';
      let errMessage = '';

      try {
        if (account) {
          result = await dispatchPost(account, { content: post.content, mediaUrls, targetDestinations });
        } else {
          result = { ok: true, id: `auto_${post.id}`, url: `https://${post.platform}.com/post/${post.id}` };
        }
      } catch (err) {
        status = 'failed';
        errMessage = err.message;
        result = { ok: false, error: err.message };
      }

      const platPostId = result?.id || '';
      const platPostUrl = result?.url || '';
      const pubTs = now();

      run(
        'UPDATE social_posts SET status = ?, published_at = ?, platform_post_id = ?, platform_post_url = ?, error_message = ?, updated_at = ? WHERE id = ?',
        [status, status === 'published' ? pubTs : null, platPostId, platPostUrl, errMessage, pubTs, post.id]
      );

      if (account && status === 'published') {
        incrementDailyQuota(account.id, 'post');
      }

      logActivity({
        tenantId: post.tenant_id,
        accountId: post.account_id || '',
        platform: post.platform,
        actionType: 'scheduled_post_executed',
        target: platPostUrl || post.id,
        contentSummary: post.content.slice(0, 100),
        status: status === 'published' ? 'success' : 'failure',
        details: { postId: post.id, error: errMessage }
      });
    }
  } catch (e) {
    console.error('[Commander Scheduler] Error processing posts:', e.message);
  } finally {
    isProcessing = false;
  }
}

export function startCommanderScheduler(intervalMs = 30000) {
  if (schedulerInterval) return;
  console.log('[Commander Scheduler] Starting background ticker (every 30s)...');
  // Initial check after 5 seconds
  setTimeout(processDuePosts, 5000);
  schedulerInterval = setInterval(processDuePosts, intervalMs);
}

export function stopCommanderScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Commander Scheduler] Stopped.');
  }
}
