import { Router } from "express";
import db from "@repo/db";
import { router as authRoutes } from "./auth";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";

const router: Router = Router();
router.get("/elements", async (req, res) => {
    const elements = await db.element.findMany()

    res.json({elements: elements.map(e => ({
        id: e.id,
        imageUrl: e.imageUrl,
        width: e.width,
        height: e.height,
        static: e.static
    }))})
})

router.get("/avatars", async (req, res) => {
    const avatars = await db.avatar.findMany()
    res.json({avatars: avatars.map(x => ({
        id: x.id,
        imageUrl: x.imageUrl,
        name: x.name
    }))})
})


router.use(authRoutes);
router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space",spaceRouter)

export default router;
