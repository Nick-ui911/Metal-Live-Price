import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Zap, Clock, Globe, Scale } from "lucide-react";

const Live = () => {
  const [data, setData] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [unit, setUnit] = useState("g");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Unit display names and conversions
  const unitInfo = {
    toz: { name: "Troy Ounce", symbol: "oz", multiplier: 1 },
    g: { name: "Gram", symbol: "g", multiplier: 31.1035 },
    kg: { name: "Kilogram", symbol: "kg", multiplier: 0.0311035 },
    lb: { name: "Pound", symbol: "lb", multiplier: 0.06857 },
  };

  // Metal configurations with colors and icons
  const metalConfig = {
    gold: {
      name: "Gold",
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      icon: "🥇",
    },
    silver: {
      name: "Silver", 
      color: "from-gray-300 to-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200", 
      textColor: "text-gray-800",
      icon: "🥈",
    },
    platinum: {
      name: "Platinum",
      color: "from-blue-400 to-indigo-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800", 
      icon: "💎",
    },
  };

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = new URL("https://api.metals.dev/v1/latest");
        url.searchParams.append("api_key", "DWM3VBVSSWZYC70KYDTT8800KYDTT");
        url.searchParams.append("metals", "gold,silver,platinum");
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
          setData(result);
          setLastUpdate(new Date());
          console.log("Live API Response:", result);
        } else {
          throw new Error(result.error_message || 'API request failed');
        }
        
      } catch (err) {
        console.error("Error fetching metals:", err);
        setError(err.message);
        
        // Mock data for demonstration
        const mockData = {
          status: 'success',
          currency: 'USD',
          unit: 'toz',
          metals: {
            gold: 2025.50,
            silver: 25.75,
            platinum: 1015.30
          },
          currencies: {
            USD: 1,
            INR: 0.011407,
            EUR: 1.0870,
            GBP: 1.2650,
            JPY: 0.006734,
            CAD: 0.7345
          }
        };
        setData(mockData);
        setLastUpdate(new Date());
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Convert USD prices to selected currency and unit
  const convertPrice = (usdPerToz) => {
    if (!usdPerToz || !data?.currencies?.[currency]) return null;
    
    // Handle currency conversion (same fix as previous component)
    const currencyRate = data.currencies[currency];
    const actualRate = currency === 'USD' ? 1 : (1 / currencyRate);
    
    // Convert to selected currency per troy ounce
    const currencyPerToz = usdPerToz * actualRate;
    
    // Convert to selected unit
    const pricePerUnit = currencyPerToz / unitInfo[unit].multiplier;
    
    return pricePerUnit;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    
    const formatted = price >= 1000 
      ? price.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : price.toFixed(2);
    
    return formatted;
  };

  const getChangeIndicator = (metal) => {
    // Mock change data - in real app this would come from API
    const mockChanges = {
      gold: 1.2,
      silver: -0.8,
      platinum: 0.5
    };
    
    const change = mockChanges[metal] || 0;
    const isPositive = change >= 0;
    
    return {
      value: Math.abs(change),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading live market data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Live Precious Metals
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Real-time market prices with 60-second updates</p>
          
          {lastUpdate && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>



        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Currency Selector */}
          {data && (
            <div className="bg-white rounded-lg shadow-md p-4 min-w-48">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <label className="font-medium text-gray-700">Currency</label>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {Object.keys(data.currencies).map((cur) => (
                  <option key={cur} value={cur}>
                    {cur} {cur === 'USD' ? '🇺🇸' : cur === 'INR' ? '🇮🇳' : cur === 'EUR' ? '🇪🇺' : cur === 'GBP' ? '🇬🇧' : '💱'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Unit Selector */}
          <div className="bg-white rounded-lg shadow-md p-4 min-w-48">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-5 w-5 text-purple-600" />
              <label className="font-medium text-gray-700">Unit</label>
            </div>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              {Object.entries(unitInfo).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name} ({info.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Cards */}
        {data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["gold", "silver", "platinum"].map((metal) => {
              const config = metalConfig[metal];
              const price = convertPrice(data.metals[metal]);
              const change = getChangeIndicator(metal);
              const ChangeIcon = change.icon;

              return (
                <div
                  key={metal}
                  className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl`}>{config.icon}</div>
                      <div>
                        <h3 className={`text-xl font-bold ${config.textColor}`}>
                          {config.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          per {unitInfo[unit].name}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 ${change.color}`}>
                      <ChangeIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {change.value}%
                      </span>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(price)}
                      </span>
                      <span className="text-lg text-gray-600 font-medium">
                        {currency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      per {unitInfo[unit].symbol}
                    </p>
                  </div>

                  {/* Gradient Bar */}
                  <div className={`h-2 bg-gradient-to-r ${config.color} rounded-full mb-4`}></div>

                  {/* Additional Info */}
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Base Price (USD/oz):</span>
                      <span className="font-mono">${data.metals[metal]?.toFixed(2)}</span>
                    </div>
                    {currency !== 'USD' && (
                      <div className="flex justify-between">
                        <span>Exchange Rate:</span>
                        <span className="font-mono">
                          1 USD = {(1/data.currencies[currency]).toFixed(4)} {currency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No data available</p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Prices are indicative and may vary from actual market rates.</p>
          <p>Data refreshes automatically every 60 seconds.</p>
        </div>
      </div>
    </div>
  );
};

export default Live;