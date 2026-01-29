import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-sans text-center">
        {t("welcome")}
      </h1>
      <p className="text-lg md:text-xl text-gray-600 text-center max-w-xl">
        {/* {t("homeDescription")} */}
      </p>

      {/* Optional: Add a call-to-action button */}
      <button className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
        {t("getStarted")}
      </button>
    </div>
  );
};

export default Home;
