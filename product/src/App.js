import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchProducts, setCategory, setSearchQuery, incrementSkip } from './redux/productsSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoSearch } from "react-icons/io5";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

const App = () => {
  const [query, setQuery] = useState('');
  const [likedProducts, setLikedProducts] = useState([]);
  const [dislikedProducts, setDislikedProducts] = useState([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupColor, setPopupColor] = useState('bg-green-500');
  const [showDislikeOptions, setShowDislikeOptions] = useState(false);
  const [currentDislikedProduct, setCurrentDislikedProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const categoryRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { categories, products, selectedCategory, skip, searchQuery } = useSelector((state) => state.products);

  const queryParams = new URLSearchParams(location.search);
  const queryCategory = queryParams.get('category');
  const querySearch = queryParams.get('search') || '';

 
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);


  useEffect(() => {
    if (querySearch) {
      const formattedQuery = querySearch.replace(/-/g, ' ');
      setQuery(formattedQuery);
      dispatch(setSearchQuery(querySearch));
    }

    if (queryCategory) {
      dispatch(setCategory(queryCategory));
    } else {
      dispatch(setCategory(null));
    }

    dispatch(fetchProducts({ category: queryCategory || null, search: querySearch, skip: 0 }));
  }, [dispatch, queryCategory, querySearch]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (categoryRef.current) {
        categoryRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleCategorySelect = (category) => {
    const formattedSearch = query ? query.replace(/\s+/g, '-') : '';
    if (category) {
      if (category !== selectedCategory) {
        dispatch(setCategory(category));
        navigate(`/?category=${category}${formattedSearch ? `&search=${formattedSearch}` : ''}`);
      }
    } else {
      dispatch(setCategory(null));
      navigate(`/${formattedSearch ? `?search=${formattedSearch}` : ''}`);
    }
  };

  const handleSearch = (e) => {
    const search = e.target.value;
    const formattedSearch = search.replace(/\s+/g, '-');
    setQuery(search);
    const matchedCategory = categories.find((category) =>
      category.name.toLowerCase() === search.toLowerCase()
    );
    if (matchedCategory) {
      if (matchedCategory.slug !== selectedCategory) {
        dispatch(setCategory(matchedCategory.slug));
        navigate(`/?category=${matchedCategory.slug}`);
      }
    } else {
      if (formattedSearch !== searchQuery) {
        dispatch(setSearchQuery(formattedSearch));
        navigate(`/?search=${formattedSearch}${selectedCategory ? `&category=${selectedCategory}` : ''}`);
      }
    }
  };

  const loadMoreProducts = () => {
    dispatch(incrementSkip());
    dispatch(fetchProducts({ category: selectedCategory || null, search: searchQuery, skip }));
  };

  const handleLikeProduct = (product) => {
    setLikedProducts((prev) => [...prev, product.id]);
    setPopupMessage(`You liked ${product.title}!`);
    setPopupColor('bg-green-500');
    setTimeout(() => setPopupMessage(''), 3000);
  };

  const handleDislikeProduct = (product) => {
    setCurrentDislikedProduct(product);
    setShowDislikeOptions(true);
  };

  const handleDislikeForever = () => {
    if (currentDislikedProduct) {
      setDislikedProducts((prev) => [...prev, currentDislikedProduct.id]);
      setPopupMessage(`You permanently disliked ${currentDislikedProduct.title}!`);
      setPopupColor('bg-red-500');
      setShowDislikeOptions(false);

      setFilteredProducts((prev) => prev.filter((p) => p.id !== currentDislikedProduct.id));

      setTimeout(() => setPopupMessage(''), 3000);
    }
  };

  const handleTemporaryDislike = () => {
    setPopupMessage(`You temporarily disliked ${currentDislikedProduct.title}!`);
    setPopupColor('bg-red-500');
    setShowDislikeOptions(false);
    setTimeout(() => setPopupMessage(''), 3000);
  };

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

 
  const getCategoryImageUrl = (categorySlug, width, height) => {
    const imageUrls = {
      electronics: `https://source.unsplash.com/featured/?electronics/${width}x${height}`,
      fashion: `https://source.unsplash.com/featured/?fashion/${width}x${height}`,
      furniture: `https://source.unsplash.com/featured/?furniture/${width}x${height}`,
      toys: `https://source.unsplash.com/featured/?toys/${width}x${height}`,
      
    };

   
    return imageUrls[categorySlug] || `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;
  };

  return (
    <div className="container mx-auto p-4 bg-white"> 
      {popupMessage && (
        <div className={`fixed top-4 right-4 ${popupColor} text-white p-4 rounded-md shadow-lg`}>
          {popupMessage}
        </div>
      )}

      {showDislikeOptions && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-6 z-10">
          <h3 className="text-lg font-semibold mb-4">What do you want to do?</h3>
          <button onClick={handleDislikeForever} className="px-4 py-2 bg-red-500 text-white rounded-md mr-2">
            Dislike Forever
          </button>
          <button onClick={handleTemporaryDislike} className="px-4 py-2 bg-gray-300 rounded-md">
            Dislike Temporarily
          </button>
          <button onClick={() => setShowDislikeOptions(false)} className="absolute top-2 right-2 text-gray-500">
            &times;
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 mx-10">
        <img src="/mall.jpg" alt="Logo" className="h-[12vh] w-[10vw] ml-10" />
        <div className='flex flex-grow justify-center items-center'>
          <input
            type="text"
            className='bg-blue-50 border border-black shadow-md w-[30%] rounded-md p-2'
            placeholder="Search products..."
            value={query}
            onChange={handleSearch}
          />
          <IoSearch className='w-[42px] h-[42px] text-black cursor-pointer bg-yellow-200 p-2 rounded-md border border-black ml-2' />
        </div>
        <div className='flex space-x-4 mr-10'>
          <a href="/login" className="text-blue-600 hover:underline">Login</a>
          <a href="/signup" className="text-blue-600 hover:underline">Sign Up</a>
        </div>
      </div>

      <hr className='border border-gray-100 mx-10 mb-6' />

      <div className='mx-10 flex space-x-4 overflow-x-scroll no-scrollbar pb-4' ref={categoryRef}>
        <button
          onClick={() => handleCategorySelect(null)}
          className={`px-4 py-2 text-sm rounded-full ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-blue-200 text-gray-700'}`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.slug)}
            className={`px-4 py-2 text-sm rounded-full bg-blue-600 text-white`} // Set all categories to dark blue
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-10 mt-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white shadow-lg rounded-md overflow-hidden transition-transform transform hover:scale-105">
            <img src={getCategoryImageUrl(selectedCategory, 400, 250)} alt={product.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
              <p className="text-gray-700 mb-2">${product.price}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleLikeProduct(product)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  <FontAwesomeIcon icon={faThumbsUp} />
                </button>
                <button
                  onClick={() => handleDislikeProduct(product)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  <FontAwesomeIcon icon={faThumbsDown} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length < 100 && (
        <button
          onClick={loadMoreProducts}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md mx-auto block"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default App;
