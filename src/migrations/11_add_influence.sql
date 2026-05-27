ALTER TABLE player ADD COLUMN IF NOT EXISTS influence INT;
UPDATE player SET influence=100 WHERE id=-1;
UPDATE player SET influence=50 WHERE id=-2;
UPDATE player SET influence=10 WHERE id=-3;
