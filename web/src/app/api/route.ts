import { NextResponse } from "next/server";
export async function GET(){
return NextResponse.json({
    hello:"hii"
})
}

export async function POST(request:Request) {
    const data=await request.body;
    // console.log(data)

  return NextResponse.json({
   success:"true"
  });
}

