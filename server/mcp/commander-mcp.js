/**
 * Promote4.me Social Media Commander - MCP Server Protocol Handler
 * Compatible with Claude Desktop, ChatGPT Custom Actions, Antigravity,
 * Forgeverse, and open-weights/API models (Hermes, Qwen, Deepseek, Codex, Gemini, Kimi, Mimo).
 */
import {
  listAccounts, saveAccount, deleteAccount,
  publishPostNow, schedulePost, getCalendar, cancelPost,
  getComments, replyComment,
  getMessages, sendMessage,
  listRules, saveRule, deleteRule,
  listCampaigns, createCampaign, toggleCampaign,
  getActivityLog, getDailyQuota, getTenantDefault
} from '../services/social-commander.js';

export const MCP_SERVER_INFO = {
  name: 'promote4me-social-commander',
  title: 'Promote4.me Social Media Commander',
  version: '4.0.0',
  description: 'AI-driven social media commander for Reddit, Facebook, Instagram, Twitter/X, Discord, YouTube, TikTok, Bluesky, Telegram. Automate posts, calendar scheduling, comment tracking, auto-replies, and growth campaigns (FollowLiker / MassPlanner modernized).',
};

export const TOOLS = [
  {
    name: 'social_list_accounts',
    description: 'List all connected social media accounts across Reddit, Facebook, Instagram, Twitter/X, Discord, YouTube, TikTok, Bluesky, Telegram, Threads with their follower counts, connection health, and remaining daily limits.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'Filter by platform (e.g. reddit, instagram, facebook, twitter, discord, or omit for all)' },
      },
    },
  },
  {
    name: 'social_connect_account',
    description: 'Connect or update credentials for a social media account (Reddit, Facebook Page/Group, Instagram, Twitter/X, Discord Webhook, YouTube, TikTok, Bluesky, Telegram).',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'Platform identifier (reddit, facebook, instagram, twitter, discord, youtube, tiktok, bluesky, telegram)' },
        accountName: { type: 'string', description: 'Display label for this account' },
        username: { type: 'string', description: 'Username, handle, or page name' },
        credentials: { type: 'object', description: 'Tokens, API keys, session cookies, or webhook URLs' },
        proxyUrl: { type: 'string', description: 'Optional proxy (http://user:pass@host:port) to avoid bot detection' },
        dailyLimits: {
          type: 'object',
          properties: {
            posts: { type: 'number', description: 'Daily post limit (default: 10)' },
            comments: { type: 'number', description: 'Daily comment reply limit (default: 50)' },
            dms: { type: 'number', description: 'Daily DM limit (default: 30)' },
            likes: { type: 'number', description: 'Daily like/upvote limit (default: 100)' },
            follows: { type: 'number', description: 'Daily follow limit (default: 80)' },
          },
        },
      },
      required: ['platform', 'username'],
    },
  },
  {
    name: 'social_post_now',
    description: 'Immediately broadcast/publish a post to one or multiple social media platforms with text content and optional media URLs or target subreddits/pages.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'Destination platform (reddit, facebook, instagram, twitter, discord, etc.)' },
        content: { type: 'string', description: 'Text content of the post or tweet' },
        accountId: { type: 'string', description: 'Optional specific account ID to post from' },
        mediaUrls: { type: 'array', items: { type: 'string' }, description: 'Public image or video URLs to attach' },
        targetDestinations: { type: 'array', items: { type: 'string' }, description: 'Target subreddits (e.g. ["r/entrepreneur"]), Facebook page IDs, Twitter thread parent IDs, or Discord channel tags' },
      },
      required: ['platform', 'content'],
    },
  },
  {
    name: 'social_schedule_post',
    description: 'Schedule a post on the calendar for a specific datetime or automatically place it in the next optimal "natural human time slot" with randomized jitter (MassPlanner / FollowLiker cadence).',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'Platform (reddit, facebook, instagram, twitter, discord, etc.)' },
        content: { type: 'string', description: 'Post text content' },
        scheduledAt: { type: 'string', description: 'ISO 8601 timestamp (e.g. 2026-11-10T14:30:00Z). Omit if naturalSlot is true.' },
        naturalSlot: { type: 'boolean', description: 'If true, automatically schedules post at the next human-like active slot with random jitter' },
        accountId: { type: 'string', description: 'Optional specific account ID' },
        mediaUrls: { type: 'array', items: { type: 'string' }, description: 'Optional image/video URLs' },
        targetDestinations: { type: 'array', items: { type: 'string' }, description: 'Subreddits or target pages' },
      },
      required: ['platform', 'content'],
    },
  },
  {
    name: 'social_get_calendar',
    description: 'Retrieve the social media calendar schedule, including upcoming queued posts, drafts, and recently published post metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Filter start ISO date' },
        endDate: { type: 'string', description: 'Filter end ISO date' },
        platform: { type: 'string', description: 'Filter by platform' },
        status: { type: 'string', enum: ['all', 'scheduled', 'published', 'draft', 'failed', 'cancelled'], description: 'Filter by status' },
        limit: { type: 'number', description: 'Max items to return (default 50)' },
      },
    },
  },
  {
    name: 'social_cancel_post',
    description: 'Cancel or unschedule a queued calendar post.',
    inputSchema: {
      type: 'object',
      properties: {
        postId: { type: 'string', description: 'The post ID to cancel' },
      },
      required: ['postId'],
    },
  },
  {
    name: 'social_get_comments',
    description: 'Fetch comments across Reddit, Facebook, Instagram, Twitter, and other platforms for moderation, sentiment analysis, or replying.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'Filter by platform' },
        accountId: { type: 'string', description: 'Filter by account ID' },
        status: { type: 'string', enum: ['all', 'pending', 'replied', 'flagged'] },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'social_reply_comment',
    description: 'Post an automated or custom reply to a comment on Reddit, Facebook, Instagram, Twitter, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        commentId: { type: 'string', description: 'ID of the comment to reply to' },
        replyText: { type: 'string', description: 'Text of the reply' },
      },
      required: ['commentId', 'replyText'],
    },
  },
  {
    name: 'social_get_messages',
    description: 'Fetch incoming direct messages and chats from connected social channels.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string' },
        accountId: { type: 'string' },
        status: { type: 'string', enum: ['all', 'unread', 'read', 'replied'] },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'social_send_message',
    description: 'Send a direct message or reply to an incoming user conversation across platforms.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'Platform to send message on' },
        messageText: { type: 'string', description: 'Message content' },
        conversationId: { type: 'string', description: 'Existing conversation/thread ID if replying' },
        recipientHandle: { type: 'string', description: 'Username or recipient ID' },
        accountId: { type: 'string', description: 'Sender account ID' },
      },
      required: ['platform', 'messageText'],
    },
  },
  {
    name: 'social_set_auto_reply',
    description: 'Create or update an automated responder rule (e.g., auto-reply to comments with keyword triggers, greeting DMs, or mark for AI completion).',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'Target platform (or "all")' },
        ruleType: { type: 'string', enum: ['comment_keyword', 'dm_keyword', 'greeting_dm', 'ai_auto_respond', 'subreddit_monitor'] },
        triggerMatch: { type: 'string', description: 'Keyword list, regex, or "*" for all' },
        actionType: { type: 'string', enum: ['template_reply', 'ai_prompt_reply', 'notify', 'tag_lead'] },
        responseTemplate: { type: 'string', description: 'Template reply text (can use variables like {{author}})' },
        aiInstructions: { type: 'string', description: 'Prompt guidelines if using AI generation' },
        cooldownSeconds: { type: 'number', description: 'Cooldown between triggers per user' },
        dailyMaxTriggers: { type: 'number', description: 'Safety cap per day' },
      },
      required: ['platform', 'ruleType', 'triggerMatch', 'responseTemplate'],
    },
  },
  {
    name: 'social_list_auto_replies',
    description: 'List all active auto-reply, auto-moderation, and trigger rules.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string' },
      },
    },
  },
  {
    name: 'social_start_campaign',
    description: 'Start a FollowLiker / MassPlanner style automated growth campaign (mass like, mass follow, targeted keyword engagement, comment storm) with built-in human delays and safety limits.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the campaign' },
        platform: { type: 'string', description: 'Platform (reddit, instagram, twitter, etc.)' },
        campaignType: { type: 'string', enum: ['follow_liker', 'mass_planner', 'comment_storm', 'direct_outreach'] },
        targetCriteria: { type: 'object', description: 'Target hashtags, keywords, subreddits, or competitor accounts' },
        dailyLimits: { type: 'object', description: 'Action caps per day (e.g. {"follows": 50, "likes": 100})' },
        minDelaySeconds: { type: 'number', description: 'Minimum delay between actions (default: 45)' },
        maxDelaySeconds: { type: 'number', description: 'Maximum delay between actions with jitter (default: 180)' },
        accountId: { type: 'string' },
      },
      required: ['name', 'platform', 'campaignType'],
    },
  },
  {
    name: 'social_get_campaigns',
    description: 'Check status, progress, and daily action counts for all growth campaigns.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string' },
        status: { type: 'string' },
      },
    },
  },
  {
    name: 'social_stop_campaign',
    description: 'Pause or terminate an active automation campaign.',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string', description: 'Campaign ID' },
        action: { type: 'string', enum: ['pause', 'stop', 'resume'], description: 'Action to perform' },
      },
      required: ['campaignId'],
    },
  },
  {
    name: 'social_get_activity_log',
    description: 'Review audit log of all automated actions, posts, comment replies, and platform responses.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string' },
        actionType: { type: 'string' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'social_check_limits',
    description: 'Inspect platform rate limits, remaining daily quotas, active cooldowns, proxy status, and anti-ban safeguards.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string' },
        accountId: { type: 'string' },
      },
    },
  },
];

export const RESOURCES = [
  {
    uri: 'social://calendar',
    name: 'Social Media Calendar Schedule',
    description: 'Active schedule of upcoming posts, publication slots, and recent history',
    mimeType: 'application/json',
  },
  {
    uri: 'social://accounts',
    name: 'Connected Social Accounts',
    description: 'Connected social platforms, credentials status, and follower metrics',
    mimeType: 'application/json',
  },
  {
    uri: 'social://activity',
    name: 'Recent Social Activity Audit Log',
    description: 'Audit trail of recent posts, replies, and campaign actions',
    mimeType: 'application/json',
  },
];

export const PROMPTS = [
  {
    name: 'daily_social_summary',
    description: 'Generate an executive briefing of scheduled social posts, pending comments, and engagement metrics',
    arguments: [],
  },
  {
    name: 'craft_viral_post',
    description: 'Draft tailored multi-platform post variations for Reddit, Facebook, Instagram, Twitter/X, and Discord from a core topic',
    arguments: [
      { name: 'topic', description: 'Core idea or product update', required: true },
      { name: 'link', description: 'Optional URL to include', required: false },
    ],
  },
  {
    name: 'campaign_growth_strategy',
    description: 'Develop a safe FollowLiker / MassPlanner automation strategy for rapid organic growth',
    arguments: [
      { name: 'niche', description: 'Industry or niche focus', required: true },
      { name: 'platform', description: 'Target platform (reddit, instagram, twitter)', required: true },
    ],
  },
];

// ─── Dispatch Tool Calls ──────────────────────────────────────────────
export async function handleToolCall(name, args = {}, tenantId = '') {
  const tid = getTenantDefault(tenantId);

  switch (name) {
    case 'social_list_accounts': {
      const accounts = listAccounts(tid);
      const filtered = args.platform && args.platform !== 'all'
        ? accounts.filter(a => a.platform.toLowerCase() === args.platform.toLowerCase())
        : accounts;
      return {
        count: filtered.length,
        accounts: filtered.map(a => ({
          id: a.id,
          platform: a.platform,
          account_name: a.account_name,
          username: a.username,
          status: a.status,
          followers: a.follower_count,
          limits: {
            posts: `${a.today_posts}/${a.daily_post_limit}`,
            comments: `${a.today_comments}/${a.daily_comment_limit}`,
            dms: `${a.today_dms}/${a.daily_dm_limit}`,
            likes: `${a.today_likes}/${a.daily_like_limit}`,
            follows: `${a.today_follows}/${a.daily_follow_limit}`,
          },
          proxy: a.proxy_url ? 'Configured' : 'Direct host',
        })),
      };
    }

    case 'social_connect_account': {
      const account = saveAccount({
        tenantId: tid,
        platform: args.platform,
        accountName: args.accountName,
        username: args.username,
        credentials: args.credentials,
        proxyUrl: args.proxyUrl,
        dailyLimits: args.dailyLimits,
      });
      return { ok: true, message: `Successfully connected ${account.platform} account @${account.username}`, accountId: account.id };
    }

    case 'social_post_now': {
      const res = await publishPostNow({
        tenantId: tid,
        accountId: args.accountId,
        platform: args.platform,
        content: args.content,
        mediaUrls: args.mediaUrls,
        targetDestinations: args.targetDestinations,
        createdByAi: 'mcp_commander',
      });
      return res;
    }

    case 'social_schedule_post': {
      const res = schedulePost({
        tenantId: tid,
        accountId: args.accountId,
        platform: args.platform,
        content: args.content,
        scheduledAt: args.scheduledAt,
        naturalSlot: args.naturalSlot,
        mediaUrls: args.mediaUrls,
        targetDestinations: args.targetDestinations,
        createdByAi: 'mcp_commander',
      });
      return res;
    }

    case 'social_get_calendar': {
      const posts = getCalendar(tid, {
        startDate: args.startDate,
        endDate: args.endDate,
        platform: args.platform,
        status: args.status && args.status !== 'all' ? args.status : null,
        limit: args.limit || 50,
      });
      return {
        total: posts.length,
        posts: posts.map(p => ({
          id: p.id,
          platform: p.platform,
          status: p.status,
          scheduled_at: p.scheduled_at,
          published_at: p.published_at,
          content: p.content,
          destinations: p.target_destinations,
          url: p.platform_post_url || undefined,
          metrics: p.metrics,
        })),
      };
    }

    case 'social_cancel_post': {
      return cancelPost(args.postId, tid);
    }

    case 'social_get_comments': {
      const comments = getComments(tid, {
        platform: args.platform,
        accountId: args.accountId,
        status: args.status && args.status !== 'all' ? args.status : null,
        limit: args.limit || 50,
      });
      return { count: comments.length, comments };
    }

    case 'social_reply_comment': {
      return await replyComment({
        tenantId: tid,
        commentId: args.commentId,
        replyText: args.replyText,
        repliedBy: 'mcp_ai_commander',
      });
    }

    case 'social_get_messages': {
      const messages = getMessages(tid, {
        platform: args.platform,
        accountId: args.accountId,
        status: args.status && args.status !== 'all' ? args.status : null,
        limit: args.limit || 50,
      });
      return { count: messages.length, messages };
    }

    case 'social_send_message': {
      return sendMessage({
        tenantId: tid,
        accountId: args.accountId,
        platform: args.platform,
        conversationId: args.conversationId,
        recipientHandle: args.recipientHandle,
        messageText: args.messageText,
        aiHandled: 1,
      });
    }

    case 'social_set_auto_reply': {
      const rule = saveRule({
        tenantId: tid,
        platform: args.platform,
        ruleType: args.ruleType,
        triggerMatch: args.triggerMatch,
        actionType: args.actionType,
        responseTemplate: args.responseTemplate,
        aiInstructions: args.aiInstructions,
        cooldownSeconds: args.cooldownSeconds,
        dailyMaxTriggers: args.dailyMaxTriggers,
      });
      return { ok: true, message: `Auto-reply rule created for ${rule.platform}`, ruleId: rule.id };
    }

    case 'social_list_auto_replies': {
      const rules = listRules(tid, { platform: args.platform });
      return { count: rules.length, rules };
    }

    case 'social_start_campaign': {
      const campaign = createCampaign({
        tenantId: tid,
        accountId: args.accountId,
        name: args.name,
        platform: args.platform,
        campaignType: args.campaignType,
        targetCriteria: args.targetCriteria,
        dailyLimits: args.dailyLimits,
        minDelaySeconds: args.minDelaySeconds,
        maxDelaySeconds: args.maxDelaySeconds,
      });
      return { ok: true, message: `Growth campaign '${args.name}' started successfully`, campaignId: campaign.id };
    }

    case 'social_get_campaigns': {
      const campaigns = listCampaigns(tid, { platform: args.platform, status: args.status });
      return { count: campaigns.length, campaigns };
    }

    case 'social_stop_campaign': {
      const newStatus = args.action === 'resume' ? 'active' : (args.action === 'pause' ? 'paused' : 'stopped');
      return toggleCampaign(args.campaignId, tid, newStatus);
    }

    case 'social_get_activity_log': {
      const log = getActivityLog(tid, { platform: args.platform, actionType: args.actionType, limit: args.limit });
      return { count: log.length, activity: log };
    }

    case 'social_check_limits': {
      const accounts = listAccounts(tid);
      const filtered = args.platform ? accounts.filter(a => a.platform === args.platform) : accounts;
      return {
        safe_mode: true,
        jitter_enabled: true,
        accounts: filtered.map(a => ({
          account: `@${a.username} (${a.platform})`,
          posts: `${a.today_posts}/${a.daily_post_limit}`,
          comments: `${a.today_comments}/${a.daily_comment_limit}`,
          dms: `${a.today_dms}/${a.daily_dm_limit}`,
          likes: `${a.today_likes}/${a.daily_like_limit}`,
          follows: `${a.today_follows}/${a.daily_follow_limit}`,
          status: a.status,
        })),
      };
    }

    default:
      throw new Error(`Unknown MCP tool: ${name}`);
  }
}

// ─── JSON-RPC 2.0 Protocol Handler ────────────────────────────────────
export async function handleRpcRequest(request, tenantId = '') {
  const { jsonrpc, id, method, params = {} } = request || {};
  if (jsonrpc !== '2.0') {
    return { jsonrpc: '2.0', id: id || null, error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' } };
  }

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: MCP_SERVER_INFO,
            capabilities: {
              tools: { listChanged: false },
              resources: { subscribe: false, listChanged: false },
              prompts: { listChanged: false },
            },
          },
        };

      case 'notifications/initialized':
        return null; // Notifications return no response

      case 'ping':
        return { jsonrpc: '2.0', id, result: {} };

      case 'tools/list':
        return { jsonrpc: '2.0', id, result: { tools: TOOLS } };

      case 'tools/call': {
        const { name, arguments: toolArgs = {} } = params;
        const result = await handleToolCall(name, toolArgs, tenantId);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
              },
            ],
            isError: false,
          },
        };
      }

      case 'resources/list':
        return { jsonrpc: '2.0', id, result: { resources: RESOURCES } };

      case 'resources/read': {
        const { uri } = params;
        let contentText = '{}';
        if (uri === 'social://calendar') {
          contentText = JSON.stringify(getCalendar(tenantId, { limit: 50 }), null, 2);
        } else if (uri === 'social://accounts') {
          contentText = JSON.stringify(listAccounts(tenantId), null, 2);
        } else if (uri === 'social://activity') {
          contentText = JSON.stringify(getActivityLog(tenantId, { limit: 50 }), null, 2);
        }
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [{ uri, mimeType: 'application/json', text: contentText }],
          },
        };
      }

      case 'prompts/list':
        return { jsonrpc: '2.0', id, result: { prompts: PROMPTS } };

      case 'prompts/get': {
        const { name, arguments: promptArgs = {} } = params;
        if (name === 'daily_social_summary') {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              description: 'Executive briefing of scheduled social posts and comments',
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: 'Please review my connected social media accounts, upcoming calendar posts, and pending comments, and give me a concise morning briefing with action recommendations.',
                  },
                },
              ],
            },
          };
        }
        if (name === 'craft_viral_post') {
          const topic = promptArgs.topic || 'New update';
          const link = promptArgs.link || '';
          return {
            jsonrpc: '2.0',
            id,
            result: {
              description: 'Draft tailored multi-platform post variations',
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: `Craft tailored post variations for the topic: "${topic}" ${link ? `(Link: ${link})` : ''} formatted for Reddit, Facebook, Instagram, Twitter/X, and Discord. Keep Reddit authentic and discussion-oriented, Twitter punchy with hooks, Instagram visual with hashtag clusters, and Discord engaging for community members.`,
                  },
                },
              ],
            },
          };
        }
        throw new Error(`Prompt not found: ${name}`);
      }

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        };
    }
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: err.message },
    };
  }
}
