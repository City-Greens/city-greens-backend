const cors = require("cors");
const express = require("express");
const app = express();
const port = 4242;
const buyerRoutes = require('./Database/buyersqlitedb');
const venderRoutes = require('./Database/vendersqlitedb');

app.use(cors());
app.use(buyerRoutes);
app.use(venderRoutes);

  const stripe = require("stripe")(
  // This is your test secret API key.
  "sk_test_51PNQggKVH5eLCsVpBp7cYHZSEif0JLfzFGSVlELXnMTWrnZLpoTN4UBBZRWNLJQujcA6AsRL2SYqkkDoohZyGpMf00sGpJZdzK",
  {
    apiVersion: "2023-10-16",
  },
);

app.use(express.static("dist"));
app.use(express.json());

app.post("/account_link", async (req, res) => {
  console.log("req.body", req.body);
  try {
    const { account } = req.body;

    const accountLink = await stripe.accountLinks.create({
      account: account,
      return_url: `${req.headers.origin}/return/${account}`,
      refresh_url: `${req.headers.origin}/refresh/${account}`,
      type: "account_onboarding",
    });

    res.json(accountLink);
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account link:",
      error,
    );
    res.status(500);
    res.send({ error: error.message });
  }
});

app.post("/account", async (req, res) => {
  try {
    const account = await stripe.accounts.create({});

    res.json({
      account: account.id,
    });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account",
      error,
    );
    res.status(500);
    res.send({ error: error.message });
  }
});

app.get("/*", (_req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
});

app.listen(port, () =>
  console.log(
    "Node server listening on port 4242! Visit http://localhost:4242 in your browser.",
  ),
);
