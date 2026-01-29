import { useState } from "react";
import axios from "axios";
import "./ExpertForm.css";

const ExpertForm = () => {
  /**
   * Form state
   */
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    expertise: "",
    experience: "",
  });

  /**
   * Submission state
   */
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/experts/register",
        formData
      );
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting expert form:", err);
      setError("Failed to submit. Please try again.");
    }
  };

  /**
   * After successful submission
   */
  if (submitted) {
    return (
      <div className="auth-container expert-form-container">
        <div className="auth-card">
          <h2>Thank You for Registering!</h2>
          <p>
            Your request has been submitted. Admin will review and approve
            your profile soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container expert-form-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Expert Registration</h2>

        {error && <p className="error">{error}</p>}

        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Your full name"
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+977 980XXXXXXX"
          required
        />

        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, District"
          required
        />

        <label>Area of Expertise</label>
        <input
          type="text"
          name="expertise"
          value={formData.expertise}
          onChange={handleChange}
          placeholder="e.g. Soil testing, Fertility analysis"
          required
        />

        <label>Years of Experience</label>
        <input
          type="number"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="0"
          required
          min="0"
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ExpertForm;
