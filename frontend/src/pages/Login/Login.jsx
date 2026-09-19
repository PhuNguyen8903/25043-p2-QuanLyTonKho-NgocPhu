import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../../assets/logo.png";
import { getMe, login } from "../../services/authService";

function Login() {
  const [emailOrusername, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() =>{
    const isHaveSession = async () =>{
      try {
        const check = await getMe();
        if(check){
          navigate("/purchaseorders");
        }
      } catch (error) {
        if(error.response?.status === 401){
          return 
        }
        console.error("Check session error:", error);
      }
    };
    isHaveSession();
  },[]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Validate frontend
    if (!emailOrusername.trim() || !password.trim()) {
      setError(
        "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu."
      );
      return;
    }
    try {
      setLoading(true);
      const data = await login(
        emailOrusername,
        password
      );
      navigate("/purchaseorders");

    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="title-logo">
            <img
              src={logo}
              alt="Yasuo logo"
              className="logo"
            />
            <h1>Yasuo</h1>
          </div>
          <p>
            Hệ thống quản lý mua hàng và tồn kho
          </p>
        </div>
        <div className="login-card">
          <h2>Đăng nhập</h2>
          <p className="login-description">
            Đăng nhập để tiếp tục sử dụng hệ thống
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">
                Tên đăng nhập / Email
              </label>

              <input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập hoặc email"
                value={emailOrusername}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                disabled={loading}
              />

            </div>

            <div className="form-group">

              <label htmlFor="password">
                Mật khẩu
              </label>

              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={loading}
              />

            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Đang đăng nhập..."
                : "Đăng nhập"}
            </button>

          </form>

        </div>

        <p className="login-footer">
          ©2026 Purchase & Inventory Management System
        </p>

      </div>
    </div>
  );
}

export default Login;