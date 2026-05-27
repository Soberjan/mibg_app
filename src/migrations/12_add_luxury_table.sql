CREATE TABLE IF NOT EXISTS luxury (
	id SERIAL PRIMARY KEY,
    "name" VARCHAR,
    price INT,
    influence INT
);
CREATE TABLE IF NOT EXISTS player_luxury (
    id SERIAL PRIMARY KEY,
    player_id INT REFERENCES player(id),
    luxury_id INT REFERENCES balance(id)
);
