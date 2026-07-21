import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Ravencrest Academy's support team. We're here to help with any questions about our tutoring platform.",
  openGraph: {
    title: "Contact Us | Ravencrest Academy",
    description: "Contact Ravencrest Academy for support, inquiries, or feedback. Our team is here to help.",
  },
  twitter: {
    title: "Contact Us | Ravencrest Academy",
    description: "Contact Ravencrest Academy for support, inquiries, or feedback.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
