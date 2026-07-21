export function generateOrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ravencrestacademy.com";
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Ravencrest Academy",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Premium 1-on-1 tutoring, elite academic mentoring, and competitive exam preparation.",
    "sameAs": [
      "https://facebook.com/ravencrestacademy",
      "https://twitter.com/ravencrestacad",
      "https://linkedin.com/company/ravencrestacademy"
    ],
    "knowsAbout": ["Mathematics", "Physics", "Chemistry", "Computer Science", "Languages", "Test Prep"]
  };
}

export function generateWebSiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ravencrestacademy.com";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Ravencrest Academy",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/tutors?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateTutorPersonJsonLd(tutor: {
  name: string;
  bio?: string;
  subjects?: string[];
  education?: string;
  profileImage?: string;
  url?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ravencrestacademy.com";
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": tutor.name,
    "description": tutor.bio || `Tutor at Ravencrest Academy specializing in ${tutor.subjects?.join(", ") || "academic subjects"}.`,
    "image": tutor.profileImage || `${baseUrl}/default-avatar.png`,
    "jobTitle": "Academic Tutor",
    "worksFor": {
      "@type": "Organization",
      "name": "Ravencrest Academy"
    },
    "knowsAbout": tutor.subjects || []
  };
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
