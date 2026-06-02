INSERT INTO lobby_questions (lobby_id, question_id, asked)
SELECT -1, GENERATE_SERIES(1, 83), FALSE;
