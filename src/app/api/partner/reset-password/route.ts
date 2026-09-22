import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { partnerResetPasswordRatelimit } from "@/lib/ratelimit";



export async function POST(req: Request){


try{


const body = await req.json();

if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return NextResponse.json(
    {
      error: "Invalid request body",
    },
    {
      status: 400,
    }
  );
}

const {
  token,
  password,
} = body as {
  token?: unknown;
  password?: unknown;
};

if (
  typeof token !== "string" ||
  typeof password !== "string"
) {
  return NextResponse.json(
    {
      error: "Invalid reset information",
    },
    {
      status: 400,
    }
  );
}

const cleanToken = token.trim();
const cleanPassword = password;

if (
  cleanToken.length === 0 ||
  cleanPassword.length === 0
) {
  return NextResponse.json(
    {
      error: "Reset information cannot be empty",
    },
    {
      status: 400,
    }
  );
}

if (
  cleanToken.length > 200 ||
  cleanPassword.length > 200
) {
  return NextResponse.json(
    {
      error:
        "Reset information exceeds the maximum allowed length",
    },
    {
      status: 400,
    }
  );
}

const rateLimitResult =
  await partnerResetPasswordRatelimit.limit(
    cleanToken
  );

if (!rateLimitResult.success) {
  return NextResponse.json(
    {
      error:
        "Too many password reset attempts. Please try again later.",
    },
    {
      status: 429,
    }
  );
}




const {db} =
await connectToDatabase();




const partner =
await db
.collection("partners")
.findOne({

resetToken: cleanToken,

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
    cleanPassword,
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