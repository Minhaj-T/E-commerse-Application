const mongoClient=require('mongodb').MongoClient

const state={
    db:null
}

module.exports.connect=function(done){
    const url= process.env.URL;
    const dbName=process.env.DBNAME;

    mongoClient.connect(url,(err,data)=>{
       if(err) return done(err)

       state.db=data.db(dbName)
       done()
    })
    
}

module.exports.get=function()
{
    return state.db
}