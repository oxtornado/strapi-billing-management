/**
 * cajero controller
 */

import { factories } from '@strapi/strapi'
import factura from '../../factura/controllers/factura';
import producto from '../../producto/controllers/producto';

module.exports = factories.createCoreController('api::cajero.cajero', ({strapi}) => {
    return {
    async findOne(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.db.query('api::cajero.cajero').findOne({
      where: { id },
      populate: {
        cajero: {
          populate: '*',
        },
      },
    });
    return entity;
  },
  async findMany(ctx) {
    const { limit, start, sort, ...filters } = ctx.query;
  
    const entities = await strapi.db.query('api::cajero.cajero').findMany({
      where: filters,
      limit: parseInt(limit as string, 10),
      offset: parseInt(start as string, 10),
      orderBy: sort,
      populate: {
        cajero: {
          populate: '*',
        },
      },
    });
  
    return entities;
  },   
  async create(ctx) {
    const { nombreCajero, direccionCajero, telefonoCajero, emailCajero } = ctx.request.body;
    const entity = await strapi.db.query('api::cajero.cajero').create({
      data: {
        nombreCajero,
        direccionCajero,
        telefonoCajero,
        emailCajero,
      },
    });
    return entity;
  },
  async update(ctx) {
    const { id } = ctx.params;
    const { nombreCajero, direccionCajero, telefonoCajero, emailCajero } = ctx.request.body;
    const entity = await strapi.db.query('api::cajero.cajero').update( {
      where: { id },  
      data: {
            nombreCajero,
            direccionCajero,
            telefonoCajero,
            emailCajero,
        },
    });
    return entity;
  },
  async delete(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.db.query('api::cajero.cajero').delete({ where: { id } });
    return entity;
  },

  // funciones de consultas esperadas
  // funcion para ver cuantas facturas tiene relacionadas por un cajero
  // en un día específico
  async getFacturasPorCajero(ctx) {
    const { fecha } = ctx.params;

    const { id } = ctx.params;
    
    const cajero = await strapi.db.query('api::cajero.cajero').findOne({
      where: { id },
      populate: {
        detalle_factura: {
          populate: {
            producto: true,
          },
        },
        cajero: true,
        cliente: true,
      },
  });
    const facturas = await strapi.db.query('api::factura.factura').findMany({
      where: {
        cajero: id,
      },
      populate: {
        facturas: {
          populate: '*',
        },
      },
    });
    if (!facturas || facturas.length === 0) {
      return ctx.throw(404, 'No records found');
    }

    const detalle = await strapi.db.query('api::detalle-factura.detalle-factura').findMany({
      where: {
        factura: facturas[0].id,
      },
      populate: {
        productos: {
          populate: '*',
        },
      },
    });

    return {
        "En la fecha": fecha,
        "Cantidad de facturas": facturas.length,
        "Facturas": facturas.map(factura => ({
            "id": factura.id,
            "fecha": factura.fechaEmisionFactura,
            "total": factura.totalFactura,
            "cajero": factura.cajero.nombreCajero,
            "cliente": factura.cliente.nombreCliente,
            "detalle_factura": factura.detalle_factura.map(detalle => ({
                "id": detalle.id,
                "producto": detalle.producto.nombreProducto,
                "cantidad": detalle.cantidadCompradaDetalleFactura,
                "precio": detalle.precioUnitarioDetalleFactura,
                "subtotal": detalle.subtotalDetalleFactura,
                "total": factura.totalFactura,
            })),
        })),
    };
  },
}});