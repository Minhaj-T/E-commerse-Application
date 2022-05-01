var express = require("express");
const session = require("express-session");
const async = require("hbs/lib/async");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");
const adminHelpers = require("../helpers/admin-helpers");
const { route } = require("./admin");
const { response } = require("express");
var paypal = require("paypal-rest-sdk");
const createReferal = require("referral-code-generator");
var nodemailer = require("nodemailer");
const emailHelpers = require("../helpers/email-helpers");

//Twilio Setups
const accountSID = process.env.accountSID;
const authToken = process.env.authToken;
const serviceSID = process.env.serviceSID;
const client = require("twilio")(accountSID, authToken);

//Paypal Configuration
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.CLIENT,
  client_secret: process.env.SECRET,
});

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  var user1 = req.session.user;
  let cartCount = 0;
  let ordersCount = 0;
  let todayDate = new Date().toISOString().slice(0, 10);
  console.log(todayDate);
  adminHelpers.startProductOffer(todayDate).then(() => {
    console.log("the prosuct offer called");
  });
  // adminHelpers.startCategoryOffer(todayDate).then(()=>{
  //   console.log("the category offer callled");
  // })
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
  }
  let catOff = await adminHelpers.startCategoryOffer(todayDate);
  let startCoupon = await adminHelpers.startCouponOffers(todayDate);
  let homeCategory = await userHelpers.getHomeCategories();
  let banners = await userHelpers.getAllBanners();
  productHelpers.getAllProduct().then((product) => {
    res.render("user/view-product", {
      product,
      user: true,
      user1,
      homeCategory,
      cartCount,
      ordersCount,
      userPage: true,
      banners,
    });
  });
});

router.get("/login", async (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    let homeCategory = await userHelpers.getHomeCategories();
    let cartCount = 0;
    res.render("user/login", {
      loginErr: req.session.loginErr,
      blockErr: req.session.blockErr,
      user: true,
      homeCategory,
      cartCount,
      userPage: true
    });
    req.session.loginErr = false;
    req.session.blockErr = false;
  }
  res.render("user/login", { user: true });
});

router.get("/signup", async (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    let refer = (await req.query.refer) ? req.query.refer : null;
    console.log("this is the refer", refer);
    let homeCategory = await userHelpers.getHomeCategories();
    let cartCount = 0;

    res.render("user/signup", {
      user: true,
      homeCategory,
      cartCount,
      usererr: req.session.usererr,
      refer,
      userPage: true
    });
    req.session.usererr = false;
  }
});

router.post("/signup", (req, res) => {
  console.log("this is the submin post requst ", req.body);
  let refer = createReferal.alphaNumeric("uppercase", 2, 3);
  req.body.refer = refer;
  if (req.body.referedBy != "") {
    userHelpers
      .checkReferal(req.body.referedBy)
      .then((data) => {
        req.body.referedBy = data[0]._id;
        req.body.wallet = 100;
        userHelpers.doSignin(req.body).then((response) => {
          req.session.loggedIn = true;
          req.session.user = response.user;
          res.redirect("/");
        });
      })
      .catch(() => {
        req.session.referErr = "Sorry No such Code Exists";
        res.redirect("/signup");
      });
  } else {
    userHelpers.doSignin(req.body).then((response) => {
      if (response.usererr) {
        req.session.usererr = true;
        res.redirect("/signup");
      } else {
        req.session.loggedIn = true;
        req.session.user = response.user;
        res.redirect("/");
      }
    });
  }
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      let status = response.user.status;
      console.log(status);
      if (status) {
        req.session.loggedIn = true;
        req.session.user = response.user;

        res.redirect("/");
      } else {
        req.session.blockErr = true;
        req.session.user = null;
        req.session.userLoggedIn = false;
        res.redirect("/login");
      }
    } else {
      req.session.loginErr = true;
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

router.get("/cart", verifyLogin, async (req, res) => {
  var user1 = req.session.user;
  let homeCategory = await userHelpers.getHomeCategories();
  let cartCount = 0;
  let ordersCount = 0;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
  }
  let products = await userHelpers.getCartProducts(user1._id);
  let total = 0;
  if (products.length > 0) {
    total = await userHelpers.getTotalAmount(user1._id);
  }
  if (cartCount > 0) {
    res.render("user/cart", {
      user2: req.session.user._id,
      user1,
      user: true,
      products,
      cartCount,
      total,
      homeCategory,
      ordersCount,
      userPage: true,
    });
  } else {
    res.render("user/empty-cart", {
      homeCategory,
      user: true,
      user1,
      ordersCount,
      cartCount,
      userPage: true,
    });
  }
});

router.get("/add-to-cart/:id", (req, res) => {
  console.log("api call");
  let user = req.session.user._id;
  let product = req.params.id;
  userHelpers.addToCart(product, user).then(() => {
    // res.redirect('/')
    res.json({ status: true });
  });
});

//change the product quantity through the ajax
router.post("/change-product-quantity", (req, res) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});

//remove the category through the ajax
router.post("/delete-cart-product", (req, res) => {
  let cartId = req.body.cart;
  let proId = req.body.product;
  userHelpers.deleteCartProduct(cartId, proId).then((response) => {
    res.json(response);
  });
});

router.get("/categoryProducts/:category", async (req, res) => {
  let category = req.params.category;
  var user1 = req.session.user;
  let cartCount = 0;
  let ordersCount = 0;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
  }
  let homeCategory = await userHelpers.getHomeCategories();
  let product = await userHelpers.getProductsByCateogry(category);

  res.render("user/category-pro", {
    product,
    user1,
    category,
    homeCategory,
    cartCount,
    ordersCount,
    userPage: true
  });
});

//phone number entering form
router.get("/loginOtp", async (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  }
  let homeCategory = await userHelpers.getHomeCategories();
  let cartCount = 0;

  res.render("user/user-mobile", {
    user: true,
    homeCategory,
    blockErr: req.session.blockErr,
    noUser: req.session.noUserMobile,
    cartCount,
    userPage: true
  });
  req.session.noUserMobile = false;
  req.session.blockErr = false;
});

router.post("/loginOtp", (req, res) => {
  let No = req.body.mobileNo;
  let no = `+91${No}`;
  console.log(no);
  userHelpers.getUserdetails(no).then((user) => {
    console.log(user);
    if (user) {
      if (user.status) {
        client.verify
          .services(serviceSID)
          .verifications.create({
            to: `+91${No}`,
            channel: "sms",
          })
          .then((resp) => {
            req.session.number = resp.to;
            console.log(resp);
            res.redirect("/login/otp");
          });
      } else {
        req.session.blockErr = true;
        res.redirect("/loginOtp");
      }
    } else {
      req.session.noUserMobile = true;
      res.redirect("/loginOtp");
    }
  });
});

//Otp Entering form
router.get("/login/otp", async (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  }
  let cartCount = 0;
  let homeCategory = await userHelpers.getHomeCategories();

  res.render("user/user-otp", {
    otp: true,
    homeCategory,
    invalidOtp: req.session.invalidOtp,
    cartCount,
    userPage: true
  });
  req.session.invalidOtp = false;
});

router.post("/login/otp", (req, res) => {
  let otp = req.body.otp;
  console.log(otp);
  number = req.session.number;
  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: number,
      code: otp,
    })
    .then((response) => {
      if (response.valid) {
        userHelpers.getUserdetails(number).then(async (user) => {
          req.session.loggedIn = true;
          req.session.user = user;
          res.redirect("/");
        });
      } else {
        console.log("error");
        req.session.invalidOtp = true;
        res.redirect("/login/otp");
      }
    });
});

router.get("/login/resend-otp", (req, res) => {
  let number = req.session.number;

  client.verify
    .services(serviceSID)
    .verifications.create({
      to: `${number}`,
      channel: "sms",
    })
    .then((resp) => {
      req.session.number = resp.to;
      console.log(resp);
      res.redirect("/login/otp");
    });
});

router.get("/view-singleProduct/:id", async (req, res) => {
  let proId = req.params.id;
  let cartCount = 0;
  let ordersCount = 0;
  let user1 = req.session.user;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
  }
  let homeCategory = await userHelpers.getHomeCategories();
  console.log(proId);
  productHelpers.getProductDetalils(proId).then(async (Product) => {
    categorys = await productHelpers.getCategoryProducts(Product.category);

    console.log(categorys);

    res.render("user/view-singleProduct", {
      Product,
      homeCategory,
      user1,
      cartCount,
      ordersCount,
      userPage: true,
      categorys,
    });
  });
});

//checkout page
router.get("/checkout", verifyLogin, async (req, res) => {
  let userId = req.session.user._id;
  var user1 = req.session.user;
  let homeCategory = await userHelpers.getHomeCategories();
  let cartCount = 0;
  let ordersCount = 0;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
    address = await userHelpers.getUserAddress(userId);
  }
  let userDetails = await adminHelpers.getUserdetails(userId);
  let total = await userHelpers.getTotalAmount(userId);
  console.log(total);
  res.render("user/checkout", {
    user: true,
    total,
    userId,
    user1,
    homeCategory,
    cartCount,
    ordersCount,
    address,
    userDetails,
    userPage: true,
  });
});

//place order page
router.post("/place-order", async (req, res) => {
  console.log(req.body);
  let userId = req.body.userId;

  let products = await userHelpers.getCartProductList(req.body.userId);
  if (req.session.couponTotal || req.session.walletTotal) {
    if (req.session.couponTotal) {
      var total = req.session.couponTotal;
    } else {
      var total = req.session.walletTotal;
    }
  } else {
    total = await userHelpers.getTotalAmount(req.body.userId);
  }
  userHelpers.placeOrder(req.body, products, total).then((orderId) => {
    req.session.orderId = orderId;

    if (req.body["Payment"] == "COD") {
      userHelpers.clearCart(userId).then(() => {
        res.json({ codSuccess: true });
      });
    } else if (req.body["Payment"] == "Razorpay") {
      userHelpers.generateRazorpay(orderId, total).then((resp) => {
        userHelpers.clearCart(userId).then(() => {
          res.json({ resp, razorpay: true });
        });
      });
    } else if (req.body["Payment"] == "Paypal") {
      console.log("this is the paypal felad", req.body);
      val = total / 74;
      total = val.toFixed(2);
      let totals = total.toString();
      console.log(totals);
      req.session.total = totals;

      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:3000/success",
          cancel_url: "http://localhost:3000/cancel",
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "Cart items",
                  sku: "001",
                  price: totals,
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: totals,
            },
            description: "Hat for the best team ever",
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              let url = payment.links[i].href;
              res.json({ url });
            } else {
              console.log("errr");
            }
          }
        }
      });
    }
  });
});

//order succsess
router.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  let total = req.session.total;

  let totals = total.toString();
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: totals,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        userHelpers.changePaymentStatus(req.session.orderId).then(() => {
          req.session.couponTotal = null;
          res.redirect("/order-success");
        });
      }
    }
  );
});

router.get("/cancel", (req, res) => {
  let user = req.session.user;
  let msg = "Your Order is not Compleated";
  emailHelpers.sendMail(user, msg).then(() => {
    res.render("user/order-cancelled",{adminlogin: true});
  });
});

//order succsess page
router.get("/order-success", (req, res) => {
  var user = req.session.user;
  const output = `
    <p>You have a new Messege From ShopGrids</p>
    <h3>Your Order Status</h3>
    <ul> 
      <li>Your Order Confirmed !</li> 
    </ul>
  `;
  userHelpers.clearCart(req.session.user._id).then(() => {
    emailHelpers.sendMail(user, output).then(() => {
      res.render("user/order-success", { adminlogin: true });
    });
  });
  req.session.couponTotal = null;
});

//get and the display the orders
router.get("/myOrders", verifyLogin, async (req, res) => {
  var user1 = req.session.user;
  let homeCategory = await userHelpers.getHomeCategories();
  let cartCount = 0;
  let ordersCount = 0;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
  }

  let id = req.session.user._id;
  let orders = await userHelpers.getUserOrders(id);
  if (ordersCount > 0) {
    res.render("user/user-order", {
      orders,
      user: true,
      user1,
      homeCategory,
      cartCount,
      ordersCount,
      userPage: true,
    });
  } else {
    res.render("user/empty-order", {
      user: true,
      user1,
      homeCategory,
      cartCount,
      ordersCount,
      userPage: true,
    });
  }
});

//View products in my orders
router.get("/singleOrder/:id", verifyLogin, async (req, res) => {
  console.log(req.params.id);
  let Id = req.params.id;
  var user1 = req.session.user;
  let homeCategory = await userHelpers.getHomeCategories();
  let cartCount = 0;
  let ordersCount = 0;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
  }
  adminHelpers.getOrderProducts(Id).then((products) => {
    res.render("user/single-orders", {
      products,
      user: true,
      user1,
      homeCategory,
      cartCount,
      ordersCount,
      userPage: true,
    });
  });
});

//cancel my orders
router.post("/cancel-order", (req, res) => {
  console.log("this is your calcel order", req.body);
  let orderId = req.body.orderId;
  let Total = req.body.Total;
  var paymentMethod = req.body.Payment;
  console.log(paymentMethod);
  var user = req.session.user._id;
  var user1 = req.session.user;
  const output = `
    <p>You have a new Messege From ShopGrids</p>
    <h3>Your Order Status</h3>
    <ul> 
      <li>Your Order Canceled Successfully !</li> 
      <li> OrderId=${orderId}</li>
    </ul>
  `;
  userHelpers.cancelOrder(orderId).then((response) => {
    if (paymentMethod == "COD") {
      emailHelpers.sendMail(user1, output).then(() => {
        res.json({ status: true });
      });
    } else {
      userHelpers.addWallet(user, Total).then(() => {
        emailHelpers.sendMail(user1, output).then(() => {
          res.json({ status: true });
        });
      });
    }
  });
});

//Render the user profile page
router.get("/my-profile", verifyLogin, async (req, res) => {
  let user2 = req.session.user._id;
  var user1 = req.session.user;
  let homeCategory = await userHelpers.getHomeCategories();
  let cartCount = 0;
  let ordersCount = 0;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
    address = await userHelpers.getUserAddress(userId);
  }
  let user = await adminHelpers.getUserdetails(user2);
  user1 = await adminHelpers.getUserdetails(user2);
  req.session.user = user1;
  let refer = user.refer;
  let wallet = user.wallet;
  let referalLink = "http://localhost:3000/signup?refer=" + refer;
  res.render("user/my-profile", {
    user: true,
    user,
    user1,
    homeCategory,
    cartCount,
    ordersCount,
    address,
    referalLink,
    wallet,
    userPage: true,
  });
});

//Edit the user profile page
router.post("/edit-profile", (req, res) => {
  let id = req.session.user._id;
  console.log(req.body);
  userHelpers.updateProfile(id, req.body).then((response) => {
    res.redirect("/my-profile");
  });
});

//profile change the password
router.get("/user-change-password", async (req, res) => {
  var user1 = req.session.user;
  let homeCategory = await userHelpers.getHomeCategories();
  let cartCount = 0;
  let ordersCount = 0;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
  }

  res.render("user/user-change-password", {
    notSame: req.session.pswdNotSame,
    invalid: req.session.invalidpswd,
    user1,
    homeCategory,
    cartCount,
    ordersCount,
    userPage: true,
  });
  req.session.pswdNotSame = false;
  req.session.invalidpswd = false;
});

router.post("/user-change-password", (req, res) => {
  let userId = req.session.user._id;
  let pass1 = req.body.password1;
  let pass2 = req.body.password2;

  if (pass1 == pass2) {
    userHelpers.changePassword(userId, req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = false;
        req.session.user = null;
        res.redirect("/login");
      } else {
        req.session.invalidpswd = true;
        res.redirect("/user-change-password");
      }
    });
  } else {
    req.session.pswdNotSame = true;
    res.redirect("/user-change-password");
  }
});

//the profile new address endering form
router.get("/add-new-addressProfile", verifyLogin, async (req, res) => {
  var user1 = req.session.user;
  let homeCategory = await userHelpers.getHomeCategories();
  let cartCount = 0;
  let ordersCount = 0;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
  }

  res.render("user/add-new-addressProfile", {
    user1,
    homeCategory,
    cartCount,
    ordersCount,
    user: true,
    userPage: true,
  });
});

//add new address in user profile
router.post("/add-new-addressProfile", (req, res) => {
  console.log(req.body);
  userHelpers.addNewAddress(req.body).then((response) => {
    res.redirect("/my-profile");
  });
});

//delete the address for user
router.get("/delete-address/:id", (req, res) => {
  let addId = req.params.id;
  let userId = req.session.user._id;
  userHelpers.deleteAddress(addId, userId).then((response) => {
    res.redirect("/my-profile");
  });
});

//edit the address for user

router.get("/edit-address/:id", verifyLogin, async (req, res) => {
  var user1 = req.session.user;
  let homeCategory = await userHelpers.getHomeCategories();
  let cartCount = 0;
  let ordersCount = 0;
  let userId = req.session.user._id;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
  }
  let addId = req.params.id;
  userHelpers.getSingleAddress(addId, userId).then((address) => {
    console.log(address);
    res.render("user/edit-address", {
      userId,
      user: true,
      address,
      user1,
      homeCategory,
      cartCount,
      ordersCount,
      userPage: true,
    });
  });
});

router.post("/edit-address", (req, res) => {
  userHelpers.editAddress(req.body).then((response) => {
    res.redirect("/my-profile");
  });
});

//verify our payment in server side
router.post("/verify-payment", (req, res) => {
  console.log(req.body);
  userHelpers
    .verifyPayment(req.body)
    .then((response) => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        console.log("payment successfully");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false });
    });
});
//cancel the order page
router.get("/cancelled", (req, res) => {
  let user = req.session.user;
  let msg = "Your Order is not Compleated";
  emailHelpers.sendMail(user, msg).then(() => {
    res.render("user/order-cancelled");
  });
});

//serch section
router.post("/getProduct", async (req, res) => {
  let payload = req.body.payload;
  let search = await userHelpers.searchProduct(payload);
  search = search.slice(0, 10);
  res.send({ payload: search });
});

//-------------------Coupon management section-------------------------------------
router.post("/couponApply", (req, res) => {
  let id = req.session.user._id;
  userHelpers.couponValidate(req.body, id).then((response) => {
    req.session.couponTotal = response.total;
    if (response.success) {
      res.json({ couponSuccess: true, total: response.total });
    } else if (response.couponUsed) {
      res.json({ couponUsed: true });
    } else if (response.couponExpired) {
      res.json({ couponExpired: true });
    } else {
      res.json({ invalidCoupon: true });
    }
  });
});

//wallet section
router.get("/wallet", (req, res) => {
  var user1 = req.session.user;
  res.render("user/wallet", { user1 });
});

//applay the wallet into check out page
router.post("/applayWallet", async (req, res) => {
  var user = req.session.user._id;
  let ttl = parseInt(req.body.Total);
  let walletAmount = parseInt(req.body.wallet);
  let userDetails = await adminHelpers.getUserdetails(user);
  if (userDetails.wallet >= walletAmount) {
    let total = ttl - walletAmount;
    console.log("this is the subtracted value", total);
    userHelpers.applayWallet(walletAmount, user).then(() => {
      req.session.walletTotal = total;
      res.json({ walletSuccess: true, total });
    });
  } else {
    res.json({ valnotCurrect: true });
  }
});

//add the contact section
router.get('/contact',async(req,res)=>{
  var user1 = req.session.user;
  let homeCategory = await userHelpers.getHomeCategories();
  let cartCount = 0;
  let ordersCount = 0;
  if (req.session.user) {
    let userId = req.session.user._id;
    cartCount = await userHelpers.getCartCount(userId);
    ordersCount = await userHelpers.getOrdersCount(userId);
  }
  res.render('user/contact',{
    user: true,
    user1,
    homeCategory,
    cartCount,
    ordersCount,
    userPage: true,
    Msgsend:req.session.Msgsend
  });
  req.session.Msgsend=false;
})

router.post('/contact',(req,res)=>{
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Subject: ${req.body.subject}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  var admin ={
    email:process.env.admingmail
  }
  emailHelpers.sendMail(admin, output).then(() => {
    req.session.Msgsend=true;
    res.redirect('/contact')
    
  });
})


module.exports = router;
