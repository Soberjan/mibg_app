CREATE TABLE IF NOT EXISTS lobby (
	id SERIAL PRIMARY KEY,
    state VARCHAR(10)
);
CREATE TABLE IF NOT EXISTS player (
	id SERIAL PRIMARY KEY,
    role VARCHAR(20),
    "name" VARCHAR(80),
    lobby_id INT REFERENCES lobby(id)
);
CREATE TABLE IF NOT EXISTS balance (
	id SERIAL PRIMARY KEY,
    lobby_id INT REFERENCES lobby(id),
    owner_id INT REFERENCES player(id),
    money INT,
    "type" VARCHAR(50)
);
