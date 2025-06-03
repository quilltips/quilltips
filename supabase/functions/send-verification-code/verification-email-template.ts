
export function generateEmailHtml({ code, type = 'signup' }: { code: string; type?: string }) {
  const title = type === 'signup' ? 'Welcome to Quilltips!' : 'Verify Your Email';
  const message = type === 'signup' 
    ? 'Thanks for signing up! Please verify your email address with the code below:'
    : 'Please verify your email address with the code below:';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; 
          background-color: #f6f9fc; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff; 
          padding: 40px 20px; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
        }
        .logo { 
          width: 60px; 
          height: 60px; 
          margin: 0 auto 12px; 
          background-color: #FFD166; 
          border-radius: 8px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
        }
        .brand-title { 
          font-size: 24px; 
          font-weight: bold; 
          color: #2D3748; 
          margin: 0; 
        }
        .brand-tagline { 
          font-size: 14px; 
          color: #666; 
          margin: 4px 0 0 0; 
        }
        .content { 
          text-align: center; 
          margin: 30px 0; 
        }
        .message { 
          font-size: 16px; 
          color: #333; 
          line-height: 1.5; 
          margin-bottom: 30px; 
        }
        .code-container { 
          background-color: #f8f9fa; 
          border: 2px solid #e9ecef; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
          display: inline-block; 
        }
        .code { 
          font-size: 32px; 
          font-weight: bold; 
          color: #2D3748; 
          letter-spacing: 4px; 
          font-family: 'Courier New', monospace; 
        }
        .code-label { 
          font-size: 12px; 
          color: #666; 
          text-transform: uppercase; 
          margin-bottom: 8px; 
        }
        .expiry { 
          font-size: 14px; 
          color: #666; 
          margin-top: 20px; 
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #e9ecef; 
          font-size: 12px; 
          color: #666; 
        }
        hr { 
          border: none; 
          border-top: 1px solid #e9ecef; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📚</div>
          <h1 class="brand-title">Quilltips</h1>
          <p class="brand-tagline">Helping authors get paid</p>
        </div>
        
        <div class="content">
          <p class="message">${message}</p>
          
          <div class="code-container">
            <div class="code-label">Verification Code</div>
            <div class="code">${code}</div>
          </div>
          
          <p class="expiry">This code will expire in 10 minutes.</p>
        </div>

        <hr>
        
        <div class="footer">
          <p>If you didn't request this verification code, you can safely ignore this email.</p>
          <p>Need help? Contact us at <a href="mailto:hello@quilltips.co">hello@quilltips.co</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
