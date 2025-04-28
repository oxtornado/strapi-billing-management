// Path: src/api/detalle-factura/routes/detalle-factura.js
'use strict';

/**
 * detalle-factura router
 */

module.exports = {
  routes: [
    // Rutas predeterminadas
    {
      method: 'GET',
      path: '/detalle-facturas',
      handler: 'detalle-factura.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/detalle-facturas/:id',
      handler: 'detalle-factura.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/detalle-facturas',
      handler: 'detalle-factura.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/detalle-facturas/:id',
      handler: 'detalle-factura.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/detalle-facturas/:id',
      handler: 'detalle-factura.delete',
      config: {
        policies: [],
      },
    },
    // Rutas personalizadas
    {
      method: 'GET',
      path: '/detalle-facturas/factura/:facturaId',
      handler: 'detalle-factura.findByFactura',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/detalle-facturas/productos/:id',
      handler: 'detalle-factura.getProductosPorDetalleFactura',
      config: {
        policies: [],
      },
    },
  ],
};