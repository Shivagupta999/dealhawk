const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

(async () => {
  try {
    await transporter.verify();
    console.log('📧 SMTP server connected successfully');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
  }
})();

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || 'Please view this email in HTML format.'
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });

    throw error;
  }
};

const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Email Verification</h2>
      <p>Your OTP for email verification is:</p>
      <h1 style="background: #F3F4F6; padding: 20px; text-align: center; letter-spacing: 5px;">
        ${otp}
      </h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'DealHawk - Email Verification OTP',
    html,
    text: `Your DealHawk OTP is ${otp}. It expires in 10 minutes.`
  });
};

const sendPriceAlertEmail = async ({
  email,
  name,
  productName,
  targetPrice,
  currentPrice,
  website,
  productUrl,
  savings
}) => {
  const savingsPercent = Math.round((savings / targetPrice) * 100);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #10B981; margin-top: 0;">🎉 Price Drop Alert!</h2>
        
        <p style="font-size: 16px;">Hi ${name || 'there'},</p>
        
        <p style="font-size: 16px;">Great news! The price of <strong>${productName}</strong> has dropped!</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 10px 0;">
                <div style="color: #6B7280; font-size: 14px;">Your Target Price</div>
                <div style="font-size: 24px; font-weight: bold; color: #374151;">₹${targetPrice}</div>
              </td>
              <td style="padding: 10px 0;">
                <div style="color: #6B7280; font-size: 14px;">Current Price</div>
                <div style="font-size: 24px; font-weight: bold; color: #10B981;">₹${currentPrice}</div>
              </td>
            </tr>
          </table>
          
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #D1D5DB;">
            <span style="color: #10B981; font-weight: bold; font-size: 18px;">
              💰 Save ₹${savings} (${savingsPercent}% off)
            </span>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #6B7280;">Available on: <strong>${website}</strong></p>
        
        <a href="${productUrl}" 
           style="display: inline-block; 
                  background: linear-gradient(to right, #4F46E5, #7C3AED); 
                  color: white; 
                  padding: 15px 40px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  font-weight: bold; 
                  margin: 20px 0;
                  text-align: center;">
          🛒 Buy Now
        </a>
        
        <p style="font-size: 12px; color: #9CA3AF; margin-top: 30px;">
          This alert has been deactivated. You can create a new alert anytime on DealHawk.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #6B7280;">
        <p>Happy Shopping! 🛍️</p>
        <p>DealHawk Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `🎉 Price Drop Alert: ${productName}`,
    html,
    text: `${productName} dropped to ₹${currentPrice} on ${website}. Buy now: ${productUrl}`
  });
};

/**
 * SEND WEEKLY PRICE DROP DIGEST
 */
const sendPriceDropDigest = async ({ email, name, priceDrops }) => {
  if (priceDrops.length === 0) return;

  const itemsHtml = priceDrops.map(item => `
    <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <h3 style="margin: 0 0 10px 0; color: #374151;">${item.productName}</h3>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="color: #6B7280; font-size: 14px;">Was: </span>
          <span style="text-decoration: line-through; color: #9CA3AF;">₹${item.oldPrice}</span>
        </div>
        <div>
          <span style="color: #6B7280; font-size: 14px;">Now: </span>
          <span style="font-size: 20px; font-weight: bold; color: #10B981;">₹${item.newPrice}</span>
        </div>
        <div>
          <span style="background: #10B981; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px;">
            ${item.dropPercent}% OFF
          </span>
        </div>
      </div>
      <a href="${item.url}" 
         style="display: inline-block; 
                background: #4F46E5; 
                color: white; 
                padding: 8px 20px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-size: 14px;
                margin-top: 10px;">
        View Deal
      </a>
    </div>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4F46E5;">📊 Your Weekly Price Drops</h2>
      <p>Hi ${name},</p>
      <p>Here are the price drops on your wishlist items this week:</p>
      ${itemsHtml}
      <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">
        Keep tracking prices with DealHawk!
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `📊 Your Weekly Price Drop Digest - ${priceDrops.length} Items`,
    html,
    text: itemsText
  });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendPriceAlertEmail,
  sendPriceDropDigest
};