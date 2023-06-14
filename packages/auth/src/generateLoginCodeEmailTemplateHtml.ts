export function generateLoginCodeEmailTemplateHtml(
  accessCode: string,
  expiresIn: number,
  attemptId: string,
  attemptDateString: string,
) {
  const PORT = process.env.PORT || "4000";
  const hostAddress =
    process.env.NODE_ENV !== "production"
      ? `http://localhost:${PORT}`
      : "https://pingrents-api.pingstash.com";

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <style>
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          mso-font-alt: 'Verdana';
          src: url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19) format('woff2');
        }
  
        * {
          font-family: 'Inter', Verdana;
        }
      </style>
      <style>
        p,
        h1,
        h2,
        h3,
        blockquote,
        img,
        ul,
        ol,
        li {
          margin-top: 0;
          margin-bottom: 0;
        }
      </style>
    </head>
    <body>
      <table align="center" width="100%" role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin-left:auto;margin-right:auto;padding:0.5rem">
        <tbody>
          <tr style="width:100%">
            <td>
              <p style="font-size:15px;line-height:24px;margin:16px 0;margin-bottom:20px;margin-top:0px;color:rgb(55,65,81);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-align:left">&nbsp;</p>
              <img alt="" src="${hostAddress}/public/assets/app-icon.webp" style="display:block;outline:none;border:none;text-decoration:none;margin-top:0px;height:40px;margin-bottom:0px">
              <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="height:64px">
                <tbody>
                  <tr>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              <h3 style="font-size:24px;font-weight:600;line-height:38px;margin-bottom:12px;color:rgb(17,24,39);text-align:left">Login Access Code</h3>
              <p style="font-size:15px;line-height:24px;margin:16px 0;margin-bottom:20px;margin-top:0px;color:rgb(55,65,81);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-align:left">Use the login access code below to sign in to your account. If you did not request an access code, you can safely ignore this email.</p>
              <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;margin-top:0px">
                <tbody>
                  <tr>
                    <td>
                      <span style="max-width:100%;font-size:2rem;font-weight:semibold;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:7.5px;">${accessCode}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style="font-size:15px;line-height:24px;margin:16px 0;margin-bottom:20px;margin-top:0px;color:rgb(55,65,81);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-align:left">Just so you know, the access code expires in <strong>${expiresIn.toString()} minutes</strong>.</p>
              <p style="font-size:15px;line-height:24px;margin:16px 0;margin-bottom:20px;margin-top:0px;color:rgb(55,65,81);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-align:left">&nbsp;</p>
              <p style="font-size:15px;line-height:24px;margin:16px 0;margin-bottom:20px;margin-top:0px;color:rgb(55,65,81);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-align:left">Attempted at: ${attemptDateString}<br />Attempt ID: ${attemptId}</p>
              <hr style="width:100%;border:none;border-top:1px solid #eaeaea;margin-top:32px;margin-bottom:32px">
              <p style="font-size:13px;line-height:24px;margin:16px 0;margin-bottom:20px;margin-top:0px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:rgb(100,116,139);text-align:left">© 2023 PingRents</p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
  `;
}
