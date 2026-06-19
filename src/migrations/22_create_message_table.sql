CREATE TABLE IF NOT EXISTS message (
	id SERIAL PRIMARY KEY,
    lobby_id INT REFERENCES lobby(id),
    sent_from INT REFERENCES player(id),
    sent_to INT REFERENCES player(id),
    text VARCHAR(20),
	sent_at TIMESTAMP
);
