next_to_implement:
1. API rate limiter for all requests and LLM API call
2. optimizing pgvector query and other database query
3. test KUBERNATES on local Machine with scale up and scale down of contianers using API tester tools 

Currently done features:
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









```
test_metro
├─ apps
│  ├─ backend
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  └─ src
│  │     ├─ app.js
│  │     ├─ config
│  │     ├─ controllers
│  │     │  ├─ aiController.js
│  │     │  ├─ authController.js
│  │     │  ├─ gateController.js
│  │     │  ├─ paymentController.js
│  │     │  ├─ stationController.js
│  │     │  └─ ticketController.js
│  │     ├─ data
│  │     │  └─ fare.js
│  │     ├─ index.js
│  │     ├─ middleware
│  │     │  └─ authMiddleware.js
│  │     ├─ models
│  │     ├─ routes
│  │     │  ├─ aiRoutes.js
│  │     │  ├─ authRoutes.js
│  │     │  ├─ lostFoundRoutes.js
│  │     │  ├─ paymentRoutes.js
│  │     │  ├─ stationRoutes.js
│  │     │  └─ ticketRoutes.js
│  │     ├─ services
│  │     │  └─ aiService.js
│  │     ├─ tests
│  │     │  ├─ fare.test.js
│  │     │  └─ gateController.test.js
│  │     └─ utils
│  │        ├─ seedKnowledge.js
│  │        └─ simulation.js
│  └─ frontend
│     ├─ eslint.config.js
│     ├─ index.html
│     ├─ package-lock.json
│     ├─ package.json
│     ├─ playwright-report
│     │  └─ index.html
│     ├─ playwright.config.js
│     ├─ public
│     │  ├─ favicon.svg
│     │  ├─ icons.svg
│     │  └─ metro_rail.jpg
│     ├─ README.md
│     ├─ src
│     │  ├─ api
│     │  │  └─ metroApi.js
│     │  ├─ App.css
│     │  ├─ App.jsx
│     │  ├─ assets
│     │  │  ├─ hero.png
│     │  │  ├─ react.svg
│     │  │  └─ vite.svg
│     │  ├─ components
│     │  │  ├─ ChatBot.jsx
│     │  │  ├─ Footer.jsx
│     │  │  ├─ MetroMap.jsx
│     │  │  └─ TicketModel.jsx
│     │  ├─ index.css
│     │  ├─ main.jsx
│     │  └─ pages
│     │     ├─ BuyTicket.jsx
│     │     ├─ Dashboard.jsx
│     │     ├─ Home.jsx
│     │     ├─ Login.jsx
│     │     ├─ LostFound.jsx
│     │     ├─ Register.jsx
│     │     ├─ StationGate.jsx
│     │     └─ TopUp.jsx
│     ├─ test-results
│     │  └─ .last-run.json
│     ├─ tests
│     │  ├─ example.spec.js
│     │  ├─ register.spec.js
│     │  └─ test1.spec.js
│     └─ vite.config.js
├─ dev_run_instructions.txt
├─ docker
│  └─ db_init
│     └─ init.sql
├─ docker-compose.yml
├─ playwright_instructions.txt
├─ README.md
└─ run.sh

```