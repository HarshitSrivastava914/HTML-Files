var razorpay = new Razorpay({
  //key: "rzp_test_qHO5zWaf7OUAPm",
  key: "rzp_live_kZq2u3OSeYjsc1",
});

let countdownTimer;
let countdownInterval;

function startCountdown() {
  // Remove existing timer and cancel button if any
  document.getElementById("countdown-timer")?.remove();
  document.getElementById("cancel-btn")?.remove();
  document.getElementById("cancel-message")?.remove();

  const timerElement = document.createElement("div");
  timerElement.id = "countdown-timer";
  timerElement.style.marginTop = "20px";
  timerElement.style.fontSize = "20px";
  timerElement.style.fontWeight = "bold";
  timerElement.style.color = "#ff0000";

  const cancelBtn = document.createElement("button");
  cancelBtn.id = "cancel-btn";
  cancelBtn.textContent = "Cancel Payment";
  cancelBtn.style.marginLeft = "20px";
  cancelBtn.style.padding = "8px 16px";
  cancelBtn.style.border = "none";
  cancelBtn.style.backgroundColor = "#dc3545";
  cancelBtn.style.color = "#fff";
  cancelBtn.style.borderRadius = "5px";
  cancelBtn.style.cursor = "pointer";

  cancelBtn.onclick = () => {
    clearInterval(countdownInterval);
    timerElement.remove();
    cancelBtn.remove();
    showCancelMessage();
    sendLogToServer("Payment cancelled by user.");
  };

  document.body.appendChild(timerElement);
  document.body.appendChild(cancelBtn);

  let timeLeft = 5 * 60; // 5 minutes
  updateTimerDisplay(timerElement, timeLeft);

  countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      timerElement.textContent = "Payment time expired.";
      cancelBtn.remove();
      sendLogToServer("Payment failed due to timeout.");
      alert("Payment failed: Time limit (5 minutes) exceeded.");
    } else {
      updateTimerDisplay(timerElement, timeLeft);
    }
  }, 1000);
}

function updateTimerDisplay(el, seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  el.textContent = `Time left to complete payment: ${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function showCancelMessage() {
  const cancelMsg = document.createElement("div");
  cancelMsg.id = "cancel-message";
  cancelMsg.style.marginTop = "20px";
  cancelMsg.style.fontSize = "18px";
  cancelMsg.style.color = "#ff0000";
  cancelMsg.style.fontWeight = "bold";
  cancelMsg.textContent = "Payment has been cancelled by the user.";
  document.body.appendChild(cancelMsg);
}

// document.getElementById("pay-btn").addEventListener("click", function () {
//   const os = detectOS();
//   sendLogToServer(`Operating System: ${os}`);

//   const container = document.getElementById("upi-apps-container");
//   container.innerHTML = ""; // Clear previous results

//   // Display appropriate message based on OS
//   if (os === "Android" || os === "iOS") {
//     sendLogToServer(`UPI intent is supported on ${os}.`);
//     razorpay
//       .getSupportedUpiIntentApps()
//       .then(function (apps) {
//         sendLogToServer(
//           "Available UPI Apps from Razorpay: " + JSON.stringify(apps)
//         );

//         if (apps && apps.length > 0) {
//           sendLogToServer(`Total Available UPI Apps on Device: ${apps.length}`);
//           apps.forEach((appCode) => {
//             const appElement = document.createElement("button");
//             appElement.className = "upi-app";
//             appElement.style.cursor = "pointer";
//             appElement.style.margin = "5px";
//             appElement.style.border = "none";
//             appElement.style.background = "transparent"; // Make the button background transparent

//             let appLogoUrl = "";

//             // Define logos for specific apps
//             switch (appCode) {
//               case "gpay":
//                 appLogoUrl =
//                   "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg";
//                 break;
//               case "phonepe":
//                 appLogoUrl =
//                   "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg";
//                 break;
//               case "paytm":
//                 appLogoUrl =
//                   "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg";
//                 break;
//               default:
//                 appLogoUrl =
//                   "https://upload.wikimedia.org/wikipedia/commons/6/6f/UPI_logo.svg"; // Placeholder for "Any"
//             }

//             // Create button with only logo and no text
//             const appLogo = document.createElement("img");
//             appLogo.src = appLogoUrl;
//             appLogo.alt = `${appCode.toUpperCase()} Logo`; // Provide alt text for accessibility
//             appLogo.style.width = "50px"; // Set width for consistency
//             appLogo.style.height = "50px"; // Set height for consistency
//             appElement.appendChild(appLogo);

//             appElement.addEventListener("click", function () {
//               sendLogToServer(`Clicked on ${appCode}`);
//               checkAndInitiatePaymentForApp(appCode);
//             });

//             container.appendChild(appElement);
//           });
//         } else {
//           container.innerText = "No UPI intent apps available";
//           sendLogToServer("No UPI apps available on this device.");
//         }
//       })
//       .catch(function (error) {
//         sendLogToServer("Error fetching UPI apps: " + error);
//       });
//   } else if (os === "macOS" || os === "Windows") {
//     sendLogToServer(`${os} does not support UPI Intent functionality.`);
//     alert(`${os} does not support UPI Intent functionality.`);
//   } else {
//     sendLogToServer(`UPI intent functionality is not supported on ${os}.`);
//     alert(`UPI intent functionality is not supported on ${os}.`);
//   }
// });

document.getElementById("pay-btn").addEventListener("click", function () {
  const os = detectOS();
  sendLogToServer(`Operating System: ${os}`);

  const container = document.getElementById("upi-apps-container");
  container.innerHTML = ""; // Clear previous results

  // Display appropriate message based on OS
  if (os === "Android" || os === "iOS") {
    sendLogToServer(`UPI intent is supported on ${os}.`);
    razorpay
      .getSupportedUpiIntentApps()
      .then(function (apps) {
        sendLogToServer(
          "Available UPI Apps from Razorpay: " + JSON.stringify(apps)
        );

        if (apps && apps.length > 0) {
          sendLogToServer(`Total Available UPI Apps on Device: ${apps.length}`);
          apps.forEach((appCode) => {
            const appElement = document.createElement("button");
            appElement.className = "upi-app";
            appElement.style.cursor = "pointer";
            appElement.style.margin = "5px";
            appElement.style.border = "none";
            appElement.style.background = "transparent"; // Make the button background transparent

            let appLogoUrl = "";

            // Define logos for specific apps
            switch (appCode) {
              case "gpay":
                appLogoUrl =
                  "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg";
                break;
              case "phonepe":
                appLogoUrl =
                  "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg";
                break;
              case "paytm":
                appLogoUrl =
                  "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg";
                break;
              case "cred":
                // Cred official logo from Wikimedia
                appLogoUrl = "logos/cred.png";
                break;
              case "bhim":
                appLogoUrl = "logos/bhim.png"; // Use your real BHIM logo PNG file here
                break;
              case "popclubapp":
                appLogoUrl = "logos/popclubapp.png"; // Use the real Popclubapp PNG logo here
                break;
              case "mobikwik":
                appLogoUrl = "logos/mobikwik.png";
                break;
              case "super_money":
                // No official Wikimedia logo, fallback to generic UPI logo
                appLogoUrl =
                  "https://upload.wikimedia.org/wikipedia/commons/6/6e/SuperMoney_Logo.png";
                break;
              case "moneyview":
                // No official Wikimedia logo, fallback to generic UPI logo
                appLogoUrl = "logos/moneyview.png";
                break;
              case "icici":
                // No official Wikimedia logo, fallback to generic UPI logo
                appLogoUrl = "logos/icici.png";
                break;
              case "navi":
                // No official Wikimedia logo, fallback to generic UPI logo
                appLogoUrl =
                  "https://upload.wikimedia.org/wikipedia/commons/f/f7/Navi_New_Logo.png";
                break;
              case "payzapp":
                // No official Wikimedia logo, fallback to generic UPI logo
                appLogoUrl = "logos/payzapp.png";
                break;
              default:
                appLogoUrl =
                  "https://upload.wikimedia.org/wikipedia/commons/6/6f/UPI_logo.svg"; // Placeholder for "Any"
            }

            // Create button with only logo and no text
            const appLogo = document.createElement("img");
            appLogo.src = appLogoUrl;
            appLogo.alt = `${appCode.toUpperCase()} Logo`; // Provide alt text for accessibility
            appLogo.style.width = "50px"; // Set width for consistency
            appLogo.style.height = "50px"; // Set height for consistency
            appElement.appendChild(appLogo);

            appElement.addEventListener("click", function () {
              sendLogToServer(`Clicked on ${appCode}`);
              checkAndInitiatePaymentForApp(appCode);
            });

            container.appendChild(appElement);
          });
        } else {
          container.innerText = "No UPI intent apps available";
          sendLogToServer("No UPI apps available on this device.");
        }
      })
      .catch(function (error) {
        sendLogToServer("Error fetching UPI apps: " + error);
      });
  } else if (os === "macOS" || os === "Windows") {
    sendLogToServer(`${os} does not support UPI Intent functionality.`);
    alert(`${os} does not support UPI Intent functionality.`);
  } else {
    sendLogToServer(`UPI intent functionality is not supported on ${os}.`);
    alert(`UPI intent functionality is not supported on ${os}.`);
  }
});

// Detect the operating system
function detectOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) {
    return "Android";
  } else if (/iphone|ipod/.test(userAgent)) {
    return "iOS";
  } else if (/macintosh|mac os x/.test(userAgent)) {
    return "macOS";
  } else if (/windows/.test(userAgent)) {
    return "Windows";
  } else {
    return "Unknown OS";
  }
}

// Check if the device is mobile web (mweb)
function isMobileWeb() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /mobile/.test(userAgent) && /iphone|ipod|android/.test(userAgent);
}

// Proceed with payment directly if app is available
// function checkAndInitiatePaymentForApp(appCode) {
//   sendLogToServer(`Proceeding with payment using ${appCode.toUpperCase()}...`);
//   initiatePayment(appCode); // Directly initiate payment without redundant availability check
// }
function checkAndInitiatePaymentForApp(appCode) {
  sendLogToServer(`Proceeding with payment using ${appCode.toUpperCase()}...`);
  startCountdown(); // ⏱️ Start 5-minute timer
  initiatePayment(appCode); // 🔁 Initiate payment
}

// Initiate payment
function initiatePayment(appCode) {
  const paymentData = {
    amount: 100,
    method: "upi",
    contact: "8788128004",
    email: "gaurav.kumar@example.com",
    // callback_url: "https://www.google.com/",
    // redirect: "true",
  };

  sendLogToServer(`Initiating payment using ${appCode.toUpperCase()}...`);
  razorpay.createPayment(paymentData, { app: appCode });

  razorpay.on("payment.success", function (response) {
    sendLogToServer("Payment Successful!");
    sendLogToServer("Payment ID: " + response.razorpay_payment_id);
    sendLogToServer("Order ID: " + response.razorpay_order_id);
  });

  razorpay.on("payment.error", function (error) {
    sendLogToServer("PSP not supported");
    sendLogToServer("Payment Failed: " + error.error.description);
  });
}

// Send logs to the server
function sendLogToServer(message) {
  fetch("/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ log: message }),
  }).catch((error) => console.error("Error sending log:", error));
}
