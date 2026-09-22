import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import {
  createAdminSession,
  SESSION_COOKIE,
} from "@/lib/adminAuth";
import { adminLoginRatelimit } from "@/lib/ratelimit";

export async function POST(req:Request){


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
  email,
  password,
} = body as {
  email?: unknown;
  password?: unknown;
};

if (
  typeof email !== "string" ||
  typeof password !== "string"
) {
  return NextResponse.json(
    {
      error: "Email and password are required",
    },
    {
      status: 400,
    }
  );
}

const cleanEmail = email.trim().toLowerCase();

if (
  cleanEmail.length === 0 ||
  password.length === 0
) {
  return NextResponse.json(
    {
      error: "Email and password are required",
    },
    {
      status: 400,
    }
  );
}

if (
  cleanEmail.length > 320 ||
  password.length > 200
) {
  return NextResponse.json(
    {
      error: "Login details exceed the maximum allowed length",
    },
    {
      status: 400,
    }
  );
}

const rateLimitResult = await adminLoginRatelimit.limit(
  cleanEmail || "unknown"
);

if (!rateLimitResult.success) {
  return NextResponse.json(
    {
      error: "Too many login attempts. Please try again later.",
    },
    {
      status: 429,
    }
  );
}

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