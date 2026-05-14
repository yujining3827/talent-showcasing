export interface CurrentUser {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPosition?: string;
}

export const dummyCurrentUser: CurrentUser = {
  companyName: "ABC상사 (주)",
  contactName: "김인사",
  contactEmail: "hr@abc-corp.com",
  contactPosition: "HR 매니저",
};

export function getCurrentUser(): CurrentUser {
  return dummyCurrentUser;
}
