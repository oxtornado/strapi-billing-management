/**
 * factura router
 */

import { factories } from '@strapi/strapi';

// definir rutas
export default {
    routes: [
        {
            method: 'GET',
            path: '/facturas',
            handler: 'factura.find',
            config: {
                policies: []
            }
        },
        {
            method: 'POST',
            path: '/facturas',
            handler: 'factura.create',
            config: {
                policies: []
            }
        },
        {
            method: 'PUT',
            path: '/facturas/:id',
            handler: 'factura.update',
            config: {
                policies: []
            }
        },
        {
            method: 'DELETE',
            path: '/facturas/:id',
            handler: 'factura.delete',
            config: {
                policies: []
            }
        },
        {
            method: 'GET',
            path: '/facturas/cajero/:id/dia/:fecha',
            handler: 'factura.facturasPorCajeroEnFecha',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/facturas/ventas/vendedora/:vendedoraId',
            handler: 'factura.totalVentasPorVendedora',
            config: {
                policies: [],
            },
        },         
        {
            method: 'GET',
            path: '/facturas/historial-compras/cliente/:clienteId',
            handler: 'factura.historialComprasDeCliente',
            config: {
                policies: [],
            },
        }          
    ]
}