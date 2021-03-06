var db=require('../config/connection')
const collection=require("../config/Collections")
const bcrypt=require('bcrypt');
const async = require('hbs/lib/async');
const objectId=require('mongodb').ObjectId
const moment = require('moment')
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

module.exports={

    //______________________check the signin data in server side______________________

    doSignin:(userData)=>{
        return new Promise( async(res,rej)=>{
            
            if (userData.wallet) {
                let mainUser=await db.get().collection(collection.USER_COLLECTION).findOne({_id:userData.referedBy})
                if(mainUser.wallet<200){
                  await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: userData.referedBy }, { $inc: { wallet: 50 } });
                }
              }
            userData.wallet = userData.wallet ? userData.wallet : 0;
            let phoneext= `+91${userData.phone}`;
            let response={};
            userData.password= await bcrypt.hash(userData.password,10)
            user = {
                name: userData.name,
                email: userData.email,
                phone: `+91${userData.phone}`,
                password: userData.password,
                status: true,
                refer:userData.refer,
                referedBy:userData.referedBy,
                wallet:userData.wallet
                
            }
             //check the user exist
           let userexst= await db.get().collection(collection.USER_COLLECTION).findOne({ "$or": [ { email: userData.email }, { phone: phoneext} ] });
            if (userexst) {
                response.usererr=true;
                res(response)
                console.log(userexst);
                
            }else{
            db.get().collection(collection.USER_COLLECTION).insertOne(user).then(async(data)=>{
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id:data.insertedId });
                  response.user = user;
                res(response)
            })
            }
        })
    },

    //______________________Check the Login data in server side______________________

        doLogin:(userData)=>{
            return new Promise(async(res,rej)=>{
                let loginStatus = false;
                let response={};
                let newMob = `+91${userData.phone}`
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({phone:newMob})
                if(user){
                    response.userStatus = true
                    bcrypt.compare(userData.password,user.password).then((status)=>{
                        if(status){
                            console.log("login successfully");
                            response.user=user;
                            response.status=true;
                            res(response)
                        }else{
                            console.log("Pleas check your password");
                            res({status:false,userStatus:true})
                        }
                    })
                }else{
                    console.log("please check your phone");
                    res({status:false,userStatus: false })
                }

            })
        },


            // get the all categorys in server
        getHomeCategories: () => {
            return new Promise(async (resolve, reject) => {
                let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().limit(10).toArray()
                resolve(category)
            })
        },
            //get the product in category wise
        getProductsByCateogry: (cat) => {
            return new Promise(async (resolve, reject) => {
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:cat}).toArray()
                resolve(products)
            })
        },

           //get the user detaile using the mobile number
        getUserdetails:(No)=>{
            return new Promise(async(res,rej)=>{
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({phone:No})
                res(user)
            })
        },

        // _______________The cart section start________________

            //add the items into the cart
        addToCart:( proId,userId)=>{
            let proObj = {
                item: objectId(proId),
                quantity: 1
            }
            return new Promise(async(res,rej)=>{
                let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
                if(userCart){
                    let proExist = userCart.products.findIndex(product => product.item == proId)
                    if(proExist!=-1){
                        db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'products.item':objectId(proId)},
                        {
                            $inc:{'products.$.quantity':1}
                        }).then((response)=>{
                            res()
                        })
                    }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},{
                        $push:{products:proObj}
                    }).then((response)=>{
                        res()
                    })
                    }
                }else{
                    let cartObj={
                        user:objectId(userId),
                        products:[proObj]
                    }
                    db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                        res()
                    })
                }
            }) 

        },

        //Get user cart products    
    getCartProducts: (userId) => {
        return new Promise(async(res,rej)=>{

            let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                    
                }
            },
            {
                $project:{
                    item:1,quantity:1,
                    product: { $arrayElemAt:['$product',0] }

                }

            }
            ]).toArray() 
            res(cartItems)
        })
    },

    getCartCount:(userId)=>{
        return new Promise(async(res,rej)=>{
            let count=0
            //check the cart avalble in this user check though the user ID
            let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.products.length
                
            }
            res(count)
        })
    },

    changeProductQuantity:(details)=>{
        count=parseInt(details.count)
        quantity=parseInt(details.quantity)
        return new Promise((res,rej)=>{
            if(count==-1 && quantity==1){
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},{
                    $pull:{products:{item:objectId(details.product)}}
                }).then((response)=>{
                    res({removeProduct:true})

                })

            }else{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
                        {
                            $inc:{'products.$.quantity':count}
                        }).then((response)=>{
                            res({status:true})
                        })
                    }
        })
    },

    //Delete single product from cart
    deleteCartProduct: (cartId, proId) =>{
        return new Promise((res,rej)=>{

            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(cartId)},{

                $pull:{products:{item:objectId(proId)}
            }
            }).then(()=>{
                res({deleteCartProduct:true})
            })
        })
    },

    getTotalAmount:(userId)=>{ 
        return new Promise(async(res,rej)=>{

            let total= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product' 
                }
            },
            {
                $project:{
                    item:1,quantity:1,
                    product: { $arrayElemAt:['$product',0] }

                }

            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: [{ '$toInt': '$quantity' }, { '$toInt': '$product.price' }] } }
                }
            }
            ]).toArray() 
            res(total[0]?.total)


        })

    },

    // _________________The order section started_________________________

    placeOrder:(order,products,total)=>{
        let coupon = order.Coupon
        return new Promise((res,rej)=>{
            let dateIso = new Date()
            let date = moment(dateIso).format('YYYY/MM/DD')
            let time = moment(dateIso).format('HH:mm:ss')
            let  orderObj = {
                deliveryDetails: {
                    Name: order.Name,
                    House: order.House,
                    Street: order.Street,
                    Town: order.Town,
                    PIN: order.PIN,
                    Mobile: order.Mobile
                },
                Email: order.Email,
                User: objectId(order.userId),
                PaymentMethod: order.Payment,
                Products: products,
                Total: total,
                Coupon: coupon,
                DateISO: dateIso,
                Date: date,
                Time: time,
                Status:"Placed"
            }
            let user = order.userId 
            db.get().collection(collection.COUPON_COLLECTION).updateOne({ Coupon: coupon },
                {
                    $push: {
                        Users: user
                    }
            }).then(()=>{
                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                    res(response.insertedId)
    
                })
            })

        })

    },
        //Cancel order by user
     cancelOrder: (Id) => {
         return new Promise((res,rej)=>{
             db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(Id)},{
                 $set:{
                    Status: 'Cancelled',
                    Cancelled: true
                 }
             }).then((response)=>{
                 res()

             })
         })

     },

        //Get cart product list to show in cart
     getCartProductList: (userId) => {
        return new Promise(async (res, rej) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
             res(cart.products)
        })
     },

        //Get user order with user id for my order section
    getUserOrders: (Id) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ User: objectId(Id) }).sort({'DateISO': -1}).limit(9).toArray()
            resolve(orders)
        })
    },

    getOrder:(Id)=>{
      return new Promise(async(res,rej)=>{
          let order=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(Id)})
          res(order)
      })

    },

        //order count for the heading part
     getOrdersCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({User:objectId(userId)})
            resolve(order)
        })
    },

    // ____________Statr the Profile section________________


    updateProfile: (id, newData) => {
        return new Promise((res,rej)=>{

            let newNum= `+91${newData.phone}`;
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(id)},{
                $set:{
                    name:newData.name,
                    email:newData.email,
                    phone:newData.phone
                }
            }).then((response)=>{
                res(response)

            })

        })
    },
        // change the password
    changePassword:(userId,data)=>{
        return new Promise(async(res,rej)=>{
            let response = {}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
            if(user){
            data1= await bcrypt.hash(data.password1, 10)
            bcrypt.compare(data.current, user.password).then((status)=>{
                if(status){
                    response.status=true;
                    console.log("the password matchig success");
                    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                        $set:{
                            password:data1
                        }
                    }).then(()=>{
                        res(response)
                    })
                }else{
                    response.status = false
                        res(response)
                        console.log("current password is invalid");
                }
            })
        }
        })
    },

        //add the new address
    addNewAddress:(details)=>{
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(details.User) })
            details._id = objectId()
            if (user.address) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.User) }, {
                    $push: {
                        address: details
                    }
                }).then(() => {
                    resolve()
                })
            } else {
                addr = [details]
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.User) }, {
                    $set: {
                        address: addr
                    }
                }).then((user) => {
                    resolve(user)
                })
            }
        })
    },
         //Get user address with user Id
     getUserAddress: (userId) => {
         return new Promise(async(res,rej)=>{

             let user= await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
             let address=user?.address;
             res(address)
         })
         
     },

         //delete the address of the user
     deleteAddress:(addId,userId)=>{
         return new Promise((res,rej)=>{
             db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                 $pull:{address:{_id:objectId(addId)}}
             }).then(()=>{
                 res()
             })
         })
     },

         //ger the single data
     getSingleAddress:(addId,userId) => {
        return new Promise(async(res,rej)=>{
            let address= await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(userId)}
                },
                {
                    $unwind:'$address'
                },
                {
                    $match:{"address._id":objectId(addId)}
                },
                {
                    $project:{
                        address:1,
                        _id:0
                    }
                }
            ]).toArray()
            res(address);
        })
        
    },
        //edit address
    editAddress: (newData) => {
        return new Promise((res, rej) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(newData.User), "address._id": objectId(newData._id) }, {
                $set: {
                    "address.$.Name": newData.Name,
                    "address.$.House": newData.House,
                    "address.$.Street": newData.Street,
                    "address.$.Town": newData.Town,
                    "address.$.PIN": newData.PIN,
                    "address.$.Mobile": newData.Mobile,
                    "address.$.Email": newData.Email,
                }
            }).then((response) => {
                res(response)
            }).catch((err) => {
                resolve(err)
            })
        })
    },

    // ______________Razorpay section_________________

        //if razorpay the generate the razorepaay gateway
    generateRazorpay: (orderId, total) => {
        return new Promise((res, rej) => {
            var options = {
                amount: total*100 ,
                currency: "INR",
                receipt: orderId.toString()
            };
            instance.orders.create(options, (err, order) => {
                if (err) {
                    console.log(err);
                } else {
                    res(order)
                }
            })
        })
    },

    verifyPayment:(details)=>{
        return new Promise((res, rej) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256',process.env.key_secret )
            hmac.update(details['response[razorpay_order_id]'] + '|' + details['response[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['response[razorpay_signature]']) {
                console.log("hmac matched");
                res()
            } else {
                console.log("hmac reject");
                rej(err)
            }
        })

    },

          //Change payment status after payment verify
      changePaymentStatus: (oId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(oId) },
                {
                    $set: {
                        Status: "Placed"
                    }
                }).then(() => {
                    resolve()
                })
        })
    },

        //For clear cart after placing order
    clearCart: (User) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(User) }).then(() => {
                resolve()
            })
        })
    },
         //Get banners from banner collection
    getAllBanners: () => {
        return new Promise(async (res, rej) => {
            let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            res(banners)
        })
    },

    searchProduct:(name)=>{
        return new Promise(async(res,rej)=>{
            let search= await db.get().collection(collection.PRODUCT_COLLECTION).find({name:{$regex:new RegExp('^'+name+'.*','i')}}).toArray();
            res(search)
        })

    },

        //vlidate the coupon with the checkout page
    couponValidate: (data, user) => {
        return new Promise(async(res,rej)=>{
            obj = {}
                let date=new Date()
                date=moment(date).format('YYYY-MM-DD')
                let coupon= await db.get().collection(collection.COUPON_COLLECTION).findOne({Coupon:data.Coupon,Available:true})
                if(coupon){
                        let users = coupon.Users
                        let userChecker = users.includes(user)
                        if(userChecker){
                            obj.couponUsed=true;
                            res(obj)
                        }else{
                            if(date <= coupon.Expiry){
                                let total = parseInt(data.Total)
                                let percentage = parseInt(coupon.Offer)
                                let discountVal = ((total * percentage) / 100).toFixed()
                                obj.total = total - discountVal
                                obj.success = true
                                res(obj)
                            }else{
                                obj.couponExpired = true
                                  console.log("Expired");
                                   res(obj)
                            }
                        }
                    }else{
                        obj.invalidCoupon = true
                        console.log("invalid");
                        res(obj)

                    }   
             })
        },
        // Chech the referal Code
        checkReferal: (referal) => {
            return new Promise(async (res, rej) => {
              let refer = await db.get().collection(collection.USER_COLLECTION).find({ refer: referal }).toArray();
              if(refer){
                  res(refer)
              }else{
                  res(err)
              }
            });
          },

        // __________The wallet section started___________

          applayWallet:(val,userId)=>{
              let value=parseInt(val)
            return new Promise((res,rej)=>{
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{ $inc: { wallet: -value }}).then((response)=>{
                    res(response)
            })
            }) 
    
        },

        addWallet:(userId,total)=>{
            let Total=parseInt(total)
            return new Promise((res,rej)=>{
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{ $inc: { wallet: Total } }).then((response)=>{
                    res(response)
                })
            })

        }
   



}