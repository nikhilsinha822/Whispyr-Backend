const verificationTemplate = (link) => {
    return `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification</title>
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #f0f2f5;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                padding: 2.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 600px;
                width: 100%;
            }
            h1 {
                color: #1a3b5d;
                margin-bottom: 1.5rem;
                font-size: clamp(1.5rem, 5vw, 2rem);
            }
            .logo {
                width: clamp(60px, 15vw, 80px);
                height: auto;
                margin-bottom: 1rem;
            }
            .message {
                color: #4a4a4a;
                margin-bottom: 1.5rem;
                font-size: clamp(0.9rem, 2.5vw, 1rem);
            }
            .btn {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                margin-bottom: 10px;
                padding: 0.75rem 1.5rem;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                transition: background-color 0.3s, transform 0.2s;
                font-size: clamp(0.9rem, 2.5vw, 1rem);
            }
            .btn:hover {
                background-color: #0056b3;
                transform: translateY(-2px);
            }
            .footer {
                margin-top: 2rem;
                font-size: clamp(0.8rem, 2vw, 0.9rem);
                color: #6c757d;
            }
            @media (max-width: 480px) {
                .container {
                    padding: 1.5rem;
                }
                .btn {
                    display: block;
                    width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="/api/placeholder/80/80" alt="Company Logo" class="logo">
            <h1>Verify Your Account</h1>
            <p class="message">Thank you for signing up! To complete your account setup and ensure the security of your information, please click the button below:</p>
            <a href="${link}" class="btn">Verify Account</a>
            <p class="message">This link will expire in 5 mins for security reasons. If you didn't request this verification, please disregard this email or contact our support team.</p>
            <div class="footer">
                <p>© 2024 Your Company Name. All rights reserved.</p>
                <p>If you have any questions, please contact our support at support@yourcompany.com</p>
            </div>
        </div>
    </body>
    </html>`
}

module.exports = verificationTemplate