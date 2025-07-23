import { adminApiClient } from "./admin-api-client";

export interface PageContent {
  pageName: "home" | "about" | "contact" | "shop";
  sections: Array<{
    __component: string;
    id: number;
    [key: string]: any;
  }>;
  seo?: {
    title: string;
    description: string;
    keywords: string;
  };
}

export class PageContentService {
  private static instance: PageContentService;

  private constructor() {}

  public static getInstance(): PageContentService {
    if (!PageContentService.instance) {
      PageContentService.instance = new PageContentService();
    }
    return PageContentService.instance;
  }

  async getPageContent(pageName: string): Promise<PageContent> {
    try {
      const response = await fetch(`/api/page-contents/by-page/${pageName}`);
      if (!response.ok) {
        throw new Error("Failed to fetch page content");
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching page content:", error);
      throw error;
    }
  }

  async updatePageContent(
    pageName: string,
    data: Partial<PageContent>
  ): Promise<PageContent> {
    try {
      const response = await adminApiClient.put(
        `/api/page-contents/by-page/${pageName}`,
        {
          data,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating page content:", error);
      throw error;
    }
  }
}

export const pageContentService = PageContentService.getInstance();
