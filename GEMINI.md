# Projekt: Menadżer Zadań (Full-Stack)
 
## Architektura
- **Backend (`/backend`)**:
  - Technologia: .NET 8 Web API (Minimal API)
  - Baza danych: SQLite (`tasks.db`) z użyciem Entity Framework Core
  - Port domyślny: `http://localhost:5217`
  - CORS skonfigurowany dla lokalnego frontendu.

- **Frontend (`/frontend`)**:
  - Technologia: React 19 + TypeScript + Vite
  - Stylowanie: Tailwind CSS v4 (z obsługą trybu ciemnego)
  - Ikony: Lucide React
  - Port domyślny: `http://localhost:5173`

## Zasady i Konwencje
- Zawsze piszemy czysty, w pełni otypowany kod zgodny ze standardami językowymi (TypeScript w trybie ścisłym / C#).
- Nie uruchamiamy serwerów w tle podczas wprowadzania zmian – przygotowujemy pliki, instalujemy zależności i weryfikujemy kod za pomocą testów/kompilacji (`dotnet build`, `npm run build`).
