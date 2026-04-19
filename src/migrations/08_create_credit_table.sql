CREATE TABLE IF NOT EXISTS credit (
    id SERIAL PRIMARY KEY,
    balance_id INT REFERENCES balance(id),
    start_time TIMESTAMP,
    duration_time INTERVAL,
    sum INT,
    interest FLOAT,
    state VARCHAR(30)
);
