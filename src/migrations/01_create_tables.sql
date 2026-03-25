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
    money INT,
    "type" VARCHAR(50)
);
CREATE TABLE IF NOT EXISTS player_balance (
    id SERIAL PRIMARY KEY,
    player_id INT REFERENCES player(id),
    balance_id INT REFERENCES balance(id)
);
