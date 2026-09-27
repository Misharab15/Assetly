import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../Context/appContext';
import ExportTransactionsModal from '../components/ExportTransactionsModal';
import { LuSearch, LuRefreshCw, LuInfo, LuDownload } from "react-icons/lu";
import { toast } from 'react-toastify';

const PLATFORM_COLORS = {
  "Binance": "#F3BA2F",
  "KuCoin": "#24AE8F",
  "Coinbase": "#0052FF",
  "OANDA": "#00214A",
  "PaperInvest": "#d6ff35",
  "Interactive Brokers": "#FF4500",
  "MetaTrader": "#0078D7",
  "binance": "#F3BA2F",
  "kucoin": "#24AE8F",
  "coinbase": "#0052FF",
  "Ethereum Wallet": "#627EEA",
  "oanda": "#00214A",
  "metatrader": "#0078D7"
};

// Skeleton Loader Component
function TransactionsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#181818] p-4 rounded-lg">
            <div className="h-3 w-24 bg-[#2a2a2a] rounded mb-3"></div>
            <div className="h-7 w-20 bg-[#2a2a2a] rounded"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl overflow-hidden bg-[#181818] border border-[#2a2a2a]">
        <table className="w-full">
          <thead className="bg-[#1f1f1f]">
            <tr>
              <th className="py-3 px-4 text-left"><div className="h-3 w-20 bg-[#2a2a2a] rounded"></div></th>
              <th className="py-3 px-4 text-right"><div className="h-3 w-16 bg-[#2a2a2a] rounded ml-auto"></div></th>
              <th className="py-3 px-4 text-right"><div className="h-3 w-16 bg-[#2a2a2a] rounded ml-auto"></div></th>
              <th className="py-3 px-4 text-right"><div className="h-3 w-20 bg-[#2a2a2a] rounded ml-auto"></div></th>
              <th className="py-3 px-4 text-right"><div className="h-3 w-24 bg-[#2a2a2a] rounded ml-auto"></div></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <tr key={item} className="border-b border-[#2a2a2a] last:border-b-0">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#2a2a2a]"></div>
                    <div className="h-4 w-24 bg-[#2a2a2a] rounded"></div>
                  </div>
                </td>
                <td className="py-3.5 px-4"><div className="h-4 w-20 bg-[#2a2a2a] rounded ml-auto"></div></td>
                <td className="py-3.5 px-4"><div className="h-4 w-16 bg-[#2a2a2a] rounded ml-auto"></div></td>
                <td className="py-3.5 px-4"><div className="h-4 w-20 bg-[#2a2a2a] rounded ml-auto"></div></td>
                <td className="py-3.5 px-4"><div className="h-4 w-24 bg-[#2a2a2a] rounded ml-auto"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Transactions = () => {
  const {
    transactions,
    transactionsLoading,
    refreshTransactions,
    fetchTransactions,
    transactionPagination
  } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDates, setSelectedDates] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState("");
  const [selectedTypes, setSelectedTypes] = useState("");
  const [selectedAssetClass, setSelectedAssetClass] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // 1️⃣ AUTO-FETCH ON MOUNT (Fixes manual click issue)
  useEffect(() => {
    if ((!transactions || transactions.length === 0) && fetchTransactions) {
      fetchTransactions(1);
    }
  }, []);

  // 2️⃣ Check cache age on mount and when transactions update
  useEffect(() => {
    const checkCacheAge = () => {
      const lastFetchTime = sessionStorage.getItem('last_fetch_time');
      const initialFetchDone = sessionStorage.getItem('initial_fetch_done') === 'true';

      if (lastFetchTime && initialFetchDone) {
        const ageInSeconds = Math.floor((Date.now() - parseInt(lastFetchTime)) / 1000);

        if (ageInSeconds < 60) {
          setCacheInfo(`Updated ${ageInSeconds} seconds ago`);
        } else if (ageInSeconds < 3600) {
          const minutes = Math.floor(ageInSeconds / 60);
          setCacheInfo(`Updated ${minutes} minute${minutes > 1 ? 's' : ''} ago`);
        } else {
          const hours = Math.floor(ageInSeconds / 3600);
          setCacheInfo(`Updated ${hours} hour${hours > 1 ? 's' : ''} ago`);
        }
      } else if (transactions && transactions.length > 0) {
        setCacheInfo('Loaded from session');
      } else {
        setCacheInfo(null);
      }
    };

    checkCacheAge();
    const interval = setInterval(checkCacheAge, 60000);
    return () => clearInterval(interval);
  }, [transactions?.length]);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTransactions();
    setRefreshing(false);

    const lastFetchTime = Date.now().toString();
    sessionStorage.setItem('last_fetch_time', lastFetchTime);
    setCacheInfo('Just updated');

    toast.success("Transactions refreshed!");
  };

  const getUniqueAccounts = () => {
    if (!transactions || transactions.length === 0) return [];
    const accounts = [...new Set(transactions.map(tx =>
      tx.platform.charAt(0).toUpperCase() + tx.platform.slice(1)
    ))];
    return accounts.sort();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));

    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const formatQuantity = (quantity, assetClass) => {
    const num = Number(quantity);
    if (assetClass?.toLowerCase() === 'stock' || assetClass?.toLowerCase() === 'forex') {
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    return num.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 });
  };

  const filteredData = transactions?.filter((row) => {
    const matchesSearch =
      row.platform?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.entity?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAccount =
      !selectedAccounts ||
      row.platform?.charAt(0).toUpperCase() + row.platform?.slice(1) === selectedAccounts;

    const matchesType = !selectedTypes ||
      (selectedTypes === "Incoming" && Number(row.amount) >= 0) ||
      (selectedTypes === "Outgoing" && Number(row.amount) < 0);

    const matchesAssetClass = !selectedAssetClass ||
      row.asset_class?.toLowerCase() === selectedAssetClass.toLowerCase();

    let matchesDate = true;
    if (selectedDates && row.transaction_date) {
      const txDate = new Date(row.transaction_date);
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      switch (selectedDates) {
        case "today":
          matchesDate = txDate.toDateString() === today.toDateString();
          break;
        case "this-week":
          matchesDate = txDate >= startOfWeek;
          break;
        case "this-month":
          matchesDate = txDate >= startOfMonth;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesAccount && matchesType && matchesDate && matchesAssetClass;
  }) || [];

  const filteredTotal = filteredData.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const handlePageChange = async (newPage) => {
    if (
      newPage < 1 ||
      newPage > transactionPagination.totalPages ||
      transactionsLoading
    ) {
      return;
    }
    await fetchTransactions(newPage, true);
  };

  return (
    <div className="mx-full max-w-6xl px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-12 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className='text-white font-semibold text-xl'>Transactions</h1>
          {cacheInfo && (
            <div className="flex items-center gap-1 text-xs text-[#ababab] bg-[#181818] px-2 py-1 rounded-md whitespace-nowrap">
              <LuInfo size={12} />
              <span>{cacheInfo}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#2285c3] text-white px-3 py-2 rounded-md hover:bg-[#1a6b9c] transition-colors cursor-pointer"
          >
            <LuDownload size={17} />
            <span>Export</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className='shrink-0 bg-[#181818] p-2 rounded-md hover:bg-[#222] transition-colors cursor-pointer'
          >
            <LuRefreshCw
              size={20}
              className={`text-white ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Filter Toolbar: 2x2 Grid on mobile, inline flex row on desktop */}
      <div className='flex flex-col sm:flex-row gap-4 items-center justify-between mb-7'>
        <div className='flex items-center gap-3 bg-[#181818] p-2 rounded-md w-full sm:w-1/3'>
          <LuSearch size={20} className='text-white shrink-0' />
          <input
            type='text'
            placeholder='Search by account or asset...'
            value={searchQuery}
            onChange={handleSearch}
            className='bg-transparent text-white w-full focus:outline-none min-w-0'
          />
        </div>

        <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-3 w-full sm:w-auto'>
          <select
            value={selectedAssetClass}
            onChange={(e) => setSelectedAssetClass(e.target.value)}
            className='bg-[#181818] text-sm text-[#ababab] p-2 rounded-md focus:outline-none border-none hover:bg-[#111] cursor-pointer w-full sm:w-auto'
          >
            <option value="">All Asset Classes</option>
            <option value="crypto">Crypto</option>
            <option value="stock">Stocks</option>
            <option value="forex">Forex</option>
          </select>

          <select
            value={selectedDates}
            onChange={(e) => setSelectedDates(e.target.value)}
            className='bg-[#181818] text-sm text-[#ababab] p-2 rounded-md focus:outline-none border-none hover:bg-[#111] cursor-pointer w-full sm:w-auto'
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
          </select>

          <select
            value={selectedAccounts}
            onChange={(e) => setSelectedAccounts(e.target.value)}
            className='bg-[#181818] text-sm text-[#ababab] p-2 rounded-md focus:outline-none border-none hover:bg-[#111] cursor-pointer w-full sm:w-auto'
          >
            <option value="">All Accounts</option>
            {getUniqueAccounts().map(account => (
              <option key={account} value={account}>{account}</option>
            ))}
          </select>

          <select
            value={selectedTypes}
            onChange={(e) => setSelectedTypes(e.target.value)}
            className='bg-[#181818] text-sm text-[#ababab] p-2 rounded-md focus:outline-none border-none hover:bg-[#111] cursor-pointer w-full sm:w-auto'
          >
            <option value="">All Types</option>
            <option value="Incoming">Incoming (Buy)</option>
            <option value="Outgoing">Outgoing (Sell)</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(searchQuery || selectedDates || selectedAccounts || selectedTypes || selectedAssetClass) && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedDates("");
              setSelectedAccounts("");
              setSelectedTypes("");
              setSelectedAssetClass("");
            }}
            className="text-sm text-[#ababab] hover:text-white transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* 3️⃣ SKELETON LOADER VS MAIN CONTENT */}
      {transactionsLoading ? (
        <TransactionsSkeleton />
      ) : (
        <>
          {/* Summary Stats */}
          {transactions && transactions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#1f1f1f] min-w-0">
                <p className="text-[#ababab] text-sm truncate">Total Transactions</p>
                <p className="text-white text-lg sm:text-2xl font-bold truncate">{transactionPagination.total}</p>
                {filteredData.length !== transactions.length && (
                  <p className="text-xs text-[#ababab] mt-1 truncate">
                    of {transactions.length} total
                  </p>
                )}
              </div>
              <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#1f1f1f] min-w-0">
                <p className="text-[#ababab] text-sm truncate">Filtered Value</p>
                <p className={`text-lg sm:text-2xl font-bold truncate ${filteredTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatAmount(filteredTotal)}
                </p>
              </div>
              <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#1f1f1f] min-w-0">
                <p className="text-[#ababab] text-sm truncate">Unique Assets</p>
                <p className="text-white text-lg sm:text-2xl font-bold truncate">
                  {new Set(filteredData.map(tx => tx.entity)).size}
                </p>
              </div>
              <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#1f1f1f] min-w-0">
                <p className="text-[#ababab] text-sm truncate">Platforms</p>
                <p className="text-white text-lg sm:text-2xl font-bold truncate">
                  {new Set(filteredData.map(tx => tx.platform)).size}
                </p>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className='rounded-2xl overflow-hidden bg-[#181818] mt-6 mb-12 overflow-x-auto'>
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#ababab]">
                  {transactions.length === 0
                    ? "No transactions found. Click refresh to fetch your transaction history."
                    : "No transactions match your filters"}
                </p>
                {transactions.length === 0 && (
                  <button
                    onClick={handleRefresh}
                    className="mt-4 text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    Fetch Transactions
                  </button>
                )}
              </div>
            ) : (
              <table className='w-full'>
                <thead className='text-sm text-[#ababab] bg-[#1f1f1f] sticky top-0'>
                  <tr>
                    <th className='pl-10 py-2.5 text-left whitespace-nowrap'>Account</th>
                    <th className='py-2.5 text-right whitespace-nowrap'>Date</th>
                    <th className='py-2.5 text-right whitespace-nowrap'>Asset</th>
                    <th className='pr-5 py-2.5 text-right whitespace-nowrap'>Quantity</th>
                    <th className='pr-5 py-2.5 text-right whitespace-nowrap'>Amount (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={index} className='text-sm text-white border-b border-[#2a2a2a] last:border-b-0 hover:bg-[#202020] transition-colors'>
                      <td className='px-4 py-2.5 select-none'>
                        <div className='flex items-center gap-3'>
                          <div
                            className='rounded-full h-3 w-3 shrink-0'
                            style={{ background: PLATFORM_COLORS[row.platform] || PLATFORM_COLORS[row.platform?.toLowerCase()] || PLATFORM_COLORS[row.platform?.charAt(0).toUpperCase() + row.platform?.slice(1)] || "#666" }}
                          />
                          <span className="capitalize whitespace-nowrap">{row.platform}</span>
                        </div>
                      </td>
                      <td className='py-2.5 px-4 text-right select-none whitespace-nowrap'>
                        {formatDate(row.transaction_date)}
                      </td>
                      <td className='py-2.5 px-4 text-right select-none font-mono uppercase whitespace-nowrap'>
                        {row.entity}
                      </td>
                      <td className="py-2.5 px-4 pr-5 text-right select-none font-mono whitespace-nowrap">
                        {formatQuantity(row.quantity, row.asset_class)}
                      </td>
                      <td className={`py-2.5 px-4 pr-5 text-right select-none font-mono whitespace-nowrap ${Number(row.amount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatAmount(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Pagination Footer */}
      {!transactionsLoading && transactionPagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 bg-[#181818] border-t border-[#2a2a2a] rounded-b-2xl mb-12 gap-4">
          <button
            onClick={() => handlePageChange(transactionPagination.page - 1)}
            disabled={!transactionPagination.hasPreviousPage || transactionsLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-[#222] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2a2a2a] cursor-pointer"
          >
            Previous
          </button>

          <div className="text-sm text-[#ababab] text-center">
            Page{" "}
            <span className="text-white font-semibold">
              {transactionPagination.page}
            </span>{" "}
            of{" "}
            <span className="text-white font-semibold">
              {transactionPagination.totalPages}
            </span>
            <span className="block sm:inline sm:ml-3 mt-1 sm:mt-0">
              ({transactionPagination.total} transactions)
            </span>
          </div>

          <button
            onClick={() => handlePageChange(transactionPagination.page + 1)}
            disabled={!transactionPagination.hasNextPage || transactionsLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-[#2285c3] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a6b9c] cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {showExportModal && (
        <ExportTransactionsModal
          onClose={() => setShowExportModal(false)}
          selectedAccount={selectedAccounts}
        />
      )}
    </div>
  );
};

export default Transactions;