import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const fetchCategories = createAsyncThunk('products/fetchCategories', async () => {
  const response = await fetch('https://dummyjson.com/products/categories');
  const data = await response.json();
  return data; 
});


export const fetchProducts = createAsyncThunk('products/fetchProducts', async ({ category, skip = 0 }) => {
  const url = category
    ? `https://dummyjson.com/products/category/${category}?limit=10&skip=${skip}`
    : `https://dummyjson.com/products?limit=10&skip=${skip}`;
    
  const response = await fetch(url);
  const data = await response.json();
  return data.products; 
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    categories: [],
    products: [],
    selectedCategory: '',
    status: 'idle', 
    searchQuery: '',
    skip: 0,
  },
  reducers: {
    setCategory(state, action) {
      state.selectedCategory = action.payload;
      state.products = []; 
      state.skip = 0; 
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    incrementSkip(state) {
      state.skip += 10;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload; 
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        
        state.products = action.payload; 
      });
  },
});

export const { setCategory, setSearchQuery, incrementSkip } = productsSlice.actions;

export default productsSlice.reducer;
