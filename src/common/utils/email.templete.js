
export const emailTemplate = (otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 40px 16px;
      font-family: Arial, sans-serif;
      background: #f3f6fb;
      color: #1f2937;
    }

    .card {
      max-width: 380px;
      margin: auto;
      padding: 32px 24px;
      text-align: center;
      background: #fff;
      border-radius: 16px;
    }

    h2 { margin-top: 0; }
    p { color: #6b7280; line-height: 1.5; }

    .code {
      margin: 24px 0;
      color: #2563eb;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 10px;
    }

    .note { font-size: 13px; }
  </style>
</head>
<body>
  <main class="card">
    <h2>Verify Your Account</h2>
    <p>Enter this verification code to continue:</p>
    <div class="code">${otp}</div>
    <p class="note">This code expires in 5 minutes.</p>
  </main>
</body>
</html>`
}