const express = require("express");
const axios = require("axios");
const router = express.Router();

/**
 * UI Page
 */
router.get("/ui/mandate-authoriser", (req, res) => {
  res.render("mandate-authoriser", {
    response: null,
    baseUrl: "https://demo.stage.curlec.com/curlec-services/mandate",
    body: {
      referenceNumber: "test10",
      name: "test test",
      emailAddress: "test@gmail.com",
      amount: "1",
      frequency: "DAILY",
      maximumFrequency: "99",
      purposeOfPayment: "test",
      businessModel: "B2C",
      bankId: "19",
      merchantId: "214267300",
      employeeId: "21426735",
      method: "03",
    },
  });
});

/**
 * Backend API Call
 */
router.post("/api/mandate-authoriser", async (req, res) => {
  const { baseUrl, ...params } = req.body;

  try {
    const apiResponse = await axios.post(
      baseUrl,
      new URLSearchParams(params).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.render("mandate-authoriser", {
      response: apiResponse.data,
      baseUrl,
      body: params,
    });
  } catch (err) {
    res.render("mandate-authoriser", {
      response: {
        error: err.response?.data || err.message,
      },
      baseUrl,
      body: params,
    });
  }
});

module.exports = router;
