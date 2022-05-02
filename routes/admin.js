var express = require("express");
const async = require("hbs/lib/async");
const session = require("express-session");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var adminHelpers = require("../helpers/admin-helpers");
var userHelpers = require("../helpers/user-helpers");
const { response } = require("express");

const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/admin-login");
  }
};

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.redirect("/admin/admin-login");
});

//__________________admin login section________________________

router.get("/admin-login", (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin/dashboard");
  }
  res.render("admin/admin-login", {
    adminlogin: true,
    loginErr: req.session.loginErr,
  });
  req.session.loginErr = false;
});

router.post("/admin-login", (req, res) => {
  adminHelpers.adminlogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      let adminName = response.admin.name;
      req.session.adminName = adminName;
      res.redirect("/admin/dashboard");
      let todayDate = new Date().toISOString().slice(0, 10);
      let dt = new Date(todayDate);
    } else {
      req.session.loginErr = true;
      res.redirect("/admin/admin-login");
    }
  });
});

//_______________admin dashboard__________________________

router.get("/dashboard", verifyAdminLogin, async (req, res) => {
  if (req.session.adminLoggedIn) {
    let newOrders = await productHelpers.getNewOrders();
    let newProducts = await productHelpers.getNewProducts();
    let newUsers = await productHelpers.getNewUsers();
    let totalIncome = await productHelpers.getTotalIncome();
    let totalUsers = await productHelpers.getTotalUsers();
    let totalProducts = await productHelpers.getTotalProducts();
    let totalOrders = await productHelpers.getTotalOrders();
    let allOrderStatus = await productHelpers.getAllOrderStatus();
    let allMethods = await productHelpers.getAllMethods();
    res.render("admin/dashboard", {
      admin: true,
      adminName: req.session.adminName,
      newOrders,
      newUsers,
      newProducts,
      totalIncome,
      totalUsers,
      totalProducts,
      totalOrders,
      allOrderStatus,
      allMethods,
    });
  } else {
    res.redirect("/admin/admin-login");
  }
});

//_______________________Product management section___________________________

router.get("/add-product", verifyAdminLogin, async (req, res) => {
  let category = await adminHelpers.getAllCategory();
  res.render("admin/add-product", {
    admin: true,
    adminName: req.session.adminName,
    category,
  });
});

router.post("/add-product", verifyAdminLogin, (req, res) => {
  console.log(req.files.Image);
  productHelpers
    .addProduct(req.body)
    .then((id) => {
      let image1 = req.files.image1;
      let image2 = req.files.image2;
      let image3 = req.files.image3;
      let image4 = req.files.image4;

      image1.mv("public/product-images/" + id + "a.jpg");
      image2.mv("public/product-images/" + id + "b.jpg");
      image3.mv("public/product-images/" + id + "c.jpg");
      image4.mv("public/product-images/" + id + "d.jpg");
      res.redirect("/admin/view-products");
    })
    .catch((err) => {
      if (err) {
        res.redirect("/admin/add-product");
      }
    });
});

router.get("/view-products", verifyAdminLogin, (req, res) => {
  productHelpers.getAllProduct().then((product) => {
    res.render("admin/view-products", {
      admin: true,
      adminName: req.session.adminName,
      product,
    });
  });
});

router.get("/delete-product/:id", verifyAdminLogin, (req, res) => {
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/view-products");

    if ("public/product-images/" + id + "b.jpg") {
      fs.unlinkSync("public/product-images/" + id + "b.jpg");
      fs.unlinkSync("public/product-images/" + id + "c.jpg");
      fs.unlinkSync("public/product-images/" + id + "d.jpg");
    }
  });
});

router.get("/edit-product/:id", verifyAdminLogin, async (req, res) => {
  let product = await productHelpers.getProductDetalils(req.params.id);
  let category = await adminHelpers.getAllCategory();
  res.render("admin/edit-product", {
    admin: true,
    adminName: req.session.adminName,
    product,
    category,
  });
});

router.post("/edit-product/:id", verifyAdminLogin, (req, res) => {
  productHelpers.updateProdct(req.params.id, req.body).then((response) => {
    let id = req.params.id;
    if (req.files?.image1) {
      let image1 = req.files.image1;
      image1.mv("public/product-images/" + id + "a.jpg");
    }
    if (req.files?.image2) {
      let image2 = req.files.image2;
      image2.mv("public/product-images/" + id + "b.jpg");
    }
    if (req.files?.image3) {
      let image3 = req.files.image3;
      image3.mv("public/product-images/" + id + "c.jpg");
    }
    if (req.files?.image4) {
      let image4 = req.files.image4;
      image4.mv("public/product-images/" + id + "d.jpg");
    }
    res.redirect("/admin/view-products");
  });
});

//___________________user mangement section started____________________________

//get the all users in to server
router.get("/get-AllUsers", verifyAdminLogin, (req, res) => {
  adminHelpers.getAllUsers().then((allUsers) => {
    res.render("admin/view-allusers", {
      allUsers,
      admin: true,
      adminName: req.session.adminName,
    });
  });
});

router.get("/block-user/:id", verifyAdminLogin, (req, res) => {
  let userId = req.params.id;
  adminHelpers.blockUse(userId).then((response) => {
    res.redirect("/admin/get-AllUsers");
  });
});

router.get("/unblock-user/:id", (req, res) => {
  var proId = req.params.id;
  adminHelpers.unblockUser(proId).then((response) => {
    res.redirect("/admin/get-AllUsers");
  });
});

router.get("/AllblockUsers",verifyAdminLogin, (req, res) => {
  adminHelpers.getAllBlockUsers().then((allBlockUsers) => {
    res.render("admin/view-allBlockusers", {
      allBlockUsers,
      admin: true,
      adminName: req.session.adminName,
    });
  });
});

//__________________Category Mangement section started______________________

router.get("/add-category",verifyAdminLogin, (req, res) => {
  res.render("admin/add-category", {
    admin: true,
    adminName: req.session.adminName,
  });
});

router.post("/add-category", (req, res) => {
  let carData = req.body;
  adminHelpers.addCategory(carData).then((response) => {
    res.redirect("/admin/view-categorys");
  });
});

router.get("/view-categorys",verifyAdminLogin, (req, res) => {
  adminHelpers.getAllCategory().then((categorys) => {
    res.render("admin/view-categorys", {
      categorys,
      admin: true,
      adminName: req.session.adminName,
    });
  });
});

router.get("/edit-categorys/:id",verifyAdminLogin, (req, res) => {
  let catId = req.params.id;
  adminHelpers.getCategoryDetails(catId).then((category) => {
    res.render("admin/edit-categorys", {
      category,
      admin: true,
      adminName: req.session.adminName,
    });
  });
});

router.post("/edit-categorys/:id", (req, res) => {
  let catId = req.params.id;
  let catData = req.body;
  adminHelpers.updateCategory(catId, catData).then(() => {
    res.redirect("/admin/view-categorys");
  });
});

router.get("/delete-category/:id", (req, res) => {
  let catId = req.params.id;
  adminHelpers.deleteCategory(catId).then((response) => {
    res.redirect("/admin/view-categorys");
  });
});

//__________________order management section_____________________ 

//Order management section
router.get("/all-orders",verifyAdminLogin, async (req, res) => {
  let ordersList = await adminHelpers.getAllOrders();
  res.render("admin/all-orders", {
    admin: true,
    ordersList,
    adminName: req.session.adminName,
  });
});

//Order Status changinge
router.get("/placed/:id", (req, res) => {
  let status = "Placed";
  adminHelpers.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/shipped/:id", (req, res) => {
  let status = "Shipped";
  adminHelpers.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect("/admin/all-orders");
  });
});
router.get("/delivered/:id", (req, res) => {
  let status = "Delivered";
  adminHelpers.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancelled/:id", (req, res) => {
  let status = "Cancelled";
  adminHelpers.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect("/admin/all-orders");
  });
});

//__________________Offer Management Section___________________

//Category offers
router.get("/category-offers", verifyAdminLogin, async (req, res) => {
  let category = await adminHelpers.getAllCategory();
  let catOffers = await adminHelpers.getAllCatOffers();
  res.render("admin/category-offer", {
    admin: true,
    category,
    catOffers,
    adminName: req.session.adminName,
  });
});

router.post("/category-offers", (req, res) => {
  adminHelpers.addCategoryOffer(req.body).then(() => {
    res.redirect("/admin/category-offers");
  });
});

//delete category
router.get("/delete-catOffer/:id", (req, res) => {
  adminHelpers.deleteCatOffer(req.params.id).then(() => {
    res.redirect("/admin/category-offers");
  });
});

//Product offer
router.get("/product-offers", verifyAdminLogin, async (req, res) => {
  let products = await productHelpers.getAllProduct();
  let proOffers = await adminHelpers.getAllProOffers();
  res.render("admin/product-offer", {
    admin: true,
    products,
    proOffers,
    proOfferExist: req.session.proOfferExist,
    adminName: req.session.adminName,
  });
  req.session.proOfferExist = false;
});

router.post("/product-offers", (req, res) => {
  adminHelpers.addProductOffer(req.body).then((response) => {
    if (response.exist) {
      req.session.proOfferExist = true;
      res.redirect("/admin/product-offers");
    } else {
      res.redirect("/admin/product-offers");
    }
  });
});

//delete the product offer
router.get("/delete-proOffer/:id", (req, res) => {
  adminHelpers.deleteProOffer(req.params.id).then(() => {
    res.redirect("/admin/product-offers");
  });
});

router.get("/edit-proOffer/:id",verifyAdminLogin, (req, res) => {
  adminHelpers.getProOffersDetails(req.params.id).then(async (proOffer) => {
    let products = await productHelpers.getAllProduct();
    res.render("admin/edit-proOffers", {
      admin: true,
      proOffer,
      products,
      adminName: req.session.adminName,
    });
  });

  router.post("/edit-proOffer/:id", (req, res) => {
    adminHelpers.updateProOffer(req.params.id, req.body).then((response) => {
      res.redirect("/admin/product-offers");
    });
  });
});

//______________Report section started_______________________

//report section start
router.get("/report",verifyAdminLogin, (req, res) => {
  adminHelpers.monthlyReport().then((data) => {
    res.render("admin/report", {
      admin: true,
      data,
      adminName: req.session.adminName,
    });
  });
});

router.post("/report",verifyAdminLogin, (req, res) => {
  adminHelpers.salesReport(req.body).then((data) => {
    res.render("admin/report", {
      admin: true,
      data,
      adminName: req.session.adminName,
    });
  });
});

//_____________________Banner management section_______________

router.get("/banners",verifyAdminLogin, async (req, res) => {
  let categories = await adminHelpers.getAllCategory();
  let banners = await userHelpers.getAllBanners();
  res.render("admin/banners", {
    admin: true,
    categories,
    banners,
    adminName: req.session.adminName,
  });
});

//add banner detils into server
router.post("/banners", (req, res) => {
  adminHelpers.addBanner(req.body).then((id) => {
    let image = req.files.Image3;
    image.mv("public/banners/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.redirect("/admin/banners");
      } else {
        console.log("erro occurse");
        res.redirect("/admin/banners");
      }
    });
  });
});

//edit the banner details
router.get("/edit-banner/:id",verifyAdminLogin, (req, res) => {
  let id = req.params.id;
  adminHelpers.getBannerDetails(id).then((banner) => {
    res.render("admin/edit-banner", {
      admin: true,
      banner,
      adminName: req.session.adminName,
    });
  });
});

router.post("/edit-banner/:id", (req, res) => {
  let id = req.params.id;
  adminHelpers.updateBanner(id, req.body).then(() => {
    res.redirect("/admin/banners");
    if (req.files.Image3) {
      let image = req.files.Image3;
      image.mv("public/banners/" + id + ".jpg");
    }
  });
});

//delete the banner details
router.get("/delete-banner/:id", (req, res) => {
  let id = req.params.id;
  adminHelpers.deleteBanner(id).then(() => {
    res.redirect("/admin/banners");
  });
});

//_______________________Coupen section________________

router.get("/coupons",verifyAdminLogin, (req, res) => {
  adminHelpers.getAllCoupons().then((coupons) => {
    res.render("admin/coupons", {
      admin: true,
      coupons,
      adminName: req.session.adminName,
    });
  });
});
router.post("/add-coupon", (req, res) => {
  adminHelpers.addCoupon(req.body).then(() => {
    res.redirect("/admin/coupons");
  });
});

//delete category offer
router.get("/delete-coupon/:id", (req, res) => {
  adminHelpers.deleteCoupon(req.params.id).then(() => {
    res.redirect("/admin/coupons");
  });
});

// ___________Admin logout section______________

router.get("/admin-logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/admin/admin-login");
  });
});

module.exports = router;
