CREATE TABLE IF NOT EXISTS server_state (
	id SERIAL PRIMARY KEY,
	heartbeat TIMESTAMP
);

INSERT INTO server_state(id, heartbeat) VALUES (1, NOW());
