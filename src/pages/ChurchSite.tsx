import React, { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { usePublicChurchSite } from "@/hooks/useChurchSite";
import { ChurchSiteTemplate } from "@/components/church-site/ChurchSiteTemplate";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function ChurchSite() {
  const { slug } = useParams<{ slug: string }>();
  const { data: site, isLoading, error } = usePublicChurchSite(slug || "");

  // Update document title and meta when site loads
  useEffect(() => {
    if (site) {
      document.title = site.seo.title || site.branding.name || "Igreja";
      
      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && site.seo.description) {
        metaDesc.setAttribute("content", site.seo.description);
      }

      // Update og:image
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (site.seo.ogImageUrl) {
        if (!ogImage) {
          ogImage = document.createElement("meta");
          ogImage.setAttribute("property", "og:image");
          document.head.appendChild(ogImage);
        }
        ogImage.setAttribute("content", site.seo.ogImageUrl);
      }

      // Update og:title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute("content", site.seo.title || site.branding.name || "Igreja");

      // Update og:description
      if (site.seo.description) {
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (!ogDesc) {
          ogDesc = document.createElement("meta");
          ogDesc.setAttribute("property", "og:description");
          document.head.appendChild(ogDesc);
        }
        ogDesc.setAttribute("content", site.seo.description);
      }
    }
  }, [site]);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Site não encontrado</h1>
          <p className="text-muted-foreground max-w-md">
            O site que você está procurando não existe ou ainda não foi publicado.
          </p>
        </div>
      </div>
    );
  }

  return <ChurchSiteTemplate config={site} />;
}
