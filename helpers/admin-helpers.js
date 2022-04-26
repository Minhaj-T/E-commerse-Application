var db=require('../config/connection')
const collection=require("../config/Collections")
const async = require('hbs/lib/async')
const { response } = require('express')
const objectId=require('mongodb').ObjectId
const bcrypt=require('bcrypt');
let moment=require('moment')

module.exports={

    adminSignup:(adminData)=>{
        return new Promise(async(req,res)=>{
            adminData.password= await bcrypt.hash(adminData.password,10)
            admin = {
                email: adminData.email,
                password: adminData.password,
            }
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(admin).then((response)=>{
                res(response)
            })
        })

    },

    adminlogin:(adminData)=>{
        let loginStatus = false;
                let response={};
        return new Promise(async(res,rej)=>{
           let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
           if(admin){
               bcrypt.compare(adminData.password,admin.password).then((status)=>{
                   if(status){
                       console.log("you successfully loged in");
                    response.admin=admin;
                    response.status=true;
                    res(response)
                   }else{
                       console.log("please check your password");
                       res({status:false})
                   }
               })

           }else{
               console.log("please chek your email");
               res({status:false})
           }

        })
    },




    getAllUsers:()=>{
        return new Promise(async(res,rej)=>{
           let allUsers= await db.get().collection(collection.USER_COLLECTION).find().toArray()
           res(allUsers)
        })
    },

     //Getting user details with user ID
     getUserdetails: (Id) => {
        return new Promise(async (res, rej) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(Id) })
            if (user) {
                res(user)
            } else {
                console.log("else");
                res(false)
            }
        })
    },

    getAllBlockUsers:()=>{
        return new Promise( async(res,rej)=>{
            let blockedUsers= await db.get().collection(collection.USER_COLLECTION).find({status:false}).toArray()
            res(blockedUsers)

        })

    },

    //Block user by user Id
    blockUse:(userId)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{

                $set:{
                    status: false
                }
            }).then((response)=>{
                res(response)
            })
        })

    },
    unblockUser:(proId)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    status:true
                }
            }).then((response)=>{
                res(response)
            })
        })
    },

    addCategory:(data)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((response)=>{
                res(response)
            })
        })
    },

    getAllCategory:()=>{
        return new Promise(async(res,rej)=>{
           let allCategorys=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
           res(allCategorys)
            
        })
    },

    getCategoryDetails:(id)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(id)}).then((response)=>{
                res(response)
                console.log(response)
            })


        })
    },

    updateCategory:(id,data)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(id)},{
                $set:{
                    category:data.category
                }
            }).then((response)=>{
                res()
            })

        })
    },

    deleteCategory:(id)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(id)}).then((response)=>{
                res(response)

            })
        })
    },

     //Get products of a specific order with order id
     getOrderProducts: (orderId) => {
        return new Promise(async (res, rej) => {
            let orderItem = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(orderId)
                    }
                },
                {
                    $unwind: '$Products'
                },
                {
                    $project: {
                        item: '$Products.item',
                        quantity: '$Products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'

                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                    }
                }
            ]).toArray()
            res(orderItem)
        })
    },


     //get all orders
     getAllOrders: () => {
        return new Promise(async (res, rej) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ $natural: -1 }).toArray()
            res(orders)
        })
    },

    changeOrderStatus:(orderId,status)=>{
        return new Promise((res,rej)=>{
            if(status=='Delivered'){
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{
                    $set:{
                        Status:status
                    }
                }).then(()=>{
                    res()
                })
            }else if(status=="Cancelled"){
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{
                    $set:{
                        Status:status
                    }
                }).then((response)=>{
                    res()
                })
            }else{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{
                $set:{
                    Status:status
                }
            }).then((response)=>{
                res()
            })
        }

        })

    },

     //Offer section
    //----------------------------------- Category offers------------------------------------------

    addCategoryOffer: (data) => {
     return new Promise((res,rej)=>{
         data.startDateIso=new Date(data.Starting)
        data.endDateIso=new Date(data.Expiry)
        db.get().collection(collection.CATEGORY_OFFERS).insertOne(data).then(async (response) => {
            res(response)
        }).catch((err) => {
            rej(err)
        })

    })
    },

    getAllCatOffers: () => {
        return new Promise((res,rej)=>{
            let categoryOffer=db.get().collection(collection.CATEGORY_OFFERS).find().toArray()
            res(categoryOffer)
        })
    },

    //set the catoffer
    startCategoryOffer:(date)=>{
        let catStartDateIso = new Date(date);
        console.log('this is a category offer.................... ',date);
        return new Promise(async(res,rej)=>{
            let data= await db.get().collection(collection.CATEGORY_OFFERS).find({startDateIso:{$lte:catStartDateIso}}).toArray();
            if (data.length > 0) {
                await data.map(async (onedata) => {

                    let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: onedata.category, offer: { $exists: false } }).toArray();

                    await products.map(async (product) => {
                        let actualPrice = product.price
                        let newPrice = (((product.price) * (onedata.catOfferPercentage)) / 100)
                        newPrice = newPrice.toFixed()
                        console.log(actualPrice, newPrice, onedata.catOfferPercentage);
                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) },
                            {
                                $set: {
                                    actualPrice: actualPrice,
                                    price: (actualPrice - newPrice),
                                    offer: true,
                                    catOfferPercentage: onedata.catOfferPercentage
                                }
                            })
                    })
                })
                res();
            }else{
                res()
            }

        })

    },

    deleteCatOffer:(id)=>{
        return new Promise(async(res,rej)=>{
            let categoryOffer= await db.get().collection(collection.CATEGORY_OFFERS).findOne({_id:objectId(id)})
            let catName=categoryOffer.category
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:catName},{offer:{$exists:true}}).toArray()
            if(product){
                db.get().collection(collection.CATEGORY_OFFERS).deleteOne({_id:objectId(id)}).then(async()=>{
                    await product.map((product)=>{

                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(product._id)},{
                            $set:{
                                price: product.actualPrice
                            },
                            $unset:{
                                offer:"",
                                catOfferPercentage:'',
                                actualPrice:''
                            }
                        }).then(()=>{
                            res()
                        })
                    })
                })
            }else{
                res()
            }

        })

    },


     //-------------------------------------Product offers----------------------------

     addProductOffer: (data) => {
         return new Promise(async(res,rej)=>{
            data.startDateIso = new Date(data.Starting)
            data.endDateIso = new Date(data.Expiry)
            let response={}
            let exist= await db.get().collection(collection.PRODUCT_COLLECTION).findOne({name:data.Product,offer: { $exists: true }});
            if(exist){
                response.exist=true
                res(response)
            }else{
             db.get().collection(collection.PRODUCT_OFFERS).insertOne(data).then( (response) => {
                 res(response)
             }).catch((err)=>{
                 rej(err)
             })
            }
         })

     },
     startProductOffer:(todayDate)=>{
        let proStartDateIso = new Date(todayDate);
        return new Promise(async(res,rej)=>{
            let data= await db.get().collection(collection.PRODUCT_OFFERS).find({startDateIso:{$lte:proStartDateIso}}).toArray();
            if(data){
                await data.map(async(onedata)=>{
                    let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({name:onedata.Product, offer: { $exists: false }})
                    if(product){
                        let actualPrice =product.price
                        let newP =(((product.price) * (onedata.proOfferPercentage))/100)
                        let newPrice =actualPrice-newP;

                        newPrice=newPrice.toFixed()
                        console.log(actualPrice,newPrice,onedata.proOfferPercentage);
                        console.log("hellow");
                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(product._id)},{
                            $set:{
                                actualPrice: actualPrice,
                                price:newPrice,
                                offer:true,
                                proOfferPercentage:onedata.proOfferPercentage
                            }
                        })
                        res()
                    }else{
                        res()
                    }

                })

            }else{
                res()
            }
        })
     },



     getAllProOffers:()=>{
         return new Promise((res,rej)=>{
            let prooff=db.get().collection(collection.PRODUCT_OFFERS).find().toArray()
            res(prooff)
         })
     },

     getProOffersDetails:(Id)=>{
         return new Promise(async(res,rej)=>{
             let proOffer=db.get().collection(collection.PRODUCT_OFFERS).findOne({_id:objectId(Id)})
             res(proOffer)
         })
         
     },

     //delete the product offer
     deleteProOffer:(Id)=>{
         return new Promise(async(res,rej)=>{
             let productoff=await db.get().collection(collection.PRODUCT_OFFERS).findOne({_id:objectId(Id)})
             let proname=productoff.Product;
             let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({name:proname})
             db.get().collection(collection.PRODUCT_OFFERS).deleteOne({_id:objectId(Id)})
             db.get().collection(collection.PRODUCT_COLLECTION).updateOne({name:proname},{
                 $set:{
                     price:product?.actualPrice
                 },
                 $unset:{
                    actualPrice:"",
                    offer:"",
                    proOfferPercentage:""
                 }
             }).then(()=>{
                 res()
             }).catch((err)=>{
                 res(err)
             })
         })

         },

         //update the product offer
         updateProOffer:(Id,Details)=>{
             return new Promise((res,rej)=>{
                 db.get().collection(collection.PRODUCT_OFFERS).updateOne({_id:objectId(Id)},{
                     $set:{
                         Product:Details.Product,
                         Starting:Details.Starting,
                         Expiry:Details.Expiry,
                        proOfferPercentage:Details.offerPercentage,
                         startDateIso:new Date(Details.Starting),
                         endDateIso:new Date(Details.endDateIso)
                     }
                 }).then((response)=>{
                     res()
                 }).catch((err)=>{
                     res(err)
                 })
             })

         },

//----------------------The coupon Mangement-------------------------------
//add coupon into server
         addCoupon:(data)=>{
             return new Promise(async(res,rej)=>{
                let startDateIso=new Date(data.Starting)
                let endDateIso=new Date(data.Expiry)
                let expiry = await moment(data.Expiry).format('YYYY-MM-DD')
                 let starting = await moment(data.Starting).format('YYYY-MM-DD')
                 let dataobj = await {
                    Coupon: data.Coupon,
                    Offer: parseInt(data.Offer),
                    Starting: starting,
                    Expiry: expiry,
                    startDateIso: startDateIso,
                    endDateIso: endDateIso,
                    Users: []
                }
                db.get().collection(collection.COUPON_COLLECTION).insertOne(dataobj).then(()=>{
                    res()
                }).catch((err)=>{
                    res(err)
                })

             })
         },

         startCouponOffers:(date)=>{
             let couponStartDate = new Date(date);
            return new Promise(async(res,rej)=>{
                let data= await db.get().collection(collection.COUPON_COLLECTION).find({startDateIso:{$lte:couponStartDate}}).toArray()
                console.log("this is the result ",data);
                if(data.length >0){
                    await data.map((onedata)=>{
                        db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:objectId(onedata._id)},{
                          $set:{
                            Available: true
                          }
                        }).then(()=>{
                            res()
                        })
                    })
                }else{
                    res()
                }
            })


         },


         //get the all coupen Details
         getAllCoupons:()=>{
             return new Promise((res,rej)=>{
                 let coupons=db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                 res(coupons)
             })
             
         },

         deleteCoupon: (id) => {
             return new Promise((res,rej)=>{
                 db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(id)}).then(()=>{
                     res()
                 })
             })

         },






          //---------------------------------report ------------------------------------------------
         //sales monthly report
         monthlyReport:()=>{
             return new Promise(async(res,rej)=>{
                 let today=new Date()
                 let end= moment(today).format('YYYY/MM/DD')
                 let start=moment(end).subtract(30,'days').format('YYYY/MM/DD')
                 let orderSuccess= await db.get().collection(collection.ORDER_COLLECTION).find({Date:{$gte:start,$lte:end},Status:{ $ne: 'pending' }}).toArray()
                 let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({Date:{$gte:start,$lte:end}}).toArray()
                 let orderSuccessLength = orderSuccess.length
                 let orderTotalLength = orderTotal.length
                 let orderFailLength = orderTotalLength - orderSuccessLength
                 let total=0;
                 let paypal=0;
                 let razorpay=0;
                 let cod=0;
                 for(let i=0;i<orderSuccessLength;i++){
                     total=total+orderSuccess[i].Total;
                     if(orderSuccess[i].PaymentMethod=='Paypal'){
                         paypal++;
                     }else if(orderSuccess[i].PaymentMethod=='Razorpay'){
                         razorpay++;
                     }else{
                         cod++;

                     }
                 }
                 var data = {
                    start: start,
                    end: end,
                    totalOrders: orderTotalLength,
                    successOrders: orderSuccessLength,
                    faildOrders: orderFailLength,
                    totalSales: total,
                    cod: cod,
                    paypal: paypal,
                    razorpay: razorpay,
                    currentOrders: orderSuccess
                }
            res(data)
            })
         },

         salesReport:(date)=>{
            return new Promise(async(res,rej)=>{
                console.log("date", date);
                
                let end= moment(date.EndDate).format('YYYY/MM/DD')
                let start=moment(date.StartDate).format('YYYY/MM/DD')

                console.log("this is tha data",end,start);
                let orderSuccess= await db.get().collection(collection.ORDER_COLLECTION).find({Date:{$gte:start,$lte:end},Status:{ $ne: 'pending' }}).toArray()
                let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({Date:{$gte:start,$lte:end}}).toArray()
                let orderSuccessLength = orderSuccess.length
                let orderTotalLength = orderTotal.length
                let orderFailLength = orderTotalLength - orderSuccessLength
                let total=0;
                let paypal=0;
                let razorpay=0;
                let cod=0;
                for(let i=0;i<orderSuccessLength;i++){
                    total=total+orderSuccess[i].Total;
                    if(orderSuccess[i].PaymentMethod=='Paypal'){
                        paypal++;
                    }else if(orderSuccess[i].PaymentMethod=='Razorpay'){
                        razorpay++;
                    }else{
                        cod++;

                    }
                }
                var data = {
                   start: start,
                   end: end,
                   totalOrders: orderTotalLength,
                   successOrders: orderSuccessLength,
                   faildOrders: orderFailLength,
                   totalSales: total,
                   cod: cod,
                   paypal: paypal,
                   razorpay: razorpay,
                   currentOrders: orderSuccess
               }
           res(data)
           })

         },

         //--------------------------banner session started-----------------------------
         addBanner:(data)=>{
             return new Promise((res,rej)=>{
                 db.get().collection(collection.BANNER_COLLECTION).insertOne(data).then((response)=>{
                     res(response.insertedId)
                 }).catch((err)=>{
                     res(err)
                 })

             })
         },
        
         //get the banner details to Id
         getBannerDetails:(id)=>{
             return new Promise((res,rej)=>{
                 db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(id)}).then((response)=>{
                     res(response)
                 })
             })
         },

          //edit the banners
    updateBanner:(id,data)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(id)},{
                $set:{
                    bannerName:data.bannerName,
                    description1:data.description1,
                    description2:data.description2,
                    offer:data.offer,
                    offerPrice:data.offerPrice,
                    link:data.link
                
                }
            }).then(()=>{
                res()
            })
        })
    },

    //delete the banner
    deleteBanner:(id)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(id)}).then(()=>{
                res()
            })

        })
    }


     }

     