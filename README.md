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
1. No se puede generar una factura sin al menos un producto.
2. Si un producto no tiene suficiente stock, no se puede procesar la venta.
3. El total de la factura se calcula como la suma de los subtotales de los productos.
4. Cada factura debe estar asociada a un cliente registrado en el sistema.
5. No se pueden eliminar facturas ya emitidas, solo anularlas dejando registro de la transacción.
6. Un cajero solo puede procesar facturas durante su turno de trabajo.
7. Las devoluciones solo pueden realizarse dentro de un período de 7 días posteriores a la compra.

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
- Listar todas las facturas de un cliente específico.
- Consultar el total de ventas realizadas en un periodo de tiempo.
- Ver los productos más vendidos.

## Contribución
Si deseas contribuir a este proyecto, por favor sigue estos pasos:
1. Haz un fork del repositorio.
2. Crea una rama nueva (`git checkout -b feature-nueva`).
3. Realiza tus cambios y haz commit (`git commit -m 'Descripción del cambio'`).
4. Sube tus cambios (`git push origin feature-nueva`).
5. Crea un Pull Request.

## Licencia
Este proyecto está bajo la licencia MIT.

