
// Email template for Quilltips notifications
// Using table-based layout with inline CSS for maximum email client compatibility

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
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${header}</title>
        <style type="text/css">
          /* Gmail-specific CSS fixes */
          .gmail-fix { display: none !important; }
          
          /* Target Gmail specifically */
          u + .body .gmail-background { background-color: #f8fafc !important; }
          u + .body .gmail-container { background-color: #ffffff !important; }
          u + .body .gmail-header { background-color: #19363C !important; }
          u + .body .gmail-button { background-color: #FFD166 !important; }
          u + .body .gmail-footer { background-color: #F7FAFC !important; }
          u + .body .gmail-logo-container { background-color: #ffffff !important; }
          
          /* Gmail Dark Mode fixes */
          [data-ogsc] .gmail-logo-container { background-color: #ffffff !important; }
          [data-ogsc] .gmail-container { background-color: #ffffff !important; }
          [data-ogsc] .gmail-header { background-color: #19363C !important; }
          [data-ogsc] .gmail-button { background-color: #FFD166 !important; color: #19363C !important; }
          [data-ogsc] .gmail-footer { background-color: #F7FAFC !important; }
          
          /* Force white background for logo in all Gmail modes */
          .logo-white-bg {
            background-color: #ffffff !important;
            background: #ffffff !important;
          }
          
          /* Gmail mobile fixes */
          @media screen and (max-width: 600px) {
            .gmail-mobile { width: 100% !important; }
            .gmail-mobile-padding { padding: 20px !important; }
          }
          
          /* Remove Gmail's blue links */
          a[x-gmail-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }
          
          /* Fix Gmail image issues */
          img {
            outline: none !important;
            text-decoration: none !important;
            -ms-interpolation-mode: bicubic !important;
            border: 0 !important;
          }
          
          /* Prevent Gmail from changing background colors in dark mode */
          @media (prefers-color-scheme: dark) {
            .logo-white-bg {
              background-color: #ffffff !important;
              background: #ffffff !important;
            }
            .gmail-logo-container {
              background-color: #ffffff !important;
              background: #ffffff !important;
            }
          }
        </style>
        <!--[if mso]>
        <style type="text/css">
          table { border-collapse: collapse; border-spacing: 0; }
          .button { padding: 0 !important; }
          .button a { padding: 16px 32px !important; }
        </style>
        <![endif]-->
      </head>
      <body class="body" style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, Helvetica, sans-serif;">
        <!-- Gmail background fix -->
        <div class="gmail-background" style="background-color: #f8fafc;">
          <!-- Main Container Table -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; margin: 0; padding: 0;" bgcolor="#f8fafc">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                
                <!-- Email Content Table -->
                <table class="gmail-container gmail-mobile" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; max-width: 600px;" bgcolor="#ffffff">
                  
                  <!-- Header Section -->
                  <tr>
                    <td class="gmail-header" style="background-color: #19363C; padding: 40px 48px; text-align: center;" bgcolor="#19363C" align="center">
                      
                      <!-- Logo Container with enhanced white background -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px auto;">
                        <tr>
                          <td class="gmail-logo-container logo-white-bg" style="background-color: #ffffff !important; background: #ffffff !important; padding: 16px; text-align: center;" bgcolor="#ffffff" align="center">
                            <img src="https://qrawynczvedffcvnympn.supabase.co/storage/v1/object/public/public-assets/logo_nav.png" 
                                 alt="Quilltips Logo" 
                                 width="60" 
                                 height="60" 
                                 style="display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; width: 60px; height: 60px; background-color: transparent;">
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Brand Title -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                        <tr>
                          <td style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: bold; color: #FFD166; text-align: center; line-height: 1.2; margin: 0 0 8px 0;" align="center">
                            Quilltips
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #E2E8F0; text-align: center; margin: 0;" align="center">
                            Helping authors get paid
                          </td>
                        </tr>
                      </table>
                      
                    </td>
                  </tr>
                  
                  <!-- Content Section -->
                  <tr>
                    <td class="gmail-mobile-padding" style="padding: 48px; background-color: #ffffff;" bgcolor="#ffffff">
                      
                      <!-- Content Header -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: bold; color: #19363C; text-align: center; line-height: 1.3; margin: 0 0 24px 0; padding-bottom: 24px;" align="center">
                            ${header}
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Main Message -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #4A5568; text-align: center; line-height: 1.6; margin: 0 0 32px 0; padding-bottom: 32px;" align="center">
                            ${message}
                          </td>
                        </tr>
                      </table>
                      
                      ${additionalContent ? `
                      <!-- Additional Content -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #4A5568; line-height: 1.6; margin: 24px 0; padding: 24px 0;">
                            ${additionalContent}
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      ${cta && ctaUrl ? `
                      <!-- CTA Button -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 40px 0;">
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaUrl}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="0%" stroke="f" fillcolor="#FFD166">
                              <w:anchorlock/>
                              <center style="color:#19363C;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${cta}</center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <table border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td class="gmail-button" style="background-color: #FFD166; border: 2px solid #FFD166;" bgcolor="#FFD166">
                                  <a href="${ctaUrl}" 
                                     style="display: inline-block; padding: 16px 32px; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: #19363C !important; text-decoration: none; min-width: 140px; text-align: center; line-height: 1;"
                                     target="_blank">
                                    ${cta}
                                  </a>
                                </td>
                              </tr>
                            </table>
                            <!--<![endif]-->
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      <!-- Secondary Link -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #4A5568; text-align: center; padding: 24px 0;" align="center">
                            or visit <a href="https://quilltips.co" style="color: #19363C !important; text-decoration: none; font-weight: bold;" target="_blank">quilltips.co</a>
                          </td>
                        </tr>
                      </table>
                      
                    </td>
                  </tr>
                  
                  <!-- Footer Section -->
                  <tr>
                    <td class="gmail-footer gmail-mobile-padding" style="background-color: #F7FAFC; padding: 32px 48px; text-align: center; border-top: 1px solid #E2E8F0;" bgcolor="#F7FAFC" align="center">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #6B7280; line-height: 1.5; text-align: center;" align="center">
                            If you have any questions, reply to this email<br>
                            or contact us at <a href="mailto:hello@quilltips.co" style="color: #19363C !important; text-decoration: none; font-weight: bold;" target="_blank">hello@quilltips.co</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
                <!-- End Email Content Table -->
                
              </td>
            </tr>
          </table>
          <!-- End Main Container Table -->
        </div>
        <!-- End Gmail background fix -->
      </body>
    </html>
  `;
};
