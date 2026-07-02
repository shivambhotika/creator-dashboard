export function buildScreenshotUrl(sourceUrl: string): string | undefined {
  const template = process.env.SOCIAL_SCREENSHOT_URL_TEMPLATE;
  if (template) {
    return template.replace("{url}", encodeURIComponent(sourceUrl));
  }

  const screenshotOneKey = process.env.SCREENSHOTONE_ACCESS_KEY;
  if (!screenshotOneKey) return undefined;

  const params = new URLSearchParams({
    access_key: screenshotOneKey,
    url: sourceUrl,
    format: "png",
    viewport_width: "1280",
    viewport_height: "900",
    full_page: "false",
    block_ads: "true",
    block_cookie_banners: "true",
  });
  return `https://api.screenshotone.com/take?${params.toString()}`;
}
