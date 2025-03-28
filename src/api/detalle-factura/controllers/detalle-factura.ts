/**
 * detalle-factura controller
 */

import { factories } from '@strapi/strapi'

module.exports = factories.createCoreController('api::detalle-factura.detalle-factura', ({strapi}) => {
        return {
        async create(ctx) {
            const { facturaId, ...data } = ctx.request.body
    
            const factura = await strapi.services.factura.findOne({ id: facturaId })
            

            // cumplimos la regla de 
            // negocio en donde cada 
            // producto vendido debe 
            // registrarse en una factura 
            if (!factura.producto) {
            return ctx.badRequest('debe ingresar un producto')
            }
    
            const detalleFactura = await strapi.services.detalleFactura.create({
            ...data,
            factura: factura.id
            })
    
            return detalleFactura
        },
        async find(ctx) {
            const { id } = ctx.params
            const detalleFactura = await strapi.services.detalleFactura.findOne({ id })
            return detalleFactura
        },
        async findAll(ctx) {
            const { facturaId } = ctx.params
            const detalleFacturas = await strapi.services.detalleFactura.find({ factura: facturaId })
            return detalleFacturas
        },
        async findOne(ctx) {
            const { id } = ctx.params
            const detalleFactura = await strapi.services.detalleFactura.findOne({ id })
            return detalleFactura
        },
        async update(ctx) {
            const { id, ...data } = ctx.request.body
            const detalleFactura = await strapi.services.detalleFactura.update({ id }, data)
            return detalleFactura
        },
        async delete(ctx) {
            const { id } = ctx.params
            const detalleFactura = await strapi.services.detalleFactura.delete({ id })
            return detalleFactura
        }
    }
});