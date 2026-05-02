import express from "express";

const app = express();
app.use(express.json({ limit: "5mb" }));

const P4ME_URL = process.env.P4ME_URL || "https://promote4.me";
const P4ME_KEY = process.env.P4ME_KEY || "";

app.post("/webhooks/orders-create", async (req, res) => {
  const order = req.body || {};
  const shipping = order.shipping_address || {};
  const payload = {
    source: "Shopify",
    type: "Package Delivery",
    title: "Shopify Order " + (order.name || order.id || ""),
    order_number: String(order.name || order.id || ""),
    customer_name: [shipping.first_name, shipping.last_name].filter(Boolean).join(" "),
    customer_email: order.email || "",
    customer_phone: shipping.phone || "",
    address: [shipping.address1, shipping.city, shipping.province, shipping.zip].filter(Boolean).join(", "),
    status: "Assigned",
    instructions: "Imported from Shopify app webhook. Upload proof before completion."
  };

  const response = await fetch(P4ME_URL.replace(/\/$/, "") + "/api/external/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-P4ME-Key": P4ME_KEY },
    body: JSON.stringify(payload)
  });

  res.status(response.ok ? 200 : 500).send(await response.text());
});

app.get("/", (req, res) => res.send("Promote4.me Shopify App Starter is running."));
app.listen(process.env.PORT || 3000, () => console.log("Promote4.me Shopify app starter listening."));
