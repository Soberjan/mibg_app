CREATE TABLE IF NOT EXISTS client (
	id SERIAL PRIMARY KEY,
    key VARCHAR(64) NOT NULL,
    lobby_id INT REFERENCES lobby(id) NOT NULL,
    player_id INT REFERENCES player(id),
    CONSTRAINT client_key_lobby_unique UNIQUE (key, lobby_id)
);
