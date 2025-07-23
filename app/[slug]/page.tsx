import { Metadata } from "next";
import { notFound } from "next/navigation";

async function getPage(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/pages/by-slug/${slug}`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getPage(params.slug);

  if (!page) {
    return {
      title: "Page Not Found",
      description: "The requested page could not be found.",
    };
  }

  return {
    title: page.data.attributes.seo?.metaTitle || page.data.attributes.title,
    description: page.data.attributes.seo?.metaDescription,
    keywords: page.data.attributes.seo?.metaKeywords,
    robots: page.data.attributes.seo?.metaRobots || "index, follow",
    ...(page.data.attributes.seo?.canonicalURL && {
      alternates: {
        canonical: page.data.attributes.seo.canonicalURL,
      },
    }),
  };
}

export default async function DynamicPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12">
      <article className="prose prose-lg mx-auto">
        <h1>{page.data.attributes.title}</h1>
        <div
          dangerouslySetInnerHTML={{ __html: page.data.attributes.content }}
          className="mt-8"
        />
      </article>
    </div>
  );
}
