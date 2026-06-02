CREATE TABLE IF NOT EXISTS player_question (
    id SERIAL PRIMARY KEY,
    player_id INT REFERENCES player(id),
    question_id INT REFERENCES question(id)
);
