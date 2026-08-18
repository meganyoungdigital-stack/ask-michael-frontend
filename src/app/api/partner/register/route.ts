import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import crypto from "crypto";



export async function POST(
req:Request
){


try{


const {
token,
password
}=await req.json();




if(!token || !password){

return NextResponse.json(
{
error:"Missing registration details"
},
{
status:400
}
);

}




const {db}=await connectToDatabase();





const invitation =
await db
.collection("partner_invitations")
.findOne({

token

});





if(!invitation){


return NextResponse.json(
{
error:"Invalid registration link"
},
{
status:404
}
);


}






const existingPartner =
await db
.collection("partners")
.findOne({

email:
invitation.email

});





if(existingPartner){


return NextResponse.json(
{
error:"Partner already registered"
},
{
status:400
}
);


}





const passwordHash =
await bcrypt.hash(
password,
10
);





const apiKey =
  "am_live_" +
  crypto.randomBytes(24).toString("hex");

const testApiKey =
  "am_test_" +
  crypto.randomBytes(24).toString("hex");






await db
.collection("partners")
.insertOne({

companyName:
invitation.companyName,


contactName:
invitation.contactName,


email:
invitation.email,


passwordHash,


apiKey,

testApiKey,

status:
"active",



monthlyFee:
1999,


pricePerMessage:
0.05,


messages:
0,


billingDay:
new Date().getDate(),


nextBillingDate:
new Date(
  new Date().setMonth(
    new Date().getMonth() + 1
  )
),


createdAt:
new Date(),

});







await db
.collection("partner_invitations")
.deleteOne({

token

});






return NextResponse.json({

success:true

});






}catch(error){


console.error(
"Partner registration error",
error
);


return NextResponse.json(
{
error:"Registration failed"
},
{
status:500
}
);


}


}