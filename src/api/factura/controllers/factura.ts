/**
 * factura controller
 */

import { factories } from '@strapi/strapi';
import { Context } from 'vm';

// Definir interfaces para mejorar el tipado
interface DetalleFactura {
    id: number;
    producto: {
        id: number;
        cantidadStockProducto: number;
    };
    cantidadCompradaDetalleFactura: number; // 👈 Agregamos esto
    precioUnitarioDetalleFactura: number; // 👈 Agregamos esto
}

interface Producto {
  id: number;
  cantidadStockProducto: number;
}

export default factories.createCoreController('api::factura.factura', ({ strapi }) => ({
    async findOne(ctx) {
        const { id } = ctx.params;
        const entity = await strapi.entityService.findOne('api::factura.factura', id, {
            populate: ['cajero', 'vendedora', 'cliente', 'detalle_facturas'],
        });
        return entity;
    },

    async find(ctx) {
        const facturas = await strapi.entityService.findMany('api::factura.factura', {
            populate: ['cajero', 'vendedora', 'cliente', 'detalle_facturas'],
        });
        return facturas;
    },

    async create(ctx) {
        const data = ctx.request.body.data || ctx.request.body;
        const { fechaEmisionFactura, cajero, cliente, detalle_facturas, vendedora } = data;
        
        // Validaciones iniciales
        if (!cajero || !vendedora || !detalle_facturas?.length) {
            return ctx.badRequest('Cajero, vendedora y detalle_facturas son obligatorios');
        }
        // Verificar si existen cajero y vendedora
        if (!(await existeCajeroVendedor(cajero, vendedora))) {
            return ctx.badRequest('No existe un cajero o vendedora válido');
        }

        // Calcular el total de la factura
        const totalFactura = await calcularPrecioFactura(detalle_facturas);

        // Actualizar cantidades de stock
        try {
            for (const detalleId of detalle_facturas) {
                await updateCantidad(detalleId);
            }
        } catch (error) {
            return ctx.badRequest(`Error al actualizar stock: ${error.message}`);
        }

        // Crear la factura
        const entity = await strapi.entityService.create('api::factura.factura', {
            data: {
                fechaEmisionFactura,
                totalFactura,
                cajero,
                cliente,
                vendedora,
                detalle_facturas: detalle_facturas.map(id => ({ id })),
            },
        });

        return entity;
    },

    async update(ctx) {
        const { id } = ctx.params;
        const data = ctx.is('model') ? ctx.request.body : ctx.request.body.factura;
        const result = await strapi.entityService.update('api::factura.factura', id, {
            data,
        });
        return result;
    },

    async delete(ctx) {
        const { id } = ctx.params;
        const result = await strapi.entityService.delete('api::factura.factura', id);
        return result;
    },

    async findByCajero(ctx) {
        try {
            const { id } = ctx.params;
            const entity = await strapi.entityService.findMany('api::factura.factura', {
                filters: { cajero: id },
                populate: ['cajero', 'vendedora', 'cliente', 'detalle_facturas'],
            });

            if (!entity || entity.length === 0) {
                return ctx.throw(404, 'No records found');
            }

            return entity;
        } catch (error) {
            console.error(error);
            return ctx.throw(500, 'Internal Server Error');
        }
    },
}));

// Auxiliary functions
const existeCajero = async (cajeroId: number): Promise<boolean> => {
    const existe = await strapi.entityService.findOne('api::cajero.cajero', cajeroId);
    if (!existe) {
        console.log('No existe este cajero');
    }
    return !!existe;
};

const existeVendedor = async (vendedoraId: number): Promise<boolean> => {
    const existe = await strapi.entityService.findOne('api::vendedora.vendedora', vendedoraId);
    if (!existe) {
        console.log('No existe esta vendedora');
    }
    return !!existe;
};

const existeCajeroVendedor = async (cajeroId: number, vendedoraId: number): Promise<boolean> => {
    const cajeroExiste = await existeCajero(cajeroId);
    const vendedorExiste = await existeVendedor(vendedoraId);
    return cajeroExiste && vendedorExiste;
};

const calcularPrecioFactura = async (detalleIds: number[]): Promise<number> => {
    let total = 0;

    for (const id of detalleIds) {
        const detalle = await strapi.entityService.findOne(
            'api::detalle-factura.detalle-factura', 
            id, 
            { populate: ['producto'] }
        ) as unknown as DetalleFactura;

        if (detalle && detalle.producto) {
            total += detalle.precioUnitarioDetalleFactura * detalle.cantidadCompradaDetalleFactura;
        }
    }

    return total;
};

const updateCantidad = async (detalleId: number): Promise<void> => {
    const detalle = await strapi.entityService.findOne(
        'api::detalle-factura.detalle-factura',
        detalleId,
        { populate: ['producto'] }
    ) as unknown as DetalleFactura;

    if (!detalle || !detalle.producto) {
        throw new Error('Detalle o producto no encontrado');
    }

    const producto = detalle.producto;

    if (typeof producto.cantidadStockProducto !== 'number') {
        throw new Error(`El producto ID ${producto.id} no tiene un stock numérico válido`);
    }

    if (typeof detalle.cantidadCompradaDetalleFactura !== 'number') {
        throw new Error(`El detalle ID ${detalle.id} no tiene una cantidad válida`);
    }

    const nuevaCantidad = producto.cantidadStockProducto - detalle.cantidadCompradaDetalleFactura;

    if (nuevaCantidad < 0) {
        throw new Error(`No hay suficiente stock para el producto ID ${producto.id}`);
    }

    await strapi.entityService.update('api::producto.producto', producto.id, {
        data: {
            cantidadStockProducto: nuevaCantidad,
        },
    });

    console.log(`✅ Stock actualizado correctamente para producto ID ${producto.id}`);
};
