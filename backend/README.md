# Backend (Node.js/Express)

API server for the FEFO inventory application. It exposes endpoints for
products, categories, warehouses, lots, etc. A MySQL database is required and
connection settings are read from `.env`.

## Authentication

A simple JWT-based authentication layer has been added:

* `POST /api/auth/register` – create a new user (name, email, password,
  rol_id).  This uses bcrypt to hash the password before storing it.
* `POST /api/auth/login` – returns a JSON object containing a `token` when
  the supplied credentials are valid.

Protected routes (`/api/productos`, `/api/categorias`, `/api/almacenes`,
`/api/lotes`) require an `Authorization: Bearer <token>` header.  The
middleware located in `middleware/auth.js` verifies and decodes the token and
attaches the user payload to `req.user`.

### Seed a default user

A helper script is provided (`npm run seed`) that inserts a user with hard‑
coded email `admin@example.com` and password `password123`.  Run it after
you've created the database and tables.

### Dependencies

The package.json now includes `bcrypt` and `jsonwebtoken`.  Run

```bash
npm install
# or, to only add the new packages:
npm install bcrypt jsonwebtoken
```

set the `JWT_SECRET` environment variable in your `.env` file to secure your
tokens (defaults to `'supersecret'` when missing).

## Running the server

Use `npm run dev` during development to reload on changes (requires
`nodemon`).  After the database and tables are ready, you can also seed the
initial user before attempting to log in from the Flutter frontend.

Endpoints summary (unchanged from previous versions):

```text
  - GET    /api/productos                   (Listar todos)
  - GET    /api/productos/:id               (Obtener por ID)
  - GET    /api/productos/:id/lotes         (Lotes FEFO)
  - POST   /api/productos                   (Crear)
  - PATCH  /api/productos/:id               (Actualizar)
  ...
```
