const authService = require('../services/authService');

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const result = await authService.login(email, senha);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};