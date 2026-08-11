import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";


export async function POST(req: Request){

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