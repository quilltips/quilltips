
// Email template for Quilltips notifications
// Using table-based layout with inline CSS for maximum email client compatibility
export const generateEmailHtml = ({ message, header, cta, ctaUrl, additionalContent }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${header}</title>
        
        <!-- Google Fonts Import with Fallbacks -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
        <style type="text/css">
          /* Font fallbacks for email clients that don't support Google Fonts */
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;500;600;700&display=swap');
          
          /* Gmail-specific CSS fixes */
          .gmail-fix { display: none !important; }
          
          /* Target Gmail specifically */
          u + .body .gmail-background { background-color: #f8fafc !important; }
          u + .body .gmail-container { background-color: #ffffff !important; }
          u + .body .gmail-header { background-color: #19363C !important; }
          u + .body .gmail-button { background-color: #FFD166 !important; }
          u + .body .gmail-footer { background-color: #F7FAFC !important; }
          
          /* Gmail Dark Mode fixes */
          [data-ogsc] .gmail-container { background-color: #ffffff !important; }
          [data-ogsc] .gmail-header { background-color: #19363C !important; }
          [data-ogsc] .gmail-button { background-color: #FFD166 !important; color: #19363C !important; }
          [data-ogsc] .gmail-footer { background-color: #F7FAFC !important; }
          
          /* Responsive typography and layout */
          @media screen and (max-width: 600px) {
            .gmail-mobile { width: 100% !important; }
            .gmail-mobile-padding { padding: 20px !important; }
            .mobile-stack { display: block !important; width: 100% !important; }
            .mobile-logo { text-align: center !important; padding-bottom: 16px !important; }
            .mobile-text { text-align: center !important; }
            
            /* Mobile font sizing */
            .mobile-body { font-size: 15px !important; }
            .mobile-padding { padding: 16px !important; }
            .mobile-header-padding { padding: 24px 16px !important; }
            
            /* Mobile logo sizing */
            .mobile-logo-img { width: 180px !important; max-width: 180px !important; }
            .mobile-brand-title { font-size: 24px !important; }
          }
          
          @media screen and (min-width: 601px) {
            /* Desktop font sizing */
            .desktop-body { font-size: 16px !important; }
            /* Desktop logo sizing */
            .desktop-logo-img { width: 220px !important; max-width: 220px !important; }
            .desktop-brand-title { font-size: 28px !important; }
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
          
          /* Font family definitions with fallbacks */
          .font-playfair {
            font-family: 'Playfair Display', Georgia, 'Times New Roman', serif !important;
          }
          
          .font-lato {
            font-family: 'Lato', Arial, Helvetica, sans-serif !important;
          }
        </style>
        
        <!--[if mso]>
        <style type="text/css">
          table { border-collapse: collapse; border-spacing: 0; }
          .button { padding: 0 !important; }
          .button a { padding: 16px 32px !important; }
          /* Outlook font handling */
          .font-playfair { font-family: Georgia, 'Times New Roman', serif !important; }
          .font-lato { font-family: Arial, Helvetica, sans-serif !important; }
          /* Outlook dark header fix */
          .gmail-header { background-color: #19363C !important; }
          /* Outlook logo sizing */
          .desktop-logo-img { width: 220px !important; }
        </style>
        <![endif]-->
      </head>
      <body class="body font-lato" style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Lato', Arial, Helvetica, sans-serif;">
        <!-- Gmail background fix -->
        <div class="gmail-background" style="background-color: #f8fafc;">
          <!-- Main Container Table -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; margin: 0; padding: 0;" bgcolor="#f8fafc">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                
                <!-- Email Content Table -->
                <table class="gmail-container gmail-mobile" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; max-width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" bgcolor="#ffffff">
                  
                  <!-- Dark Header Section with Logo and Branding -->
                  <tr>
                    <td class="gmail-header mobile-header-padding" style="background-color: #19363C; padding: 40px 48px; text-align: center;" bgcolor="#19363C" align="center">
                      <!-- Logo -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding-bottom: 12px;">
                            <img src="https://qrawynczvedffcvnympn.supabase.co/storage/v1/object/public/public-assets/Variant5.png" 
                                 alt="Quilltips Logo" 
                                 class="desktop-logo-img mobile-logo-img"
                                 style="display: block; max-width: 100%; width: 220px; height: auto; margin: 0 auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Brand Title -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-playfair desktop-brand-title mobile-brand-title" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #ffffff; text-align: center; margin: 0; padding-bottom: 8px;" align="center">
                            Quilltips
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Tagline -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-lato" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; color: #ffffff; text-align: center; font-weight: 300; opacity: 0.9;" align="center">
                            Connecting authors with their readers
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Main Content Section -->
                  <tr>
                    <td class="gmail-mobile-padding mobile-padding" style="padding: 48px 48px; background-color: #ffffff;" bgcolor="#ffffff">
                      
                      <!-- Header Text -->
                      ${header ? `
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-playfair" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #19363C; text-align: center; line-height: 1.3; margin: 0 0 24px 0; padding-bottom: 24px;" align="center">
                            ${header}
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <!-- Main Message -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-lato desktop-body mobile-body" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; color: #4A5568; text-align: center; line-height: 1.6; margin: 0 0 32px 0; padding-bottom: 32px;" align="center">
                            ${message}
                          </td>
                        </tr>
                      </table>
                      
                      ${additionalContent ? `
                      <!-- Additional Content -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-lato" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; color: #4A5568; line-height: 1.6; margin: 24px 0; padding: 24px 0;">
                            ${additionalContent}
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      ${cta && ctaUrl ? `
                      <!-- CTA Button with Enhanced Styling -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 40px 0;">
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaUrl}" style="height:56px;v-text-anchor:middle;width:240px;" arcsize="28%" stroke="f" fillcolor="#FFD166">
                              <w:anchorlock/>
                              <center class="font-lato" style="color:#19363C;font-family:'Lato', Arial, sans-serif;font-size:16px;font-weight:600;">${cta}</center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <table border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td class="gmail-button" style="background-color: #FFD166; border: none; border-radius: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);" bgcolor="#FFD166">
                                  <a href="${ctaUrl}" 
                                     class="font-lato"
                                     style="display: inline-block; padding: 20px 40px; font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 600; color: #19363C !important; text-decoration: none; min-width: 180px; text-align: center; line-height: 1; border-radius: 16px; transition: all 0.2s ease;"
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
                          <td class="font-lato" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; color: #6B7280; text-align: center; padding: 24px 0;" align="center">
                            or visit <a href="https://quilltips.co" style="color: #19363C !important; text-decoration: none; font-weight: 600;" target="_blank">quilltips.co</a>
                          </td>
                        </tr>
                      </table>
                      
                    </td>
                  </tr>
                  
                  <!-- Enhanced Footer Section -->
                  <tr>
                    <td class="gmail-footer gmail-mobile-padding mobile-padding" style="background-color: #F7FAFC; padding: 32px 48px; text-align: center; border-top: 1px solid #E2E8F0;" bgcolor="#F7FAFC" align="center">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-lato" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 14px; color: #6B7280; line-height: 1.5; text-align: center;" align="center">
                            Questions? Contact us at <a href="mailto:hello@quilltips.co" style="color: #19363C !important; text-decoration: none; font-weight: 600;" target="_blank">hello@quilltips.co</a>
                            <br><br>
                            <span style="font-size: 12px; color: #9CA3AF;">
                              © 2024 Quilltips. All rights reserved.
                            </span>
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
