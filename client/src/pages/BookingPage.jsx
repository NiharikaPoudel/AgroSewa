import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NepaliDate from "nepali-date-converter";

const BookSoilTest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form States
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [ward, setWard] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [fieldSize, setFieldSize] = useState("");
  const [cropType, setCropType] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new NepaliDate());

  // Location data
  const locationData = {
    provinces: [
      {
        name: "Bagmati Province",
        nameNe: "बागमती प्रदेश",
        districts: [
          {
            name: "Kathmandu",
            nameNe: "काठमाडौं",
            municipalities: [
              { name: "Kathmandu Metropolitan", nameNe: "काठमाडौं महानगरपालिका", wards: Array.from({length: 32}, (_, i) => i + 1) },
              { name: "Kirtipur", nameNe: "कीर्तिपुर नगरपालिका", wards: Array.from({length: 10}, (_, i) => i + 1) },
              { name: "Budanilkantha", nameNe: "बुढानीलकण्ठ नगरपालिका", wards: Array.from({length: 13}, (_, i) => i + 1) },
              { name: "Tarakeshwar", nameNe: "तारकेश्वर नगरपालिका", wards: Array.from({length: 11}, (_, i) => i + 1) }
            ]
          },
          {
            name: "Lalitpur",
            nameNe: "ललितपुर",
            municipalities: [
              { name: "Lalitpur Metropolitan", nameNe: "ललितपुर महानगरपालिका", wards: Array.from({length: 29}, (_, i) => i + 1) },
              { name: "Godawari", nameNe: "गोदावरी नगरपालिका", wards: Array.from({length: 14}, (_, i) => i + 1) },
              { name: "Mahalaxmi", nameNe: "महालक्ष्मी नगरपालिका", wards: Array.from({length: 10}, (_, i) => i + 1) }
            ]
          },
          {
            name: "Bhaktapur",
            nameNe: "भक्तपुर",
            municipalities: [
              { name: "Bhaktapur Municipality", nameNe: "भक्तपुर नगरपालिका", wards: Array.from({length: 10}, (_, i) => i + 1) },
              { name: "Madhyapur Thimi", nameNe: "मध्यपुर थिमी नगरपालिका", wards: Array.from({length: 9}, (_, i) => i + 1) },
              { name: "Suryabinayak", nameNe: "सूर्यबिनायक नगरपालिका", wards: Array.from({length: 10}, (_, i) => i + 1) }
            ]
          }
        ]
      },
      {
        name: "Gandaki Province",
        nameNe: "गण्डकी प्रदेश",
        districts: [
          {
            name: "Kaski",
            nameNe: "कास्की",
            municipalities: [
              { name: "Pokhara Metropolitan", nameNe: "पोखरा महानगरपालिका", wards: Array.from({length: 33}, (_, i) => i + 1) }
            ]
          }
        ]
      },
      {
        name: "Lumbini Province",
        nameNe: "लुम्बिनी प्रदेश",
        districts: [
          {
            name: "Rupandehi",
            nameNe: "रुपन्देही",
            municipalities: [
              { name: "Butwal Sub-Metropolitan", nameNe: "बुटवल उपमहानगरपालिका", wards: Array.from({length: 19}, (_, i) => i + 1) },
              { name: "Siddharthanagar", nameNe: "सिद्धार्थनगर नगरपालिका", wards: Array.from({length: 14}, (_, i) => i + 1) }
            ]
          }
        ]
      }
    ]
  };

  // Get filtered location options
  const getDistricts = () => {
    const prov = locationData.provinces.find(p => p.name === province);
    return prov ? prov.districts : [];
  };

  const getMunicipalities = () => {
    const prov = locationData.provinces.find(p => p.name === province);
    const dist = prov?.districts.find(d => d.name === district);
    return dist ? dist.municipalities : [];
  };

  const getWards = () => {
    const prov = locationData.provinces.find(p => p.name === province);
    const dist = prov?.districts.find(d => d.name === district);
    const mun = dist?.municipalities.find(m => m.name === municipality);
    return mun ? mun.wards : [];
  };

  // Reset dependent fields when parent changes
  useEffect(() => {
    setDistrict("");
    setMunicipality("");
    setWard("");
  }, [province]);

  useEffect(() => {
    setMunicipality("");
    setWard("");
  }, [district]);

  useEffect(() => {
    setWard("");
  }, [municipality]);

  // Nepali Calendar Functions
  const getDaysInNepaliMonth = (nepaliDate) => {
    const year = nepaliDate.getYear();
    const month = nepaliDate.getMonth();
    
    // Create date for first day of next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    // Get last day of current month
    const daysInMonth = new NepaliDate(year, month + 1, 0).getDate();
    const firstDayOfWeek = new NepaliDate(year, month, 1).getDay();
    
    return { daysInMonth, firstDayOfWeek };
  };

  const { daysInMonth, firstDayOfWeek } = getDaysInNepaliMonth(currentMonth);

  const nepaliMonths = [
    { en: "Baisakh", ne: "बैशाख" },
    { en: "Jestha", ne: "जेष्ठ" },
    { en: "Ashar", ne: "असार" },
    { en: "Shrawan", ne: "श्रावण" },
    { en: "Bhadra", ne: "भाद्र" },
    { en: "Ashwin", ne: "आश्विन" },
    { en: "Kartik", ne: "कार्तिक" },
    { en: "Mangsir", ne: "मंसिर" },
    { en: "Poush", ne: "पौष" },
    { en: "Magh", ne: "माघ" },
    { en: "Falgun", ne: "फाल्गुण" },
    { en: "Chaitra", ne: "चैत्र" }
  ];

  const weekDays = [
    { en: "Su", ne: "आ" },
    { en: "Mo", ne: "सो" },
    { en: "Tu", ne: "म" },
    { en: "We", ne: "बु" },
    { en: "Th", ne: "बि" },
    { en: "Fr", ne: "शु" },
    { en: "Sa", ne: "श" }
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
  };

  const formatNepaliDate = (nepaliDate) => {
    if (!nepaliDate) return "";
    const monthName = nepaliMonths[nepaliDate.getMonth()];
    return `${monthName.en} ${nepaliDate.getDate()}, ${nepaliDate.getYear()}`;
  };

  // Form validation
  const handleSubmit = async () => {
    if (!province || !district || !municipality || !ward) {
      alert(t("pleaseSelectLocation"));
      return;
    }
    if (!fieldName) {
      alert(t("pleaseEnterFieldName"));
      return;
    }
    if (!selectedDate) {
      alert(t("pleaseSelectDate"));
      return;
    }

    const bookingData = {
      location: {
        province,
        district,
        municipality,
        ward
      },
      fieldName,
      fieldSize,
      cropType,
      notes,
      collectionDate: selectedDate.toJsDate().toISOString(),
      nepaliDate: formatNepaliDate(selectedDate)
    };

    console.log("Booking Data:", bookingData);
    // TODO: Send to backend API
    alert(t("bookingSuccess"));
  };

  return (
    <>
      <div className="booking-page">
        {/* Animated Background */}
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>
        <div className="bg-decoration bg-decoration-3"></div>

        <div className="booking-container">
          {/* Header Section */}
          <div className="booking-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t("backToDashboard")}
            </button>
            
            <div className="header-content">
              <div className="header-badge">
                <span className="badge-icon">🧪</span>
                <span>{t("soilTesting")}</span>
              </div>
              <h1 className="header-title">{t("bookSoilTestingService")}</h1>
              <p className="header-subtitle">{t("bookingSoilTestSubtitle")}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="booking-content">
            {/* Form Section */}
            <div className="form-section">
              <div className="section-card">
                <div className="card-header">
                  <span className="card-icon">📍</span>
                  <h2 className="card-title">{t("locationDetails")}</h2>
                </div>
                
                {/* Province */}
                <div className="form-group">
                  <label className="form-label">{t("province")}</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="form-control"
                  >
                    <option value="">{t("selectProvince")}</option>
                    {locationData.provinces.map((p, i) => (
                      <option key={i} value={p.name}>{p.nameNe} ({p.name})</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="form-group">
                  <label className="form-label">{t("district")}</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="form-control"
                    disabled={!province}
                  >
                    <option value="">{t("selectDistrict")}</option>
                    {getDistricts().map((d, i) => (
                      <option key={i} value={d.name}>{d.nameNe} ({d.name})</option>
                    ))}
                  </select>
                </div>

                {/* Municipality */}
                <div className="form-group">
                  <label className="form-label">{t("municipality")}</label>
                  <select
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    className="form-control"
                    disabled={!district}
                  >
                    <option value="">{t("selectMunicipality")}</option>
                    {getMunicipalities().map((m, i) => (
                      <option key={i} value={m.name}>{m.nameNe}</option>
                    ))}
                  </select>
                </div>

                {/* Ward */}
                <div className="form-group">
                  <label className="form-label">{t("ward")}</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="form-control"
                    disabled={!municipality}
                  >
                    <option value="">{t("selectWard")}</option>
                    {getWards().map((w, i) => (
                      <option key={i} value={w}>{t("wardNo")} {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field Information */}
              <div className="section-card">
                <div className="card-header">
                  <span className="card-icon">🌾</span>
                  <h2 className="card-title">{t("fieldInformation")}</h2>
                </div>

                <div className="form-group">
                  <label className="form-label">{t("fieldName")}</label>
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder={t("fieldNamePlaceholder")}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t("fieldSize")}</label>
                    <input
                      type="text"
                      value={fieldSize}
                      onChange={(e) => setFieldSize(e.target.value)}
                      placeholder={t("fieldSizePlaceholder")}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("cropType")}</label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="form-control"
                    >
                      <option value="">{t("selectCropType")}</option>
                      <option value="rice">{t("rice")}</option>
                      <option value="wheat">{t("wheat")}</option>
                      <option value="maize">{t("maize")}</option>
                      <option value="vegetables">{t("vegetables")}</option>
                      <option value="fruits">{t("fruits")}</option>
                      <option value="other">{t("other")}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t("additionalNotes")}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("notesPlaceholder")}
                    className="form-control form-textarea"
                    rows="3"
                  />
                </div>
              </div>

              {/* Payment Info */}
              <div className="payment-card">
                <div className="payment-icon-wrapper">
                  <span className="payment-icon">💰</span>
                </div>
                <div className="payment-content">
                  <h3 className="payment-title">{t("cashOnDelivery")}</h3>
                  <p className="payment-desc">
                    {t("paymentOf")} <strong className="payment-amount">NPR 500</strong> {t("paymentCollectionNote")}
                  </p>
                  <div className="payment-features">
                    <span className="payment-feature">✓ {t("securePayment")}</span>
                    <span className="payment-feature">✓ {t("noAdvancePayment")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="calendar-section">
              <div className="calendar-card">
                <div className="card-header">
                  <span className="card-icon">📅</span>
                  <h2 className="card-title">{t("selectCollectionDate")}</h2>
                </div>

                <div className="nepali-calendar">
                  {/* Calendar Header */}
                  <div className="calendar-header">
                    <button className="calendar-nav" onClick={previousMonth}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="calendar-month-display">
                      <span className="calendar-month">{nepaliMonths[currentMonth.getMonth()].ne}</span>
                      <span className="calendar-year">{currentMonth.getYear()}</span>
                    </div>
                    <button className="calendar-nav" onClick={nextMonth}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  {/* Weekday Headers */}
                  <div className="calendar-weekdays">
                    {weekDays.map((day, i) => (
                      <div key={i} className="calendar-weekday">{day.ne}</div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
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
                      
                      const isPast = new NepaliDate(currentMonth.getYear(), currentMonth.getMonth(), day).toJsDate() < new Date(new Date().setHours(0,0,0,0));

                      return (
                        <button
                          key={day}
                          onClick={() => !isPast && selectDate(day)}
                          className={`calendar-day ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                          disabled={isPast}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Date Display */}
                {selectedDate && (
                  <div className="selected-date-box">
                    <div className="selected-date-label">{t("selectedDate")}</div>
                    <div className="selected-date-value">
                      {formatNepaliDate(selectedDate)}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button className="submit-btn" onClick={handleSubmit}>
                <span>{t("requestSoilTest")}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Help Card */}
              <div className="help-card">
                <div className="help-icon">💡</div>
                <div className="help-content">
                  <h4 className="help-title">{t("needHelp")}</h4>
                  <p className="help-text">{t("needHelpText")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .booking-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #f9fafb 100%);
          position: relative;
          overflow: hidden;
        }

        .bg-decoration {
          position: absolute;
          border-radius: 50%;
          opacity: 0.15;
          pointer-events: none;
        }

        .bg-decoration-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #16a34a 0%, transparent 70%);
          top: -300px;
          right: -200px;
          animation: float 20s ease-in-out infinite;
        }

        .bg-decoration-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #86efac 0%, transparent 70%);
          bottom: -150px;
          left: -100px;
          animation: float 15s ease-in-out infinite reverse;
        }

        .bg-decoration-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #dcfce7 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 10s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.25; }
        }

        .booking-container {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        /* Header */
        .booking-header {
          margin-bottom: 48px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1.5px solid #e5e7eb;
          color: #16a34a;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 32px;
        }

        .back-btn:hover {
          background: #f0fdf4;
          border-color: #16a34a;
          transform: translateX(-4px);
        }

        .header-content {
          text-align: center;
          animation: fadeInUp 0.6s ease-out;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          color: #16a34a;
          box-shadow: 0 2px 12px rgba(22, 163, 74, 0.15);
          margin-bottom: 20px;
        }

        .badge-icon {
          font-size: 18px;
        }

        .header-title {
          font-size: clamp(32px, 5vw, 42px);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 12px 0;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          font-size: 17px;
          color: #64748b;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Content Grid */
        .booking-content {
          display: grid;
          grid-template-columns: 1fr 450px;
          gap: 40px;
          align-items: start;
        }

        /* Form Section */
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .section-card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0fdf4;
        }

        .card-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 12px;
        }

        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-control {
          width: 100%;
          padding: 13px 16px;
          font-size: 15px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          background: #fafafa;
          color: #1f2937;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-control:hover {
          border-color: #16a34a;
          background: white;
        }

        .form-control:focus {
          border-color: #16a34a;
          background: white;
          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
        }

        .form-control:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Payment Card */
        .payment-card {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          gap: 20px;
          color: white;
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.3);
          position: relative;
          overflow: hidden;
        }

        .payment-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .payment-icon-wrapper {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .payment-icon {
          font-size: 28px;
        }

        .payment-content {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .payment-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .payment-desc {
          font-size: 14px;
          margin: 0 0 12px 0;
          opacity: 0.95;
          line-height: 1.5;
        }

        .payment-amount {
          font-size: 18px;
          font-weight: 800;
        }

        .payment-features {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .payment-feature {
          font-size: 13px;
          opacity: 0.9;
        }

        /* Calendar Section */
        .calendar-section {
          position: sticky;
          top: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .calendar-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }

        .nepali-calendar {
          margin-top: 24px;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
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
          background: #16a34a;
          color: white;
        }

        .calendar-month-display {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .calendar-month {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .calendar-year {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
        }

        .calendar-weekday {
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: #16a34a;
          padding: 10px 0;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .calendar-day {
          aspect-ratio: 1;
          border: none;
          background: #f9fafb;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .calendar-day:not(.empty):not(.past):hover {
          background: #f0fdf4;
          color: #16a34a;
          transform: scale(1.05);
        }

        .calendar-day.selected {
          background: #16a34a;
          color: white;
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
        }

        .calendar-day.empty {
          background: transparent;
          cursor: default;
        }

        .calendar-day.past {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .selected-date-box {
          margin-top: 20px;
          padding: 16px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 12px;
          text-align: center;
        }

        .selected-date-label {
          font-size: 11px;
          font-weight: 700;
          color: #16a34a;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .selected-date-value {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(22, 163, 74, 0.3);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.4);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        /* Help Card */
        .help-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 1.5px dashed #e5e7eb;
          border-radius: 16px;
        }

        .help-icon {
          font-size: 28px;
          flex-shrink: 0;
        }

        .help-content {
          flex: 1;
        }

        .help-title {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 6px 0;
        }

        .help-text {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .booking-content {
            grid-template-columns: 1fr;
          }

          .calendar-section {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .booking-container {
            padding: 24px 16px 60px;
          }

          .section-card {
            padding: 24px 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .header-title {
            font-size: 28px;
          }
        }
      `}</style>
    </>
  );
};

export default BookSoilTest;