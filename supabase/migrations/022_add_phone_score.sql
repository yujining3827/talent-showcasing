-- legacy 시트 임포트용: phone interview score 저장
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS phone_score int;
