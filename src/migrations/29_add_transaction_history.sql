CREATE TABLE IF NOT EXISTS transaction_history(
    id SERIAL PRIMARY KEY,
    lobby_id INT REFERENCES lobby(id),
    sent_to INT REFERENCES balance(id),
    sent_from INT REFERENCES balance(id),
    sent_at TIMESTAMP
);
