import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "تواصل معنا | معرض العز",
    description:
        "هل لديك أسئلة؟ تواصل مع فريق معرض العز — نحن هنا لمساعدتك في العثور على سيارتك المثالية أو الإجابة عن أي استفسارات.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
