const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const { User } = require("../models/user");
const { Product } = require("../models/product");
const orderController = require("./orders");

exports.checkout = async function (req, res) {
    const accessToken = req.headers['authorization'].replace('Bearer ', '').trim();
    const tokenData = jwt.decode(accessToken);
    try {
        const user = User.findById(tokenData.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        for (const cartItem of req.body.cartItems) {
            const product = await Product.findById(cartItem.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${cartItem.name} not found` });
            } else if (!cartItem.reserved && product.countInStock < cartItem.quantity) {
                const message = { message: `${product.name}\n order for ${cartItem.quantity}, but ${product.countInStock} left in stock` };
                return res.status(400).json({ message });
            }
        }
        let customerId;
        if (user.paymentCustomerId) {
            customerId = user.paymentCustomerId;
        } else {
            const customer = await stripe.customers.create({
                metadata: { userId: tokenData.id },
            });
            customerId = customer.id;
        }
        const session = await stripe.checkout.sessions.create({
            line_items: req.body.cartItems.map((item) => {
                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: item.name,
                            image: item.images,
                            metadata: {
                                productId: item.productId,
                                cartProductId: item.cartProductId,
                                selectedSize: item.selectedSize ?? undefined,
                                selectedColour: item.selectedColour ?? undefined,
                            },
                        },
                        unit_amount: (item.productPrice * 100).toFixed(0),
                    },
                    quantity: item.quantity,
                };
            }),
            paymentOption: {
                card: { setup_future_usage: "on_session" },
            },
            billing_address_collection: "auto",
            shipping_address_collection: {
                allowed_countries: [
                    "AC",
                    "AD",
                    "AE",
                    "AF",
                    "AG",
                    "AI",
                    "AL",
                    "AM",
                    "AO",
                    "AQ",
                    "AR",
                    "AS",
                    "AT",
                    "AU",
                    "AW",
                    "AX",
                    "AZ",
                    "BA",
                    "BB",
                    "BD",
                    "BE",
                    "BF",
                    "BG",
                    "BH",
                    "BI",
                    "BJ",
                    "BL",
                    "BM",
                    "BN",
                    "BO",
                    "BQ",
                    "BR",
                    "BS",
                    "BT",
                    "BV",
                    "BW",
                    "BY",
                    "BZ",
                    "CA",
                    "CC",
                    "CD",
                    "CF",
                    "CG",
                    "CH",
                    "CI",
                    "CK",
                    "CL",
                    "CM",
                    "CN",
                    "CO",
                    "CR",
                    "CU",
                    "CV",
                    "CW",
                    "CX",
                    "CY",
                    "CZ",
                    "DE",
                    "DJ",
                    "DK",
                    "DM",
                    "DO",
                    "DZ",
                    "EC",
                    "EE",
                    "EG",
                    "EH",
                    "ER",
                    "ES",
                    "ET",
                    "FI",
                    "FJ",
                    "FK",
                    "FM",
                    "FO",
                    "FR",
                    "GA",
                    "GB",
                    "GD",
                    "GE",
                    "GF",
                    "GG",
                    "GH",
                    "GI",
                    "GL",
                    "GM",
                    "GN",
                    "GP",
                    "GQ",
                    "GR",
                    "GS",
                    "GT",
                    "GU",
                    "GW",
                    "GY",
                    "HK",
                    "HM",
                    "HN",
                    "HR",
                    "HT",
                    "HU",
                    "ID",
                    "IE",
                    "IL",
                    "IM",
                    "IN",
                    "IQ",
                    "IR",
                    "IS",
                    "IT",
                    "JE",
                    "JM",
                    "JO",
                    "JP",
                    "KE",
                    "KG",
                    "KH",
                    "KI",
                    "KM",
                    "KN",
                    "KP",
                    "KR",
                    "KW",
                    "KY",
                    "KZ",
                    "LA",
                    "LB",
                    "LC",
                    "LI",
                    "LK",
                    "LR",
                    "LS",
                    "LT",
                    "LU",
                    "LV",
                    "LY",
                    "MA",
                    "MC",
                    "MD",
                    "ME",
                    "MF",
                    "MG",
                    "MH",
                    "MK",
                    "ML",
                    "MM",
                    "MN",
                    "MO",
                    "MP",
                    "MQ",
                    "MR",
                    "MS",
                    "MT",
                    "MU",
                    "MV",
                    "MW",
                    "MX",
                    "MY",
                    "MZ",
                    "NA",
                    "NC",
                    "NE",
                    "NF",
                    "NG",
                    "NI",
                    "NL",
                    "NO",
                    "NP",
                    "NR",
                    "NU",
                    "NZ",
                    "OM",
                    "PA",
                    "PE",
                    "PF",
                    "PG",
                    "PH",
                    "PK",
                    "PL",
                    "PM",
                    "PN",
                    "PR",
                    "PS",
                    "PT",
                    "PW",
                    "PY",
                    "QA",
                    "RE",
                    "RO",
                    "RS",
                    "RU",
                    "RW",
                    "SA",
                    "SB",
                    "SC",
                    "SD",
                    "SE",
                    "SG",
                    "SH",
                    "SI",
                    "SJ",
                    "SK",
                    "SL",
                    "SM",
                    "SN",
                    "SO",
                    "SR",
                    "SS",
                    "ST",
                    "SV",
                    "SX",
                    "SY",
                    "SZ",
                    "TC",
                    "TD",
                    "TF",
                    "TG",
                    "TH",
                    "TJ",
                    "TK",
                    "TL",
                    "TM",
                    "TN",
                    "TO",
                    "TR",
                    "TT",
                    "TV",
                    "TW",
                    "TZ",
                    "UA",
                    "UG",
                    "UM",
                    "US",
                    "UY",
                    "UZ",
                    "VA",
                    "VC",
                    "VE",
                    "VG",
                    "VI",
                    "VN",
                    "VU",
                    "WF",
                    "WS",
                    "YE",
                    "YT",
                    "ZA",
                    "ZM",
                    "ZW",
                    "ZZ",
                ],
            },
            phone_number_collection: { enabled: treu },
            customer: customerId,
            mode: "payment",
            success_url: `https://dbesttech.biz/payment-success`,
            cancel_url: `https://dbesttech.biz/cart`,
        });
        res.status(201).json({ url: session.url });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ type: error.name, message: error.message }] });
    }
}

exports.webhook = async function (req, res) {

    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
        console.error("Webhook Error: ", error.message);
        return res.status(400).json(`WEBHOOK_ERROR ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        stripe.customers.retrieve(session.customer).then(async (customer) => {
            const lineItems = await stripe.checkout.sessions.listLineItems(
                session.id,
                { expand: ["data.price.product"] }
            );


            const orderItems = lineItems.data.map((item) => {
                return {
                    quantity: item.quantity,
                    product: item.price.product.metadata.productId,
                    cartProductId: item.price.product.metadata.cartProductId,
                    productPrice: item.price.unit_amount / 100,
                    productName: item.price.product.name,
                    productImage: item.price.product.images[0],
                    selectedSize: item.price.product.metadata.selectedSize ?? undefined,
                    selectedColour: item.price.product.metadata.selectedColour ?? undefined
                };
            });

            const address = session.shipping_details?.address ?? session.customer_details.address;
            const order = await orderController.addOrder({
                orderItems: orderItems,
                user: customer.metadata.userId,
                shippingAddress: address.line1 === 'N/A' ? address.line2 : address.line1,
                city: address.city,
                postalCode: address.postal_code,
                country: address.country,
                phone: session.customer_details.phone,
                totalPrice: session.amount_total / 100,
                user: customer.metadata.userId,
                paymentId: session.payment_intent,
            });

            let user = await User.findById(customer.metadata.userId);
            if (user && !user.paymentCustomerId) {
                user = await User.findByIdAndUpdate(
                    customer.metadata.userId,
                    { paymentCustomerId: session.customer },
                    { new: true }
                );
            }

            const leanOrder = order.toObject();
            leanOrder["orderItems"] = orderItems;

            ///TODO: send email to user
            ///TODO: send email to admin
        }).catch((error) => console.error('WEB HOOK ERROR CATCHER', error.message)
        );

    } else {
        console.log(`Unhandled event type ${event.type}`);
    }

    res.send().end();
}