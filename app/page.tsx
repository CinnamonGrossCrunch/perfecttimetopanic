export const runtime = "nodejs";


import { fetchAllSources } from "../lib/fetchAllSources";
import { summarizeWithGPT } from "../lib/summarizeWithGPT";
import ArticleGrid from "../components/ArticleGrid";

type Article = {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  thumbnail?: string | null;
  image?: string | null;
  source: {
    name: string;
  };
};

type StructuredSummary = {
  "the panic": string;
  "the hope": string;
  "the action": string;
};

export default async function Home() {
  const articles: Article[] = await fetchAllSources();

  const summaries: StructuredSummary[] = await Promise.all(
    articles.map((article) =>
      summarizeWithGPT({
        title: article.title,
        description: article.description,
      })
    )
  );

  return <ArticleGrid articles={articles} summaries={summaries} />;
}