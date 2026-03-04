# Frontend (Flutter)

This Flutter application is the mobile frontend for the perishable products
control system. It communicates with the Node.js backend to display and
manage inventory following the FEFO criterion.

## Getting Started

1. Make sure Flutter SDK is installed and the `flutter` command is available.
2. Open a terminal inside the `frontend` folder.
3. Run `flutter pub get` to install dependencies (including `http`).
4. Launch an emulator or connect a physical device.
5. Run `flutter run` to start the application.

The app will attempt to fetch the product list from
`http://10.0.2.2:3000/api/productos` (Android emulator) and requires a valid
JWT obtained by logging in. Modify the URL in
`lib/services/api_service.dart` if you need a different endpoint, or adapt
`@/api/auth/login` endpoints if your backend changes.

### Estructura principal

- `lib/main.dart` – entrada que muestra `ProductListScreen`.
- `lib/models/product.dart` – clase de modelo para productos.
- `lib/services/api_service.dart` – llamadas HTTP al backend.
- `lib/screens/product_list_screen.dart` – lista de productos con refresco
  y acceso al formulario de alta.
- `lib/screens/add_product_screen.dart` – formulario para crear un producto.

### Funcionalidades de la ventana de productos

- Descarga la lista desde la API al iniciarse.
- Muestra nombre (y descripción/stock cuando están disponibles) de cada producto.
- Permite añadir un producto nuevo mediante el botón flotante (sólo nombre por ahora).
- Refresca arrastrando hacia abajo.

Continúa extendiendo la UI según tus necesidades (editar, eliminar, filtros,
etc.).

