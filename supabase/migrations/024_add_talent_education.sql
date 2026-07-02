-- 스핀오프: 동의 기반 노출 — 인재 카드에 상위 대학/졸업연도 강조
-- candidates 테이블엔 이미 university/graduation_year 가 있으나(010), talents(공개 카드)엔 없어
-- 카드로 흘려보내기 위해 컬럼 추가. (전 직장은 career_history jsonb 에 이미 존재)
alter table talents add column if not exists university text;
alter table talents add column if not exists graduation_year text;

comment on column talents.university is '출신 대학 (동의 기반 노출, 카드 강조)';
comment on column talents.graduation_year is '졸업 연도';
