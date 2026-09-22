import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
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

export async function GET(){
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


const {db} = await connectToDatabase();



const partners =
  await db
    .collection("partners")
    .find(
      {},
      {
        projection: {
          passwordHash: 0,
          apiKey: 0,
          testApiKey: 0,
          apiKeyHash: 0,
          testApiKeyHash: 0,
          paystackAuthorizationCode: 0,
        },
      }
    )
    .sort({
      createdAt: -1,
    })
    .toArray();

console.log(
  "ADMIN PARTNER TERMS:",
  partners.map((partner) => ({
    companyName: partner.companyName,
    termsAccepted: partner.termsAccepted,
    termsVersion: partner.termsVersion,
    termsAcceptedAt: partner.termsAcceptedAt,
  }))
);

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

const { id, status } = body as {
  id?: unknown;
  status?: unknown;
};

if (
  typeof id !== "string" ||
  typeof status !== "string" ||
  id.trim().length === 0 ||
  status.trim().length === 0
) {
  return NextResponse.json(
    {
      error: "Missing details",
    },
    {
      status: 400,
    }
  );
}

if (!ObjectId.isValid(id)) {
  return NextResponse.json(
    {
      error: "Invalid partner ID",
    },
    {
      status: 400,
    }
  );
}

const allowedStatuses = [
  "pending",
  "active",
  "suspended",
  "rejected",
];

if (!allowedStatuses.includes(status)) {
  return NextResponse.json(
    {
      error: "Invalid partner status",
    },
    {
      status: 400,
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
export async function DELETE(req: Request) {

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
  try {

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

const { id } = body as {
  id?: unknown;
};

if (
  typeof id !== "string" ||
  id.trim().length === 0
) {
  return NextResponse.json(
    {
      error: "Missing partner id",
    },
    {
      status: 400,
    }
  );
}

if (!ObjectId.isValid(id)) {
  return NextResponse.json(
    {
      error: "Invalid partner ID",
    },
    {
      status: 400,
    }
  );
}

    const { db } = await connectToDatabase();

    const result = await db
      .collection("partners")
      .deleteOne({
        _id: new ObjectId(id)
      });

    if (result.deletedCount === 0) {

      return NextResponse.json(
        {
          error: "Partner account not found"
        },
        {
          status: 404
        }
      );

    }

    return NextResponse.json({
      success: true,
      message: "Partner account deleted"
    });

  } catch (error) {

    console.error(
      "Admin partner delete error:",
      error
    );

    return NextResponse.json(
      {
        error: "Delete failed"
      },
      {
        status: 500
      }
    );

  }

}