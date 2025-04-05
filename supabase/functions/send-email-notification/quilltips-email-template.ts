
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
        <style>
          body {
            background-color: #f6f9fc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            background-color: #ffffff;
            margin: 0 auto;
            max-width: 600px;
            padding: 20px 0 48px;
            margin-bottom: 64px;
          }
          .box {
            padding: 0 48px;
          }
          .hr {
            border: none;
            border-top: 1px solid #e6ebf1;
            margin: 20px 0;
          }
          .paragraph {
            color: #333;
            font-size: 16px;
            line-height: 24px;
            text-align: center;
          }
          .brand-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 0;
          }
          .brand-tagline {
            font-size: 14px;
            color: #666;
            text-align: center;
            margin-bottom: 24px;
          }
          .button {
            background-color: #FFD166;
            border-radius: 999px;
            color: #000;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
            display: inline-block;
            padding: 12px 24px;
            margin: 20px auto;
          }
          .button-container {
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            color: #8898aa;
            font-size: 12px;
            line-height: 16px;
            text-align: center;
          }
          .logo-container {
            text-align: center;
            margin-bottom: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="box">
            <div class="logo-container">
              <img src="https://quilltips.app/quill_icon.png" width="60" alt="Quilltips Logo" style="border-radius: 8px;">
            </div>
            <h1 class="brand-title">Quilltips</h1>
            <p class="brand-tagline">Helping authors get paid</p>
            <hr class="hr">

            <h2 style="text-align: center;">${header}</h2>
            <p class="paragraph">${message}</p>
            
            ${additionalContent ? `<div class="paragraph">${additionalContent}</div>` : ''}

            ${cta && ctaUrl ? `
              <div class="button-container">
                <a class="button" href="${ctaUrl}">${cta}</a>
              </div>
            ` : ''}

            <p class="paragraph">
              or visit <a href="https://quilltips.app">quilltips.app</a>
            </p>

            <hr class="hr">

            <p class="footer">
              If you have any questions, reply to this email<br>
              or contact us at <a href="mailto:hello@quilltips.co">hello@quilltips.co</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};
