import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const clinics = await prisma.clinic.findMany({ select: { slug: true, updatedAt: true } });

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/planos`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const clinicPages: MetadataRoute.Sitemap = clinics.flatMap((c) => [
    { url: `${siteUrl}/c/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/c/${c.slug}/servicos`, lastModified: c.updatedAt, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/c/${c.slug}/portfolio`, lastModified: c.updatedAt, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/c/${c.slug}/agendar`, lastModified: c.updatedAt, changeFrequency: "monthly", priority: 0.7 },
  ]);

  return [...staticPages, ...clinicPages];
}
