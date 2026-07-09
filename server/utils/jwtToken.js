const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  const secret = process.env.JWT_PRIVATE_SECRET || 'local_development_jwt_secret_key_change_in_prod';
  const token = jwt.sign(payload, secret, {
    expiresIn: '7d',
  });

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Rule #5: Prevents XSS script access
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };

  res
    .status(statusCode)
    .cookie('staywise_jwt', token, options)
    .json({
      success: true,
      token, // Also returned in body for mobile fallback headers
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        aiPreferenceVector: user.aiPreferenceVector,
      },
    });
};

module.exports = sendTokenResponse;
