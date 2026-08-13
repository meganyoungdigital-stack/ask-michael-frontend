import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";


export async function GET(){

try{


const {db} = await connectToDatabase();



const partners =
await db
.collection("partners")
.find({})
.sort({
createdAt:-1
})
.toArray();



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

try{


const {
id,
status
}=await req.json();



if(!id || !status){

return NextResponse.json(
{
error:"Missing details"
},
{
status:400
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

  try {

    const { id } = await req.json();

    if (!id) {

      return NextResponse.json(
        {
          error: "Missing partner id"
        },
        {
          status: 400
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