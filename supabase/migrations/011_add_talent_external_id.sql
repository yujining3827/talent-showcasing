-- 외부 연동용 컬럼 추가 (salarymap 등에서 보낸 인재 식별)
alter table talents add column if not exists external_id text;
alter table talents add column if not exists external_source text;

-- 같은 소스에서 같은 ID로 중복 등록 방지
create unique index if not exists talents_external_unique on talents (external_source, external_id) where external_id is not null;
