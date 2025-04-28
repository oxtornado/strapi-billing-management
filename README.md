# README - Proceso de Facturación en una Tienda

## Descripción del Proyecto
Este proyecto implementa un sistema de facturación para una tienda, gestionando clientes, cajeros, vendedoras, productos y las facturas generadas por cada transacción. Se ha desarrollado utilizando **Strapi** como backend y **SQLite** como motor de base de datos.

## Instalación y Configuración
### Prerrequisitos
- Tener instalado **Node.js** y **npm**.
- Tener instalado **Strapi**.
- Tener configurado **SQLite** como motor de base de datos.

### Pasos para instalar y ejecutar el proyecto
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-repo/facturacion-tienda.git
   cd facturacion-tienda
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de Strapi:
   ```bash
   npm run develop
   ```
4. Acceder al panel de administración de Strapi en:
   ```
   http://localhost:1337/admin
   ```

## Modelo de Base de Datos
El sistema maneja las siguientes entidades:

1. **Cajero**: ID del cajero, nombre, apellido, turno de trabajo.
2. **Vendedora**: ID de la vendedora, nombre, apellido, turno de trabajo.
3. **Cliente**: ID del cliente, nombre, apellido, dirección, correo electrónico, teléfono.
4. **Productos**: ID del producto, nombre, descripción, precio, cantidad en stock.
5. **Factura**: ID de la factura, ID del cajero, ID del cliente, fecha de emisión, total.
6. **Detalle Factura**: ID del producto, ID de la factura, cantidad comprada, precio unitario, subtotal.

### Relaciones
- Un **cajero** puede procesar varias facturas.
- Una **factura** está asociada a un único cajero y un único cliente.
- Un **cliente** puede tener múltiples facturas.
- Una **factura** puede contener varios productos mediante el **detalle de factura**.
- Una **vendedora** atiende a los clientes en la tienda.

## Reglas de Negocio
1. Un cliente puede realizar varias compras (facturas), pero cada factura está asociada a una única transacción con un cajero y una vendedora.
2. Cada producto vendido debe estar registrado en una factura.
3. El precio total de una factura se calcula como la suma de los subtotales de los productos vendidos.
4. El cajero es quien procesa el pago, mientras que la vendedora asiste en la venta.
5. La cantidad de productos en stock debe actualizarse después de realizar una venta.
6. No se puede generar una factura sin al menos un producto.
7. Si un producto no tiene suficiente stock, no se puede procesar la venta.
8. Cada factura debe estar asociada a un cliente registrado en el sistema.
9. No se pueden eliminar facturas ya emitidas, solo anularlas dejando registro de la transacción.
10. Un cajero solo puede procesar facturas durante su turno de trabajo.
11. Las devoluciones solo pueden realizarse dentro de un período de 7 días posteriores a la compra.

## Datos de Prueba
Para poblar la base de datos con datos de prueba, puedes ejecutar el siguiente comando en el directorio del proyecto:
```bash
npm run seed
```

## API Endpoints
Los siguientes endpoints están disponibles para realizar consultas:

### Facturas
- **Obtener todas las facturas:** `GET /facturas`
- **Obtener una factura por ID:** `GET /facturas/:id`
- **Crear una nueva factura:** `POST /facturas`
- **Eliminar una factura:** `DELETE /facturas/:id`

### Clientes
- **Obtener todos los clientes:** `GET /clientes`
- **Obtener un cliente por ID:** `GET /clientes/:id`
- **Crear un nuevo cliente:** `POST /clientes`

### Productos
- **Obtener todos los productos:** `GET /productos`
- **Obtener un producto por ID:** `GET /productos/:id`
- **Actualizar stock de un producto:** `PUT /productos/:id`

## Consultas Esperadas
A continuación, se detallan algunas de las consultas más comunes:

### i. Consultar todas las facturas emitidas por un cajero en un día específico.
**GET** `http://localhost:1337/api/facturas/cajero/1/dia/2025-04-28`

**Authorization:** Bearer `<token>`

**Content-Type:** application/json

### ii. Ver los productos vendidos en una factura específica.
**GET** `http://localhost:1337/api/detalle-facturas/factura/11`

**Authorization:** Bearer `<token>`

**Content-Type:** application/json

### iii. Obtener el total de ventas realizadas por una vendedora durante un periodo de tiempo.
**GET** `http://localhost:1337/api/facturas/ventas/vendedora/3?fechaInicio=2024-04-01&fechaFin=2025-04-30`

**Authorization:** Bearer `<token>`

**Content-Type:** application/json

### iv. Consultar el historial de compras de un cliente.
**GET** `http://localhost:1337/api/facturas/historial-compras/cliente/3`

**Authorization:** Bearer `<token>`

**Content-Type:** application/json

### v. Verificar el stock de productos antes de realizar una venta.
Este endpoint podría ser implementado para verificar el stock antes de procesar una venta, pero no está definido en los ejemplos previos. Sin embargo, sería algo como:

**GET** `http://localhost:1337/api/productos/stock/:idProducto`

**Authorization:** Bearer `<token>`

**Content-Type:** application/json

## Contribución
Si deseas contribuir a este proyecto, por favor sigue estos pasos:
1. Haz un fork del repositorio.
2. Crea una rama nueva (`git checkout -b feature-nueva`).
3. Realiza tus cambios y haz commit (`git commit -m 'Descripción del cambio'`).
4. Sube tus cambios (`git push origin feature-nueva`).
5. Crea un Pull Request.

## Licencia
Este proyecto está bajo la licencia MIT.
