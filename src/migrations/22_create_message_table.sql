CREATE TABLE IF NOT EXISTS message (
	id SERIAL PRIMARY KEY,
    lobby_id INT REFERENCES lobby(id),
    sender_id INT REFERENCES player(id),
    receiver_id INT REFERENCES player(id),
    text VARCHAR(20),
	sent_at TIMESTAMP
);
