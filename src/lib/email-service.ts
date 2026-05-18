import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_NAME = "Achieve Academy";
const FROM_EMAIL = "Achieve Academy <onboarding@resend.dev>"; // Update with verified domain in production

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Email not sent.");
    return { success: false, error: "Email configuration missing" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend Email Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Email Service Error:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
};

export const emailTemplates = {
  interviewScheduled: (name: string, date: string, joinLink: string) => ({
    subject: `Interview Scheduled - ${APP_NAME}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">${APP_NAME}</h1>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello ${name},</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">We've scheduled your interview! We're looking forward to meeting you and discussing your application.</p>
        
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 14px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 0; letter-spacing: 0.05em;">Interview Details</h2>
          <p style="margin: 12px 0; color: #1e293b; font-size: 16px;"><strong>Date & Time:</strong> ${date}</p>
          <div style="margin-top: 20px;">
            <a href="${joinLink}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Join Zoom Meeting</a>
          </div>
        </div>

        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Please join the meeting a few minutes early to test your equipment. If you need to reschedule, please contact us as soon as possible.</p>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #334155; margin-bottom: 4px;">Best regards,</p>
          <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0;">The ${APP_NAME} Team</p>
        </div>
      </div>
    `,
  }),

  userApproved: (name: string, role: string) => ({
    subject: `Welcome to ${APP_NAME} - Your Account is Approved!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">${APP_NAME}</h1>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello ${name},</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Congratulations! Your application has been reviewed and <strong>approved</strong>. You are now a verified ${role} on our platform.</p>
        
        <div style="background-color: #f0fdf4; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #dcfce7;">
          <p style="margin: 0; color: #166534; font-size: 16px; font-weight: 500;">You can now log in to your dashboard and start using all the features available to you.</p>
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Go to Dashboard</a>
          </div>
        </div>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #334155; margin-bottom: 4px;">Best regards,</p>
          <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0;">The ${APP_NAME} Team</p>
        </div>
      </div>
    `,
  }),

  userRejected: (name: string, reason?: string) => ({
    subject: `Update regarding your application - ${APP_NAME}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 20px; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">${APP_NAME}</h1>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello ${name},</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Thank you for your interest in joining ${APP_NAME}. After careful review, we regret to inform you that we cannot approve your application at this time.</p>
        
        ${reason ? `
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #fee2e2;">
          <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
        </div>
        ` : ''}

        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">We appreciate the time you took to apply and wish you the best in your future endeavors.</p>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #334155; margin-bottom: 4px;">Best regards,</p>
          <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0;">The ${APP_NAME} Team</p>
        </div>
      </div>
    `,
  }),

  payoutConfirmed: (data: {
    name: string;
    amount: number;
    method: string;
    transactionId: string;
    date: string;
    screenshot?: string;
  }) => ({
    subject: `Payout Confirmed - ${APP_NAME}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">${APP_NAME}</h1>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello ${data.name},</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Great news! Your payout has been processed and sent to your account.</p>
        
        <div style="background-color: #f0fdf4; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #dcfce7;">
          <h2 style="font-size: 14px; font-weight: 800; color: #166534; text-transform: uppercase; margin-top: 0; letter-spacing: 0.05em;">Payout Details</h2>
          <p style="margin: 12px 0; color: #1e293b; font-size: 18px; font-weight: 800;">Amount: $${data.amount.toLocaleString()}</p>
          <p style="margin: 8px 0; color: #1e293b; font-size: 14px;"><strong>Method:</strong> ${data.method}</p>
          <p style="margin: 8px 0; color: #1e293b; font-size: 14px;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
          <p style="margin: 8px 0; color: #1e293b; font-size: 14px;"><strong>Date:</strong> ${data.date}</p>
          
          ${data.screenshot ? `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dcfce7;">
            <p style="margin: 0 0 10px 0; color: #166534; font-size: 14px;"><strong>Payment Proof:</strong></p>
            <a href="${data.screenshot}" style="color: #10b981; font-weight: 600; text-decoration: underline;">View Payment Screenshot</a>
          </div>
          ` : ''}
        </div>

        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you have any questions regarding this payment, please reply to this email or contact our support team.</p>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #334155; margin-bottom: 4px;">Best regards,</p>
          <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0;">The ${APP_NAME} Team</p>
        </div>
      </div>
    `,
  }),

  trialReminder: (data: {
    name: string;
    partnerName: string;
    daysLeft: number;
    endDate: string;
    paymentLink: string;
  }) => ({
    subject: `Your trial with ${data.partnerName} ends in ${data.daysLeft} days!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">${APP_NAME}</h1>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello ${data.name},</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">We hope you're enjoying your trial sessions with <strong>${data.partnerName}</strong>!</p>
        
        <div style="background-color: #eff6ff; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #dbeafe;">
          <h2 style="font-size: 14px; font-weight: 800; color: #1e40af; text-transform: uppercase; margin-top: 0; letter-spacing: 0.05em;">Trial Countdown</h2>
          <p style="margin: 12px 0; color: #1e293b; font-size: 18px; font-weight: 800;">Days Remaining: ${data.daysLeft}</p>
          <p style="margin: 8px 0; color: #1e293b; font-size: 14px;">Your trial will expire on <strong>${data.endDate}</strong>.</p>
          
          <div style="margin-top: 24px;">
            <a href="${data.paymentLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 800; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">Continue Learning</a>
          </div>
        </div>

        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you decide to continue, please complete the payment before the trial ends to avoid any interruption in messaging or scheduling.</p>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #334155; margin-bottom: 4px;">Best regards,</p>
          <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0;">The ${APP_NAME} Team</p>
        </div>
      </div>
    `,
  }),

  trialExpired: (data: {
    name: string;
    partnerName: string;
    paymentLink: string;
  }) => ({
    subject: `Trial Expired: Continue your sessions with ${data.partnerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 20px; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">${APP_NAME}</h1>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello ${data.name},</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Your trial period with <strong>${data.partnerName}</strong> has now expired.</p>
        
        <div style="background-color: #fef2f2; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #fee2e2;">
          <p style="margin: 0 0 16px 0; color: #991b1b; font-size: 16px; font-weight: 600;">Action Required: Trial Expired</p>
          <p style="margin: 0 0 24px 0; color: #450a0a; font-size: 14px;">To continue messaging and scheduling sessions with your tutor, please complete the monthly payment.</p>
          
          <a href="${data.paymentLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 800; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">Unlock Full Access</a>
        </div>

        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #334155; margin-bottom: 4px;">Best regards,</p>
          <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 0;">The ${APP_NAME} Team</p>
        </div>
      </div>
    `,
  }),
};
