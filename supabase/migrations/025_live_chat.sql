-- 025_live_chat.sql — 1:1 실시간 채팅 (방문자 ↔ 어드민)
-- 대화방
create table if not exists chat_threads (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null,
  visitor_name text,
  visitor_contact text,
  status text not null default 'open' check (status in ('open', 'assigned', 'closed')),
  assigned_admin uuid references user_profiles(id),
  origin_path text,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
create index if not exists idx_chat_threads_visitor on chat_threads(visitor_id);
create index if not exists idx_chat_threads_last on chat_threads(last_message_at desc);

-- 메시지
create table if not exists chat_messages (
  id bigint generated always as identity primary key,
  thread_id uuid not null references chat_threads(id) on delete cascade,
  sender text not null check (sender in ('visitor', 'admin')),
  admin_id uuid references user_profiles(id),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists idx_chat_messages_thread on chat_messages(thread_id, created_at);

-- RLS: 클라이언트 직접 읽기/쓰기 차단 (모든 조작은 API의 service_role 경유)
-- 단, 어드민 화면의 실시간 구독을 위해 어드민 계정만 SELECT 허용
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;

create policy chat_threads_admin_select on chat_threads
  for select to authenticated
  using (exists (
    select 1 from user_profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  ));

create policy chat_messages_admin_select on chat_messages
  for select to authenticated
  using (exists (
    select 1 from user_profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  ));

-- 어드민 화면 실시간 반영 (postgres_changes 구독 대상 등록)
alter publication supabase_realtime add table chat_threads;
alter publication supabase_realtime add table chat_messages;
