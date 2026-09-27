import { useState, useEffect, useContext, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip
} from 'recharts';
import { LuSearch, LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import { AppContext } from '../Context/appContext';
import { getAssetColor } from '../utils/assetColors';
import { formatChange } from '../utils/formatChange';
import API from '../Api/axios';

// Skeleton Loading Components
const MarketOverviewSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-[#202020] p-3 sm:p-4 rounded-xl border border-[#2a2a2a] animate-pulse flex flex-col gap-2">
        <div className="h-3 bg-[#2a2a2a] rounded w-16 sm:w-20"></div>
        <div className="h-5 sm:h-6 bg-[#2a2a2a] rounded w-20 sm:w-28"></div>
        <div className="h-4 bg-[#2a2a2a] rounded w-12 sm:w-16"></div>
      </div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="w-full h-full flex flex-col justify-between py-4 animate-pulse">
    <div className="h-4 bg-[#2a2a2a] rounded w-1/3"></div>
    <div className="h-48 bg-[#2a2a2a] rounded-lg w-full my-auto"></div>
    <div className="flex justify-between">
      <div className="h-3 bg-[#2a2a2a] rounded w-12"></div>
      <div className="h-3 bg-[#2a2a2a] rounded w-12"></div>
      <div className="h-3 bg-[#2a2a2a] rounded w-12"></div>
    </div>
  </div>
);

const PortfolioPieSkeleton = () => (
  <div className="w-full h-full flex items-center justify-center animate-pulse">
    <div className="w-48 h-48 rounded-full border-[18px] border-[#2a2a2a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-5 bg-[#2a2a2a] rounded w-20"></div>
        <div className="h-3 bg-[#2a2a2a] rounded w-14"></div>
      </div>
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="w-full animate-pulse p-4 flex flex-col gap-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#2a2a2a]"></div>
          <div className="h-4 bg-[#2a2a2a] rounded w-16"></div>
        </div>
        <div className="h-4 bg-[#2a2a2a] rounded w-20"></div>
        <div className="h-4 bg-[#2a2a2a] rounded w-20"></div>
        <div className="h-4 bg-[#2a2a2a] rounded w-16"></div>
        <div className="h-4 bg-[#2a2a2a] rounded w-20"></div>
        <div className="h-4 bg-[#2a2a2a] rounded w-12"></div>
      </div>
    ))}
  </div>
);

// Pie Chart Tooltip
const CustomToolTip = ({ active, payload, total }) => {
  if (active && payload?.length) {
    const crypto = payload[0];
    return (
      <div className='bg-[#3a3a3a] p-2 rounded-lg shadow-lg'>
        <p className='font-semibold text-white'>{crypto.name}</p>
        <p className='text-white font-medium'>
          ${crypto.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className='text-sm text-gray-300'>
          {total ? ((crypto.value / total) * 100).toFixed(2) : 0}% of portfolio
        </p>
      </div>
    );
  }
  return null;
};

// Line Chart Tooltip
const CustomToolTipLine = ({ active, payload }) => {
  if (active && payload?.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-[#3a3a3a] p-2 rounded-lg shadow-lg">
        <p className="font-semibold text-white">
          {data.month}
        </p>
        <p className="text-white">
          ${Number(data.value).toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

export default function CryptoDashboard() {
  const { isLoggedIn, userData, BackendUrl } = useContext(AppContext);

  const [chartData, setChartData] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMarketDataLoading, setIsMarketDataLoading] = useState(true);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [snapshotData, setSnapshotData] = useState([]);

  // Fetch portfolio data from backend (only when logged in)
  const fetchCryptoData = async () => {
    if (!isLoggedIn || !userData) {
      setPortfolioData([]);
      setTotal(0);
      setSnapshotData([]);
      setIsMarketDataLoading(false);
      setIsPortfolioLoading(false);
      return;
    }

    setIsMarketDataLoading(true);
    setIsPortfolioLoading(true);

    try {
      const { data: portfolioJson } = await API.get('/api/crypto/trades');

      const portfolioItems = (portfolioJson.portfolio || [])
        .filter((item) => item.amount > 0)
        .slice(0, 20);

      setSnapshotData(portfolioJson.cryptoSnapshots || []);

      if (portfolioItems.length === 0) {
        setPortfolioData([]);
        setTotal(0);
        return;
      }

      const symbols = portfolioItems.map((item) => item.asset);

      const { data: priceJson } = await API.post('/api/crypto/coingecko', { symbols });

      setChartData(
        (priceJson.market || []).map((coin) => ({
          name: coin.name,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
        }))
      );

      if (!priceJson.success) {
        throw new Error(priceJson.message || "Failed to fetch prices");
      }

      const pricesData = priceJson.prices || {};

      const processedPortfolio = portfolioItems
        .map((item) => {
          const symbol = item.asset.toUpperCase();
          const priceData = pricesData[symbol] || {};
          const price = priceData.usd || 0;
          const change24h = priceData.usd_24h_change || 0;
          const value = price * Math.abs(item.amount);

          return {
            symbol, name: item.asset, amount: item.amount,
            price, change24h, value, tradeCount: item.tradeCount,
          };
        })
        .sort((a, b) => b.value - a.value);

      setPortfolioData(processedPortfolio);
      setTotal(processedPortfolio.reduce((sum, item) => sum + item.value, 0));
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setPortfolioData([]);
      setTotal(0);
      setSnapshotData([]);
    } finally {
      setIsPortfolioLoading(false);
      setIsMarketDataLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setIsMarketDataLoading(false);
      setIsPortfolioLoading(false);
      return;
    }

    fetchCryptoData();

    const id = setInterval(fetchCryptoData, 60000);

    return () => clearInterval(id);
  }, [isLoggedIn]);

  const displayData = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return searchQuery
      ? portfolioData.filter(
        c =>
          c.symbol.toLowerCase().includes(query) ||
          c.name.toLowerCase().includes(query)
      )
      : portfolioData;
  }, [portfolioData, searchQuery]);

  return (
    <div className='flex flex-col'>
      <div className='min-h-screen bg-[#0d0d0d] text-white flex flex-col p-4 sm:p-6 gap-6 sm:gap-8 pt-10'>
        {/* Market Overview Card */}
        <div className='bg-[#181818] p-4 sm:p-6 rounded-2xl shadow-lg border border-[#262626] transition-colors duration-200 hover:border-gray-700 min-h-[148px] flex flex-col justify-between w-full'>
          <h2 className='text-lg font-bold text-white tracking-wide'>Market Overview</h2>
          {isMarketDataLoading ? (
            <MarketOverviewSkeleton />
          ) : chartData.length === 0 ? (
            <div className="text-center text-gray-400 py-6">No market data available</div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-gray-300 pt-3'>
              {chartData.map((c, i) => (
                <div key={i} className='bg-[#202020] p-3 sm:p-4 rounded-xl border border-[#2a2a2a] flex flex-col justify-between gap-1.5 overflow-hidden'>
                  <p className='text-[10px] sm:text-xs uppercase font-semibold text-gray-400 tracking-wider truncate'>
                    {c.name}
                  </p>
                  <p className='text-base sm:text-xl font-bold text-white truncate'>
                    ${c.price < 1 ? c.price.toFixed(6) : c.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: c.price < 1 ? 6 : 2
                    })}
                  </p>
                  <div
                    className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium w-max ${c.change24h > 0
                        ? 'bg-green-900/30 text-green-400'
                        : c.change24h < 0
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-gray-900/30 text-gray-400'
                      }`}
                  >
                    {c.change24h > 0 ? (
                      <LuTrendingUp size={12} className="sm:w-3.5 sm:h-3.5" />
                    ) : c.change24h < 0 ? (
                      <LuTrendingDown size={12} className="sm:w-3.5 sm:h-3.5" />
                    ) : null}
                    {formatChange(c.change24h)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Two columns: trend & portfolio */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
          {/* Crypto Trend */}
          <div className='bg-[#181818] p-4 sm:p-6 rounded-2xl shadow-lg border border-[#262626]'>
            <h2 className='text-lg sm:text-xl font-semibold mb-4 text-white'>Crypto Asset Trend</h2>
            <div className='w-full h-[250px] sm:h-[280px]'>
              {isMarketDataLoading ? (
                <ChartSkeleton />
              ) : snapshotData.length === 0 ? (
                <div className='flex justify-center items-center h-full text-gray-400'>
                  No market data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={snapshotData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="#aaa" interval={0} tick={{ fontSize: 10, sm: 12 }} padding={{ left: 10, right: 10 }} />
                    <YAxis stroke="#aaa" tick={{ fontSize: 10, sm: 12 }} width={45} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomToolTipLine />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2285c3"
                      strokeWidth={3}
                      dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Portfolio Distribution */}
          <div className='bg-[#181818] p-4 sm:p-6 rounded-2xl shadow-lg border border-[#262626] flex flex-col'>
            <h2 className='text-lg sm:text-xl font-semibold mb-4 text-white'>Portfolio Distribution</h2>
            <div className='relative w-full h-[250px] sm:h-[280px]'>
              {!isLoggedIn ? (
                <div className='flex flex-col justify-center items-center h-full text-gray-400'>
                  <p className='mb-2'>Please log in to view your portfolio</p>
                </div>
              ) : isPortfolioLoading ? (
                <PortfolioPieSkeleton />
              ) : displayData.length === 0 ? (
                <div className='flex flex-col justify-center items-center h-full text-gray-400'>
                  <p className='mb-2'>No portfolio data available</p>
                  <p className='text-sm'>Connect your wallet or add assets</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 10, bottom: 10 }}>
                    <Pie
                      data={displayData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      dataKey="value"
                      label={({ percent, symbol }) =>
                        percent > 0.05 ? symbol : ""
                      }
                      labelLine={false}
                      stroke="none"
                    >
                      {displayData.map((entry, i) => (
                        <Cell key={i} fill={getAssetColor(entry.symbol)} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomToolTip total={total} />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {snapshotData.length > 0 && !isPortfolioLoading && (
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-32 px-2'>
                  <div className='text-white text-lg sm:text-2xl font-semibold truncate'>
                    ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className='text-xs sm:text-sm text-gray-400 mt-1 truncate'>Total Value</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Table */}
        {isLoggedIn && (
          <div className="w-full">
            <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3'>
              <h1 className='text-white font-semibold text-lg sm:text-xl'>Your Assets</h1>
              <div className='flex items-center gap-3 bg-[#181818] p-2 rounded-md w-full sm:w-1/4 border border-[#262626]'>
                <LuSearch size={18} className='text-white' />
                <input
                  type='text'
                  placeholder='Search Assets'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  spellCheck={false}
                  className='bg-transparent text-white text-sm w-full focus:outline-none placeholder-gray-400'
                />
              </div>
            </div>

            <div className='rounded-2xl overflow-hidden bg-[#181818] border border-[#262626] mt-4 mb-12 overflow-x-auto'>
              {isPortfolioLoading ? (
                <TableSkeleton />
              ) : displayData.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No assets found. Add crypto assets to your portfolio.
                </div>
              ) : (
                <table className='w-full min-w-[700px]'>
                  <thead className='text-xs sm:text-sm font-medium text-[#ababab] bg-[#1f1f1f]'>
                    <tr>
                      <th className='pl-6 py-2.5 px-4 text-left font-mono uppercase tracking-wide select-none'>Asset</th>
                      <th className='py-2.5 px-4 text-right font-mono uppercase tracking-wide select-none'>Amount</th>
                      <th className='py-2.5 px-4 text-right font-mono uppercase tracking-wide select-none'>Price</th>
                      <th className='py-2.5 px-4 text-right font-mono uppercase tracking-wide select-none'>24h Change</th>
                      <th className='py-2.5 px-4 text-right font-mono uppercase tracking-wide select-none'>Value</th>
                      <th className='pr-5 py-2.5 px-4 text-right font-mono uppercase tracking-wide select-none'>% of Portfolio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((row) => (
                      <tr key={row.symbol} className='text-xs sm:text-sm text-white border-b border-[#2a2a2a] last:border-b-0 hover:bg-[#202020]'>
                        <td className='py-2.5 pl-6 px-4 select-none flex items-center gap-3'>
                          <div className='rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0' style={{ background: getAssetColor(row.symbol) }}></div>
                          <span className="truncate">{row.symbol}</span>
                        </td>
                        <td className='py-3 px-4 text-right select-none'>
                          {row.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </td>
                        <td className='py-3 px-4 text-right select-none'>
                          ${row.price < 1 ? row.price.toFixed(6) : row.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: row.price < 1 ? 6 : 2
                          })}
                        </td>
                        <td className='py-3 px-4 text-right select-none'>
                          <span className={`font-medium ${row.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {row.change24h >= 0 ? '+' : ''}{row.change24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className='py-3 px-4 text-right select-none'>
                          ${row.value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                        <td className='py-3 px-4 pr-5 text-right select-none'>
                          {total ? ((row.value / total) * 100).toFixed(2) : '0.00'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}