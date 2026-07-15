import { redirect } from "next/navigation";

// /gm-admin 진입 시 1:1 채팅으로 이동 (상담 리드는 /gm-admin/leads)
export default function GmAdminIndex() {
  redirect("/gm-admin/chats");
}
