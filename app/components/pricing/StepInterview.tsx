import Link from "next/link";
import { InlineField } from "./ui";
import { inputClass, type PricingForm } from "./types";
import type { HeroTalent } from "@/lib/heroTalents";

type Props = {
  form: PricingForm;
  patch: (p: Partial<PricingForm>) => void;
  onNext: () => void;
  canNext: boolean;
  talentName?: string;
  talentRole?: string;
  talentData?: HeroTalent | null;
};

/* 인재 요약 카드 — 상세 페이지 상단 요약을 문의 1스텝에서 다시 보여줌 */
function TalentSummaryCard({ t }: { t: HeroTalent }) {
  return (
    <div className="flex gap-4 rounded-xl border border-[#EEF1F5] bg-[#FAFBFC] p-4">
      {t.photo_url && (
        <div className="h-[88px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-[#E6EAF0]">
          <img src={t.photo_url} alt={t.name} className="h-full w-full object-cover" style={{ objectPosition: "center 20%" }} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#E8590C]">{t.role || "테크 전문가"}</p>
        <p className="mt-0.5 text-[17px] font-bold text-[#171E2D]">{t.name}</p>
        {t.headline && (
          <p className="mt-0.5 text-[13px] leading-[1.5] text-[#5B667A]">{t.headline.replace(/\s*\/n\s*/g, " ")}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#59657A]">
          <span className="font-semibold text-[#3A4356]">{t.yoeYears ? `${t.yoeYears}년차` : "신입"}{t.company ? ` · ${t.company}` : ""}</span>
          {t.school && <span>· {t.school}</span>}
          {t.language && <span>· {t.language}</span>}
        </div>
        {t.skills && t.skills.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {t.skills.slice(0, 5).map((s) => (
              <span key={s} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#5B667A] ring-1 ring-inset ring-[#E7EBF1]">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Step 1 (인재 특정 문의) — 인재 요약 + 담당자 정보(성함·기업명·연락처·동의) */
export default function StepInterview({ form, patch, onNext, canNext, talentName, talentRole, talentData }: Props) {
  const name = talentData?.name || talentName;
  const role = talentData?.role || talentRole;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[19px] font-bold text-[#171E2D]">채용 문의할 인재</h2>
        <p className="mt-1 text-[14px] leading-[1.5] text-[#8A93A5]">
          아래 인재로 채용 문의를 진행합니다. 연락받으실 담당자 정보를 입력해주세요.
        </p>
      </div>

      {/* 인재 요약 (상세 페이지 상단 요약 재노출) */}
      {talentData ? (
        <TalentSummaryCard t={talentData} />
      ) : (
        name && (
          <div className="rounded-xl border border-[#EEF1F5] bg-[#FAFBFC] p-4">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#E8590C]">{role || "테크 전문가"}</p>
            <p className="mt-0.5 text-[17px] font-bold text-[#171E2D]">{name}</p>
          </div>
        )
      )}

      {/* 담당자 정보 */}
      <div>
        <h3 className="text-[15px] font-bold text-[#171E2D]">담당자 정보</h3>
        <div className="mt-4 flex flex-col gap-5">
          <InlineField label="성함" required>
            <input className={inputClass} value={form.name} onChange={(e) => patch({ name: e.target.value })} placeholder="홍길동" />
          </InlineField>
          <InlineField label="기업명" required>
            <input className={inputClass} value={form.company} onChange={(e) => patch({ company: e.target.value })} placeholder="(주)공고마감" />
          </InlineField>
          <InlineField label="연락처" required hint="전화 또는 이메일">
            <input className={inputClass} value={form.contact} onChange={(e) => patch({ contact: e.target.value })} placeholder="010-0000-0000 / name@company.com" />
          </InlineField>
        </div>

        {/* 개인정보 수집·이용 동의 (필수) — 담당자 정보와 구분선으로 분리 */}
        <label className="mt-5 flex cursor-pointer items-start gap-2.5 border-t border-[#EEF1F5] pt-5">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => patch({ consent: e.target.checked })}
            className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-[#E8590C]"
          />
          <span className="text-[13.5px] leading-[1.6] text-[#3A4356]">
            <span className="font-semibold">[필수]</span> 인재 추천 상담을 위한 개인정보(성함·기업명·연락처) 수집·이용에 동의합니다.{" "}
            <Link href="/privacy" target="_blank" className="font-medium text-[#8A93A5] underline underline-offset-2 transition hover:text-[#E8590C]">
              자세히 보기
            </Link>
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="mt-1 inline-flex items-center justify-center rounded-md bg-[#E8590C] px-6 py-4 text-[16px] font-semibold text-white transition hover:bg-[#C74E0A] disabled:cursor-not-allowed disabled:opacity-40"
      >
        다음 →
      </button>
    </div>
  );
}
