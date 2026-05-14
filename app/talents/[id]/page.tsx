import { notFound } from "next/navigation";
import { dummyTalents } from "@/lib/dummy-talents";
import { AbilityCard } from "@/app/components/talent/AbilityCard";
import { CareerHistory } from "@/app/components/talent/CareerHistory";
import { TalentTags } from "@/app/components/talent/TalentTags";
import { InterviewCTA } from "@/app/components/talent/InterviewCTA";
import { DetailNav } from "./DetailNav";

export function generateStaticParams() {
  return dummyTalents.map((t) => ({ id: t.id }));
}

export default function TalentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const talent = dummyTalents.find((t) => t.id === params.id);
  if (!talent) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[720px] mx-auto px-4 py-6">
        {/* A. 네비게이션 */}
        <DetailNav />

        {/* B. 메인 능력치 카드 */}
        <AbilityCard talent={talent} />

        {/* C. 경력 */}
        <CareerHistory careers={talent.career_history} />

        {/* D. 태그 */}
        <TalentTags tags={talent.tags} availability={talent.availability} />

        {/* E. CTA (모바일 sticky) */}
        <div className="md:relative sticky bottom-0 left-0 right-0 md:mt-0 mt-3 md:p-0 p-3 md:bg-transparent bg-white md:border-none border-t-[0.5px] border-gray-200/60 z-10">
          <InterviewCTA talent={talent} />
        </div>
      </div>
    </main>
  );
}
