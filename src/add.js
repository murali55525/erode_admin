import React, { useState, useEffect } from "react"
import axios from "axios"
import { Search, Filter, Plus, Trash2, Edit, Save, X, AlertCircle, Package, RefreshCw, CheckCircle } from "lucide-react"

// Categories array
const categories = [
  "Lipstick",
  "Nail polish",
  "Soap",
  "Shampoo",
  "Perfumes",
  "Bag items",
  "Necklace",
  "Bangles",
  "Steads",
  "Hip band",
  "Bands",
  "Cosmetics makeup accessories",
  "Slippers",
  "Shoes",
  "Watches",
  "Bindi",
  "Key chains",
  "Gift items",
  "Rental jewelry",
  "Skin care products",
  "Bottles",
]

// Category Filter Component
const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="relative min-w-[200px]">
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-8 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
    </div>
  )
}

export default function AdminProductManagement() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: categories[0],
    colors: "",
    availableQuantity: "",
    description: "",
    imageFile: null,
    imagePreview: null,
  })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" })
  const [bulkAction, setBulkAction] = useState("")
  const [selectedProducts, setSelectedProducts] = useState([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalCategories: 0,
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5001/api/products")
      setProducts(response.data)
      setFilteredProducts(response.data)

      // Calculate stats
      setStats({
        totalProducts: response.data.length,
        lowStockProducts: response.data.filter((p) => p.availableQuantity < 5).length,
        totalCategories: new Set(response.data.map((p) => p.category)).size,
      })

      setLoading(false)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products. Please try again.")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    // Filter products based on category and search term
    let filtered = [...products]

    if (selectedCategory) {
      filtered = filtered.filter((prod) => prod.category === selectedCategory)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (prod) =>
          prod.name.toLowerCase().includes(term) ||
          prod.description.toLowerCase().includes(term) ||
          prod.category.toLowerCase().includes(term),
      )
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, searchTerm, products])

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setProduct((prev) => ({ ...prev, category }))
  }

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProduct({
          ...product,
          imageFile: file,
          imagePreview: reader.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("name", product.name)
    formData.append("price", product.price)
    formData.append("category", product.category)
    formData.append("colors", product.colors)
    formData.append("availableQuantity", product.availableQuantity)
    formData.append("description", product.description)
    if (product.imageFile) {
      formData.append("image", product.imageFile)
    }

    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      }

      if (editId) {
        await axios.put(`http://localhost:5001/api/products/${editId}`, formData, { headers })
        setSuccessMessage("Product updated successfully!")
      } else {
        await axios.post("http://localhost:5001/api/products", formData, { headers })
        setSuccessMessage("Product added successfully!")
      }

      setTimeout(() => setSuccessMessage(null), 3000)
      resetForm()
      fetchProducts()
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Failed to save product. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setProduct({
      name: "",
      price: "",
      category: categories[0],
      colors: "",
      availableQuantity: "",
      description: "",
      imageFile: null,
      imagePreview: null,
    })
    setEditId(null)
    setShowAddForm(false)
  }

  const handleEdit = (prod) => {
    setProduct({
      name: prod.name,
      price: prod.price,
      category: prod.category,
      colors: prod.colors.join(", "),
      availableQuantity: prod.availableQuantity,
      description: prod.description,
      imageFile: null,
      imagePreview: prod.imageUrl,
    })
    setEditId(prod._id)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setLoading(true)
        await axios.delete(`http://localhost:5001/api/products/${id}`)
        setSuccessMessage("Product deleted successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
        fetchProducts()
      } catch (err) {
        setError("Error deleting product. Please try again.")
        console.error("Error deleting product:", err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBulkAction = async () => {
    if (selectedProducts.length === 0) {
      setError("Please select at least one product")
      setTimeout(() => setError(null), 3000)
      return
    }

    if (bulkAction === "delete") {
      if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
        try {
          setLoading(true)
          await Promise.all(selectedProducts.map((id) => axios.delete(`http://localhost:5001/api/products/${id}`)))
          setSuccessMessage(`${selectedProducts.length} products deleted successfully!`)
          setTimeout(() => setSuccessMessage(null), 3000)
          setSelectedProducts([])
          fetchProducts()
        } catch (err) {
          setError("Error performing bulk delete. Please try again.")
          console.error("Error performing bulk action:", err)
        } finally {
          setLoading(false)
        }
      }
    }
  }

  const handleSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const sortedProducts = React.useMemo(() => {
    const sortableProducts = [...filteredProducts]
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }
    return sortableProducts
  }, [filteredProducts, sortConfig])

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAllProducts = (e) => {
    if (e.target.checked) {
      setSelectedProducts(sortedProducts.map((prod) => prod._id))
    } else {
      setSelectedProducts([])
    }
  }

  const groupProductsByCategory = (products) => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = []
      }
      acc[product.category].push(product)
      return acc
    }, {})
  }

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ▲" : " ▼"
    }
    return ""
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      {/* Header & Stats */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Product Management</h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Products */}
          <div className="flex items-center rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-sm">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts}</h3>
              <p className="text-sm text-gray-500">Total Products</p>
            </div>
          </div>

          {/* Low Stock */}
          <div className="flex items-center rounded-lg border-l-4 border-amber-500 bg-white p-4 shadow-sm">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-500">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.lowStockProducts}</h3>
              <p className="text-sm text-gray-500">Low Stock Items</p>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center rounded-lg border-l-4 border-violet-500 bg-white p-4 shadow-sm">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-500">
              <Filter size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalCategories}</h3>
              <p className="text-sm text-gray-500">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border-l-4 border-green-500 bg-green-50 p-4 text-green-700">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? "Cancel" : "Add Product"}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-6 text-xl font-bold text-gray-800">{editId ? "Edit Product" : "Add New Product"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Product Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Product Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Product name"
                  value={product.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={product.price}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={product.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <label htmlFor="colors" className="text-sm font-medium text-gray-700">
                  Colors
                </label>
                <input
                  id="colors"
                  type="text"
                  name="colors"
                  placeholder="Colors (comma-separated)"
                  value={product.colors}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Available Quantity */}
              <div className="space-y-2">
                <label htmlFor="availableQuantity" className="text-sm font-medium text-gray-700">
                  Available Quantity
                </label>
                <input
                  id="availableQuantity"
                  type="number"
                  name="availableQuantity"
                  placeholder="Available Quantity"
                  value={product.availableQuantity}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Product Image */}
              <div className="space-y-2">
                <label htmlFor="imageFile" className="text-sm font-medium text-gray-700">
                  Product Image
                </label>
                <input
                  id="imageFile"
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-600 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Product description"
                  value={product.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                ></textarea>
              </div>

              {/* Image Preview */}
              <div className="flex items-center justify-center lg:row-span-2">
                {product.imagePreview && (
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
                    <img
                      src={product.imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-40 w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  "Saving..."
                ) : editId ? (
                  <>
                    <Save size={16} /> Update Product
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
        {/* Bulk Actions */}
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              onChange={handleSelectAllProducts}
              checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
              className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="selectAll" className="text-sm text-gray-700">
              Select All ({selectedProducts.length}/{sortedProducts.length})
            </label>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white p-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="">Bulk Actions</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedProducts.length === 0}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-12 px-3 py-3.5"></th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700">
                  Image
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex cursor-pointer items-center">Name{getSortIndicator("name")}</div>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex cursor-pointer items-center">Price{getSortIndicator("price")}</div>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex cursor-pointer items-center">Category{getSortIndicator("category")}</div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700">
                  Colors
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  onClick={() => handleSort("availableQuantity")}
                >
                  <div className="flex cursor-pointer items-center">Stock{getSortIndicator("availableQuantity")}</div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading && !sortedProducts.length ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <RefreshCw size={24} className="mb-2 animate-spin text-emerald-500" />
                      <p>Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : !sortedProducts.length ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                sortedProducts.map((prod) => (
                  <tr
                    key={prod._id}
                    className={`${prod.availableQuantity < 5 ? "bg-red-50" : ""} ${
                      selectedProducts.includes(prod._id) ? "bg-emerald-50" : ""
                    } hover:bg-gray-50`}
                  >
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(prod._id)}
                        onChange={() => handleSelectProduct(prod._id)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <img
                        src={prod.imageUrl || "/placeholder.svg"}
                        alt={prod.name}
                        className="h-14 w-14 rounded-lg object-cover shadow-sm"
                      />
                    </td>
                    <td className="px-3 py-4 text-sm">{prod.name}</td>
                    <td className="px-3 py-4 text-sm font-medium text-emerald-600">₹{prod.price}</td>
                    <td className="px-3 py-4 text-sm">{prod.category}</td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-1">
                        {prod.colors.map((color, index) => (
                          <span
                            key={index}
                            className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={`px-3 py-4 text-sm ${prod.availableQuantity < 5 ? "text-red-600" : ""}`}>
                      <div className="flex items-center gap-1">
                        {prod.availableQuantity < 5 && <AlertCircle size={14} className="text-red-500" />}
                        {prod.availableQuantity}
                      </div>
                    </td>
                    <td className="max-w-[200px] px-3 py-4 text-sm">
                      <div className="truncate">
                        {prod.description.length > 50 ? `${prod.description.substring(0, 50)}...` : prod.description}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(prod)}
                          className="rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-200"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(prod._id)}
                          className="rounded-lg bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products by Category */}
      <h2 className="mb-4 text-2xl font-bold text-gray-800">Products by Category</h2>
      <div className="space-y-8">
        {Object.entries(groupProductsByCategory(sortedProducts)).map(([category, products]) => (
          <div key={category} className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="mb-4 border-b border-gray-100 pb-3 text-xl font-semibold text-gray-800">
              {category} ({products.length})
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((prod) => (
                <div
                  key={prod._id}
                  className="group overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={prod.imageUrl || "/placeholder.svg"}
                      alt={prod.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {prod.availableQuantity < 5 && (
                      <div className="absolute right-2 top-2 rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white shadow-sm">
                        <div className="flex items-center gap-1">
                          <AlertCircle size={12} />
                          Low Stock
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h4 className="mb-1 truncate text-base font-semibold text-gray-800">{prod.name}</h4>
                    <p className="mb-2 text-lg font-bold text-emerald-600">₹{prod.price}</p>
                    <p className="mb-3 text-sm text-gray-500">Stock: {prod.availableQuantity}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
