const { getProducts } = require('./products');
const { login } = require('./auth');

// Controller de Produtos
// Retorna produtos com metadados de paginação
const productsController = async (req, res, next) => {
  try {
    const { pagination } = req;
    const products = await getProducts(pagination);
    
    res.json({
      data: products.items,
      pagination: {
        limit: pagination.limit,
        cursor: pagination.cursor,
        nextCursor: products.nextCursor,
        hasMore: products.hasMore,
        total: products.total
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  productsController,
  loginController: login
};