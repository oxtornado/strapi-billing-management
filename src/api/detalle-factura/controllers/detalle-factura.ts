/**
 * detalle-factura controller
 */
import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::detalle-factura.detalle-factura', ({ strapi }) => ({
  // Método para listar todos los detalles de facturas
  async find(ctx) {
    try {
      // Obtener todos los detalles de factura
      const detallesFactura = await strapi.entityService.findMany('api::detalle-factura.detalle-factura', {
        populate: ['factura', 'producto']
      });

      return { data: detallesFactura };
    } catch (error) {
      console.error('Error al buscar detalles de factura:', error);
      return ctx.badRequest(`Error al obtener detalles de factura: ${error.message}`);
    }
  },

  // Método para obtener un solo detalle de factura por su ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      
      const detalleFactura = await strapi.entityService.findOne('api::detalle-factura.detalle-factura', id, {
        populate: ['factura', 'producto']
      });

      if (!detalleFactura) {
        return ctx.notFound('Detalle de factura no encontrado');
      }

      return { data: detalleFactura };
    } catch (error) {
      console.error('Error al buscar detalle de factura:', error);
      return ctx.badRequest(`Error al obtener detalle de factura: ${error.message}`);
    }
  },

  // Método para obtener detalles por factura (este necesita un ID de factura)
  async findByFactura(ctx) {
    try {
      console.log('ctx.params:', ctx.params); // Agregado para depuración
      const { facturaId } = ctx.params;
      
      if (!facturaId) {
        return ctx.badRequest('ID de factura no proporcionado');
      }
  
      const detallesFactura = await strapi.db.query('api::detalle-factura.detalle-factura').findMany({
        where: { factura: { id: facturaId } },
        populate: ['producto']
      });
  
      if (!detallesFactura || detallesFactura.length === 0) {
        return ctx.notFound('No se encontraron detalles para esta factura');
      }
  
      return { 
        "la factura": facturaId, 
        "productos que se encuentran en la factura": detallesFactura 
      };
    } catch (error) {
      console.error('Error al buscar detalles por factura:', error);
      return ctx.badRequest(`Error al obtener detalles de factura: ${error.message}`);
    }
  },

  async create(ctx) {
    try {
      const { facturaId, productoId, ...data } = ctx.request.body;

      if (!productoId) {
        return ctx.badRequest('Debe ingresar un producto');
      }

      // Verificamos que exista la factura
      const factura = await strapi.db.query('api::factura.factura').findOne({
        where: { id: facturaId }
      });

      if (!factura) {
        return ctx.badRequest('Factura no encontrada');
      }

      // Verificamos si el producto tiene stock disponible
      const stockDisponible = await verificarStock(productoId);
      if (!stockDisponible) {
        return ctx.badRequest('No hay stock disponible');
      }

      // Creamos el detalle de factura
      const detalleFactura = await strapi.entityService.create('api::detalle-factura.detalle-factura', {
        data: {
          ...data,
          factura: facturaId,
          producto: productoId
        }
      });

      return { data: detalleFactura };
    } catch (error) {
      console.error('Error al crear detalle de factura:', error);
      return ctx.badRequest(`Error al crear detalle de factura: ${error.message}`);
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const data = ctx.request.body;
      
      const detalleFactura = await strapi.entityService.update('api::detalle-factura.detalle-factura', id, {
        data
      });

      return { data: detalleFactura };
    } catch (error) {
      console.error('Error al actualizar detalle de factura:', error);
      return ctx.badRequest(`Error al actualizar detalle de factura: ${error.message}`);
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;
      
      const detalleFactura = await strapi.entityService.delete('api::detalle-factura.detalle-factura', id);

      return { data: detalleFactura };
    } catch (error) {
      console.error('Error al eliminar detalle de factura:', error);
      return ctx.badRequest(`Error al eliminar detalle de factura: ${error.message}`);
    }
  },

  // Función específica para obtener productos por factura
  async getProductosPorDetalleFactura(ctx) {
    try {
      const { id } = ctx.params;
      
      // Usar el método correcto para consultar
      const detallesFactura = await strapi.db.query('api::detalle-factura.detalle-factura').findMany({
        where: { factura: { id } },
        populate: ['producto']
      });

      if (!detallesFactura || detallesFactura.length === 0) {
        return ctx.notFound('No se encontraron productos para esta factura');
      }

      // Extraer solo los productos
      const productos = detallesFactura
        .map(detalle => detalle.producto)
        .filter(Boolean);
      
      return { data: productos };
    } catch (error) {
      console.error('Error al buscar productos por detalle de factura:', error);
      return ctx.badRequest(`Error al obtener productos: ${error.message}`);
    }
  }
}));

// Función auxiliar para verificar stock
const verificarStock = async (productoId) => {
  try {
    const producto = await strapi.db.query('api::producto.producto').findOne({
      where: { id: productoId }
    });
    
    if (!producto) {
      console.log('Producto no encontrado');
      return false;
    }
    
    if (producto.cantidadStockProducto > 0) {
      return true;
    } else {
      console.log('No hay stock disponible para el producto:', productoId);
      return false;
    }
  } catch (error) {
    console.error('Error al verificar stock:', error);
    return false;
  }
};