# AI Powered Flight Crew Dispatch Coordinator

An enterprise-grade airline fleet scheduling and crew optimization system powered by a multi-agent **LangGraph** engine, **Spring Boot**, and **React**. It tracks pilot duty logs, monitors severe weather warnings at hubs, schedules rotations, checks FAA rest guidelines, and automatically suggests crew swaps when fatigue alerts trigger.

---

## Technical Stack & Architecture

- **Frontend**: React (Vite), Tailwind CSS (Aviation HUD Theme), Recharts, Leaflet Airport Maps, Axios
- **Backend Services**: Java Spring Boot 3.3.1, Spring Security (JWT), Spring Data JPA (PostgreSQL / H2)
- **AI Agent Engine**: FastAPI (Python), LangGraph Workflow Pipeline, LangChain
- **Databases**: PostgreSQL (Production) / H2 in-memory (Development)
- **Dockerization**: Docker Compose orchestrating all service nodes

---

## Folder Structure

```text
├── skycrew-backend/      # Spring Boot REST API
├── skycrew-frontend/     # React Single Page Application
├── skycrew-ai/           # Python FastAPI LangGraph Agents
├── docker-compose.yml    # Root deployment container stack
├── AWS_DEPLOYMENT.md     # Production cloud migration guide
└── postman_collection.json # API endpoints testing collection
```

---

## 1. Quick Start (Using Docker Compose)

To spin up the entire application stack including a local PostgreSQL instance:

1. **Clone/Open the Workspace** and run from the root directory:
   ```bash
   docker-compose up --build -d
   ```
2. **Access Points**:
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Spring Boot Backend**: [http://localhost:8080](http://localhost:8080)
   - **AI Microservice**: [http://localhost:8000](http://localhost:8000)
   - **Swagger UI Docs**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

## 2. Local Manual Development Execution

If you prefer to run services manually for debugging:

### A. Python AI Microservice (`skycrew-ai`)
1. Change directory and set up a virtual environment:
   ```bash
   cd skycrew-ai
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Uvicorn engine:
   ```bash
   python main.py
   ```

### B. Spring Boot Backend (`skycrew-backend`)
1. Ensure JDK 17 is installed. Run the maven compiler wrapper:
   ```bash
   cd skycrew-backend
   mvn clean spring-boot:run
   ```
2. By default, it runs on port `8080` with profile `dev` using an in-memory H2 database (accessible at `/h2-console` with JDBC URL `jdbc:h2:mem:skycrewdb`).

### C. React Frontend (`skycrew-frontend`)
1. Install Node.js dependencies and initiate development server:
   ```bash
   cd skycrew-frontend
   npm install
   npm run dev
   ```
2. The UI is served at `http://localhost:5173` (or `http://localhost:3000` under Docker redirection).

---

## 3. Seed Users & Role Permissions

The database seeds default operator logins on startup (`DataInitializer.java`):

| Username | Password | Role Group | Permitted Actions |
| :--- | :--- | :--- | :--- |
| `admin` | `password` | `ROLE_ADMIN` | Full access, Delete flights/crew, Register airports/aircrafts |
| `dispatcher` | `password` | `ROLE_DISPATCHER` | Create flights, assign crew, trigger weather simulations |
| `ops_manager` | `password` | `ROLE_OPERATIONS_MANAGER`| Modify AI Rule thresholds, log duty/rest hours |
| `john_doe` | `password` | `ROLE_PILOT` | Read crew roster schedules |

---

## 4. Key AI & Operations Features

- **Interactive Airspace Map**: Uses React Leaflet to map out JFK, LAX, and Chicago ORD with live plane coordinates showing real-time flight lines.
- **FAA Compliance Engine**: Live verification when assigning crew: checks if pilot certificates match the Boeing/Airbus type, checks if rest is below 10 hours, and alerts dispatchers before committing.
- **LangGraph Visualizer**: Select any flight in the `LangGraph Live Flow` tab, click "Optimize", and view an animated node flowchart tracking execution from Weather checks through to dispatcher sign-off.
- **Operations Reports**: Generate daily/monthly reports and download them client-side in Excel (CSV format) or print cleanly formatted PDF sheets.
