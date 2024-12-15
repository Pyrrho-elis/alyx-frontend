// This script will be injected into ye-buna's success page
(function() {
    // Get the original token from localStorage
    const token = localStorage.getItem('payment_token');
    if (!token) return;

    // Get the verification parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const vert = urlParams.get('vert');
    const umain = urlParams.get('umain');

    if (!vert || !umain) return;

    // Notify our backend about the successful payment
    fetch('https://YOUR_DOMAIN/api/verify-payment-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: token,
            action: 'subscribe',
            response: { 
                status: 1,
                vert: vert,
                umain: umain
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Subscription activated successfully') {
            // Clear the payment token
            localStorage.removeItem('payment_token');
            // Redirect to our success page
            window.location.href = 'https://YOUR_DOMAIN/payment-success';
        }
    })
    .catch(error => {
        console.error('Payment verification error:', error);
        window.location.href = 'https://YOUR_DOMAIN/payment-failed';
    });
})();
