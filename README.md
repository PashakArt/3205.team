# URL Checker Dashboard

Сервис для массовой проверки доступности URL-адресов 

---

## Технологический стек

* **Backend:** Node.js, NestJS, TypeScript
* **Frontend:** React, TypeScript, Zustand, Vite
* **API Doc:** Swagger / OpenAPI
* **DevOps:** Docker, Docker Compose

---

## Запуск всего приложения
```
docker compose up --build -d
```

После завершения сборки приложения будут доступны по адресам:
- Web Dashboard (Frontend): http://localhost:5174
- REST API (Backend): http://localhost:3000
- Swagger API Docs: http://localhost:3000/docs