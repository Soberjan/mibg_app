CREATE TABLE IF NOT EXISTS property (
    id SERIAL PRIMARY KEY,
    tile_number INT,
    lobby_id INT REFERENCES lobby(id),
    owner_id INT REFERENCES balance(id),
    price INT,
    "level" INT,
    income INT
);
