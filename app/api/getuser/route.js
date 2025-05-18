import connectdb from "@/app/lib/connect";
import User from "../../models/user"
import { NextResponse } from "next/server";

export async function GET(req){
    await connectdb();
    const _id =req.id;
    const user=User.findById(_id);
return NextResponse.json({user});

}
