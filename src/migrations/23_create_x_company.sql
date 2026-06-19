CREATE TABLE IF NOT EXISTS branch (
    id SERIAL PRIMARY KEY,
    lobby_id INT REFERENCES lobby(id),
    owner_id INT REFERENCES balance(id),
    "name" VARCHAR(50)
);
