// Controller de Produtos
// Simula consultas à base de dados com paginação baseada em cursor

// Base de dados simulada de produtos
const generateMockProducts = () => {
  const products = [];
  for (let i = 1; i <= 200; i++) {
    products.push({
      id: `prod_${i}`,
      name: `Produto ${i}`,
      description: `Descrição do produto ${i}`,
      price: (Math.random() * 1000).toFixed(2),
      category: ['Eletrónica', 'Vestuário', 'Livros', 'Casa'][Math.floor(Math.random() * 4)],
      stock: Math.floor(Math.random() * 100),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return products.sort((a, b) => a.id.localeCompare(b.id));
};

const allProducts = generateMockProducts();

// Obter produtos com paginação baseada em cursor
const getProducts = async (pagination) => {
  const { limit, cursor } = pagination;
  
  // Encontrar índice inicial baseado no cursor
  let startIndex = 0;
  if (cursor) {
    const cursorIndex = allProducts.findIndex(p => p.id === cursor);
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1;
    }
  }
  
  // Obter produtos para a página atual
  const items = allProducts.slice(startIndex, startIndex + limit);
  
  // Determinar próximo cursor
  const nextIndex = startIndex + limit;
  const nextCursor = nextIndex < allProducts.length 
    ? allProducts[nextIndex].id 
    : null;
  
  const hasMore = nextIndex < allProducts.length;
  
  return {
    items,
    nextCursor,
    hasMore,
    total: allProducts.length
  };
};

module.exports = {
  getProducts
};