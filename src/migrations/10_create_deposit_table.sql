CREATE TABLE IF NOT EXISTS deposit(
    id SERIAL PRIMARY KEY,
    lobby_id INT REFERENCES lobby(id),
    balance_id INT REFERENCES balance(id),
    ends_at TIMESTAMP,
    sum INT,
    interest FLOAT,
    state VARCHAR(30)
);
