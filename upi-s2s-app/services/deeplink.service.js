export const generatePSPLinks = (upiIntentUrl) => {
  console.log("----- Generating PSP deeplinks -----");
  console.log("Base UPI intent URL:", upiIntentUrl);

  const qp = upiIntentUrl.split("?");
  const params = qp[1]; // everything after ?

  const links = {
    any: `upi://pay?${params}`,
    gpay: `gpay://upi/pay?${params}`,
    phonepe: `phonepe://pay?${params}`,
    paytm: `paytmmp://pay?${params}`,
    bhim: `bhim://upi/pay?${params}`,
  };

  console.log("Deeplinks generated:", links);
  return links;
};
