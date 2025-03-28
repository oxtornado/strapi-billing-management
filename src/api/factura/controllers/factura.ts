/**
 * factura controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::factura.factura', ({ strapi }) => ({
    async findOne(ctx) {
        const { id } = ctx.params

        const entity = await strapi.services.factura.findOne({ id });

        return entity;
    },
    async findMany(ctx) {
        const { limit, start, sort } = ctx.query;

        const entities = await strapi.services.factura.findMany({
            limit: parseInt(limit as string, 10),
            start: parseInt(start as string, 10),
            sort,
        });

        return entities;
    },
    async create(ctx) {
        const { fechaEmisionFactura, totalFactura, cajero, cliente, detalle_factura, vendedora } = ctx.request.body;
        if (await existeCajeroVendedor(cajero, vendedora)) {
            const entity = await strapi.services.factura.create({
                fechaEmisionFactura,
                totalFactura,
                cajero,
                cliente,
                detalle_factura,
                vendedora,
            });
            return entity;
        } else {
            return ctx.badRequest('No existe un cajero o vendedor');
        }
    },
    async update(ctx) {
        const { id } = ctx.params;

        let entity;
        if (ctx.is('model')) {
            entity = ctx.request.body;
        } else {
            entity = ctx.request.body.factura;
        }

        const result = await strapi.services.factura.update({ id }, entity);
        return result;
    },
    async delete(ctx) {
        const { id } = ctx.params;

        const result = await strapi.services.factura.delete({ id });
        return result;
    },
}));

// funciones auxiliares
// funcion para verificar si existe un cajero
const existeCajero = async (cajero) => {
    const existe = await strapi.services.cajero.findOne({ id: cajero });
    if (!existe) {
        return console.log('No existe este cajero');
    }
    return existe;
};
// funcion para verificar si existe una vendedora
const existeVendedor = async (vendedora) => {
    const existe = await strapi.services.vendedor.findOne({ id: vendedora });
    if (!existe) {
        return console.log('No existe esta vendedora');
    }
    return existe;
};
// funcion para verificar que solo se registre un solo cajero y un solo vendedor
const existeCajeroVendedor = async (cajero, vendedora) => {
    const cajeroExiste = await existeCajero(cajero);
    const vendedorExiste = await existeVendedor(vendedora);
    if (existeCajero && existeVendedor) {
        return true;
    } else {
        return console.log('No existen estos cajeros o vendedores');
    }
};

