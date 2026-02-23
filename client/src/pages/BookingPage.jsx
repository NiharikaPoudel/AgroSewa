import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NepaliDate from "nepali-date-converter";
import axios from "axios";

const BookSoilTest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form States
  const [municipality, setMunicipality] = useState("");
  const [ward, setWard] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [cropType, setCropType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new NepaliDate());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const municipalities = [
    { name: "Kathmandu Metropolitan", nameNe: "काठमाडौं महानगरपालिका", wards: Array.from({ length: 32 }, (_, i) => i + 1) },
    { name: "Kirtipur", nameNe: "कीर्तिपुर नगरपालिका", wards: Array.from({ length: 10 }, (_, i) => i + 1) },
    { name: "Budanilkantha", nameNe: "बुढानीलकण्ठ नगरपालिका", wards: Array.from({ length: 13 }, (_, i) => i + 1) },
    { name: "Tarakeshwar", nameNe: "तारकेश्वर नगरपालिका", wards: Array.from({ length: 11 }, (_, i) => i + 1) },
    { name: "Lalitpur Metropolitan", nameNe: "ललितपुर महानगरपालिका", wards: Array.from({ length: 29 }, (_, i) => i + 1) },
    { name: "Godawari", nameNe: "गोदावरी नगरपालिका", wards: Array.from({ length: 14 }, (_, i) => i + 1) },
    { name: "Mahalaxmi", nameNe: "महालक्ष्मी नगरपालिका", wards: Array.from({ length: 10 }, (_, i) => i + 1) },
    { name: "Bhaktapur Municipality", nameNe: "भक्तपुर नगरपालिका", wards: Array.from({ length: 10 }, (_, i) => i + 1) },
    { name: "Madhyapur Thimi", nameNe: "मध्यपुर थिमी नगरपालिका", wards: Array.from({ length: 9 }, (_, i) => i + 1) },
    { name: "Pokhara Metropolitan", nameNe: "पोखरा महानगरपालिका", wards: Array.from({ length: 33 }, (_, i) => i + 1) },
    { name: "Butwal Sub-Metropolitan", nameNe: "बुटवल उपमहानगरपालिका", wards: Array.from({ length: 19 }, (_, i) => i + 1) },
    { name: "Siddharthanagar", nameNe: "सिद्धार्थनगर नगरपालिका", wards: Array.from({ length: 14 }, (_, i) => i + 1) },
  ];

  const getWards = () => {
    const mun = municipalities.find((m) => m.name === municipality);
    return mun ? mun.wards : [];
  };

  useEffect(() => {
    setWard("");
  }, [municipality]);

  useEffect(() => {
    setSelectedTimeSlot(null);
    if (selectedDate && municipality && ward) {
      fetchBookedSlots();
    }
  }, [selectedDate, municipality, ward]);

  const fetchBookedSlots = async () => {
    setLoadingSlots(true);
    try {
      const token = localStorage.getItem("token");
      const dateStr = selectedDate.toJsDate().toISOString().split("T")[0];
      const { data } = await axios.get(
        `http://localhost:5000/api/bookings/slots?date=${dateStr}&municipality=${encodeURIComponent(municipality)}&ward=${ward}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setBookedSlots(data.bookedSlots || []);
      }
    } catch (error) {
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const timeSlots = [
    { id: "07:00", label: "७:०० बिहान", labelEn: "7:00 AM", icon: "🌅" },
    { id: "09:00", label: "९:०० बिहान", labelEn: "9:00 AM", icon: "☀️" },
    { id: "11:00", label: "११:०० बिहान", labelEn: "11:00 AM", icon: "🌤️" },
    { id: "13:00", label: "१:०० दिउँसो", labelEn: "1:00 PM", icon: "🌞" },
    { id: "15:00", label: "३:०० दिउँसो", labelEn: "3:00 PM", icon: "⛅" },
    { id: "17:00", label: "५:०० साँझ", labelEn: "5:00 PM", icon: "🌇" },
  ];

  // Nepali Calendar
  const getDaysInNepaliMonth = (nepaliDate) => {
    const year = nepaliDate.getYear();
    const month = nepaliDate.getMonth();
    const daysInMonth = new NepaliDate(year, month + 1, 0).getDate();
    const firstDayOfWeek = new NepaliDate(year, month, 1).getDay();
    return { daysInMonth, firstDayOfWeek };
  };

  const { daysInMonth, firstDayOfWeek } = getDaysInNepaliMonth(currentMonth);

  const nepaliMonths = [
    { en: "Baisakh", ne: "बैशाख" }, { en: "Jestha", ne: "जेष्ठ" },
    { en: "Ashar", ne: "असार" }, { en: "Shrawan", ne: "श्रावण" },
    { en: "Bhadra", ne: "भाद्र" }, { en: "Ashwin", ne: "आश्विन" },
    { en: "Kartik", ne: "कार्तिक" }, { en: "Mangsir", ne: "मंसिर" },
    { en: "Poush", ne: "पौष" }, { en: "Magh", ne: "माघ" },
    { en: "Falgun", ne: "फाल्गुण" }, { en: "Chaitra", ne: "चैत्र" },
  ];

  const weekDays = [
    { en: "Su", ne: "आ" }, { en: "Mo", ne: "सो" }, { en: "Tu", ne: "म" },
    { en: "We", ne: "बु" }, { en: "Th", ne: "बि" }, { en: "Fr", ne: "शु" }, { en: "Sa", ne: "श" },
  ];

  const previousMonth = () => {
    const newMonth = currentMonth.getMonth() === 0 ? 11 : currentMonth.getMonth() - 1;
    const newYear = currentMonth.getMonth() === 0 ? currentMonth.getYear() - 1 : currentMonth.getYear();
    setCurrentMonth(new NepaliDate(newYear, newMonth, 1));
  };

  const nextMonth = () => {
    const newMonth = currentMonth.getMonth() === 11 ? 0 : currentMonth.getMonth() + 1;
    const newYear = currentMonth.getMonth() === 11 ? currentMonth.getYear() + 1 : currentMonth.getYear();
    setCurrentMonth(new NepaliDate(newYear, newMonth, 1));
  };

  const selectDate = (day) => {
    const selected = new NepaliDate(currentMonth.getYear(), currentMonth.getMonth(), day);
    setSelectedDate(selected);
    setSelectedTimeSlot(null);
  };

  const formatNepaliDate = (nepaliDate) => {
    if (!nepaliDate) return "";
    const monthName = nepaliMonths[nepaliDate.getMonth()];
    return `${monthName.en} ${nepaliDate.getDate()}, ${nepaliDate.getYear()}`;
  };

  const handleSubmit = async () => {
    if (!municipality || !ward) {
      alert(t("pleaseSelectLocation") || "Please select municipality and ward.");
      return;
    }
    if (!fieldName) {
      alert(t("pleaseEnterFieldName") || "Please enter field name.");
      return;
    }
    if (!phoneNumber) {
      alert("Please enter your phone number.");
      return;
    }
    if (!selectedDate) {
      alert(t("pleaseSelectDate") || "Please select a date.");
      return;
    }
    if (!selectedTimeSlot) {
      alert("Please select a time slot.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      const jsDate = selectedDate.toJsDate();
      const [hours] = selectedTimeSlot.split(":");
      jsDate.setHours(parseInt(hours), 0, 0, 0);

      const bookingData = {
        location: { municipality, ward },
        fieldName,
        cropType,
        phoneNumber,
        collectionDate: jsDate.toISOString(),
        nepaliDate: formatNepaliDate(selectedDate),
        timeSlot: selectedTimeSlot,
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/bookings",
        bookingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        alert(t("bookingSuccess") || "Booking successful!");
        navigate("/farmer-dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="booking-page">
        {/* Soil particle animations */}
        <div className="soil-particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>

        {/* Floating soil layers */}
        <div className="soil-layer soil-layer-1"></div>
        <div className="soil-layer soil-layer-2"></div>
        <div className="soil-layer soil-layer-3"></div>

        <div className="booking-container">
          {/* Header */}
          <div className="booking-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("backToDashboard") || "Back"}
            </button>

            <div className="header-content">
              <div className="soil-animation-wrapper">
                <div className="soil-beaker">
                  <div className="beaker-body">
                    <div className="soil-fill">
                      <div className="soil-layer-anim layer-dark"></div>
                      <div className="soil-layer-anim layer-mid"></div>
                      <div className="soil-layer-anim layer-light"></div>
                    </div>
                    <div className="beaker-bubbles">
                      <span className="bubble b1"></span>
                      <span className="bubble b2"></span>
                      <span className="bubble b3"></span>
                    </div>
                  </div>
                  <div className="beaker-neck"></div>
                </div>
                <div className="scan-lines">
                  <div className="scan-line sl1"></div>
                  <div className="scan-line sl2"></div>
                  <div className="scan-line sl3"></div>
                </div>
              </div>

              <div className="header-badge">
                <span className="badge-dot"></span>
                {t("soilTesting") || "Soil Testing Service"}
              </div>
              <h1 className="header-title">
                {t("bookSoilTestingService") || "Book Soil Testing"}
              </h1>
              <p className="header-subtitle">
                {t("bookingSoilTestSubtitle") || "Schedule a professional soil analysis for your farm — powered by science, delivered to your field."}
              </p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="booking-content">
            {/* LEFT: Form */}
            <div className="form-section">

              {/* Location Card */}
              <div className="section-card" style={{ animationDelay: "0.1s" }}>
                <div className="card-header">
                  <span className="card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <h2 className="card-title">{t("locationDetails") || "Location Details"}</h2>
                </div>

                <div className="form-group">
                  <label className="form-label">{t("municipality") || "Municipality / Nagarpalika"}</label>
                  <div className="select-wrapper">
                    <select value={municipality} onChange={(e) => setMunicipality(e.target.value)} className="form-control">
                      <option value="">{t("selectMunicipality") || "Select Municipality"}</option>
                      {municipalities.map((m, i) => (
                        <option key={i} value={m.name}>{m.nameNe} ({m.name})</option>
                      ))}
                    </select>
                    <span className="select-arrow">▾</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t("ward") || "Ward Number"}</label>
                  <div className="select-wrapper">
                    <select value={ward} onChange={(e) => setWard(e.target.value)} className="form-control" disabled={!municipality}>
                      <option value="">{t("selectWard") || "Select Ward"}</option>
                      {getWards().map((w, i) => (
                        <option key={i} value={w}>{t("wardNo") || "Ward"} {w}</option>
                      ))}
                    </select>
                    <span className="select-arrow">▾</span>
                  </div>
                </div>
              </div>

              {/* Field Info Card */}
              <div className="section-card" style={{ animationDelay: "0.2s" }}>
                <div className="card-header">
                  <span className="card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </span>
                  <h2 className="card-title">{t("fieldInformation") || "Field Information"}</h2>
                </div>

                <div className="form-group">
                  <label className="form-label">{t("fieldName") || "Field Name"}</label>
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder={t("fieldNamePlaceholder") || "e.g. Mero Kheto, North Field..."}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t("cropType") || "Crop Type"}</label>
                    <div className="select-wrapper">
                      <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="form-control">
                        <option value="">{t("selectCropType") || "Select Crop"}</option>
                        <option value="rice">{t("rice") || "Rice (Dhan)"}</option>
                        <option value="wheat">{t("wheat") || "Wheat (Gahu)"}</option>
                        <option value="maize">{t("maize") || "Maize (Makai)"}</option>
                        <option value="vegetables">{t("vegetables") || "Vegetables (Tarkari)"}</option>
                        <option value="fruits">{t("fruits") || "Fruits (Phal)"}</option>
                        <option value="other">{t("other") || "Other"}</option>
                      </select>
                      <span className="select-arrow">▾</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number / फोन नम्बर</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="form-control"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info Card */}
              <div className="payment-card" style={{ animationDelay: "0.3s" }}>
                <div className="payment-orb"></div>
                <div className="payment-icon-wrapper">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div className="payment-content">
                  <h3 className="payment-title">{t("cashOnDelivery") || "Cash on Delivery"}</h3>
                  <p className="payment-desc">
                    {t("paymentOf") || "Pay"} <strong className="payment-amount">NPR 500</strong> {t("paymentCollectionNote") || "when our technician arrives at your field."}
                  </p>
                  <div className="payment-features">
                    <span className="payment-feature">✓ {t("securePayment") || "Secure"}</span>
                    <span className="payment-feature">✓ {t("noAdvancePayment") || "No Advance"}</span>
                    <span className="payment-feature">✓ Receipt Provided</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Calendar + Time Slots */}
            <div className="calendar-section">
              <div className="calendar-card">
                <div className="card-header">
                  <span className="card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  <h2 className="card-title">{t("selectCollectionDate") || "Select Date"}</h2>
                </div>

                <div className="nepali-calendar">
                  <div className="calendar-header">
                    <button className="calendar-nav" onClick={previousMonth}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <div className="calendar-month-display">
                      <span className="calendar-month">{nepaliMonths[currentMonth.getMonth()].ne}</span>
                      <span className="calendar-year">{currentMonth.getYear()}</span>
                    </div>
                    <button className="calendar-nav" onClick={nextMonth}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  <div className="calendar-weekdays">
                    {weekDays.map((day, i) => (
                      <div key={i} className="calendar-weekday">{day.ne}</div>
                    ))}
                  </div>

                  <div className="calendar-grid">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="calendar-day empty"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const isSelected = selectedDate &&
                        selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentMonth.getMonth() &&
                        selectedDate.getYear() === currentMonth.getYear();
                      const isPast = new NepaliDate(currentMonth.getYear(), currentMonth.getMonth(), day).toJsDate() <
                        new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <button
                          key={day}
                          onClick={() => !isPast && selectDate(day)}
                          className={`calendar-day ${isSelected ? "selected" : ""} ${isPast ? "past" : "available"}`}
                          disabled={isPast}
                        >
                          {day}
                          {isSelected && <span className="day-dot"></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div className="selected-date-box">
                    <div className="selected-date-label">{t("selectedDate") || "Selected Date"}</div>
                    <div className="selected-date-value">{formatNepaliDate(selectedDate)}</div>
                  </div>
                )}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="timeslot-card">
                  <div className="card-header">
                    <span className="card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </span>
                    <h2 className="card-title">Select Time Slot / समय छान्नुहोस्</h2>
                  </div>

                  {!municipality || !ward ? (
                    <div className="slot-notice">
                      <span className="slot-notice-icon">📍</span>
                      <p>Please select municipality and ward to see available slots.</p>
                    </div>
                  ) : loadingSlots ? (
                    <div className="slots-loading">
                      <div className="loading-spinner"></div>
                      <span>Loading available slots...</span>
                    </div>
                  ) : (
                    <div className="timeslot-grid">
                      {timeSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot.id);
                        const isSelected = selectedTimeSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            onClick={() => !isBooked && setSelectedTimeSlot(slot.id)}
                            disabled={isBooked}
                            className={`timeslot-btn ${isSelected ? "slot-selected" : ""} ${isBooked ? "slot-booked" : ""}`}
                          >
                            <span className="slot-icon">{slot.icon}</span>
                            <span className="slot-time-ne">{slot.label}</span>
                            <span className="slot-time-en">{slot.labelEn}</span>
                            {isBooked && <span className="slot-badge">Booked</span>}
                            {isSelected && <span className="slot-check">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                className={`submit-btn ${submitting ? "submitting" : ""}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="btn-spinner"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>{t("requestSoilTest") || "Book Soil Test"}</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>

              {/* Help Card */}
              <div className="help-card">
                <div className="help-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="help-content">
                  <h4 className="help-title">{t("needHelp") || "Need Help?"}</h4>
                  <p className="help-text">{t("needHelpText") || "Call our helpline: 1800-SOIL-TEST or visit the nearest agriculture office."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Nepali&family=Syne:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; }

        .booking-page {
          min-height: 100vh;
          background: #f8fdf5;
          position: relative;
          overflow-x: hidden;
          font-family: 'Syne', 'Tiro Devanagari Nepali', sans-serif;
        }

        /* ── Soil particles ── */
        .soil-particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .particle {
          position: absolute;
          border-radius: 50%;
          animation: drift linear infinite;
          opacity: 0;
        }
        ${[...Array(12)].map((_, i) => `
          .particle-${i + 1} {
            width: ${6 + (i % 4) * 4}px;
            height: ${6 + (i % 4) * 4}px;
            background: ${["#8B5E3C","#A0724A","#6B4226","#C4945A","#D4A96A","#7B4F2E"][i % 6]};
            left: ${(i * 8.3) % 100}%;
            top: ${Math.random() * 100}%;
            animation-duration: ${12 + i * 2}s;
            animation-delay: ${-i * 1.5}s;
            opacity: 0.18;
          }
        `).join("")}
        @keyframes drift {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.18; }
          90% { opacity: 0.18; }
          100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
        }

        /* ── Soil layers bg ── */
        .soil-layer {
          position: fixed;
          width: 100%;
          height: 200px;
          pointer-events: none;
          z-index: 0;
          opacity: 0.04;
        }
        .soil-layer-1 {
          bottom: 0;
          background: #6B4226;
          clip-path: ellipse(60% 50% at 50% 100%);
        }
        .soil-layer-2 {
          bottom: -30px;
          background: #8B5E3C;
          clip-path: ellipse(80% 60% at 50% 100%);
        }
        .soil-layer-3 {
          bottom: -60px;
          background: #A0724A;
          clip-path: ellipse(100% 70% at 50% 100%);
        }

        /* ── Container ── */
        .booking-container {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        /* ── Header ── */
        .booking-header { margin-bottom: 56px; }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1.5px solid #e5e7eb;
          color: #15803d;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 32px;
          font-family: inherit;
        }
        .back-btn:hover {
          background: #f0fdf4;
          border-color: #15803d;
          transform: translateX(-4px);
        }

        .header-content {
          text-align: center;
          animation: fadeInUp 0.7s ease-out;
        }

        /* ── Soil Beaker Animation ── */
        .soil-animation-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 24px;
        }
        .soil-beaker {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          animation: gentleRock 4s ease-in-out infinite;
        }
        @keyframes gentleRock {
          0%, 100% { transform: translateX(-50%) rotate(-2deg); }
          50% { transform: translateX(-50%) rotate(2deg); }
        }
        .beaker-neck {
          width: 30px;
          height: 18px;
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          border-radius: 4px 4px 0 0;
          margin: 0 auto;
          border: 2px solid #6ee7b7;
          border-bottom: none;
        }
        .beaker-body {
          width: 60px;
          height: 70px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border: 2px solid #6ee7b7;
          border-radius: 4px 4px 10px 10px;
          overflow: hidden;
          position: relative;
        }
        .soil-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 75%;
          display: flex;
          flex-direction: column-reverse;
        }
        .soil-layer-anim {
          width: 100%;
          animation: soilWave 3s ease-in-out infinite;
        }
        .layer-dark { height: 40%; background: #6B4226; }
        .layer-mid { height: 35%; background: #8B5E3C; animation-delay: 0.5s; }
        .layer-light { height: 25%; background: #A0724A; animation-delay: 1s; }
        @keyframes soilWave {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.03); }
        }
        .beaker-bubbles { position: absolute; top: 5px; left: 0; right: 0; }
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.7);
          animation: bubbleUp 2.5s ease-in infinite;
        }
        .b1 { width: 6px; height: 6px; left: 20%; animation-delay: 0s; }
        .b2 { width: 4px; height: 4px; left: 50%; animation-delay: 0.8s; }
        .b3 { width: 5px; height: 5px; left: 70%; animation-delay: 1.5s; }
        @keyframes bubbleUp {
          0% { transform: translateY(50px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(-10px); opacity: 0; }
        }
        .scan-lines {
          position: absolute;
          right: 0;
          top: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .scan-line {
          height: 3px;
          border-radius: 2px;
          background: linear-gradient(90deg, transparent, #15803d);
          animation: scanPulse 2s ease-in-out infinite;
        }
        .sl1 { width: 30px; animation-delay: 0s; }
        .sl2 { width: 20px; animation-delay: 0.3s; }
        .sl3 { width: 25px; animation-delay: 0.6s; }
        @keyframes scanPulse {
          0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
          50% { opacity: 1; transform: scaleX(1); }
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 700;
          color: #15803d;
          box-shadow: 0 2px 16px rgba(21, 128, 61, 0.15);
          margin-bottom: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .badge-dot {
          width: 8px;
          height: 8px;
          background: #15803d;
          border-radius: 50%;
          animation: badgePulse 2s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(21, 128, 61, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(21, 128, 61, 0); }
        }

        .header-title {
          font-size: clamp(30px, 5vw, 48px);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 12px 0;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .header-subtitle {
          font-size: 16px;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Content Grid ── */
        .booking-content {
          display: grid;
          grid-template-columns: 1fr 460px;
          gap: 40px;
          align-items: start;
        }

        /* ── Form Section ── */
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
          border: 1px solid #e8f5e9;
          animation: fadeInUp 0.5s ease-out both;
          position: relative;
          overflow: hidden;
        }
        .section-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #15803d, #4ade80, #15803d);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1.5px solid #f0fdf4;
        }
        .card-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-radius: 12px;
          flex-shrink: 0;
        }
        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a2e1a;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .form-group { margin-bottom: 20px; }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .select-wrapper { position: relative; }
        .select-arrow {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #15803d;
          pointer-events: none;
          font-size: 16px;
        }

        .form-control {
          width: 100%;
          padding: 13px 16px;
          font-size: 15px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          background: #fafafa;
          color: #1f2937;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
          appearance: none;
        }
        .form-control:hover {
          border-color: #15803d;
          background: white;
        }
        .form-control:focus {
          border-color: #15803d;
          background: white;
          box-shadow: 0 0 0 4px rgba(21, 128, 61, 0.08);
        }
        .form-control:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* ── Payment Card ── */
        .payment-card {
          background: linear-gradient(135deg, #15803d 0%, #166534 60%, #14532d 100%);
          border-radius: 24px;
          padding: 28px;
          display: flex;
          gap: 20px;
          color: white;
          box-shadow: 0 12px 32px rgba(21, 128, 61, 0.3);
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.5s ease-out both;
        }
        .payment-orb {
          position: absolute;
          width: 180px;
          height: 180px;
          background: rgba(255,255,255,0.07);
          border-radius: 50%;
          top: -60px;
          right: -40px;
        }
        .payment-icon-wrapper {
          width: 56px;
          height: 56px;
          background: rgba(255,255,255,0.18);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          backdrop-filter: blur(4px);
        }
        .payment-content { flex: 1; position: relative; z-index: 1; }
        .payment-title { font-size: 17px; font-weight: 700; margin: 0 0 8px 0; }
        .payment-desc { font-size: 14px; margin: 0 0 12px 0; opacity: 0.9; line-height: 1.5; }
        .payment-amount { font-size: 20px; font-weight: 800; }
        .payment-features { display: flex; gap: 14px; flex-wrap: wrap; }
        .payment-feature { font-size: 12px; opacity: 0.85; font-weight: 600; }

        /* ── Calendar Section ── */
        .calendar-section {
          position: sticky;
          top: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: fadeInUp 0.5s ease-out 0.15s both;
        }

        .calendar-card, .timeslot-card {
          background: white;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          border: 1px solid #e8f5e9;
          position: relative;
          overflow: hidden;
        }
        .calendar-card::before, .timeslot-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #15803d, #4ade80, #15803d);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        .nepali-calendar { margin-top: 24px; }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .calendar-nav {
          width: 36px;
          height: 36px;
          border: none;
          background: #f3f4f6;
          border-radius: 10px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .calendar-nav:hover {
          background: #15803d;
          color: white;
          transform: scale(1.1);
        }
        .calendar-month-display { text-align: center; }
        .calendar-month { display: block; font-size: 20px; font-weight: 800; color: #1a2e1a; }
        .calendar-year { font-size: 13px; color: #6b7280; font-weight: 600; }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
        }
        .calendar-weekday {
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          color: #15803d;
          padding: 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
        }
        .calendar-day {
          aspect-ratio: 1;
          border: none;
          background: #f9fafb;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-family: inherit;
          flex-direction: column;
          gap: 2px;
        }
        .calendar-day.available:hover {
          background: #dcfce7;
          color: #15803d;
          transform: scale(1.1);
        }
        .calendar-day.selected {
          background: linear-gradient(135deg, #15803d, #16a34a);
          color: white;
          transform: scale(1.12);
          box-shadow: 0 4px 14px rgba(21, 128, 61, 0.4);
        }
        .calendar-day.empty { background: transparent; cursor: default; }
        .calendar-day.past { opacity: 0.25; cursor: not-allowed; }
        .day-dot {
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          position: absolute;
          bottom: 4px;
        }

        .selected-date-box {
          margin-top: 20px;
          padding: 16px;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-radius: 14px;
          text-align: center;
          animation: fadeInUp 0.3s ease-out;
          border: 1px solid #bbf7d0;
        }
        .selected-date-label {
          font-size: 10px;
          font-weight: 800;
          color: #15803d;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
        }
        .selected-date-value {
          font-size: 17px;
          font-weight: 700;
          color: #1a2e1a;
        }

        /* ── Time Slots ── */
        .timeslot-card { animation: fadeInUp 0.4s ease-out; }

        .slot-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px;
          background: #fef9c3;
          border-radius: 12px;
          font-size: 14px;
          color: #92400e;
          margin-top: 16px;
        }
        .slot-notice-icon { font-size: 20px; }

        .slots-loading {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
          margin-top: 12px;
        }
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top-color: #15803d;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .timeslot-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 16px;
        }
        .timeslot-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 14px 10px;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          background: #fafafa;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: inherit;
          overflow: hidden;
        }
        .timeslot-btn:not(.slot-booked):not(.slot-selected):hover {
          border-color: #15803d;
          background: #f0fdf4;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(21,128,61,0.12);
        }
        .timeslot-btn.slot-selected {
          border-color: #15803d;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          box-shadow: 0 4px 14px rgba(21,128,61,0.2);
        }
        .timeslot-btn.slot-booked {
          background: #f9fafb;
          border-color: #e5e7eb;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .slot-icon { font-size: 22px; }
        .slot-time-ne { font-size: 13px; font-weight: 700; color: #1a2e1a; }
        .slot-time-en { font-size: 11px; color: #6b7280; }
        .slot-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #fee2e2;
          color: #dc2626;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .slot-check {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #15803d;
          color: white;
          font-size: 10px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Submit ── */
        .submit-btn {
          width: 100%;
          padding: 18px 24px;
          background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 6px 20px rgba(21, 128, 61, 0.35);
          font-family: inherit;
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(21, 128, 61, 0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.75; cursor: not-allowed; }
        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* ── Help Card ── */
        .help-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 1.5px dashed #d1fae5;
          border-radius: 16px;
          transition: border-color 0.3s ease;
        }
        .help-card:hover { border-color: #15803d; }
        .help-icon { flex-shrink: 0; display: flex; align-items: flex-start; padding-top: 2px; }
        .help-content { flex: 1; }
        .help-title { font-size: 15px; font-weight: 700; color: #1a2e1a; margin: 0 0 6px 0; }
        .help-text { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .booking-content { grid-template-columns: 1fr; }
          .calendar-section { position: static; }
        }
        @media (max-width: 640px) {
          .booking-container { padding: 24px 16px 60px; }
          .section-card { padding: 24px 20px; }
          .form-row { grid-template-columns: 1fr; }
          .timeslot-grid { grid-template-columns: 1fr 1fr; }
          .header-title { font-size: 28px; }
        }
      `}</style>
    </>
  );
};

export default BookSoilTest;