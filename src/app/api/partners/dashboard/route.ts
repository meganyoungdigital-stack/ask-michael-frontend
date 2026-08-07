import {NextResponse} from "next/server";
import {connectToDatabase} from "@/lib/mongodb";
import {ObjectId} from "mongodb";


export async function GET(req:Request){

try{


const token =
req.headers.get(
"authorization"
);



if(!token){

return NextResponse.json(
{
error:"Unauthorized"
},
{
status:401
}
);

}



const {db}=await connectToDatabase();



const partner =
await db.collection("partners")
.findOne({
_id:new ObjectId(token)
});



if(!partner){

return NextResponse.json(
{
error:"Partner not found"
},
{
status:404
}
);

}



return NextResponse.json({

companyName:
partner.companyName,

monthlyFee:
partner.monthlyFee || 0,

messages:
partner.messages || 0,

currentBill:
partner.currentBill || 0

});


}catch(error){


return NextResponse.json(
{
error:"Dashboard failed"
},
{
status:500
}
);


}

}