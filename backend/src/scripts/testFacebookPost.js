import '../config/env.js';
import axios from 'axios';

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v24.0';
const pageId = process.env.META_PAGE_ID || process.env.FACEBOOK_PAGE_ID || '';
let pageAccessToken =
  process.env.META_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
const userAccessToken =
  process.env.META_USER_ACCESS_TOKEN || process.env.FACEBOOK_USER_ACCESS_TOKEN || '';

const args = process.argv.slice(2);

const readArg = (name) => {
  const index = args.indexOf(name);
  if (index === -1) return '';
  return args[index + 1] || '';
};

const hasFlag = (name) => args.includes(name);

const message =
  readArg('--message') ||
  `Test autopost from SarkariPulse backend at ${new Date().toISOString()}`;
const link = readArg('--link');
const dryRun = hasFlag('--dry-run');

const usage = () => {
  console.log(`
Usage:
  npm run facebook:test-post -- --message "Test post" --link "https://example.com"

Required env:
  META_PAGE_ID=your_facebook_page_id
  META_PAGE_ACCESS_TOKEN=your_page_access_token

Alternative token env:
  META_USER_ACCESS_TOKEN=your_user_access_token
  The script will try to resolve a Page access token from /me/accounts.

Optional env:
  META_GRAPH_VERSION=${GRAPH_VERSION}

Options:
  --message   Text to publish. A default test message is used if omitted.
  --link      Optional URL to attach with the post.
  --dry-run   Print request details without publishing.
`);
};

const fail = (messageText) => {
  console.error(`Error: ${messageText}`);
  usage();
  process.exit(1);
};

if (hasFlag('--help') || hasFlag('-h')) {
  usage();
  process.exit(0);
}

if (!pageId) {
  fail('META_PAGE_ID is missing.');
}

if (!pageAccessToken && !userAccessToken) {
  fail('META_PAGE_ACCESS_TOKEN or META_USER_ACCESS_TOKEN is missing.');
}

if (!message.trim() && !link.trim()) {
  fail('Provide --message or --link.');
}

const endpoint = `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/feed`;

const fetchJson = async (url, options) => {
  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error?.message || error.message);
    err.status = error.response?.status;
    err.data = error.response?.data;
    throw err;
  }
};

const resolvePageAccessToken = async () => {
  if (pageAccessToken) return pageAccessToken;

  let url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/me/accounts`);
  url.searchParams.set('fields', 'id,name,access_token');
  url.searchParams.set('limit', '100');
  url.searchParams.set('access_token', userAccessToken);

  for (let page = 0; page < 5 && url; page += 1) {
    const data = await fetchJson(url.toString());
    const match = data?.data?.find((item) => String(item.id) === String(pageId));

    if (match?.access_token) {
      console.log(`Resolved Page access token for: ${match.name || pageId}`);
      return match.access_token;
    }

    url = data?.paging?.next ? new URL(data.paging.next) : null;
  }

  throw new Error(
    'Could not resolve Page access token. Check page ID, pages_show_list, pages_read_engagement, and pages_manage_posts permissions.'
  );
};

const main = async () => {
  if (dryRun) {
    console.log('Dry run only. Nothing was posted.');
    console.log({
      endpoint,
      pageId,
      graphVersion: GRAPH_VERSION,
      tokenSource: pageAccessToken ? 'page access token' : 'user access token lookup',
      message: message.trim(),
      link: link.trim() || undefined
    });
    return;
  }

  pageAccessToken = await resolvePageAccessToken();

  const body = new URLSearchParams();
  body.set('access_token', pageAccessToken);

  if (message.trim()) body.set('message', message.trim());
  if (link.trim()) body.set('link', link.trim());

  let data;

  try {
    const response = await axios.post(endpoint, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    });
    data = response.data;
  } catch (error) {
    const apiError = error.response?.data?.error;
    console.error('Facebook post failed.');
    console.error({
      status: error.response?.status,
      message: apiError?.message || error.message,
      type: apiError?.type,
      code: apiError?.code,
      subcode: apiError?.error_subcode
    });

    console.error('\nCheck that your token is a Page access token with pages_manage_posts and pages_read_engagement permissions, and that you can manage this Page.');
    process.exit(1);
  }

  console.log('Facebook post published successfully.');
  console.log({
    id: data.id,
    pageId
  });
};

main().catch((error) => {
  console.error('Facebook post failed:', error.message);
  process.exit(1);
});
