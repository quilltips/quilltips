
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
          u + .body .gmail-button { background-color: #FFD166 !important; }
          u + .body .gmail-footer { background-color: #F7FAFC !important; }
          
          /* Gmail Dark Mode fixes */
          [data-ogsc] .gmail-container { background-color: #ffffff !important; }
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
            .mobile-logo-size { width: 60px !important; height: 60px !important; }
            .mobile-title { font-size: 24px !important; line-height: 1.2 !important; }
            .mobile-subtitle { font-size: 16px !important; }
            .mobile-header { font-size: 20px !important; }
            .mobile-body { font-size: 15px !important; }
            .mobile-padding { padding: 16px !important; }
          }
          
          @media screen and (min-width: 601px) {
            /* Desktop font sizing */
            .desktop-logo-size { width: 80px !important; height: 80px !important; }
            .desktop-title { font-size: 32px !important; line-height: 1.2 !important; }
            .desktop-subtitle { font-size: 18px !important; }
            .desktop-header { font-size: 28px !important; }
            .desktop-body { font-size: 16px !important; }
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
                <table class="gmail-container gmail-mobile" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; max-width: 600px; border-radius: 12px;" bgcolor="#ffffff">
                  
                  <!-- Header Section with Horizontal Layout -->
                  <tr>
                    <td class="mobile-padding" style="padding: 40px 48px; text-align: left;" align="left">
                      
                      <!-- Horizontal Logo and Text Layout -->
                      <table border="0" cellspacing="0" cellpadding="0" width="100%">
                        <tr>
                          <td class="mobile-stack" style="vertical-align: middle; width: 100px;" valign="middle">
                            <div class="mobile-logo">
                              <img src="https://qrawynczvedffcvnympn.supabase.co/storage/v1/object/public/public-assets/Variant3.png" 
                                   alt="Quilltips Logo" 
                                   class="desktop-logo-size mobile-logo-size"
                                   width="80" 
                                   height="80" 
                                   style="display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; width: 80px; height: 80px;">
                            </div>
                          </td>
                          <td class="mobile-stack mobile-text" style="vertical-align: middle; padding-left: 20px;" valign="middle">
                            <table border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td class="font-playfair desktop-title mobile-title" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 32px; font-weight: 600; color: #19363C; line-height: 1.2; margin: 0;" align="left">
                                  Quilltips
                                </td>
                              </tr>
                              <tr>
                                <td class="font-lato desktop-subtitle mobile-subtitle" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 18px; color: #6B7280; margin: 0; padding-top: 4px; font-weight: 400;" align="left">
                                  Helping authors get paid
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                    </td>
                  </tr>
                  
                  <!-- Content Section -->
                  <tr>
                    <td class="gmail-mobile-padding mobile-padding" style="padding: 0 48px 48px 48px; background-color: #ffffff;" bgcolor="#ffffff">
                      
                      <!-- Content Header -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-playfair desktop-header mobile-header" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #19363C; text-align: center; line-height: 1.3; margin: 0 0 24px 0; padding-bottom: 24px;" align="center">
                            ${header}
                          </td>
                        </tr>
                      </table>
                      
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
                      <!-- CTA Button with Rounded Corners -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 40px 0;">
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaUrl}" style="height:52px;v-text-anchor:middle;width:220px;" arcsize="25%" stroke="f" fillcolor="#FFD166">
                              <w:anchorlock/>
                              <center class="font-lato" style="color:#19363C;font-family:'Lato', Arial, sans-serif;font-size:16px;font-weight:600;">${cta}</center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <table border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td class="gmail-button" style="background-color: #FFD166; border: none; border-radius: 16px;" bgcolor="#FFD166">
                                  <a href="${ctaUrl}" 
                                     class="font-lato"
                                     style="display: inline-block; padding: 18px 36px; font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 600; color: #19363C !important; text-decoration: none; min-width: 160px; text-align: center; line-height: 1; border-radius: 16px;"
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
                          <td class="font-lato" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; color: #4A5568; text-align: center; padding: 24px 0;" align="center">
                            or visit <a href="https://quilltips.co" style="color: #19363C !important; text-decoration: none; font-weight: 600;" target="_blank">quilltips.co</a>
                          </td>
                        </tr>
                      </table>
                      
                    </td>
                  </tr>
                  
                  <!-- Footer Section -->
                  <tr>
                    <td class="gmail-footer gmail-mobile-padding mobile-padding" style="background-color: #F7FAFC; padding: 32px 48px; text-align: center; border-top: 1px solid #E2E8F0; border-radius: 0 0 12px 12px;" bgcolor="#F7FAFC" align="center">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-lato" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 14px; color: #6B7280; line-height: 1.5; text-align: center;" align="center">
                            If you have any questions, reply to this email<br>
                            or contact us at <a href="mailto:hello@quilltips.co" style="color: #19363C !important; text-decoration: none; font-weight: 600;" target="_blank">hello@quilltips.co</a>
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
