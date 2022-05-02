var db=require('../config/connection')
const collection=require("../config/Collections")
const async = require('hbs/lib/async')
const objectId=require('mongodb').ObjectId

module.exports={
    // addProduc:(product,cb)=>{
    //     console.log(product)
    //     db.get().collection('product').insertOne(product).then((data)=>{
    //        console.log(data);
    //         cb(data.insertedId)
    //         console.log(data.insertedId);
    //     })

        addProduct:(product)=>{
            return new Promise((res,rej)=>{
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
                res(data.insertedId)
                })
            })

        },
    
    getAllProduct:()=>{
        return new Promise(async (res,rej)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            res(products)

        })
    },
    deleteProduct:(proId)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                console.log(response);
                res(response);
            })

        })

    },
    getProductDetalils:(proId)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                res(product)
            })


        })

    },
    updateProdct:(proId,proDetails)=>{
        console.log("this is the submitside", proDetails.category);
        return new Promise((res,rej)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    name:proDetails.name,       
                    category:proDetails.category,
                    price:proDetails.price,
                    discription:proDetails.discription
                }
            }).then((response)=>{
                console.log(response);
                res()
            })
        })
    },
    getAllUsers:()=>{
        return new Promise(async(res,rej)=>{
           let allUsers= db.get().collection(collection.USER_COLLECTION).find().toArray()
           res(allUsers)
        })
    },

    //get the product based in category name
    getCategoryProducts:(catname)=>{
        return new Promise(async(res,rej)=>{
           let categorys=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:catname}).toArray()
           res(categorys)
        })

    },

    //---------------------admin dashboard-----------------------

    //get the all new orders
    getNewOrders:()=>{
        return new Promise(async(res,rej)=>{
           let newOrders= await db.get().collection(collection.ORDER_COLLECTION).find().sort({ $natural: -1 }).limit(5).toArray()
            res(newOrders)
        })
    },
    //get the all new products
    getNewProducts:()=>{
        return  new Promise(async(res,rej)=>{
            let newProducts= await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({$natural:-1}).limit(5).toArray()
            res(newProducts)
        })
    },
    // get the all new users
    getNewUsers:()=>{
        return new Promise(async(res,rej)=>{
            let newUsers=await db.get().collection(collection.USER_COLLECTION).find().sort({$natural:-1}).limit(6).toArray()
            res(newUsers)
        })
    },
     //Get total income from products which delivered
     getTotalIncome: ()=>{
         let Totel=0;
         return new Promise(async(res,rej)=>{
             let total= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        Status: "Delivered"
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$Total" }
                    },
                }
            ]).toArray()

            if (total[0]) {
                res(total[0].total)
            } else {
                res(Total)
            }
         })
     },
    //get the count of totel users
    getTotalUsers:()=>{
        return new Promise(async(res,rej)=>{
            let totalUsers = await db.get().collection(collection.USER_COLLECTION).count()
            res(totalUsers)
        })
    },
    //Get total number of products
    getTotalProducts: () => {
        return new Promise(async (res, rej) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).count()
            res(products)
        })
    },
    //Get total number of orders
    getTotalOrders: () => {
        return new Promise(async (res, rej) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).count()
            res(orders)
        })
    }, 
    //get the all orser status
    getAllOrderStatus:()=>{
        let orderStatus = []
        return new Promise(async(res,rej)=>{
            //To get number of placed orders
            let placedProducts= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        Status:"Placed"
                    }
                }
            ]).toArray()
            let placeLen= placedProducts.length
            orderStatus.push(placeLen)
            console.log("place order len",placeLen);
            
            //To get number of shipped orders
            let shippedProducts= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        Status:"Shipped"
                    }
                }
            ]).toArray()
            let shippedLen=shippedProducts.length
            orderStatus.push(shippedLen)
            //To get number of delivered orders
            let deliveredProducts=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        Status:"Delivered"
                    }
                }
            ]).toArray()
            let deliveredLen=deliveredProducts.length
            orderStatus.push(deliveredLen)
            //To get number of cancelled orders
            let pendingProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        Status: "Cancelled"
                    }
                }
            ]).toArray()
            let pendingLen = pendingProducts.length
            orderStatus.push(pendingLen)
            //Resolve all order status in an array for chart
            res(orderStatus)
        });
    },
    //To get all payment methods used for orders
    getAllMethods: () => {
        let methods = []
        return new Promise(async (res, rej) => {
            let codProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        PaymentMethod: "COD"
                    }
                }
            ]).toArray()
            let codLen = codProducts.length
            methods.push(codLen)

            let razorpayProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        PaymentMethod: "Razorpay"
                    }
                }
            ]).toArray()
            let razorpayLen = razorpayProducts.length
            methods.push(razorpayLen)

            let paypalProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        PaymentMethod: "Paypal"
                    }
                }
            ]).toArray()
            let paypalLen = paypalProducts.length
            methods.push(paypalLen)
            res(methods)
        })
    }
}