import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import type { ChangeEvent, SubmitEvent } from "react";
import type { TProduct } from "@/types/product";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function WeekThree() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setisAuth] = useState(false);
  const productModalRef = useRef<bootstrap.Modal | null>(null);

  useEffect(() => {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, "$1");
    // 注意：已全域設定 Authorization token
    axios.defaults.headers.common.Authorization = token;
    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });

    const checkAdmin = async () => {
      try {
        await axios.post(`${API_BASE}/api/user/check`);
        setisAuth(true);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error(err.response?.data.message);
        }
      }
    };
    checkAdmin();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common.Authorization = token;
      setisAuth(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert("登入失敗: " + error.response?.data.message);
      }
    }
  };

  // 產品列表渲染
  const [products, setProducts] = useState<TProduct[]>([]);

  // useCallback，避免因 useEffect 重複渲染而建立多個；參數 2 為依賴陣列（空陣列 = Mount 階段建立一次，並保持同一個引用）
  const fetchProductsList = useCallback(async (): Promise<TProduct[]> => {
    const { data } = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products/all`);
    return Object.values(data.products);
  }, []);

  // 給外部用的
  const getProducts = useCallback(async () => {
    const list = await fetchProductsList();
    setProducts(list);
  }, [fetchProductsList]);

  useEffect(() => {
    if (!isAuth) return;

    // 確保在元件 unmount 時，不會因為非同步操作而造成記憶體洩漏
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const list = await fetchProductsList();
        if (isMounted) {
          setProducts(list);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data.message);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [isAuth, fetchProductsList]);

  // 產品列表的 tr 元件
  const ProductListTr = ({ product }: { product: TProduct }) => {
    return (
      <tr>
        <td>{product.category}</td>
        <td>{product.title}</td>
        <td className="text-end">{product.origin_price}</td>
        <td className="text-end">{product.price}</td>
        <td>{product.is_enabled ? <span className="text-success">啟用</span> : <span>未啟用</span>}</td>
        <td>
          <div className="btn-group">
            <button type="button" className="btn btn-outline-primary btn-sm">
              編輯
            </button>
            <button type="button" className="btn btn-outline-danger btn-sm">
              刪除
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // 新增、編輯產品
  const [productFormData, setProductFormData] = useState<TProduct>({
    category: "",
    content: "",
    description: "",
    id: "",
    is_enabled: 0,
    origin_price: 0,
    price: 0,
    title: "",
    unit: "",
    num: 0,
    imageUrl: "",
    imagesUrl: [],
  });

  const [imageUrl, setImageUrl] = useState("");

  const addImage = () => {
    setProductFormData((prevData) => {
      const { imageUrl: preImageUrl, imagesUrl: preImagesUrl } = prevData;
      if (!preImageUrl) {
        return {
          ...prevData,
          imageUrl: imageUrl,
        };
      }

      return {
        ...prevData,
        imagesUrl: [...preImagesUrl, imageUrl],
      };
    });
    setImageUrl("");
  };

  const deleteImage = () => {
    setProductFormData((prevData) => {
      const { imagesUrl: preImagesUrl } = prevData;
      if (preImagesUrl.length > 0) {
        return {
          ...prevData,
          imagesUrl: preImagesUrl.slice(0, -1),
        };
      }
      return {
        ...prevData,
        imageUrl: "",
      };
    });
  };

  const handleProductFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id } = e.target;
    let value: string | number = e.target.value;

    const toNumberField = ["origin_price", "price"];

    if (toNumberField.includes(id)) {
      value = Number(value) || 0;
    }

    setProductFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
    console.log(productFormData, id, value);
  };

  // 參數 1 為表單資料，參數 2 為必填欄位陣列
  const checkRequiredFields = <T,>(data: T, fields: (keyof T)[]): boolean => {
    const isValid = fields.every((field) => {
      const value = data[field];
      return value !== undefined && value !== null && value !== "";
    });

    if (!isValid) alert(`請檢查必填欄位: ${fields.join(", ")}`);

    return isValid;
  };

  const submitProductForm = async () => {
    const requiredFields: (keyof TProduct)[] = ["title", "category", "unit", "origin_price", "price"];
    
    const isValid = checkRequiredFields(productFormData, requiredFields);
    if (!isValid) return;

    try {
      const { data } = await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, { data: productFormData });
      alert(data.message);
      productModalRef.current?.hide();
      getProducts();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data.message);
        alert(error.response?.data.message);
      }
    }
  };

  return (
    <>
      {isAuth ? (
        <div>
          <div className="container">
            <div className="text-end mt-4">
              <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#productModal">
                建立新的產品
              </button>
            </div>
            <table className="table mt-4">
              <thead>
                <tr>
                  <th style={{ width: "120px" }}>分類</th>
                  <th>產品名稱</th>
                  <th style={{ width: "120px" }}>原價</th>
                  <th style={{ width: "120px" }}>售價</th>
                  <th style={{ width: "100px" }}>是否啟用</th>
                  <th style={{ width: "120px" }}>編輯</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductListTr key={product.id} product={product} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="container text-center vh-100">
          <div className="row justify-content-center align-items-center w-100 h-100">
            <div className="col-8">
              <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button className="btn btn-lg btn-primary w-100 mt-3" type="submit">
                  登入
                </button>
              </form>
              <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
            </div>
          </div>
        </div>
      )}
      <div
        id="productModal"
        className="modal fade"
        tabIndex={-1}
        aria-labelledby="productModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className="modal-header bg-dark text-white">
              <h5 id="productModalLabel" className="modal-title">
                <span>新增產品</span>
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="imageUrl" className="form-label">
                        輸入圖片網址
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>
                    {productFormData.imageUrl && (
                      <img className="img-fluid" src={productFormData.imageUrl} alt="產品主圖" />
                    )}
                    {productFormData.imagesUrl.length > 0 &&
                      productFormData.imagesUrl.map((url, index) => (
                        <img className="img-fluid mt-2" key={url + index} src={url} alt={`產品副圖${index + 1}`} />
                      ))}
                  </div>
                  <div>
                    <button
                      className="btn btn-outline-primary btn-sm d-block w-100"
                      onClick={addImage}
                      disabled={!imageUrl}
                    >
                      新增圖片
                    </button>
                  </div>
                  <div>
                    <button
                      className="btn btn-outline-danger btn-sm d-block w-100"
                      onClick={deleteImage}
                      disabled={!productFormData.imageUrl}
                    >
                      刪除圖片
                    </button>
                  </div>
                </div>
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      value={productFormData.title}
                      onChange={handleProductFormChange}
                    />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">
                        分類
                      </label>
                      <input
                        id="category"
                        type="text"
                        className="form-control"
                        placeholder="請輸入分類"
                        value={productFormData.category}
                        onChange={handleProductFormChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">
                        單位
                      </label>
                      <input
                        id="unit"
                        type="text"
                        className="form-control"
                        placeholder="請輸入單位"
                        value={productFormData.unit}
                        onChange={handleProductFormChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        id="origin_price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入原價"
                        value={productFormData.origin_price}
                        onChange={handleProductFormChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入售價"
                        value={productFormData.price}
                        onChange={handleProductFormChange}
                      />
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      id="description"
                      className="form-control"
                      placeholder="請輸入產品描述"
                      value={productFormData.description}
                      onChange={handleProductFormChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      id="content"
                      className="form-control"
                      placeholder="請輸入說明內容"
                      value={productFormData.content}
                      onChange={handleProductFormChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        value={productFormData.is_enabled}
                        onChange={(e) =>
                          setProductFormData((prevData) => ({
                            ...prevData,
                            is_enabled: e.target.checked ? 1 : 0,
                          }))
                        }
                      />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                取消
              </button>
              <button type="button" className="btn btn-primary" onClick={submitProductForm}>
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
