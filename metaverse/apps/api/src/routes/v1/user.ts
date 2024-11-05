import { Router } from "express";
import db from "@repo/db"
import { userSignupSchema } from "../../validations";

const userRoutes: Router = Router();
userRoutes.post("/signup", async(req, res) => {
    try {
        const parsedData        =userSignupSchema.safeParse(req.body);
        if(!parsedData.success){
            res.status(400).json({error:parsedData.error});
            return;
        }
        const hashedPassword=await bcrypt.hash(parsedData.data.password,10);
        const user=await db.user.create({
            data:{
                username:parsedData.data.username,
                password:hashedPassword,
            }
        })
    } catch (error) {
        
    }
  
    
});
userRoutes.post("/signin", (req, res) => {
  res.json({ message: "Sign in route" });
});

export default userRoutes;