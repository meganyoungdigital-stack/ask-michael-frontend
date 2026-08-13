import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import {
  createAdminSession,
  SESSION_COOKIE,
} from "@/lib/adminAuth";

export async function POST(req:Request){


try{


const {
email,
password
}=await req.json();



const {db}=await connectToDatabase();



const admin =
await db
.collection("admins")
.findOne({
email
});



if(!admin){

return NextResponse.json(
{
error:"Admin not found"
},
{
status:404
}
);

}



const match =
await bcrypt.compare(
password,
admin.passwordHash
);



if(!match){

return NextResponse.json(
{
error:"Invalid password"
},
{
status:401
}
);

}



const session = createAdminSession(
  admin._id.toString()
);

const response = NextResponse.json({
  success: true,
  admin: {
    email: admin.email,
    role: admin.role,
  },
});

response.cookies.set({
  name: SESSION_COOKIE,
  value: session,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 8,
});

return response;


}catch(error){


console.error(
"Admin login error",
error
);



return NextResponse.json(
{
error:"Login failed"
},
{
status:500
}
);


}


}