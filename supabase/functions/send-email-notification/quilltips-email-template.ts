
// Email template for Quilltips notifications
// We're using a TypeScript version instead of JSX since edge functions
// don't support React JSX rendering directly

interface EmailTemplateProps {
  message: string;
  header: string;
  cta?: string;
  ctaUrl?: string;
  additionalContent?: string;
}

export const generateEmailHtml = ({
  message,
  header,
  cta,
  ctaUrl,
  additionalContent,
}: EmailTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${header}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          /* Reset and base styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            background-color: #f8fafc;
            font-family: 'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: #333333;
          }
          
          .email-container {
            background-color: #f8fafc;
            padding: 40px 20px;
            min-height: 100vh;
          }
          
          .email-wrapper {
            background-color: #ffffff;
            margin: 0 auto;
            max-width: 600px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
          }
          
          /* Header section with logo */
          .header-section {
            background: linear-gradient(135deg, #19363C 0%, #2A4F57 100%);
            padding: 40px 48px 32px;
            text-align: center;
            position: relative;
          }
          
          .logo-container {
            background-color: #ffffff;
            padding: 16px;
            border-radius: 16px;
            display: inline-block;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .logo {
            width: 72px;
            height: 72px;
            border-radius: 8px;
            display: block;
          }
          
          .brand-title {
            font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
            font-size: 32px;
            font-weight: 700;
            color: #FFD166;
            margin: 0 0 8px 0;
            letter-spacing: -0.5px;
          }
          
          .brand-tagline {
            font-family: 'Lato', sans-serif;
            font-size: 16px;
            font-weight: 400;
            color: #E2E8F0;
            margin: 0;
          }
          
          /* Content section */
          .content-section {
            padding: 48px;
          }
          
          .content-header {
            font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
            font-size: 28px;
            font-weight: 600;
            color: #19363C;
            text-align: center;
            margin: 0 0 24px 0;
            line-height: 1.3;
          }
          
          .content-message {
            font-family: 'Lato', sans-serif;
            font-size: 16px;
            font-weight: 400;
            color: #4A5568;
            text-align: center;
            margin: 0 0 32px 0;
            line-height: 1.6;
          }
          
          .additional-content {
            font-family: 'Lato', sans-serif;
            font-size: 16px;
            color: #4A5568;
            margin: 24px 0;
            line-height: 1.6;
          }
          
          .additional-content p {
            margin: 0 0 16px 0;
          }
          
          .additional-content p:last-child {
            margin-bottom: 0;
          }
          
          .additional-content strong {
            font-weight: 600;
            color: #19363C;
          }
          
          .additional-content ul {
            margin: 16px 0;
            padding-left: 24px;
          }
          
          .additional-content li {
            margin: 8px 0;
            color: #4A5568;
          }
          
          .additional-content em {
            font-style: italic;
            color: #6B7280;
          }
          
          /* CTA Button */
          .cta-container {
            text-align: center;
            margin: 40px 0;
          }
          
          .cta-button {
            background-color: #FFD166;
            color: #19363C;
            font-family: 'Lato', sans-serif;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            display: inline-block;
            padding: 16px 32px;
            border-radius: 9999px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: none;
            min-width: 200px;
          }
          
          .cta-button:hover {
            background-color: #FFC033;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            transform: translateY(-1px);
          }
          
          /* Secondary link */
          .secondary-link {
            font-family: 'Lato', sans-serif;
            font-size: 16px;
            color: #4A5568;
            text-align: center;
            margin: 24px 0;
          }
          
          .secondary-link a {
            color: #19363C;
            text-decoration: none;
            font-weight: 600;
          }
          
          .secondary-link a:hover {
            text-decoration: underline;
          }
          
          /* Footer */
          .footer-section {
            background-color: #F7FAFC;
            padding: 32px 48px;
            text-align: center;
            border-top: 1px solid #E2E8F0;
          }
          
          .footer-text {
            font-family: 'Lato', sans-serif;
            font-size: 14px;
            color: #6B7280;
            line-height: 1.5;
            margin: 0;
          }
          
          .footer-text a {
            color: #19363C;
            text-decoration: none;
            font-weight: 500;
          }
          
          .footer-text a:hover {
            text-decoration: underline;
          }
          
          /* Divider */
          .divider {
            border: none;
            border-top: 1px solid #E2E8F0;
            margin: 32px 0;
          }
          
          /* Mobile responsive */
          @media only screen and (max-width: 600px) {
            .email-container {
              padding: 20px 10px;
            }
            
            .email-wrapper {
              border-radius: 12px;
            }
            
            .header-section {
              padding: 32px 24px 24px;
            }
            
            .content-section {
              padding: 32px 24px;
            }
            
            .footer-section {
              padding: 24px;
            }
            
            .brand-title {
              font-size: 28px;
            }
            
            .content-header {
              font-size: 24px;
            }
            
            .content-message {
              font-size: 15px;
            }
            
            .cta-button {
              padding: 14px 28px;
              font-size: 15px;
              min-width: 180px;
            }
            
            .logo {
              width: 60px;
              height: 60px;
            }
            
            .logo-container {
              padding: 12px;
            }
          }
          
          /* Email client specific fixes */
          @media screen and (max-width: 480px) {
            .email-wrapper {
              width: 100% !important;
              min-width: 100% !important;
            }
          }
          
          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            .logo-container {
              background-color: #ffffff !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-wrapper">
            <!-- Header Section -->
            <div class="header-section">
              <div class="logo-container">
                <img src="https://qrawynczvedffcvnympn.supabase.co/storage/v1/object/public/public-assets/logo_nav.webp" 
                     alt="Quilltips Logo" 
                     class="logo">
              </div>
              <h1 class="brand-title">Quilltips</h1>
              <p class="brand-tagline">Helping authors get paid</p>
            </div>

            <!-- Content Section -->
            <div class="content-section">
              <h2 class="content-header">${header}</h2>
              <p class="content-message">${message}</p>
              
              ${additionalContent ? `<div class="additional-content">${additionalContent}</div>` : ''}

              ${cta && ctaUrl ? `
                <div class="cta-container">
                  <a href="${ctaUrl}" class="cta-button">${cta}</a>
                </div>
              ` : ''}

              <div class="secondary-link">
                or visit <a href="https://quilltips.co">quilltips.co</a>
              </div>
            </div>

            <!-- Footer Section -->
            <div class="footer-section">
              <p class="footer-text">
                If you have any questions, reply to this email<br>
                or contact us at <a href="mailto:hello@quilltips.co">hello@quilltips.co</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
