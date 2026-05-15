-- user_profiles에 회사명, 담당자명 컬럼 추가
alter table user_profiles add column if not exists company_name text;
alter table user_profiles add column if not exists contact_name text;

-- 유저가 본인 프로필의 company_name, contact_name을 업데이트할 수 있는 정책
create policy "user_profiles_self_update" on user_profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);
