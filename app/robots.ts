import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://unionai.appristine.co.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/account/legal/"],
      disallow: [
        "/dashboard/",
        "/tasks/",
        "/insights/",
        "/notifications/",
        "/weekly-check-in/",
        "/check-in-completed/",
        "/relationship-details/",
        "/create-union/",
        "/join-union/",
        "/code-created/",
        "/connected/",
        "/account/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
