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

interface Vendedora {
    id: number;
    nombreVendedora: string;
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


    // Funciones para cumplir con consultas esperadas

    async facturasPorCajeroEnFecha(ctx) {
        const { id, fecha } = ctx.params;

        try {
            const facturas = await strapi.entityService.findMany('api::factura.factura', {
                filters: {
                    cajero: id,
                    fechaEmisionFactura: fecha,
                },
                populate: ['cliente', 'vendedora', 'detalle_facturas'], // Opcional: para más detalle
            });

            return { data: facturas };
        } catch (error) {
            console.error('Error al buscar facturas:', error);
            return ctx.internalServerError('No se pudieron obtener las facturas');
        }
    },
            
// Obtener el total de ventas por vendedora en un rango de fechas
async totalVentasPorVendedora(ctx) {
    try {
      const { vendedoraId } = ctx.params;
      const { fechaInicio, fechaFin } = ctx.query;

      if (!vendedoraId || !fechaInicio || !fechaFin) {
        return ctx.badRequest('Se requieren vendedoraId, fechaInicio y fechaFin');
      }

      // Obtener las facturas correspondientes a la vendedora y en el rango de fechas
      const facturas = await strapi.db.query('api::factura.factura').findMany({
        where: {
          vendedora: { id: vendedoraId },
          fechaEmisionFactura: {
            $gte: fechaInicio,
            $lte: fechaFin,
          },
        },
        select: ['totalFactura'],
        populate: {
          vendedora: {
            select: ['nombreVendedora', 'apellidoVendedora'], // Agregar los campos del nombre y apellido
          },
        },
      });

      // Calcular el total de ventas
      const totalVentas = facturas.reduce((sum, factura) => {
        return sum + parseFloat(factura.totalFactura);
      }, 0);

      const cantidadVentas = facturas.length;

      // Verificar si la vendedora tiene facturas
      if (facturas.length > 0) {
        const nombreVendedora = `${facturas[0]?.vendedora?.nombreVendedora} ${facturas[0]?.vendedora?.apellidoVendedora}`;

        return { 
          data: { 
            "la vendedora": nombreVendedora,
            "ventas realizadas": cantidadVentas,
            "dando un total de": totalVentas
          } 
        };
      } else {
        return ctx.notFound('No se encontraron ventas para la vendedora en el periodo proporcionado.');
      }
    } catch (error) {
      console.error('Error al calcular total de ventas:', error);
      return ctx.badRequest(`Error al obtener total de ventas: ${error.message}`);
    }
  },
  async historialComprasDeCliente(ctx) {
    try {
      const { clienteId } = ctx.params;
  
      if (!clienteId) {
        return ctx.badRequest('ID de cliente no proporcionado');
      }
  
      // Buscamos al cliente junto con sus facturas y detalles de las facturas (productos, cantidades, etc.)
      const cliente = await strapi.db.query('api::cliente.cliente').findOne({
        where: { id: clienteId },
        populate: {
          facturas: {
            populate: {
              detalle_facturas: true,  // Traemos todos los detalles de las facturas
            }
          }
        },
        select: ['nombreCliente', 'apellidoCliente'],
      });
  
      if (!cliente) {
        return ctx.notFound('Cliente no encontrado');
      }
  
      if (!cliente.facturas || cliente.facturas.length === 0) {
        return ctx.notFound('Este cliente no tiene compras registradas');
      }
  
      // Preparar la respuesta con las facturas y los detalles
      const facturas = cliente.facturas.map(factura => {
        const detalle_facturas = factura.detalle_facturas.map(detalle => ({
          cantidadCompradaDetalleFactura: detalle.cantidadCompradaDetalleFactura,
          precioUnitarioDetalleFactura: detalle.precioUnitarioDetalleFactura,
          subtotalDetalleFactura: detalle.subtotalDetalleFactura
        }));
  
        return {
          idFactura: factura.id,
          totalFactura: factura.totalFactura,
          detalle_facturas // Los detalles de la factura
        };
      });
  
      return {
        data: {
          nombreCliente: cliente.nombreCliente,
          apellidoCliente: cliente.apellidoCliente,
          facturas
        }
      };
    } catch (error) {
      console.error('Error al obtener historial de compras:', error);
      return ctx.badRequest(`Error al obtener historial de compras: ${error.message}`);
    }
  }      
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
