const PriceAlert = require('../models/PriceAlert');

exports.createAlert = async (req, res, next) => {
  try {
    const {
      productName,
      targetPrice,
      currentPrice,
      website,
      url,
      imageUrl
    } = req.body;

    if (!productName || !targetPrice || !currentPrice) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    if (Number(targetPrice) >= Number(currentPrice)) {
      return res.status(400).json({
        error: 'Target price must be lower than current price'
      });
    }

    const normalizedName = productName.trim().toLowerCase();
    const normalizedWebsite = website?.trim().toLowerCase() || null;

    const existingAlert = await PriceAlert.findOne({
      user: req.user._id,
      normalizedName,
      normalizedWebsite,
      isActive: true
    });

    if (existingAlert) {
      return res.status(400).json({
        error: 'Price alert already exists for this product'
      });
    }

    const alert = await PriceAlert.create({
      user: req.user._id,
      productName,
      normalizedName,
      website,
      normalizedWebsite,
      targetPrice,
      initialPrice: Number(currentPrice),
      currentPrice: Number(currentPrice),
      url,
      imageUrl
    });

    res.status(201).json({
      message: 'Price alert created successfully',
      alert
    });
  } catch (error) {
    next(error);
  }
};

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find({
      user: req.user._id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      count: alerts.length,
      alerts
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const { targetPrice, isActive } = req.body;

    const alert = await PriceAlert.findOne({
      _id: alertId,
      user: req.user._id,
      isActive: true
    });

    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }

    if (targetPrice !== undefined) {
      if (Number(targetPrice) >= alert.currentPrice) {
        return res.status(400).json({
          error: 'Target price must be lower than current price'
        });
      }

      alert.targetPrice = Number(targetPrice);
      alert.notified = false;    
      alert.triggeredAt = null;     
    }

    if (isActive !== undefined) {
      alert.isActive = Boolean(isActive);
    }

    await alert.save();

    res.json({
      message: 'Alert updated successfully',
      alert
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;

    const alert = await PriceAlert.findOneAndUpdate(
      {
        _id: alertId,
        user: req.user._id
      },
      {
        isActive: false
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }

    res.json({
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getTriggeredAlerts = async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find({
      user: req.user._id,
      notified: true
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      count: alerts.length,
      alerts
    });
  } catch (error) {
    next(error);
  }
};
