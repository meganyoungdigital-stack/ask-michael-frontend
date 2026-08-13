import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import {
  SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/adminAuth";

async function requireAdmin() {

  const cookieStore = await cookies();

  const session =
    cookieStore.get(
      SESSION_COOKIE
    )?.value;

  const adminId =
    verifyAdminSession(session);

  if (!adminId) {
    return null;
  }

  return adminId;
}


export async function POST(req: Request){
    const adminId = await requireAdmin();

if (!adminId) {
  return NextResponse.json(
    {
      error: "Unauthorized"
    },
    {
      status: 401
    }
  );
}

try{


const {
email,
password
}=await req.json();



if(!email || !password){

return NextResponse.json(
{
error:"Missing email or password"
},
{
status:400
}
);

}



const {db}=await connectToDatabase();



const existing =
await db
.collection("admins")
.findOne({
email
});



if(existing){

return NextResponse.json(
{
error:"Admin already exists"
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
.collection("admins")
.insertOne({

email,

passwordHash,

role:"admin",

createdAt:new Date()

});



return NextResponse.json({

success:true

});



}catch(error){

console.error(
"Admin creation error",
error
);


return NextResponse.json(
{
error:"Failed creating admin"
},
{
status:500
}
);


}

}