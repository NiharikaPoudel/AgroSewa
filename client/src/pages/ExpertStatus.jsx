import { useEffect, useState } from "react";
import api from "../utils/axios";

const ExpertStatus = () => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get("/expert/my-application", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setStatus(res.data.application.status);
        }
      } catch (err) {
        console.error(err);
        setStatus("none");
      }
    };

    fetchStatus();
  }, []);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Expert Application Status</h2>

      {status === "pending" && (
        <p style={{ color: "#f59e0b" }}>
          ⏳ Your application is under review.
        </p>
      )}

      {status === "approved" && (
        <p style={{ color: "#10b981" }}>
          ✅ Your application has been approved.
        </p>
      )}

      {status === "rejected" && (
        <p style={{ color: "#ef4444" }}>
          ❌ Your application was rejected.
        </p>
      )}
    </div>
  );
};

export default ExpertStatus;
