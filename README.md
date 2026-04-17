http://localhost:5000/api/stations/fare?startId=1&endId=6

to test ; keep script under tests/ and name as something.test.js
inside backend: run-> npm test

entering DB: $ docker exec -it metrosheba_db psql -U user -d metrosheba

NEXT to do:
1. user cant buy multiple ticket within given time
2. API rate limit in the GROK
3. Overall security during login, strict checking
4. add ADMIN panel, ADMIN will be able to delete items from lost and found, delete user account, etc. [for later]



