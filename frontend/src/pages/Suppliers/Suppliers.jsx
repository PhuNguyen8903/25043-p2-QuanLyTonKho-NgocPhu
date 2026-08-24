import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSuppliers } from "../../services/supplierService";
import "./Suppliers.css";

function Suppliers() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSuppliers();

      setSuppliers(data);
    } catch (error) {
      console.error("Get suppliers error:", error);

      setSuppliers([]);
      setError(
        error.response?.data?.message ||
        "Không thể tải danh sách nhà cung cấp."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreate = () => {
    navigate("/suppliers/create");
  };

  const handleSupplierClick = (id) => {
    navigate(`/suppliers/${id}`);
  };

  return (
    <div className="suppliers-page">

      <div className="suppliers-header">
        <div>
          <h1>Danh sách Nhà cung cấp</h1>
          <p>Quản lý thông tin nhà cung cấp trong hệ thống</p>
        </div>

        <button
          type="button"
          className="create-supplier-button"
          onClick={handleCreate}
        >
          <span className="create-supplier-icon">+</span>
          Tạo mới
        </button>
      </div>

      {error && (
        <div className="suppliers-error">
          {error}
        </div>
      )}

      <div className="suppliers-table-container">
        <table className="suppliers-table">

          <thead>
            <tr>
              <th>Tên nhà cung cấp</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="table-message">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan="3" className="table-message">
                  Chưa có nhà cung cấp.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  onClick={() =>
                    handleSupplierClick(supplier.id)
                  }
                >
                  <td className="supplier-name">
                    {supplier.supplierName}
                  </td>

                  <td>
                    {supplier.phone || "-"}
                  </td>

                  <td>
                    {supplier.address || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default Suppliers;