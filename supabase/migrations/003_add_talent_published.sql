-- initials → name 컬럼명 변경
alter table talents rename column initials to name;

-- talents 테이블에 게시 상태 및 사진 컬럼 추가
alter table talents add column if not exists published boolean not null default true;
alter table talents add column if not exists photo_url text;
alter table talents add column if not exists resume_url text;

-- admin만 인재 등록/수정/삭제 가능
create policy "talents_admin_insert" on talents
  for insert with check (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "talents_admin_update" on talents
  for update using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "talents_admin_delete" on talents
  for delete using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );
