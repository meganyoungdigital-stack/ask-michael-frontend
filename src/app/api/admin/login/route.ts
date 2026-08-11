import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";


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



return NextResponse.json({

success:true,

token:
admin._id.toString(),

admin:{
email:admin.email,
role:admin.role
}

});


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