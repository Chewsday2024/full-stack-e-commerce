import { motion } from 'framer-motion'
import { useProductStore } from '../stores/useProductStore'
import { Star, Trash } from 'lucide-react'


function ProductsList() {
  const { deleteProduct, toggleFeaturedProduct, products } = useProductStore()

  return (
    <motion.div
      className='bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <table className='min-w-full divide-y divide-gray-700'>
        <thead className='bg-gray-700'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider'
            >
              Product
            </th>
            
            <th
              scope='col'
              className='px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider'
            >
              Price
            </th>

            <th
              scope='col'
              className='px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider'
            >
              Category
            </th>

            <th
              scope='col'
              className='px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider'
            >
              Featured
            </th>

            <th
              scope='col'
              className='px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider'
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody className='bg-gray-800 divide-y divide-gray-700'>
          {products.map(product => (
            <tr key={product._id?.toString()} className='hover:bg-gray-700'>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex items-center justify-center gap-3'>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='h-10 w-10 rounded-full object-cover'
                  />
                  
                  <div className='text-sm font-medium text-white'>
                    {product.name}
                  </div>
                </div>
              </td>

              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm text-gray-300 text-center'>
                  $&nbsp;{Number(product.price).toFixed(2)}
                </div>
              </td>

              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm text-gray-300 text-center'>
                  {product.category}
                </div>
              </td>

              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex justify-center'>
                  <button
                    onClick={() => product._id && toggleFeaturedProduct(product._id.toString())}
                    className={`p-1 rounded-full hover:bg-yellow-500 transition-colors duration-200 cursor-pointer ${
                      product.isFeatured
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    <Star className='h-5 w-5' />
                  </button>
                </div>
              </td>

              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                <div className='flex justify-center'>
                  <button
                    onClick={() => product._id && deleteProduct(product._id.toString())}
                    className='text-red-400 hover:text-red-300 cursor-pointer'
                  >
                    <Trash className='h-5 w-5' />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
export default ProductsList