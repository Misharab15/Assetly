import supabase from '../config/supabaseClient.js';

// =========================================================
// REFRESH COOKIE CONFIG
// =========================================================
// const REFRESH_COOKIE_OPTS = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'lax',
//     path: '/api/auth',
//     maxAge: 7 * 24 * 60 * 60 * 1000,
// };
const REFRESH_COOKIE_OPTS = {
    httpOnly: true,
    secure: true, // Required when sameSite is 'none' (and mandatory on Vercel's HTTPS)
    sameSite: 'none', // Allows the cookie to pass between your distinct frontend and backend Vercel domains
    path: '/', // Makes the cookie available across your entire API domain
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const trimTrailingSlash = (value = '') =>
    value.replace(/\/+$/, '');

const getServerOrigin = (req) => {
    if (process.env.BACKEND_URL) {
        return trimTrailingSlash(process.env.BACKEND_URL);
    }

    const forwardedProto = req.get('x-forwarded-proto');
    const proto = forwardedProto
        ? forwardedProto.split(',')[0]
        : req.protocol;
    const host = req.get('x-forwarded-host') || req.get('host');

    if (!host) return '';

    return `${proto}://${host}`;
};

const getClientOrigin = () =>
    trimTrailingSlash(process.env.CLIENT_ORIGIN || '');
// =========================================================
// SIGNUP / REGISTER
// =========================================================
export const signup = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({
                success: false,
                message: 'Enter all required fields',
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(201).json({
            success: true,
            user: data.user,
            message: 'Signup successful! Check your email.',
        });
    } catch (err) {
        console.error('Signup error:', err);

        return res.status(500).json({
            success: false,
            message: err.message || 'Signup failed',
        });
    }
};

// =========================================================
// SIGNIN
// =========================================================
export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Enter all required fields',
            });
        }

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        if (error || !data.session) {
            return res.status(400).json({
                success: false,
                message: error?.message || 'Invalid login credentials',
            });
        }

        // Store refresh token in HTTP-only cookie
        res.cookie(
            'refresh_token',
            data.session.refresh_token,
            REFRESH_COOKIE_OPTS
        );

        return res.status(200).json({
            success: true,
            access_token: data.session.access_token,
            expires_at: data.session.expires_at,
            user: data.user,
        });
    } catch (err) {
        console.error('Signin error:', err);

        return res.status(500).json({
            success: false,
            message: err.message || 'Signin failed',
        });
    }
};

// =========================================================
// REFRESH SESSION
// =========================================================
export const refresh = async (req, res) => {
    try {
        const refresh_token = req.cookies?.refresh_token;

        if (!refresh_token) {
            return res.status(401).json({
                success: false,
                message: 'No refresh token',
            });
        }

        const { data, error } =
            await supabase.auth.refreshSession({
                refresh_token,
            });

        if (error || !data.session) {
            res.clearCookie(
                'refresh_token',
                REFRESH_COOKIE_OPTS
            );

            return res.status(401).json({
                success: false,
                message: 'Session expired, please log in again',
            });
        }

        // Supabase may rotate the refresh token
        res.cookie(
            'refresh_token',
            data.session.refresh_token,
            REFRESH_COOKIE_OPTS
        );

        return res.status(200).json({
            success: true,
            access_token: data.session.access_token,
            expires_at: data.session.expires_at,
        });
    } catch (err) {
        console.error('Refresh error:', err);

        return res.status(500).json({
            success: false,
            message: err.message || 'Failed to refresh session',
        });
    }
};

// =========================================================
// GOOGLE LOGIN
// =========================================================
// 1. Update your existing googleLogin controller
export const googleLogin = async (req, res) => {
    try {
        const serverOrigin = getServerOrigin(req);

        if (!serverOrigin) {
            return res.status(500).json({
                success: false,
                message: 'Server origin is not configured for OAuth',
            });
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Google/Supabase returns the code here for server-side exchange
                redirectTo: `${serverOrigin}/api/auth/callback`,
            },
        });

        if (error) throw error;

        return res.status(200).json({
            success: true,
            url: data.url,
        });
    } catch (err) {
        console.error('Google login error:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Google login failed',
        });
    }
};

// 2. Add this NEW controller at the bottom of the file
export const setAuthCookie = (req, res) => {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
        return res.status(400).json({ success: false, message: 'No token provided' });
    }

    // REFRESH_COOKIE_OPTS is already defined at the top of your file
    res.cookie('refresh_token', refresh_token, REFRESH_COOKIE_OPTS);

    return res.status(200).json({ success: true, message: 'Cookie set' });
};

// =========================================================
// GOOGLE OAUTH CALLBACK
// =========================================================
// =========================================================
// GOOGLE OAUTH CALLBACK
// =========================================================
export const callback = async (req, res) => {
    const { code } = req.query;
    const clientOrigin = getClientOrigin();
    const loginPath = '/auth/login?error=oauth_failed';

    if (!code) {
        return res.redirect(clientOrigin
            ? `${clientOrigin}${loginPath}`
            : loginPath);
    }

    try {
        const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.session) {
            return res.redirect(clientOrigin
                ? `${clientOrigin}${loginPath}`
                : loginPath);
        }

        // Store refresh token securely
        res.cookie(
            'refresh_token',
            data.session.refresh_token,
            REFRESH_COOKIE_OPTS
        );

        // Do NOT put access token in URL
        return res.redirect(clientOrigin
            ? `${clientOrigin}/auth/callback?login=success`
            : '/auth/callback?login=success');
    } catch (err) {
        console.error('Google callback error:', err);

        return res.redirect(clientOrigin
            ? `${clientOrigin}${loginPath}`
            : loginPath);
    }
};



// =========================================================
// LOGOUT
// =========================================================
export const logout = async (req, res) => {
    try {
        const refresh_token = req.cookies?.refresh_token;

        if (refresh_token) {
            try {
                await supabase.auth.admin.signOut(refresh_token);
            } catch (err) {
                console.error(
                    'Supabase signout warning:',
                    err.message
                );
            }
        }

        res.clearCookie(
            'refresh_token',
            REFRESH_COOKIE_OPTS
        );

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (err) {
        console.error('Logout error:', err);

        return res.status(500).json({
            success: false,
            message: 'Logout failed. Try again.',
        });
    }
};

// =========================================================
// CHANGE PASSWORD
// =========================================================
export const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        const userId = req.user.id;
        const email = req.user.email;

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required.',
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match.',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters.',
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    'New password must be different from your current password.',
            });
        }

        const { error: signInError } =
            await supabase.auth.signInWithPassword({
                email,
                password: currentPassword,
            });

        if (signInError) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect current password',
            });
        }

        const { error: updateError } =
            await supabase.auth.admin.updateUserById(
                userId,
                {
                    password: newPassword,
                }
            );

        if (updateError) {
            console.error(
                'Supabase password update error:',
                updateError
            );

            return res.status(500).json({
                success: false,
                message:
                    'Failed to update password. Please try again.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully!',
        });
    } catch (err) {
        console.error(
            'Change password error:',
            err
        );

        return res.status(500).json({
            success: false,
            message:
                err.message ||
                'Failed to update password',
        });
    }
};

// =========================================================
// FORGOT PASSWORD - SEND RESET EMAIL
// =========================================================
export const resetpassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        const { data, error } =
            await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            console.error('Reset password error:', error);

            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to send reset email',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Password reset email sent! Please check your inbox.',
            data,
        });
    } catch (err) {
        console.error('Reset password error:', err);

        return res.status(500).json({
            success: false,
            message: err.message || 'Failed to process request',
        });
    }
};

// =========================================================
// VERIFY OTP AND RESET PASSWORD (NEW)
// =========================================================
export const verifyAndResetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, 6-digit code, and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        // Verify the 6-digit code sent via email
        const { data, error: otpError } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'recovery',
        });

        if (otpError || !data.user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired code. Please check and try again.",
            });
        }

        // Update user password via Admin API
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            data.user.id,
            { password: newPassword }
        );

        if (updateError) {
            return res.status(500).json({
                success: false,
                message: "Failed to update password. Please try again.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password reset successfully! Please log in.",
        });

    } catch (err) {
        console.error("Verify OTP error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to process request",
        });
    }
};

// =========================================================
// UPDATE PASSWORD AFTER FORGOT PASSWORD FLOW (Legacy Token-based)
// =========================================================
export const updateForgottenPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No recovery session found',
            });
        }

        const accessToken = authHeader.split(' ')[1];

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser(accessToken);

        if (userError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired recovery session. Please request a new password reset.',
            });
        }

        const { error: updateError } =
            await supabase.auth.admin.updateUserById(
                user.id,
                {
                    password: newPassword,
                }
            );

        if (updateError) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update password. Please try again.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully! Please log in with your new password.',
        });
    } catch (err) {
        console.error('Update forgotten password error:', err);

        return res.status(500).json({
            success: false,
            message: err.message || 'Failed to reset password',
        });
    }
};

// =========================================================
// GET USER
// =========================================================
export const getUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        let username = req.user.user_metadata?.username;

        if (!username && req.user.email) {
            const fullName = req.user.user_metadata?.full_name || '';

            const firstName =
                fullName.split(' ')[0]?.toLowerCase() ||
                req.user.email.split('@')[0].toLowerCase();

            username = firstName;

            const { data, error } = await supabase.auth.admin.listUsers();

            if (error) {
                throw error;
            }

            const usernameExists = data.users.some(
                (user) => user.user_metadata?.username === username
            );

            if (usernameExists) {
                username =
                    firstName +
                    Math.floor(1000 + Math.random() * 9000);
            }

            await supabase.auth.admin.updateUserById(
                req.user.id,
                {
                    user_metadata: {
                        ...req.user.user_metadata,
                        username,
                    },
                }
            );
        }

        const flatUser = {
            id: req.user.id,
            email: req.user.email,
            username,
        };

        return res.status(200).json({
            success: true,
            user: flatUser,
        });
    } catch (err) {
        console.error('Get user error:', err);

        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};
