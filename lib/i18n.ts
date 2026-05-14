export const availabilityKR = {
  immediate: "즉시 합류 가능",
  negotiable: "협의 가능",
  employed: "현직",
} as const;

const roleSuffixKR: Record<string, string> = {
  프론트엔드: "개발자",
  백엔드: "개발자",
  풀스택: "개발자",
  "UI/UX 디자이너": "",
  "데이터 분석가": "",
  QA: "엔지니어",
  DevOps: "엔지니어",
};

export function formatRoleTitle(role: string): string {
  const suffix = roleSuffixKR[role];
  if (suffix === undefined) return role;
  return suffix ? `${role} ${suffix}` : role;
}
