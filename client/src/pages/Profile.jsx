import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import districtsData from "../data/nepalDistricts.json"; 

const Profile = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    picture: "",
    province: "",
    district: "",
    municipality: "",
    ward: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [locations, setLocations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wards, setWards] = useState([]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/profile", { withCredentials: true });
        setUser(res.data.user);
        setFormData({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          contact: res.data.user.contact || "",
          picture: res.data.user.picture || "",
          province: res.data.user.province || "",
          district: res.data.user.district || "",
          municipality: res.data.user.municipality || "",
          ward: res.data.user.ward || ""
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch locations
  useEffect(() => {
    // Use the imported JSON directly
    setLocations(districtsData.provinces || []);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Dynamic dropdown handling
    if (name === "province") {
      const prov = locations.find(p => p.name === value);
      setDistricts(prov?.districts || []);
      setMunicipalities([]);
      setWards([]);
      setFormData(prev => ({ ...prev, district: "", municipality: "", ward: "" }));
    }
    if (name === "district") {
      const dist = districts.find(d => d.name === value);
      setMunicipalities(dist?.municipalities || []);
      setWards([]);
      setFormData(prev => ({ ...prev, municipality: "", ward: "" }));
    }
    if (name === "municipality") {
      const mun = municipalities.find(m => m.name === value);
      setWards(mun?.wards || []);
      setFormData(prev => ({ ...prev, ward: "" }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      const res = await axios.put("http://localhost:5000/api/user/profile", formData, { withCredentials: true });
      setUser(res.data.user);
      setMessage(t("profileUpdateSuccess"));
    } catch (err) {
      console.error(err);
      setMessage(t("profileUpdateError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-loading">{t("loading")}</div>;
  if (!user) return <div className="profile-loading">{t("noUserData")}</div>;

  return (
    <>
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {formData.picture ? <img src={formData.picture} alt="profile" /> : <span>{user.name?.charAt(0).toUpperCase()}</span>}
            </div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>

          <div className="profile-form">
            {/* Name */}
            <div className="form-group">
              <label>{t("fullName")}</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>{t("email")}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>

            {/* Contact */}
            <div className="form-group">
              <label>{t("contactNumber")}</label>
              <input type="text" name="contact" value={formData.contact} onChange={handleChange} />
            </div>

            {/* Profile Picture */}
            <div className="form-group">
              <label>{t("profilePicture")}</label>
              <input type="text" name="picture" value={formData.picture} onChange={handleChange} />
            </div>

            {/* Province */}
            <div className="form-group">
              <label>{t("province")}</label>
              <select name="province" value={formData.province} onChange={handleChange}>
                <option value="">{t("selectProvince")}</option>
                {locations.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            {/* District */}
            <div className="form-group">
              <label>{t("district")}</label>
              <select name="district" value={formData.district} onChange={handleChange} disabled={!districts.length}>
                <option value="">{t("selectDistrict")}</option>
                {districts.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>

            {/* Municipality */}
            <div className="form-group">
              <label>{t("municipality")}</label>
              <select name="municipality" value={formData.municipality} onChange={handleChange} disabled={!municipalities.length}>
                <option value="">{t("selectMunicipality")}</option>
                {municipalities.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>

            {/* Ward */}
            <div className="form-group">
              <label>{t("ward")}</label>
              <select name="ward" value={formData.ward} onChange={handleChange} disabled={!wards.length}>
                <option value="">{t("selectWard")}</option>
                {wards.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? t("saving") : t("saveChanges")}
            </button>
            {message && <p className="profile-message">{message}</p>}
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .profile-container { min-height:100vh; display:flex; justify-content:center; align-items:center; padding:60px 20px; background: linear-gradient(180deg,#f0fdf4 0%,#ffffff 100%);}
        .profile-card { width:100%; max-width:500px; background:white; padding:40px; border-radius:24px; box-shadow:0 20px 40px rgba(0,0,0,0.08); border:1px solid #e5e7eb;}
        .profile-header { text-align:center; margin-bottom:32px; }
        .profile-avatar { width:100px;height:100px;border-radius:50%; background:linear-gradient(135deg,#16a34a,#15803d); color:white; font-size:36px; font-weight:bold; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; overflow:hidden; }
        .profile-avatar img { width:100%;height:100%;object-fit:cover;}
        .profile-header h2 { font-size:22px; font-weight:700; color:#0f172a;}
        .profile-header p { color:#64748b;font-size:14px;}
        .profile-form { display:flex; flex-direction:column; gap:20px; }
        .form-group { display:flex; flex-direction:column; gap:6px; }
        .form-group label { font-weight:600;font-size:14px;color:#334155; }
        .form-group input, .form-group select { padding:12px 14px; border-radius:10px; border:1px solid #e5e7eb; font-size:14px; transition:0.3s; }
        .form-group input:focus, .form-group select:focus { border-color:#16a34a; outline:none; box-shadow:0 0 0 2px rgba(22,163,74,0.15);}
        .save-btn { background:linear-gradient(135deg,#16a34a 0%,#15803d 100%); color:white; padding:14px; border-radius:12px; font-weight:600; border:none; cursor:pointer; transition:0.3s;}
        .save-btn:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(22,163,74,0.3);}
        .profile-message { text-align:center; font-size:14px; margin-top:10px;}
        .profile-loading { text-align:center; padding:100px; font-size:18px;}
      `}</style>
    </>
  );
};

export default Profile;
