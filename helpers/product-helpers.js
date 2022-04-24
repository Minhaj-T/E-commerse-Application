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
        return new Promise((res,rej)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    name:proDetails.name,       
                    catogory:proDetails.catogory,
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
    }
}