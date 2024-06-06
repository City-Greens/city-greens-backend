require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const port = 4242;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// const buyerRoutes = require("./DB_Buyer/buyersqlitedb");
// const cartRoutes = require("./DB_Buyer/cartsqlitedb");
// const venderRoutes = require("./DB_Vender/vendersqlitedb");
// const productsRoutes = require("./DB_Vender/productssqlitedb");

// app.use(buyerRoutes);
// app.use(cartRoutes);
// app.use(venderRoutes);
// app.use(productsRoutes);
//

const { app: buyerApp } = require("./DB_Buyer/buyersqlitedb");
const { app: cartApp } = require("./DB_Buyer/cartsqlitedb");
const { app: venderApp } = require("./DB_Vender/vendersqlitedb");
const { app: productsApp } = require("./DB_Vender/productssqlitedb");

app.use(cors());
app.use(buyerApp);
app.use(cartApp);
app.use(venderApp);
app.use(productsApp);

app.use(express.static("dist"));
app.use(express.json());

app.post("/account_link", async (req, res) => {
  try {
    const { account } = req.body;

    const accountLink = await stripe.accountLinks.create({
      account: account,
      return_url: `${req.headers.origin}/profile`,
      refresh_url: `${req.headers.origin}/profile`,
      type: "account_onboarding",
      collection_options: {
        fields: "eventually_due",
      },
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

app.post("/get-products", async (req, res) => {
  const id = req.body.id;

  try {
    // Fetch the products
    const products = await stripe.products.list(
      {
        limit: 100,
      },
      {
        stripeAccount: id,
      },
    );

    // Function to fetch price details for a given price ID
    async function fetchPriceDetails(priceId) {
      const price = await stripe.prices.retrieve(priceId, {
        stripeAccount: id,
      });
      return price;
    }

    // Fetch price details for each product and add formatted price
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const priceDetails = await fetchPriceDetails(product.default_price);
        return {
          ...product,
          price: `${(priceDetails.unit_amount / 100).toFixed(2)} ${priceDetails.currency.toUpperCase()}`,
        };
      }),
    );
    res.send(productsWithPrices);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ error: "Failed to fetch products" });
  }
});

app.post("/get-account", async (req, res) => {
  try {
    const account = await stripe.accounts.retrieve(req.body.accountID);
    res.send(account);
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to retrieve an account",
      error,
    );
    res.status(500);
    res.send({ error: error.message });
  }
});

//BUG: THIS ROUTE IS NOT WORKING
// app.post("/checkout-session", async (req, res) => {
//   const { line_items, customer_id } = req.body;
//   console.log(req.body);
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: line_items.map((item) => ({
//         price: item.price,
//         quantity: item.quantity,
//       })),
//       mode: "payment",
//       success_url: `${req.headers.origin}/cart`,
//       customer: customer_id,
//     });
//     for (const item of line_items) {
//       await stripe.paymentIntents.create({
//         amount: item.amount,
//         currency: "usd",
//         customer: customer_id,
//         payment_method_types: ["card"],
//         transfer_data: {
//           destination: item.vendor_id,
//         },
//       });
//     }
//     res.json({ id: session.id });
//   } catch (error) {
//     console.error("Error creating checkout session:", error);
//     res.status(500).send({ error: "Failed to create checkout session" });
//   }
// });

app.post("/checkout-session", async (req, res) => {
  const { line_items, vendor_id } = req.body;
  console.log(vendor_id);

  //TODO: add customer email to the session
  try {
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: line_items,
        mode: "payment",
        success_url: `${req.headers.origin}/cart`,
      },
      {
        stripeAccount: vendor_id,
      },
    );

    console.log(session);
    res.json(session);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send({ error: error.message });
  }
});

app.get("/all-products", async (req, res) => {
  try {
    const accountsResponse = await stripe.accounts.list({ limit: 100 });
    const accounts = accountsResponse.data;

    const allProducts = await Promise.all(
      accounts.map(async (account) => {
        const productsResponse = await stripe.products.list(
          { limit: 100 },
          { stripeAccount: account.id },
        );

        const productsWithPrices = await Promise.all(
          productsResponse.data.map(async (product) => {
            const priceDetails = await stripe.prices.retrieve(
              product.default_price,
              { stripeAccount: account.id },
            );
            return {
              ...product,
              price: `${(priceDetails.unit_amount / 100).toFixed(2)} ${priceDetails.currency.toUpperCase()}`,
            };
          }),
        );

        return productsWithPrices;
      }),
    );

    const flattenedProducts = allProducts.flat();
    res.json(flattenedProducts);
  } catch (error) {
    console.error("Error fetching products or prices:", error);
    res.status(500).json({ error: "Failed to fetch products or prices" });
  }
});

app.post("/account", async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      business_type: "individual",
      country: "US",
      individual: {
        first_name: accountData.individual.first_name,
        last_name: accountData.individual.lastName,
        address: {
          city: accountData.individual.address.city,
          country: accountData.individual.address.country,
          line1: accountData.individual.address.line1,
          line2: accountData.individual.address.line2,
          postal_code: accountData.individual.address.postalCode,
          state: accountData.individual.address.state, // corrected here
        },
        dob: {
          day: dob[2],
          month: dob[1],
          year: dob[0],
        },
        email: accountData.individual.email,
        phone: accountData.individual.phone,
      },
      business_profile: {
        mcc: "5499",
        name: accountData.business_profile.name,
        product_description: accountData.business_profile.productDescription,
        support_email: accountData.business_profile.support_email,
        support_phone: accountData.business_profile.support_phone,
      },
      tos_acceptance: {
        service_agreement: "full",
      },
    });

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
