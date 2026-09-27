import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import features from '../data/features';
import { defaultMarketData } from '../utils/defaultMarketData';
import { formatChange } from '../utils/formatChange';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';

export default function LandingPage() {
    const [email, setEmail] = useState("");
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const displayMarketData = {
        crypto: marketData?.crypto ?? defaultMarketData.crypto,
        stock: marketData?.stock ?? defaultMarketData.stock,
        forex: marketData?.forex ?? defaultMarketData.forex
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                `${backendUrl}/api/newsletter/subscribe`,
                { email }
            );

            toast.success("Subscribed successfully! Check your email");
            setEmail("");
        } catch (err) {
            console.log(err);
            if (err.response?.status === 409) {
                toast.info("This email is already subscribed.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchLandingData = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/landing`);
                setMarketData(data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchLandingData();
    }, []);

    return (
        <div className="bg-[#0c0c0c] min-h-screen overflow-x-hidden">
            <ToastContainer
                position="top-right"
                autoClose={4000}
                theme="dark"
            />

            {/* Header: Added responsive padding and flexible logo scaling */}
            <header className="flex items-center justify-between p-4 sm:px-8 sticky top-0 z-50 bg-[#0c0c0c]/90 backdrop-blur-md border-b border-white/5">
                <img src="/brandlogo.jpg" alt="Assetly Logo" className="w-32 sm:w-44 object-contain" />
                <nav className="flex items-center gap-2 sm:gap-4">
                    <button
                        className="font-semibold text-sm sm:text-base px-3 py-2 rounded-md text-white hover:text-gray-300 transition-colors cursor-pointer"
                        onClick={() => navigate("/auth/login")}
                    >
                        Login
                    </button>
                    <button
                        className="font-semibold text-sm sm:text-base bg-[#00e238] px-3.5 py-2 rounded-md text-black transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        onClick={() => navigate("/auth/signup")}
                    >
                        Get Started
                    </button>
                </nav>
            </header>

            {/* Main Container: Added px-4 sm:px-6 to prevent edge touching */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 mt-8 sm:mt-16">
                <section className="grid md:grid-cols-2 gap-8 md:gap-12 items-center text-white">
                    <div>
                        {/* Heading: Scaled text-3xl on mobile -> text-6xl on desktop */}
                        <h1 className="text-3xl sm:text-5xl md:text-6xl leading-tight font-extrabold mb-4 sm:mb-6">
                            All your markets. All in one dashboard.
                        </h1>
                        <p className="text-base sm:text-lg text-white/70 mb-6">
                            Your portfolio simplified. Track stocks, crypto and forex&mdash;live, visual, and effortless. No spreadsheets. No tab-hopping. Just clear insights to make smarter decisions.
                        </p>

                        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-sm text-white/70">
                            <li>• Real-time price streaming</li>
                            <li>• Portfolio PnL & allocation</li>
                            <li>• Connect & Import Trades</li>
                        </ul>
                    </div>

                    {/* Right-side main widget */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="rounded-2xl p-5 sm:p-7 bg-[#181818] border border-white/5 shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-white/70">Net Worth</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold">$128,342</h2>
                                </div>
                                <div className="text-xs sm:text-sm text-white/70">Updated: 2m ago</div>
                            </div>

                            {/* Responsive 1 column on tiny screens, 3 columns on small+ screens */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                                <div className="p-3 rounded-lg bg-white/5">
                                    <p className="text-xs sm:text-sm text-white/60">Stocks</p>
                                    <h3 className="text-base sm:text-lg font-semibold">$72,120</h3>
                                    <p className="text-xs sm:text-sm text-[#00e238]">+4.3%</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5">
                                    <p className="text-xs sm:text-sm text-white/60">Crypto</p>
                                    <h3 className="text-base sm:text-lg font-semibold">$38,004</h3>
                                    <p className="text-xs sm:text-sm text-[#ff0000]">-2.1%</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5">
                                    <p className="text-xs sm:text-sm text-white/60">Forex</p>
                                    <h3 className="text-base sm:text-lg font-semibold">$18,218</h3>
                                    <p className="text-xs sm:text-sm text-[#00e238]">+0.9%</p>
                                </div>
                            </div>

                            <div>
                                <hr className="mt-6 border-white/10" />
                                {/* Flexible flex-wrap container replacing hardcoded &nbsp; strings */}
                                <div className="mt-3 pt-2 text-xs sm:text-sm text-white/60 flex flex-wrap items-center gap-y-1 gap-x-2">
                                    <span className="font-medium text-white/80">Quick actions:</span>
                                    <span>• Add account</span>
                                    <span>• Import CSV</span>
                                    <span>• Connect Exchange</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right-side 3 widgets */}
                        <motion.div
                            className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="text-xs sm:text-sm text-white/60">{displayMarketData.crypto.symbol}/USD</div>
                                <div className="text-base sm:text-lg font-semibold">${displayMarketData.crypto.price?.toLocaleString()}</div>
                                <div className={`text-xs sm:text-sm ${displayMarketData.crypto.change > 0
                                    ? "text-[#00e238]"
                                    : displayMarketData.crypto.change < 0
                                        ? "text-[#ff0000]"
                                        : "text-white/60"}`}>
                                    {formatChange(displayMarketData.crypto.change)}
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="text-xs sm:text-sm text-white/60">{displayMarketData.stock.symbol}</div>
                                <div className="text-base sm:text-lg font-semibold">${displayMarketData.stock.price?.toFixed(2)}</div>
                                <div className={`text-xs sm:text-sm ${displayMarketData.stock.change > 0
                                    ? "text-[#00e238]"
                                    : displayMarketData.stock.change < 0
                                        ? "text-[#ff0000]"
                                        : "text-white/60"}`}>
                                    {formatChange(displayMarketData.stock.change)}
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="text-xs sm:text-sm text-white/60">{displayMarketData.forex.symbol}</div>
                                <div className="text-base sm:text-lg font-semibold">${displayMarketData.forex.price?.toFixed(4)}</div>
                                <div className={`text-xs sm:text-sm ${displayMarketData.forex.change > 0
                                    ? "text-[#00e238]"
                                    : displayMarketData.forex.change < 0
                                        ? "text-[#ff0000]"
                                        : "text-white/60"}`}>
                                    {formatChange(displayMarketData.forex.change)}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="relative p-6 bg-white/5 rounded-2xl border border-white/5 cursor-pointer"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <div className="absolute top-6 left-6 rounded-lg p-3 bg-white/80 text-black">
                                {feature.icon}
                            </div>
                            <div className="text-lg sm:text-xl font-semibold mt-16">{feature.title}</div>
                            <div className="text-sm mt-3 text-white/60">{feature.description}</div>
                        </motion.div>
                    ))}
                </section>

                {/* Footer Section */}
                <footer className="border-t border-white/10 mt-16 sm:mt-24 pt-8 text-white/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-between items-center">
                        <div className="text-xs sm:text-sm">
                            <div>© {new Date().getFullYear()} Assetly • Stocks • Crypto • Forex</div>
                            <div>Made by Misharab & Sajjal</div>
                        </div>

                        <div className="flex flex-col md:items-end">
                            <div className="flex flex-col items-start md:items-end">
                                <div className="font-semibold text-white text-sm">Follow Us</div>
                                <div className="flex gap-3 text-lg mt-3">
                                    <div className="p-2 border rounded-md border-[#ababab] bg-white/5 hover:bg-[#ababab] hover:text-black transition duration-300 cursor-pointer">
                                        <FiFacebook />
                                    </div>
                                    <div className="p-2 border rounded-md border-[#ababab] bg-white/5 hover:bg-[#ababab] hover:text-black transition duration-300 cursor-pointer">
                                        <FiTwitter />
                                    </div>
                                    <div className="p-2 border rounded-md border-[#ababab] bg-white/5 hover:bg-[#ababab] hover:text-black transition duration-300 cursor-pointer">
                                        <FiInstagram />
                                    </div>
                                    <div className="p-2 border rounded-md border-[#ababab] bg-white/5 hover:bg-[#ababab] hover:text-black transition duration-300 cursor-pointer">
                                        <FiLinkedin />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter Section */}
                    <section>
                        <div className="border-t border-white/10 mt-10 pt-8 text-center flex flex-col items-center">
                            <div className="text-white font-semibold text-lg sm:text-xl mb-2">Stay Updated</div>
                            <div className="text-xs sm:text-sm text-white/60 mb-4 max-w-md">
                                Get notified about new features, updates and financial news.
                            </div>

                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md w-full">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="bg-white/5 p-3 sm:p-4 border border-white/20 rounded-lg flex-grow placeholder-white/50 text-white text-sm focus:outline-none focus:border-white transition duration-300"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#ababab] hover:bg-white text-black font-semibold p-3 sm:p-4 px-6 rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm shrink-0"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                            <span>Subscribing...</span>
                                        </div>
                                    ) : (
                                        "Subscribe"
                                    )}
                                </button>
                            </form>
                        </div>
                    </section>
                </footer>
            </main>
        </div>
    );
}