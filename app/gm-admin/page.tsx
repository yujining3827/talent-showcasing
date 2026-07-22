import { redirect } from "next/navigation";

// /gm-admin 진입 시 Clarity 요약으로 이동
export default function GmAdminIndex() {
  redirect("/gm-admin/clarity");
}
