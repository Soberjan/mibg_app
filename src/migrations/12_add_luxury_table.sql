CREATE TABLE IF NOT EXISTS luxury (
	id SERIAL PRIMARY KEY,
    "name" VARCHAR,
    price INT,
    influence INT
);
CREATE TABLE IF NOT EXISTS balance_luxury (
    id SERIAL PRIMARY KEY,
    balance_id INT REFERENCES balance(id),
    luxury_id INT REFERENCES luxury(id)
);
