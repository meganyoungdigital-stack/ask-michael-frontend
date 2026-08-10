import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";



export async function POST(req: Request){


try{


const {

token,

password

} = await req.json();



if(!token || !password){


return NextResponse.json(

{
error:
"Missing reset information"
},

{
status:400
}

);


}




const {db} =
await connectToDatabase();




const partner =
await db
.collection("partners")
.findOne({

resetToken: token,

});





if(!partner){


return NextResponse.json(

{
error:
"Invalid or expired reset link"
},

{
status:400
}

);


}





if(

partner.resetTokenExpiry
&&
new Date(partner.resetTokenExpiry)
<
new Date()

){


return NextResponse.json(

{
error:
"Reset link has expired"
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






await db
.collection("partners")
.updateOne(

{
_id:
partner._id
},

{

$set:
{

passwordHash,

},

$unset:
{

resetToken:"",

resetTokenExpiry:"",

}

}

);







return NextResponse.json({

success:true,

message:
"Password updated"

});





}catch(error){


console.error(
"Partner reset password error:",
error
);



return NextResponse.json(

{
error:
"Password reset failed"
},

{
status:500
}

);


}


}