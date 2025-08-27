import { useEffect, useState } from "react";

// Correct conversion: How many of each unit equals 1 troy ounce
const unitMultipliers = {
  toz: 1, // base unit (1 troy ounce = 1 troy ounce)
  g: 31.1035, // 1 troy ounce = 31.1035 grams
  kg: 0.0311035, // 1 troy ounce = 0.0311035 kg
  lb: 0.06857, // 1 troy ounce = 0.06857 pounds
};

const PreviousPrices = () => {
  const [history, setHistory] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [unit, setUnit] = useState("g");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 5);
        const startDateStr = startDate.toISOString().split("T")[0];

        const url = new URL("https://api.metals.dev/v1/timeseries");
        url.searchParams.append("api_key", "NNLHMKZDD28H8TTAITNM906TAITNM");
        url.searchParams.append("start_date", startDateStr);
        url.searchParams.append("end_date", endDate);
        url.searchParams.append("metals", "gold,silver,platinum");

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setHistory(data);

        // Check if the response has the expected structure
        if (!data.rates) {
          setError("Unexpected API response structure");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchHistory();
  }, []);

  const convertPrice = (metalPrice, currencyRate, unit) => {
    if (!metalPrice || !currencyRate) return null;

    const actualRate = currency === "USD" ? currencyRate : 1 / currencyRate;
    const currencyPerToz = metalPrice * actualRate;

    const pricePerUnit = currencyPerToz / unitMultipliers[unit];


    return pricePerUnit;
  };

  // Helper function to get currency rate safely
  const getCurrencyRate = (dayData, targetCurrency) => {
    if (!dayData.currencies || !dayData.currencies[targetCurrency]) {
      console.warn(`Currency ${targetCurrency} not found in data:`, dayData);
      return null;
    }
    return dayData.currencies[targetCurrency];
  };

  // Mock data for demonstration if API fails
  const mockData = {
    rates: {
      "2024-01-20": {
        currencies: {
          INR: 83.15,
          USD: 1,
          EUR: 0.92,
          GBP: 0.79,
        },
        metals: {
          gold: 2025.5,
          silver: 25.75,
          platinum: 1015.3,
        },
      },
      "2024-01-19": {
        currencies: {
          INR: 83.2,
          USD: 1,
          EUR: 0.92,
          GBP: 0.79,
        },
        metals: {
          gold: 2020.25,
          silver: 25.5,
          platinum: 1010.75,
        },
      },
    },
  };

  const dataToUse = history || (error ? mockData : null);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-4 max-w-4xl mx-auto ">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Previous 5 Days Prices ({currency} / {unit})
        </h2>


        {/* Dropdowns */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Currency Dropdown */}
          {dataToUse &&
            dataToUse.rates &&
            Object.keys(dataToUse.rates).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.keys(
                    dataToUse.rates[Object.keys(dataToUse.rates)[0]]
                      .currencies || {}
                  ).map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>
            )}

          {/* Unit Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="toz">Troy Ounce</option>
              <option value="g">Gram</option>
              <option value="kg">Kilogram</option>
              <option value="lb">Pound</option>
            </select>
          </div>
        </div>

        {/* Price Cards */}
        {dataToUse && dataToUse.rates ? (
          <div className="space-y-4">
            {Object.entries(dataToUse.rates)
              .sort(([a], [b]) => new Date(b) - new Date(a)) // Sort by date, newest first
              .map(([date, dayData]) => {
                const currencyRate = getCurrencyRate(dayData, currency);

                if (!currencyRate) {
                  return (
                    <div
                      key={date}
                      className="p-4 border border-red-200 rounded-lg bg-red-50"
                    >
                      <h3 className="font-semibold text-red-800 mb-2">
                        {new Date(date).toLocaleDateString()}
                      </h3>
                      <p className="text-red-600">
                        Currency rate not available for {currency}
                      </p>
                      <p className="text-xs text-red-500 mt-1">
                        Available currencies:{" "}
                        {Object.keys(dayData.currencies || {}).join(", ")}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={date}
                    className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </h3>
                      <span className="text-sm text-gray-500">
                        1 USD ={" "}
                        {currency === "USD"
                          ? "1.0000"
                          : (1 / currencyRate).toFixed(4)}{" "}
                        {currency}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Gold */}
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                            <span className="font-medium text-gray-800">
                              Gold
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {dayData.metals?.gold
                                ? convertPrice(
                                    dayData.metals.gold,
                                    currencyRate,
                                    unit
                                  )?.toFixed(unit === "toz" ? 0 : 2)
                                : "N/A"}
                            </div>
                            <div className="text-xs text-gray-600">
                              {currency}/{unit}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Silver */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                            <span className="font-medium text-gray-800">
                              Silver
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {dayData.metals?.silver
                                ? convertPrice(
                                    dayData.metals.silver,
                                    currencyRate,
                                    unit
                                  )?.toFixed(unit === "toz" ? 0 : 2)
                                : "N/A"}
                            </div>
                            <div className="text-xs text-gray-600">
                              {currency}/{unit}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Platinum */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                            <span className="font-medium text-gray-800">
                              Platinum
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {dayData.metals?.platinum
                                ? convertPrice(
                                    dayData.metals.platinum,
                                    currencyRate,
                                    unit
                                  )?.toFixed(unit === "toz" ? 0 : 2)
                                : "N/A"}
                            </div>
                            <div className="text-xs text-gray-600">
                              {currency}/{unit}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Raw data for debugging */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer hover:text-gray-700">
                          Raw data
                        </summary>
                        <div className="mt-1 font-mono">
                          Gold: ${dayData.metals?.gold} | Silver: $
                          {dayData.metals?.silver} | Platinum: $
                          {dayData.metals?.platinum} | Raw Rate: {currencyRate}{" "}
                          | Actual Rate:{" "}
                          {currency === "USD"
                            ? "1.0000"
                            : (1 / currencyRate).toFixed(4)}{" "}
                          {currency}/USD
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Loading historical data...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousPrices;
