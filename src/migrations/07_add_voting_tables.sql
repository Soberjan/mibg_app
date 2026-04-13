CREATE TABLE IF NOT EXISTS election (
    id SERIAL PRIMARY KEY,
    lobby_id int REFERENCES lobby(id),
    round int,
    status VARCHAR(30)
);
CREATE TABLE IF NOT EXISTS vote (
    id SERIAL PRIMARY KEY,
    voted_id int REFERENCES player(id),
    elected_id int REFERENCES player(id),
    election_id int REFERENCES election(id),
    round int,
    UNIQUE (voted_id, election_id, round)
);
