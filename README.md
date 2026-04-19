Currently done: functions
1. users can sign up and login
2. users can top-up balance from bank account (mock bank table)
3. users can buy one time valid ticket (will have 1h validity)
4. Ticket validity will be changed during time.
4.5. Upon buying ticket, QR code will be generated, which will be downloadable (PDF copy)
5. Gate Punch system: users can punch in and out during the 1h window 
6. users can ask for suggestions to AI chatbot
7. users can see map too see crowed status (to be updated further)
8. users will be penalized balance if they do not follow the ticket policy


security and AI;
AI:  userMessage -> RAG pipeline (landmark based from vector databse) -> LLM  -> response

security: 
1. accessToken and RefreshToken are used for seamlessness and security
2. XSS & CSRF proof (used httpOnly cookies)\
3. users can't buy ticket with insufficiant balance
4. users can't punch in and out in same station
5. users can't use two emails (to be updated)

issues in prod: 
1. when refresh shows error message everything else works fine
2. 

to implement:
1. update the fonts and logos and writings 
2. focus on the RAG pipeline and make it better at response
3. try to add dark mode feature [for later]





