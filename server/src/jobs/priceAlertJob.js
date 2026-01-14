const cron = require('node-cron');
const mongoose = require('mongoose');

const User = require('../models/User');
const PriceAlert = require('../models/PriceAlert');
const WishlistItem = require('../models/Wishlist');
const scrapingService = require('../services/scrapingService');
const { sendPriceAlertEmail } = require('../services/emailService');


const JobLockSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  lockedAt: Date,
});
const JobLock = mongoose.model('JobLock', JobLockSchema);

const acquireLock = async (name, ttlMinutes = 55) => {
  const now = new Date();
  const expiry = new Date(now.getTime() - ttlMinutes * 60000);

  const lock = await JobLock.findOneAndUpdate(
    {
      name,
      $or: [{ lockedAt: { $lt: expiry } }, { lockedAt: null }],
    },
    { lockedAt: now },
    { upsert: true, new: true }
  );

  return lock.lockedAt.getTime() === now.getTime();
};


const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ]);


const checkPriceAlerts = cron.schedule(
  '0 * * * *',
  async () => {
    console.log('🔔 Price alert job started');

    const hasLock = await acquireLock('price-alert-job');
    if (!hasLock) {
      console.log('⏭️ Price alert job skipped (already running)');
      return;
    }

    try {
      const alerts = await PriceAlert.find({
        isActive: true,
        notified: false,
      })
        .populate('user', 'email name')
        .lean();

      console.log(`📦 Alerts to check: ${alerts.length}`);

      for (const alert of alerts) {
        try {
          const searchResults = await withTimeout(
            scrapingService.searchAllWebsites(alert.productName),
            15000
          );

          if (!searchResults?.results?.length) continue;

          const sameWebsite = alert.website
            ? searchResults.results.find((r) =>
              r.website
                .toLowerCase()
                .includes(alert.website.toLowerCase())
            )
            : null;

          const result = sameWebsite || searchResults.results[0];
          const currentPrice = result.price;
          if (!currentPrice || typeof currentPrice !== 'number') continue;
          const isTriggered = currentPrice <= alert.targetPrice;

          const updateResult = await PriceAlert.updateOne(
            {
              _id: alert._id,
              isActive: true,
              notified: false
            },
            {
              currentPrice,
              lastChecked: new Date(),
              ...(isTriggered && {
                notified: true,
                triggeredAt: new Date(),
                isActive: false
              }),
            }
          );
          if (isTriggered && updateResult.modifiedCount === 0) {
            continue;
          }

          if (isTriggered && updateResult.modifiedCount === 1) {
            const savings = Math.max(
              0,
              alert.initialPrice - currentPrice
            );

            await User.updateOne(
              { _id: alert.user._id },
              {
                $inc: {
                  totalSavings: savings,
                  targetsHit: 1 
                }
              }
            );
            await sendPriceAlertEmail({
              email: alert.user.email,
              name: alert.user.name,
              productName: alert.productName,
              initialPrice: alert.initialPrice,
              targetPrice: alert.targetPrice,
              currentPrice,
              website: alert.website,
              productUrl: result.url,
              savings
            });
            console.log(`🎯 Alert sent: ${alert.productName}`);
          }
        } catch (err) {
          console.error(`⚠️ Alert failed (${alert._id}):`, err.message);
        }

        await delay(800);
      }
    } catch (err) {
      console.error('❌ Price alert job error:', err);
    }
  },
  { scheduled: false }
);


const updateWishlistPrices = cron.schedule(
  '0 9 * * *',
  async () => {
    console.log('🔄 Wishlist update job started');

    const hasLock = await acquireLock('wishlist-job', 1440);
    if (!hasLock) {
      console.log('⏭️ Wishlist job skipped');
      return;
    }

    try {
      const items = await WishlistItem.find({}).lean();

      for (const item of items) {
        try {
          const searchResults = await withTimeout(
            scrapingService.searchAllWebsites(item.productName),
            15000
          );

          if (!searchResults?.results?.length) continue;

          const sameWebsite = searchResults.results.find((r) =>
            r.website.toLowerCase().includes(item.website.toLowerCase())
          );

          const currentPrice = (sameWebsite || searchResults.results[0]).price;

          if (currentPrice !== item.currentPrice) {
            await WishlistItem.updateOne(
              { _id: item._id },
              {
                currentPrice,
                $push: {
                  priceHistory: {
                    price: currentPrice,
                    date: new Date(),
                  },
                },
              }
            );
          }
        } catch (err) {
          console.error(
            `⚠️ Wishlist update failed (${item.productName}):`,
            err.message
          );
        }

        await delay(800);
      }
    } catch (err) {
      console.error('❌ Wishlist job error:', err);
    }
  },
  { scheduled: false }
);


const cleanupOldAlerts = cron.schedule(
  '0 0 * * *',
  async () => {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 30);

      const result = await PriceAlert.deleteMany({
        notified: true,
        updatedAt: { $lt: date },
      });

      console.log(`🧹 Cleaned alerts: ${result.deletedCount}`);
    } catch (err) {
      console.error('❌ Cleanup error:', err);
    }
  },
  { scheduled: false }
);

const startCronJobs = () => {
  checkPriceAlerts.start();
  updateWishlistPrices.start();
  cleanupOldAlerts.start();
  console.log('⏰ Cron jobs started');
};

const stopCronJobs = () => {
  checkPriceAlerts.stop();
  updateWishlistPrices.stop();
  cleanupOldAlerts.stop();
};

module.exports = {
  startCronJobs,
  stopCronJobs,
};
