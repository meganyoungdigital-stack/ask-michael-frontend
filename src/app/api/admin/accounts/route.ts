import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";


export async function GET(){

try{


const {db} = await connectToDatabase();



const partners =
await db
.collection("partners")
.find({})
.sort({
createdAt:-1
})
.toArray();



return NextResponse.json(
partners
);



}catch(error){


console.error(
"Admin accounts error:",
error
);



return NextResponse.json(
{
error:"Failed loading accounts"
},
{
status:500
}
);


}

}





export async function PATCH(req:Request){

try{


const {
id,
status
}=await req.json();



if(!id || !status){

return NextResponse.json(
{
error:"Missing details"
},
{
status:400
}
);

}




const {db}=await connectToDatabase();



await db
.collection("partners")
.updateOne(

{
_id:new ObjectId(id)
},

{
$set:{
status,
updatedAt:new Date()
}
}

);



return NextResponse.json(
{
success:true
}
);



}catch(error){


console.error(
"Admin account update error:",
error
);



return NextResponse.json(
{
error:"Update failed"
},
{
status:500
}
);


}


}