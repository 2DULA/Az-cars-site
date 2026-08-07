import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "من نحن | معرض العز",
    description:
        "معرض العز العالمي — متخصصون في استيراد السيارات من كوريا منذ 2019. خبرة ممتدة، أكثر من 3000 سيارة، ودعم متواصل.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
