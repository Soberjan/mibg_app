CREATE TABLE IF NOT EXISTS question (
    id SERIAL PRIMARY KEY,
    "type" VARCHAR,
    role VARCHAR,
    text VARCHAR,
    answer VARCHAR,
    reward INT,
    reward_type VARCHAR
);

CREATE TABLE IF NOT EXISTS lobby_question (
    id SERIAL PRIMARY KEY,
    lobby_id INT REFERENCES lobby(id),
    question_id INT REFERENCES question(id),
    asked BOOLEAN
);

