ALTER TABLE lobby RENAME COLUMN state TO status;
ALTER TABLE lobby ALTER COLUMN status TYPE varchar(30);
